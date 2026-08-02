"use strict"

const path = require("path")
const { execFileSync } = require("child_process")

const { findZustandStoreObjectLiterals } = require("./utils/findZustandStoreObjectLiterals")
const { findAppRoot } = require("./utils/sharedFolderBuckets")
const { findMainExportDeclaration, getMainExportLineLoc } = require("./utils/mainExportLoc")
const { DID_YOU_MEAN_EMOJI } = require("./utils/messages")

// A zustand store only earns its own file once 2+ DIFFERENT files actually read it - that's the
// whole reason to reach for shared state instead of useState in the first place. A store with
// exactly one real importer anywhere in the codebase never shares anything: whatever that one
// importer does with it, useState inside that same file would do identically, minus the create()
// call and the extra file.
//
// Real incident: useWindowWidth.ts (app/store/shared) was created so useScreenWidth.ts could read
// "the one true window width" - but useWindowWidth is only ever imported by useScreenWidth.ts
// itself. useScreenWidth being called from 2 components doesn't make useWindowWidth shared - it's
// still exactly 1 file touching the store directly, so useState inside useScreenWidth would have
// been identical with less indirection.
//
// Bad (useWindowWidth.ts, only importer is useScreenWidth.ts):
//   export const useWindowWidth = create<WindowWidthState>()(set => ({
//     width: 0,
//     setWidth: width => set(() => ({ width })),
//   }))
// Good: delete the store, use useState directly inside useScreenWidth.ts instead.
//
// EXCEPTION - a store holding MIN_SHARED_STATE_VALUES+ separate values is kept even with one
// importer. Sharing isn't the only reason a store earns its file: past ~5 values each with its own
// setter, the alternative is 5+ loose useState pairs in one component, and one named store reads
// better than that even when nothing else ever touches it. This is the same bar
// zustand-require-method uses to ASK a file with 5+ useState pairs to make a store - without the
// exception the two rules bounce the same code back and forth, one saying "make a store" and this
// one saying "delete it". Nikita, 2026-07-26: "only exception I think if there is 5+ useStates then
// it make sense to encapsulate it into zustand store even if this zustand store is used ONLY in
// this file."
//
// Counted as VALUES, not properties - a `setXxx` method sitting next to its own value is that same
// value's setter, not a second piece of state, so useAutoEASetup's 7 values + 7 setters counts as 7.
const MIN_SHARED_STATE_VALUES = 5

function isSetterProperty(name, valueNames) {
  const match = /^set([A-Z].*)$/.exec(name)
  if (!match) return false
  return valueNames.has(match[1][0].toLowerCase() + match[1].slice(1))
}

function countStateValues(objectLiteral) {
  const names = objectLiteral.properties
    .filter(property => property.type === "Property" && property.key.type === "Identifier")
    .map(property => property.key.name)
  const allNames = new Set(names)
  return names.filter(name => !isSetterProperty(name, allNames)).length
}

// The one value's own name when the store holds exactly one value plus its setter, else null -
// used by the single-value check to name it in the message rather than say "the value".
function onlyStateValueName(objectLiteral) {
  const names = objectLiteral.properties
    .filter(property => property.type === "Property" && property.key.type === "Identifier")
    .map(property => property.key.name)
  const allNames = new Set(names)
  const values = names.filter(name => !isSetterProperty(name, allNames))
  return values.length === 1 ? values[0] : null
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// This codebase's own word split: `persist(...)` wrapping the create() call writes to storage, so
// calling it a "store" is accurate; a create() call with no persist never leaves memory, closer to
// React state that happens to live outside the component, so "state" reads truer. Best-effort text
// check, same bar every other heuristic in this rule set uses - looks for the middleware actually
// being called, not just imported (an unused import would otherwise misreport an un-persisted
// create() as persisted).
function usesPersistMiddleware(sourceCode) {
  return /\bpersist\s*\(/.test(sourceCode.getText())
}

// Lightweight `grep -l` (filenames only, no line numbers/content needed) for a single identifier -
// simpler than imports-order.js's collectNameToOtherFiles, which batches many names at once; this
// rule only ever checks the one name it just found.
function findOtherFilesMentioning(name, appRoot, ownFilename) {
  let output
  try {
    output = execFileSync(
      "grep",
      [
        "-rlP",
        `\\b${escapeRegex(name)}\\b`,
        appRoot,
        "--include=*.ts",
        "--include=*.tsx",
        "--exclude-dir=node_modules",
        "--exclude-dir=.next",
        "--exclude-dir=.git",
      ],
      { encoding: "utf8", timeout: 5000, maxBuffer: 10 * 1024 * 1024 },
    )
  } catch {
    // grep exits non-zero when it finds nothing (or times out) - treat as "no other importers
    // proven", not as a violation
    return []
  }

  const ownResolved = path.resolve(ownFilename)
  return output
    .split("\n")
    .filter(Boolean)
    .map(file => path.resolve(file))
    .filter(file => file !== ownResolved)
}

module.exports = {
  "zustand-no-pointless-store": {
    meta: {
      type: "suggestion",
      docs: {
        description:
          "flag a zustand store whose only real importer anywhere in the codebase is a single file - nothing is actually shared, so useState would do the same job",
      },
      schema: [],
      messages: {
        soloImporterStore:
          `"{{name}}" is a zustand {{kind}}, but "{{importerBasename}}" is its only real importer anywhere in the codebase - ` +
          `nothing is shared across components. ${DID_YOU_MEAN_EMOJI}Did you mean to use useState directly inside ` +
          `"{{importerBasename}}" instead of a {{kind}}?`,
        singleValueStore:
          `"{{name}}" is a whole {{kind}} file holding one value ("{{valueName}}") and its setter, nothing else. ` +
          `${DID_YOU_MEAN_EMOJI}Did you mean to\n{{optionsList}}`,
      },
    },
    create(context) {
      const filename = context.filename ?? context.getFilename()
      const appRoot = findAppRoot(filename)
      if (!appRoot) return {}

      return {
        "Program:exit"(node) {
          const objectLiterals = findZustandStoreObjectLiterals(node)
          if (objectLiterals.length === 0) return

          // See MIN_SHARED_STATE_VALUES - enough state of its own earns the file whether or not a
          // second importer ever shows up.
          if (objectLiterals.some(objectLiteral => countStateValues(objectLiteral) >= MIN_SHARED_STATE_VALUES)) return

          const basenameNoExt = path.basename(filename).replace(/\.tsx?$/, "")
          const found = findMainExportDeclaration(node, basenameNoExt)
          if (!found) return

          const decl = found.declaration
          let name = null
          if (decl.type === "VariableDeclaration") {
            const declarator = decl.declarations.find(d => d.id.type === "Identifier")
            name = declarator?.id.name ?? null
          } else if ((decl.type === "FunctionDeclaration" || decl.type === "ClassDeclaration") && decl.id) {
            name = decl.id.name
          } else if (found.statement.type === "ExportDefaultDeclaration" && decl.type === "Identifier") {
            name = decl.name
          }
          if (!name) return

          const sourceCode = context.sourceCode ?? context.getSourceCode()
          const kind = usesPersistMiddleware(sourceCode) ? "store" : "state"
          const otherFiles = findOtherFilesMentioning(name, appRoot, filename)

          if (otherFiles.length === 1) {
            context.report({
              loc: getMainExportLineLoc(node, sourceCode, basenameNoExt),
              messageId: "soloImporterStore",
              data: { name, importerBasename: path.basename(otherFiles[0]), kind },
            })
            return
          }

          // Second, separate check - a store file holding ONE value and its setter, however many
          // files read it. Nikita (2026-07-26) on app/store/useStats.ts: "should be warned by
          // zustand-no-pointless-store Because it has only 1 state and 1 setter". Unlike the solo
          // importer above, the answer here is never useState - useStats is read by 13 files, so the
          // state really is shared; the question is whether one value earns a file and an import of
          // its own instead of sitting in a store that already exists beside it. 10 of this repo's
          // 85 store files are this shape.
          const singleValue = objectLiterals
            .map(objectLiteral => onlyStateValueName(objectLiteral))
            .find(valueName => valueName !== null)
          if (!singleValue) return

          // Numbered, not a run-on parenthetical - option 2 (delete-and-move) only makes sense with
          // few enough real importers that ONE of them can absorb it; with many real importers
          // (useStats has 13), that option would point at an arbitrary pick among many, so it's left
          // out rather than naming one at random. Built as one pre-rendered string, not left to the
          // message template's own {{}} substitution - a static template has no conditional logic of
          // its own to skip a line with.
          const options = [
            `add a related useState pair from one of "${name}"'s real importers into this ${kind} instead ` +
              `(check each real importer for its own useState next to a "${name}()" call)`,
          ]
          if (otherFiles.length >= 1 && otherFiles.length <= 2) {
            const firstImporterBasename = path.basename(otherFiles[0])
            options.push(
              `delete this ${kind} and move "${singleValue}" into useState inside "${firstImporterBasename}" instead`,
            )
          }
          options.push(`return "${singleValue}" directly from whichever hook already sets it, if no ${kind} fits`)
          options.push("leave it as-is - it's already right")
          const optionsList = options.map((option, index) => `${index + 1}. ${option}?`).join("\n")

          context.report({
            loc: getMainExportLineLoc(node, sourceCode, basenameNoExt),
            messageId: "singleValueStore",
            data: { name, valueName: singleValue, kind, optionsList },
          })
        },
      }
    },
  },
}

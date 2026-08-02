"use strict"

const path = require("path")

const { isZustandCreateCall } = require("./utils/findZustandStoreObjectLiterals")

// Every zustand store in this codebase is one store per file, and the file is named after the hook
// it exports - so `import { useGSMStore } from "@dialer/store/useGSMStore"` reads as one name, not
// two. A shortened export (useGSMStore.ts exporting useGSM) makes the import line say one thing and
// the path say another, and nothing catches it: the file keeps its long name forever while every
// importer writes the short one.
//
// The store's own name lives on the VariableDeclarator that create() is assigned to, never inside
// the creator function, so this reads the declarator directly instead of resolving the creator via
// resolveStoreCreatorFunction the way zustand-persist-name does.
//
// No fixer here on purpose - renaming the export rewrites every importing file, and renaming the
// file is the right answer whenever the export is the correctly-named hook (warmUp.ts exporting
// useWarmUp). A one-file fixer would only break the build.
//
// Bad:
//   // file: useGSMStore.ts
//   export const useGSM = create<GSMStore>()(persist(gsmStore, { name: "gsmStore" }))
// Good:
//   // file: useGSMStore.ts
//   export const useGSMStore = create<GSMStore>()(persist(gsmStore, { name: "gsmStore" }))

// create<T>()(storeFn) nests the type arguments on an inner call, so the store creation is the
// OUTER CallExpression whose callee is itself create(...) - create<T>(storeFn) and
// create(subscribeWithSelector(...)) are the single-call shape instead.
function isStoreCreation(node) {
  if (!node || node.type !== "CallExpression") return false
  return isZustandCreateCall(node) || isZustandCreateCall(node.callee)
}

// `export const useGSMStore = create(...)` names it inline; `const useLabelsStore = create(...)`
// plus `export default useLabelsStore` (or `export { useLabelsStore }`) names it further down the
// file. Both shapes make the identifier the name importers write.
function isExportedStore(declaratorNode, programNode) {
  const declaration = declaratorNode.parent
  if (declaration?.parent?.type === "ExportNamedDeclaration") return true

  const storeName = declaratorNode.id.name
  for (const statement of programNode.body) {
    if (statement.type === "ExportDefaultDeclaration" && statement.declaration.type === "Identifier") {
      if (statement.declaration.name === storeName) return true
    }
    if (statement.type === "ExportNamedDeclaration" && !statement.declaration) {
      const isNamed = statement.specifiers.some(specifier => specifier.local.type === "Identifier" && specifier.local.name === storeName)
      if (isNamed) return true
    }
  }
  return false
}

module.exports = {
  "zustand-store-export-matches-filename": {
    meta: {
      type: "suggestion",
      docs: {
        description: "require a zustand store's exported hook name to match its own filename exactly",
      },
      schema: [],
      messages: {
        exportNameMismatch:
          'this store is exported as "{{storeName}}" but its file is "{{fileName}}{{extension}}" - importers then write "{{storeName}}" while the path says "{{fileName}}". Rename the export to "{{fileName}}", or rename the file to "{{storeName}}{{extension}}" when the export is the correctly named hook.',
      },
    },
    create(context) {
      const filename = context.filename ?? context.getFilename()
      const extension = path.extname(filename)
      const fileName = path.basename(filename, extension)
      // <input>/<text> are ESLint's stand-ins when there is no file on disk, and an index file is
      // named after its folder rather than after any one hook inside it.
      if (!extension || fileName.startsWith("<") || fileName === "index") return {}

      return {
        VariableDeclarator(node) {
          if (node.id.type !== "Identifier") return
          if (!isStoreCreation(node.init)) return

          const storeName = node.id.name
          if (storeName === fileName) return

          const programNode = context.sourceCode.ast
          if (!isExportedStore(node, programNode)) return

          context.report({
            node: node.id,
            messageId: "exportNameMismatch",
            data: { storeName, fileName, extension },
          })
        },
      }
    },
  },
}

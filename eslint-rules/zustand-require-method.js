"use strict"

// A local one-line handler whose entire body is just calling a `useState` setter isn't logic -
// it's the exact shape zustand-patterns.md's `toggleDarkMode` example already lives in a store as
// (see docs/code-patterns/component-related/zustand-patterns.md). But asking "should this become a
// brand-new store" for genuinely single-use state is exactly what zustand-no-pointless-store exists
// to catch on the other side - most of the time the honest answer is "no, useState is fine".
//
// EVERY firing needs 5+ useState pairs in the file (MIN_USE_STATES_FOR_STORE below) - whether this
// file already imports its OWN store or not. Nikita, 2026-07-26: "it's ok to have a 1-liner if it's
// not reused anywhere and it's not 5 useStates." A file's own store sitting right next to a lone
// `[isShowDropdown, setIsShowDropdown]` is proximity, not a reason to move it - the same 1-state
// case would fail zustand-no-pointless-store outright if it tried to justify a BRAND NEW store, so
// an EXISTING store next door has to clear the exact same 5-state bar a new one would need, never a
// lower one. Below 5, useState stays useState either way - only the destination in the message
// differs (fold into the existing store vs make a new one), never whether it fires at all.
//
// A second, concrete reason a lone one-liner has to stay local even past 5 states in principle:
// some state is isolated PER COMPONENT INSTANCE on purpose, not shared. TimeZonePicker.tsx mounts
// at 2+ sites (account settings + the schedule-email modal) - its own `isShowDropdown` must stay
// one flag per mounted instance. A zustand store is a single global source of truth; folding
// `isShowDropdown` into TimeZonePicker's own `useUserTimezone` store would turn "is THIS dropdown
// open" into one shared flag every mounted instance reads and toggles together - a real bug, not a
// style question. A rule that only ever sees one file at a time has no way to know how many places
// render that file's own component, so this stays a case-by-case eslint-disable-next-line judgment
// call, not a structural exception - but it's the reason a per-instance flag should almost never be
// the thing that pushes a file over the 5-state bar in the first place.
//
// Merely importing SOME store was this rule's original bug, now moot for the >=5 gate too - a
// dropdown that imports useToast, useEnvs, or useTickets has committed to zustand for TOAST / ENVS /
// TICKETS, not for wherever its own `hover`/`isShowDropdown` belongs. Nikita, 2026-07-26: "if it
// need to create a zustand store then don't require a method just to encapsulate it into a store
// ... it's like going to the supermarket knowing you have food - doesn't make sense."
//
// Real conflict this caused before the 5-state gate applied everywhere: the rule told
// YTBgDropdown.tsx to fold isShowDropdown into useBackgroundStore, one commit after
// zustand-no-pointless-store had deleted useBackgroundImageDropdown.ts - the store that used to
// hold exactly that flag. Two rules pushing the same line of code in opposite directions.
//
// Bad (5+ useState pairs, own store sits right next to it - a store's worth, not a couple of flags):
//   import { useEmailAccountsDropdown } from "./store/useEmailAccountsDropdown"
//   const [hover, setHover] = useState("")           // 1 of 5+ pairs in this file
//   const mouseHover = (name: string) => setHover(name)
// Ask: add hover/mouseHover to that same store as a method.
//
// Good (own store exists, but only 1-4 useState pairs total): never flagged, stays useState.
//   import { useUserTimezone } from "./store/useUserTimeZone"
//   const [isShowDropdown, setIsShowDropdown] = useState(false)
//   const toggleDropdown = () => setIsShowDropdown(!isShowDropdown)
//
// Good (only reaches a global/other-feature store, so this state has no home yet): never flagged.
//   import { useToast } from "@/store/shared/useToast"
//   const [isShowDropdown, setIsShowDropdown] = useState(false)
//   const toggleDropdown = () => setIsShowDropdown(prev => !prev)

// A store hook is identified by its import source containing "store"/"zustand" (not by name alone)
// - mirrors zustand-no-selector's own isStoreImportSource, so both rules agree on what counts as
// "this file already uses zustand".
function isStoreImportSource(source) {
  return /store/i.test(source) || /zustand/i.test(source)
}

// The file's OWN store, as opposed to any store it merely reads from. A relative source ("./",
// "../") is what makes it "own" - it resolves inside this component's own folder tree, so the store
// was written for this component. An aliased source ("@/store/...", "@support/store/...",
// "@dialer/store/...") always points at a global bucket or another feature's store, which this file
// reads from rather than owns - see the header comment on why reading one proves nothing about where
// this file's own state belongs.
function isOwnStoreImportSource(source) {
  if (!source.startsWith(".")) return false
  return /(^|\/)stores?(\/|$)/i.test(source)
}

const ZUSTAND_MIDDLEWARE_NAMES = new Set(["persist", "subscribeWithSelector", "devtools", "combine", "redux"])

// See the create() comment where this is read - the point where loose useState pairs stop being
// "a couple of local flags" and start being a store the component wrote by hand.
const MIN_USE_STATES_FOR_STORE = 5

// The first real store hook import found in this file, kept only to point at "add it here too" in
// the report message - not used to pick a destination, that's still a per-case call.
function findFirstStoreHookImport(programNode) {
  for (const statement of programNode.body) {
    if (statement.type !== "ImportDeclaration") continue
    if (statement.importKind === "type") continue
    if (!isStoreImportSource(statement.source.value)) continue
    if (!isOwnStoreImportSource(statement.source.value)) continue
    for (const specifier of statement.specifiers) {
      if (specifier.type !== "ImportDefaultSpecifier" && specifier.type !== "ImportSpecifier") continue
      if (specifier.importKind === "type") continue
      if (specifier.local.name === "create" || specifier.local.name === "createStore") continue
      if (ZUSTAND_MIDDLEWARE_NAMES.has(specifier.local.name)) continue
      return { name: specifier.local.name, source: statement.source.value }
    }
  }
  return null
}

// Every `const [x, setX] = useState(...)` binding in this file, keyed by the setter's name so a
// handler can be traced back to the state it forwards to.
function findUseStateSetters(sourceCode) {
  const stateNameBySetterName = new Map()
  for (const scope of sourceCode.scopeManager.scopes) {
    for (const variable of scope.variables) {
      for (const definition of variable.defs) {
        if (definition.type !== "Variable") continue
        const declarator = definition.node
        if (declarator.type !== "VariableDeclarator") continue
        if (declarator.id.type !== "ArrayPattern") continue
        if (declarator.id.elements.length !== 2) continue
        const [stateEl, setterEl] = declarator.id.elements
        if (!stateEl || stateEl.type !== "Identifier") continue
        if (!setterEl || setterEl.type !== "Identifier") continue
        const init = declarator.init
        if (init?.type !== "CallExpression" || init.callee.type !== "Identifier" || init.callee.name !== "useState") continue
        stateNameBySetterName.set(setterEl.name, stateEl.name)
      }
    }
  }
  return stateNameBySetterName
}

// A handler wired straight to a native DOM drag event - the browser's own event name IS the
// callback's name, so it needs a stable identity for addEventListener/removeEventListener or a JSX
// prop reference either way, and the drag interaction it tracks is virtually always private to
// whichever draggable/drop-target element owns it (useDragTabs.ts, useDragAndDropPost.ts). Not a
// case this rule should ask about - skip by name rather than asking for a disable comment on every
// drag hook in the codebase.
const SKIPPED_HANDLER_NAMES = new Set(["onDragStart", "onDragLeave"])

// The single expression a trivial handler's body reduces to - an arrow's implicit-return
// expression, a block body's lone `return <expr>`, or a block body's lone void call
// (`setIsOpen(false)`, no return value). Anything with more than one statement is real logic, not
// this rule's concern.
function getSingleActionExpression(fn) {
  if (fn.body.type !== "BlockStatement") return fn.body
  if (fn.body.body.length !== 1) return null
  const statement = fn.body.body[0]
  if (statement.type === "ExpressionStatement") return statement.expression
  if (statement.type === "ReturnStatement" && statement.argument) return statement.argument
  return null
}

module.exports = {
  "zustand-require-method": {
    meta: {
      type: "suggestion",
      docs: {
        description:
          "once a file already imports a real zustand store hook, ask whether a local one-line handler that only calls a useState setter should be folded into that store as a method instead",
      },
      schema: [],
      messages: {
        askZustandMethod:
          '"{{name}}" is a one-line handler that only calls the local useState setter "{{setterName}}" - this component\'s own store ("{{storeName}}" from "{{storeSource}}") already sits right next to it, so add "{{stateName}}"/"{{name}}" to that store as a method instead of leaving it as a separate useState pair.',
        askZustandStoreForManyStates:
          'This file holds {{stateCount}} useState pairs, and "{{name}}" is a one-line handler that only calls the setter "{{setterName}}" - that much state with its own setters is a store\'s worth, even if only this file ever reads it. Move all {{stateCount}} into one store and make "{{name}}" a method on it.',
      },
    },
    create(context) {
      const sourceCode = context.sourceCode ?? context.getSourceCode()

      const stateNameBySetterName = findUseStateSetters(sourceCode)
      if (stateNameBySetterName.size === 0) return {}

      // The ONE gate for firing at all, regardless of whether this file already imports its own
      // store - see the header comment for why an existing store next door doesn't get a lower bar
      // than a brand-new one would need. Past ~5 useState pairs each with its own setter, the
      // component is hand-rolling what a store does, and one store used by this file alone still
      // reads better than 5 loose pairs. Nikita, 2026-07-26: "only exception I think if there is 5+
      // useStates then it make sense to encapsulate it into zustand store even if this zustand store
      // is used ONLY in this file." Below that bar, nothing fires - useLoadingToastTimers.ts holds 3
      // pairs (no store of its own) and TimeZonePicker.tsx holds 1 pair (own store exists) and both
      // stay silent.
      const hasManyStates = stateNameBySetterName.size >= MIN_USE_STATES_FOR_STORE
      if (!hasManyStates) return {}
      // Own store still wins as the DESTINATION in the message once the 5-state bar is cleared -
      // "add it here" beats "make a new one" when there's already a real place for it to go.
      const storeHookImport = findFirstStoreHookImport(sourceCode.ast)

      function check(node, name) {
        if (SKIPPED_HANDLER_NAMES.has(name)) return
        const fn = node.type === "FunctionDeclaration" ? node : node.init
        if (!fn) return
        if (fn.type !== "FunctionDeclaration" && fn.type !== "ArrowFunctionExpression" && fn.type !== "FunctionExpression") return

        const actionExpr = getSingleActionExpression(fn)
        if (!actionExpr || actionExpr.type !== "CallExpression") return
        if (actionExpr.callee.type !== "Identifier") return

        const setterName = actionExpr.callee.name
        const stateName = stateNameBySetterName.get(setterName)
        if (!stateName) return

        // Its own store wins as the reason when both apply - it names a real destination, while the
        // count-based message can only say "make one".
        if (storeHookImport) {
          context.report({
            node,
            messageId: "askZustandMethod",
            data: { name, setterName, stateName, storeName: storeHookImport.name, storeSource: storeHookImport.source },
          })
          return
        }

        context.report({
          node,
          messageId: "askZustandStoreForManyStates",
          data: { name, setterName, stateCount: stateNameBySetterName.size },
        })
      }

      return {
        FunctionDeclaration(node) {
          if (node.id) check(node, node.id.name)
        },
        VariableDeclarator(node) {
          if (node.id.type !== "Identifier") return
          if (!node.init) return
          check(node, node.id.name)
        },
      }
    },
  },
}

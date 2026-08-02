"use strict"

const { findZustandStoreObjectLiterals } = require("./utils/findZustandStoreObjectLiterals")
const { getMainExportLineLoc } = require("./utils/mainExportLoc")

// A zustand store only earns create() because it holds real state - at least one data property
// that isn't itself a function. Signal 1 below is the GATE that decides whether this rule applies
// to a given store at all; signals 2-4 are supporting evidence checked ONLY once signal 1 already
// fired, never independently:
//   1. no real state field anywhere (every property is a function) - THE actual violation
//   2. `await` used inside one of its own function properties
//   3. another store's `.getState()` called inside one of its own function properties (reaching
//      into a DIFFERENT store's state instead of using this store's own `get()`)
//   4. `new XxxSDK()` constructed inside one of its own function properties
// A store that DOES hold real state calling e.g. useLoading.getState() to coordinate a shared
// loading flag (useMetricStatsModal, useAddEAModal, ~10 others in this codebase) is completely
// normal cross-store coordination, not this smell - signals 2-4 only mean something once signal 1
// has already proven the store has nothing of its own to justify existing.
//
// Real incident (2026-07-25, Nikita): useMailboxFromNameToast.ts hit ALL 4 signals at once - zero
// state fields, awaits emailsSDK.setEmailFromName, reads useEnvs.getState()/useAccountsStore.getState()
// (2 DIFFERENT stores, neither its own), and constructs `new EmailsSDK()` - built purely to dodge
// prefer-memo-row-component instead of fixing the real problem. The real fix was adding
// setEmailFromName as an action ON useAccountsStore (which already owns emailFromNames, the state
// this function actually writes to) - not inventing a new store with nothing to hold.
//
// Bad (useMailboxFromNameToast.ts, the real incident - hits all 4 signals):
//   export const useMailboxFromNameToast = create<MailboxFromNameToast>(() => ({
//     async setEmailFromName(mailbox, value) {
//       const { encryptedEnvsClient } = useEnvs.getState()
//       const { setEmailFromNames } = useAccountsStore.getState()
//       const emailsSDK = new EmailsSDK()
//       const response = await emailsSDK.setEmailFromName(encryptedEnvsClient, ...)
//       setEmailFromNames({ ...useAccountsStore.getState().emailFromNames, [mailbox]: value })
//     },
//   }))
// Good (real state field, isShowCompareDropdown, sits next to its own setter, no await/getState/SDK):
//   export const useMetricStatsModal = create<MetricStatsModal>((set, get) => ({
//     isShowCompareDropdown: false,
//     setIsShowCompareDropdown: isShowCompareDropdown => set(() => ({ isShowCompareDropdown })),
//   }))
// Good (the actual fix for the bad example above - the action moves onto the store that already
// owns the state it touches, instead of a new store built around it):
//   export default useAccountsStore = create(...)((set, get) => ({
//     emailFromNames: null,
//     setEmailFromNames: emailFromNames => set(() => ({ emailFromNames })),
//     async setEmailFromName(mailbox, value) { ... it calls get().setEmailFromNames(...) ... },
//   }))

// A property counts as "real state" if its value is anything other than a function - a
// data literal/array/object/null/undefined default, or a value read from another store's
// getState() at store-creation time. Functions (the store's own actions) never count, whether
// declared as `key: value => ...`, `key(...) {...}` (method shorthand), or `key: function() {}`.
function isFunctionValue(propertyValue) {
  return propertyValue.type === "ArrowFunctionExpression" || propertyValue.type === "FunctionExpression"
}

// A `...initialState` spread (useScheduledEmails.ts's own pattern - state pulled from a separate
// object instead of listed inline) almost always brings real state fields in with it - there's no
// cheap way to look inside the spread's own source object from here, so a spread on its own counts
// as proof of state rather than being skipped, keeping this rule silent on a store that spreads
// its state in instead of listing it property-by-property.
function hasRealStateProperty(objectLiteral) {
  return objectLiteral.properties.some(property => {
    if (property.type === "SpreadElement") return true
    if (property.type !== "Property") return false
    if (property.method) return false // method shorthand (`key() {}`) is always a function
    return !isFunctionValue(property.value)
  })
}

function countFunctionProperties(objectLiteral) {
  return objectLiteral.properties.filter(property => {
    if (property.type !== "Property") return false
    return property.method || isFunctionValue(property.value)
  }).length
}

// This store's own hook name (e.g. "useAccountsStore") - walks up through the curried
// create<T>()(fn) / persist(fn, {...}) calls AND the creator function's own body (an implicit-
// return arrow `() => ({...})` puts the object literal directly as the arrow's own body, an
// explicit `(set) => { return {...} }` puts it one ReturnStatement deeper) to reach the
// "export const useThing = ..." declaration - same reasoning as zustand-no-await-in-store.js's
// getStoreLabel, widened to also climb through the creator function itself. Needed so a store
// reading ITS OWN state via `useThisStore.getState()` (legitimate - same as calling `get()`) isn't
// mistaken for signal 3 (reaching into a DIFFERENT store).
function getOwnStoreHookName(objectLiteral) {
  let node = objectLiteral.parent
  while (
    node &&
    (node.type === "CallExpression" ||
      node.type === "Property" ||
      node.type === "ArrayExpression" ||
      node.type === "ArrowFunctionExpression" ||
      node.type === "FunctionExpression" ||
      node.type === "BlockStatement" ||
      node.type === "ReturnStatement")
  ) {
    node = node.parent
  }
  if (node && node.type === "VariableDeclarator" && node.id.type === "Identifier") return node.id.name
  return null
}

function getSdkConstructionName(node) {
  if (node.type !== "NewExpression") return null
  if (node.callee.type !== "Identifier") return null
  if (!/^[A-Z]\w*SDK$/.test(node.callee.name)) return null
  return node.callee.name
}

// `useXxxStore.getState()` / `useXxx.getState()` where useXxx isn't THIS store's own hook - the
// same "reach into a DIFFERENT store instead of using this store's own get()" smell, just checked
// from the store-creator side instead of the component side. Returns the other store's hook name
// (for the message), or null when it's not this shape at all, or when it IS this shape but points
// at this store's own hook (legitimate - same as calling get()).
function getOtherStoreGetStateName(node, ownStoreHookName) {
  if (node.type !== "CallExpression") return null
  if (node.callee.type !== "MemberExpression") return null
  if (node.callee.property.type !== "Identifier" || node.callee.property.name !== "getState") return null
  if (node.callee.object.type !== "Identifier") return null
  if (!/^use[A-Z]/.test(node.callee.object.name)) return null
  if (node.callee.object.name === ownStoreHookName) return null
  return node.callee.object.name
}

// Walks every function property's own body looking for the 3 AST-level signals (await, another
// store's getState(), new XxxSDK()) - stops once all 3 are found since one instance of each is
// already enough to report, same "any ONE is enough" reasoning as the header comment.
function findFunctionBodySignals(objectLiteral, ownStoreHookName) {
  const signals = { hasAwait: false, otherStoreName: null, sdkName: null }

  function walk(node) {
    if (!node || typeof node.type !== "string") return
    if (signals.hasAwait && signals.otherStoreName && signals.sdkName) return // all 3 found already

    if (node.type === "AwaitExpression") signals.hasAwait = true
    if (!signals.otherStoreName) signals.otherStoreName = getOtherStoreGetStateName(node, ownStoreHookName)
    if (!signals.sdkName) signals.sdkName = getSdkConstructionName(node)

    for (const key in node) {
      if (key === "parent") continue
      const value = node[key]
      if (Array.isArray(value)) value.forEach(walk)
      else if (value && typeof value.type === "string") walk(value)
    }
  }

  for (const property of objectLiteral.properties) {
    if (property.type !== "Property") continue
    const value = property.value
    if (property.method || isFunctionValue(value)) walk(value.body ?? value)
  }

  return signals
}

module.exports = {
  "zustand-no-stateless-store": {
    meta: {
      type: "problem",
      docs: {
        description:
          "disallow a zustand create() store whose returned object holds only function properties and no real state",
      },
      schema: [],
      messages: {
        noStateField:
          "This zustand store's returned object has {{fnCount}} function propert{{plural}} but no real state field (every property is a function) - a store only earns create() because it holds state. Move {{fnWord}} onto a store that already owns the state {{fnPronoun}} touch{{fnVerbSuffix}} instead of keeping a store with nothing to hold.",
        hasAwait:
          '"{{store}}" uses "await" inside one of its own function properties - that\'s real async business logic, the same signal zustand-no-await-in-store already bans when a store DOES have state. Move it onto a store that already owns the state it touches instead.',
        hasOtherStoreGetState:
          '"{{store}}" calls "{{otherStore}}.getState()" inside one of its own function properties - reaching into a DIFFERENT store\'s state instead of using this store\'s own get(). Move this function onto "{{otherStore}}" itself instead of keeping it here.',
        hasSdkConstruction:
          '"{{store}}" constructs "new {{sdkName}}()" inside one of its own function properties - a zustand store creator isn\'t where an SDK method call belongs. Move this function onto a store that already owns the state it touches instead.',
      },
    },
    create(context) {
      const filename = context.filename ?? context.getFilename()
      if (!/\.tsx?$/.test(filename)) return {}

      return {
        Program(node) {
          const objectLiterals = findZustandStoreObjectLiterals(node)
          const sourceCode = context.sourceCode ?? context.getSourceCode()

          for (const objectLiteral of objectLiterals) {
            if (objectLiteral.properties.length === 0) continue // empty store - nothing to flag yet
            if (hasRealStateProperty(objectLiteral)) continue // has real state - not this rule's shape at all

            const fnCount = countFunctionProperties(objectLiteral)
            if (fnCount === 0) continue // all spreads or something unrecognized - stays silent

            const ownStoreHookName = getOwnStoreHookName(objectLiteral)
            const loc = getMainExportLineLoc(node, sourceCode, filename.split("/").pop().replace(/\.tsx?$/, ""))
            const storeLabel = ownStoreHookName ?? "this store"

            const isSingle = fnCount === 1
            context.report({
              loc,
              messageId: "noStateField",
              data: {
                fnCount,
                plural: isSingle ? "y" : "ies",
                fnWord: isSingle ? "this function" : "these functions",
                fnPronoun: isSingle ? "it" : "they",
                fnVerbSuffix: isSingle ? "es" : "",
              },
            })

            // Signals 2-4 only add supporting evidence ONCE the store is already proven stateless
            // above - a store that DOES own real state calling useLoading.getState() to coordinate
            // a shared loading flag (useMetricStatsModal, useAddEAModal, ~10 others) is completely
            // normal cross-store coordination, not this smell. Only report these on a store that's
            // already been shown to hold nothing of its own.
            const signals = findFunctionBodySignals(objectLiteral, ownStoreHookName)

            if (signals.hasAwait) context.report({ loc, messageId: "hasAwait", data: { store: storeLabel } })

            if (signals.otherStoreName) {
              context.report({
                loc,
                messageId: "hasOtherStoreGetState",
                data: { store: storeLabel, otherStore: signals.otherStoreName },
              })
            }

            if (signals.sdkName) {
              context.report({ loc, messageId: "hasSdkConstruction", data: { store: storeLabel, sdkName: signals.sdkName } })
            }
          }
        },
      }
    },
  },
}

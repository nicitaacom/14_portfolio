"use strict"

const { isZustandCreateCall, findStoreCreatorIdentifier } = require("./utils/findZustandStoreObjectLiterals")

// zustand-persist-name chains the localStorage key to the store creator function's own name, and
// nothing was checking that name - so `function store(set) {...}` produced `name: "store"`, a key
// that says nothing about which store owns it and that the next store to be called `store` would
// take over. This closes that: the creator is named after the hook it builds, so the hook, the
// creator and the key all read as one name.
//
// The wanted name is the exported hook minus its `use` prefix, first letter lowercased. A leading
// run of capitals is one acronym whose LAST capital starts the next word (GSMStore = GSM + Store),
// so everything up to that last capital gets lowercased - useGSMStore wants gsmStore, not gSMStore.
//
// Bad:
//   function store(set: SetState): HotkeysModalStore { ... }
//   export const useHotkeysModalStore = create(subscribeWithSelector(persist(store, { name: "store" })))
// Good:
//   function hotkeysModalStore(set: SetState): HotkeysModalStore { ... }
//   export const useHotkeysModalStore = create(
//     subscribeWithSelector(persist(hotkeysModalStore, { name: "hotkeysModalStore" })),
//   )

// create<T>()(storeFn) nests the type arguments on an inner call, so the store creation is the
// OUTER CallExpression whose callee is itself create(...) - create<T>(storeFn) and
// create(subscribeWithSelector(...)) are the single-call shape instead.
function findStoreCreationCall(node) {
  if (!node || node.type !== "CallExpression") return null
  if (isZustandCreateCall(node.callee)) return node
  if (isZustandCreateCall(node)) return node
  return null
}

function creatorNameFor(hookName) {
  const withoutUse = hookName.startsWith("use") ? hookName.slice(3) : hookName
  if (!withoutUse) return null

  const capitals = withoutUse.match(/^[A-Z]+/)?.[0] ?? ""
  if (capitals.length <= 1) return withoutUse.charAt(0).toLowerCase() + withoutUse.slice(1)

  // GSMStore stops the run at "GSMS" - that last S belongs to Store, so it stays capital. DNC on
  // its own has nothing after it, so the whole run goes lowercase.
  const acronymLength = withoutUse.length > capitals.length ? capitals.length - 1 : capitals.length
  return withoutUse.slice(0, acronymLength).toLowerCase() + withoutUse.slice(acronymLength)
}

module.exports = {
  "zustand-creator-name-matches-store": {
    meta: {
      type: "suggestion",
      docs: {
        description: "require a zustand store creator function to be named after the hook it builds - the hook name minus its use prefix",
      },
      schema: [],
      messages: {
        creatorNameMismatch:
          'the store creator is named "{{creatorName}}" but "{{hookName}}" builds it, so it should be "{{wantedName}}" - rename the function and this call site. zustand-persist-name then makes the localStorage key "{{wantedName}}" too.',
      },
    },
    create(context) {
      return {
        VariableDeclarator(node) {
          if (node.id.type !== "Identifier") return

          const creationCall = findStoreCreationCall(node.init)
          if (!creationCall) return

          const creatorIdentifier = findStoreCreatorIdentifier(creationCall.arguments[0])
          if (!creatorIdentifier) return

          const hookName = node.id.name
          const wantedName = creatorNameFor(hookName)
          if (!wantedName || creatorIdentifier.name === wantedName) return

          context.report({
            node: creatorIdentifier,
            messageId: "creatorNameMismatch",
            data: { creatorName: creatorIdentifier.name, hookName, wantedName },
          })
        },
      }
    },
  },
}

"use strict"

// docs/code-patterns/component-related/zustand-patterns.md's persist example always hands
// persist() a NAMED store creator - either the bare identifier (`persist(gsmStore, {...})`) or a
// thin pass-through arrow that calls one (`persist(set => useAIScrapingDecisionsStoreState(set), {...})`).
// persist()'s first argument should never be an inline function whose body IS the store's object
// literal - that object has no name of its own, so nothing else in the file can reference "this
// store's creator" the way zustand-persist-name and zustand-extract-set-type both expect to.
//
// Bad:
//   export const useFingerprintStore = create<FingerprintStore>()(
//     persist(
//       set => ({
//         fingerprint: null,
//         setFingerprint: (fingerprint, computedAt) => set({ fingerprint, computedAt }),
//       }),
//       { name: "14-fingerprint-store" },
//     ),
//   )
// Good:
//   function fingerprintStore(set: SetState): FingerprintStore {
//     return {
//       fingerprint: null,
//       setFingerprint: (fingerprint, computedAt) => set({ fingerprint, computedAt }),
//     }
//   }
//   export const useFingerprintStore = create<FingerprintStore>()(
//     persist(fingerprintStore, { name: "fingerprintStore" }),
//   )

function isPersistCall(node) {
  return node.type === "CallExpression" && node.callee.type === "Identifier" && node.callee.name === "persist"
}

// True when an arrow/function's whole body is a call to some OTHER named function (the thin
// pass-through shape `set => useAIScrapingDecisionsStoreState(set)`) rather than the store's own
// object literal written out inline.
function isPassThroughToNamedFunction(fn) {
  const body = fn.body.type === "BlockStatement" ? fn.body.body.find(s => s.type === "ReturnStatement")?.argument : fn.body
  return body?.type === "CallExpression" && body.callee.type === "Identifier"
}

module.exports = {
  "zustand-persist-named-store": {
    meta: {
      type: "suggestion",
      docs: {
        description: "require persist()'s first argument to be a named store creator function, not an inline function whose body is the store's object literal",
      },
      schema: [],
      messages: {
        inlineStoreInPersist:
          "persist()'s first argument is an inline function that returns the store's object literal directly - extract it into a named store creator function (see docs/code-patterns/component-related/zustand-patterns.md) instead of writing the store body inline here.",
      },
    },
    create(context) {
      return {
        CallExpression(node) {
          if (!isPersistCall(node)) return

          const storeArg = node.arguments[0]
          if (!storeArg) return
          if (storeArg.type !== "ArrowFunctionExpression" && storeArg.type !== "FunctionExpression") return
          if (isPassThroughToNamedFunction(storeArg)) return

          context.report({ node: storeArg, messageId: "inlineStoreInPersist" })
        },
      }
    },
  },
}

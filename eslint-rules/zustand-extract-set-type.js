"use strict"

// docs/code-patterns/component-related/zustand-patterns.md's persist example extracts the store
// creator function's `set`/`get` parameter types into named `SetState`/`GetState` aliases
// declared right above it, instead of writing the function type inline on the parameter. This
// only applies to a STANDALONE creator function (a FunctionDeclaration or a
// `const x = (set, get) => ({...})` handed to create()/persist()/subscribeWithSelector() by
// identifier) - an inline `create<T>()(set => ({...}))` with no persist/middleware stays inline,
// nothing to extract there.
//
// Bad:
//   function gsmStore(set: (func: (state: GSMStore) => Partial<GSMStore>) => void): GSMStore {
//     return { ... }
//   }
// Good:
//   type SetState = (fn: (prevState: GSMStore) => Partial<GSMStore>) => void
//   type GetState = () => GSMStore
//
//   function gsmStore(set: SetState, get: GetState): GSMStore {
//     return { ... }
//   }

function hasSetFirstParam(node) {
  const firstParam = node.params[0]
  if (!firstParam) return false
  const identifier = firstParam.type === "Identifier" ? firstParam : null
  return identifier?.name === "set"
}

function isStandaloneCreator(node) {
  if (node.type === "FunctionDeclaration") return true
  if (node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression") {
    return node.parent?.type === "VariableDeclarator" && node.parent.id.type === "Identifier"
  }
  return false
}

function getCreatorLabel(node) {
  if (node.type === "FunctionDeclaration" && node.id) return node.id.name
  if (node.parent?.type === "VariableDeclarator" && node.parent.id.type === "Identifier") return node.parent.id.name
  return "this store"
}

module.exports = {
  "zustand-extract-set-type": {
    meta: {
      type: "suggestion",
      docs: {
        description:
          "require a standalone zustand store creator function's set/get params to use extracted SetState/GetState type aliases instead of an inline function type",
      },
      schema: [],
      messages: {
        extractSetType:
          '"{{store}}"\'s "{{param}}" param is typed inline - extract a "SetState"/"GetState" type alias above this function instead (see docs/code-patterns/component-related/zustand-patterns.md).',
      },
    },
    create(context) {
      function checkFunction(node) {
        if (!hasSetFirstParam(node)) return
        if (!isStandaloneCreator(node)) return

        for (const param of node.params.slice(0, 2)) {
          if (param.type !== "Identifier" || !param.typeAnnotation) continue
          const annotation = param.typeAnnotation.typeAnnotation
          if (annotation.type !== "TSFunctionType") continue

          context.report({
            node: param,
            messageId: "extractSetType",
            data: { store: getCreatorLabel(node), param: param.name },
          })
        }
      }

      return {
        FunctionDeclaration: checkFunction,
        FunctionExpression: checkFunction,
        ArrowFunctionExpression: checkFunction,
      }
    },
  },
}

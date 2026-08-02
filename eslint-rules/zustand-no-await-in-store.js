"use strict"

// Zustand stores must stay synchronous - see docs/code-patterns/component-related/zustand-patterns.md.
// Async work (network calls, timers, etc.) belongs in a hook that calls the store's bare setter,
// never inside the store's own create() creator function. A store creator is identified by its
// codebase-wide naming convention: first param literally named "set" (matches every store in this
// repo, including named functions handed to persist()/subscribeWithSelector() middleware) - not by
// tracing the create() call itself, which would miss the middleware-wrapped, named-function form.
//
// Bad:
//   export const useThing = create<ThingStore>()(set => ({
//     thing: null,
//     setThing: async id => {
//       const thing = await fetchThing(id)
//       set({ thing })
//     },
//   }))
// Good:
//   export const useThing = create<ThingStore>()(set => ({
//     thing: null,
//     setThing: thing => set({ thing }),
//   }))
//   // async work lives in a hook instead:
//   export function useSetThing(id: string) {
//     const { setThing } = useThing()
//     useEffect(() => {
//       fetchThing(id).then(setThing)
//     }, [id])
//   }

function hasSetFirstParam(node) {
  const firstParam = node.params[0]
  if (!firstParam) return false
  // destructured/typed params are still an Identifier node with a "set" name at the top level
  return firstParam.type === "Identifier" && firstParam.name === "set"
}

function getFunctionLabel(node) {
  const parent = node.parent
  if (parent && parent.type === "Property" && parent.key.type === "Identifier") return parent.key.name
  if (parent && parent.type === "VariableDeclarator" && parent.id.type === "Identifier") return parent.id.name
  if (node.id && node.id.name) return node.id.name
  return "this function"
}

function getStoreLabel(creatorNode) {
  if (creatorNode.id && creatorNode.id.name) return creatorNode.id.name
  // walk up through the curried create<T>()(fn) / persist(fn, {...}) call wrappers to reach the
  // "export const useThing = ..." declaration
  let node = creatorNode.parent
  while (node && (node.type === "CallExpression" || node.type === "Property" || node.type === "ArrayExpression")) {
    node = node.parent
  }
  if (node && node.type === "VariableDeclarator" && node.id.type === "Identifier") return node.id.name
  return "this store"
}

module.exports = {
  "zustand-no-await-in-store": {
    meta: {
      type: "problem",
      docs: {
        description:
          "disallow async/await inside a zustand store's creator function - stores must stay synchronous, async work belongs in a hook",
      },
      schema: [],
      messages: {
        noAsyncFunction:
          '"{{name}}" is async, but it\'s inside zustand store "{{store}}"\'s creator function - stores must stay synchronous. Move the async work into a hook that calls this store\'s setter instead.',
        noAwait:
          '"await" used inside zustand store "{{store}}"\'s creator function - stores must stay synchronous. Move the async work into a hook that calls this store\'s setter instead.',
      },
    },
    create(context) {
      const creatorStack = []

      function checkFunction(node) {
        const isCreator = hasSetFirstParam(node)
        if (isCreator) creatorStack.push(getStoreLabel(node))

        if (creatorStack.length > 0 && node.async) {
          context.report({
            node,
            messageId: "noAsyncFunction",
            data: { name: getFunctionLabel(node), store: creatorStack[creatorStack.length - 1] },
          })
        }
      }

      function popIfCreator(node) {
        if (hasSetFirstParam(node)) creatorStack.pop()
      }

      return {
        FunctionDeclaration: checkFunction,
        FunctionExpression: checkFunction,
        ArrowFunctionExpression: checkFunction,
        "FunctionDeclaration:exit": popIfCreator,
        "FunctionExpression:exit": popIfCreator,
        "ArrowFunctionExpression:exit": popIfCreator,
        AwaitExpression(node) {
          if (creatorStack.length === 0) return
          context.report({ node, messageId: "noAwait", data: { store: creatorStack[creatorStack.length - 1] } })
        },
      }
    },
  },
}

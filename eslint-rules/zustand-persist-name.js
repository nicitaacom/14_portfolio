"use strict"

// zustand's persist() middleware takes a `name` option that becomes the localStorage key
// (persist(gsmStore, { name: "gsmStore" })). That key should be the store creator function's own
// name, not a free-text/dotted string someone typed by hand - a hand-typed name drifts from the
// function it labels the moment either one gets renamed, and nothing catches the mismatch.
//
// Bad:
//   function gsmStore(set) { ... }
//   persist(gsmStore, { name: "gsm.selectedSim" })
// Good:
//   function gsmStore(set) { ... }
//   persist(gsmStore, { name: "gsmStore" })

function isPersistCall(node) {
  return node.type === "CallExpression" && node.callee.type === "Identifier" && node.callee.name === "persist"
}

module.exports = {
  "zustand-persist-name": {
    meta: {
      type: "suggestion",
      fixable: "code",
      docs: {
        description: "require persist()'s name option to match the store creator function's own name",
      },
      schema: [],
      messages: {
        wrongPersistName: 'persist()\'s name option is "{{actualName}}" but the store creator function is "{{fnName}}" - use "{{fnName}}" so the two never drift apart.',
      },
    },
    create(context) {
      return {
        CallExpression(node) {
          if (!isPersistCall(node)) return

          const [storeArg, optionsArg] = node.arguments
          if (!storeArg || storeArg.type !== "Identifier") return
          if (!optionsArg || optionsArg.type !== "ObjectExpression") return

          const nameProperty = optionsArg.properties.find(
            property => property.type === "Property" && property.key.type === "Identifier" && property.key.name === "name",
          )
          if (!nameProperty) return
          if (nameProperty.value.type !== "Literal" || typeof nameProperty.value.value !== "string") return

          const fnName = storeArg.name
          const actualName = nameProperty.value.value
          if (actualName === fnName) return

          context.report({
            node: nameProperty.value,
            messageId: "wrongPersistName",
            data: { actualName, fnName },
            fix(fixer) {
              return fixer.replaceText(nameProperty.value, JSON.stringify(fnName))
            },
          })
        },
      }
    },
  },
}

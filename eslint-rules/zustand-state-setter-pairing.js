"use strict"

const { findZustandStoreObjectLiterals, findZustandStoreTypeMembers } = require("./utils/findZustandStoreObjectLiterals")

// Within a zustand store's returned object, each state property should sit directly next to its
// own setter (whatever verb the setter uses - set/add/reset/clear/toggle/upd/increase/decrease/
// remove/push/hadd/hdel/hupd, not just "set"), with a blank line separating each state+setter
// pair from the next one. Unrelated properties (no matching pair) aren't required to have a
// blank line before/after them - only recognized pairs are checked.
// Wrong:
//   isSetSecretKeyInLS: false,
//   skOrOTPInputValue: "",
//   setIsSetSecretKeyInLS: (isSetSecretKeyInLS: boolean) => set(() => ({ isSetSecretKeyInLS })),
//   setSKOrOTPInputValue: SKInputValue => set(() => ({ skOrOTPInputValue: SKInputValue })),
// Correct:
//   isSetSecretKeyInLS: false,
//   setIsSetSecretKeyInLS: (isSetSecretKeyInLS: boolean) => set(() => ({ isSetSecretKeyInLS })),
//
//   skOrOTPInputValue: "",
//   setSKOrOTPInputValue: skOrOTPInputValue => set(() => ({ skOrOTPInputValue })),
const SETTER_VERB_PREFIXES = [
  "set",
  "add",
  "reset",
  "clear",
  "toggle",
  "upd",
  "update",
  "increase",
  "decrease",
  "remove",
  "push",
  "hadd",
  "hdel",
  "hupd",
]

// Strips a recognized verb prefix from a property name and lowercases the following letter, so
// "setIsSetSecretKeyInLS" -> "isSetSecretKeyInLS", matchable against the state property
// "isSetSecretKeyInLS" it pairs with. Returns null if no known verb prefix matches.
function stripSetterVerb(name) {
  for (const verb of SETTER_VERB_PREFIXES) {
    if (name.length > verb.length && name.startsWith(verb) && /[A-Z]/.test(name[verb.length])) {
      return name[verb.length].toLowerCase() + name.slice(verb.length + 1)
    }
  }
  return null
}

module.exports = {
  "zustand-state-setter-pairing": {
    meta: {
      type: "suggestion",
      // Only the blank-line half is fixable - inserting a newline never changes what the code does.
      // pairNotAdjacent stays report-only on purpose: reordering properties is a judgment call about
      // which setter belongs to which state, and this rule already skips the ambiguous cases rather
      // than guessing.
      fixable: "whitespace",
      docs: {
        description: "require a zustand store's state property to sit directly next to its own setter, with a blank line between each pair",
      },
      schema: [],
      messages: {
        pairNotAdjacent:
          '"{{stateName}}" and its setter "{{setterName}}" should be adjacent (state property immediately followed by its own setter), not separated by other properties.',
        missingBlankLineBetweenPairs:
          'Add a blank line after the "{{stateName}}" / "{{setterName}}" pair, before the next property.',
      },
    },
    create(context) {
      const sourceCode = context.sourceCode ?? context.getSourceCode()

      return {
        Program(node) {
          // The store's returned object AND the type it was created with, checked the same way -
          // the two list the same state/setter names, so grouping them differently makes the reader
          // match the halves up by eye. A TSPropertySignature exposes `.key` and `.loc` exactly
          // like a Property, so the pairing below reads both without branching.
          const memberLists = [
            ...findZustandStoreObjectLiterals(node).map(objectLiteral => objectLiteral.properties),
            ...findZustandStoreTypeMembers(node).map(typeBody => typeBody.members ?? typeBody.body),
          ]

          for (const members of memberLists) {
            const properties = members.filter(
              property =>
                (property.type === "Property" || property.type === "TSPropertySignature") && property.key.type === "Identifier",
            )

            // Map from a state property's name to the setter property that pairs with it (only
            // among properties whose stripped-verb form matches another property's name exactly).
            const nameToProperty = new Map(properties.map(property => [property.key.name, property]))

            // A state name matched by MORE THAN ONE setter-shaped property (e.g. "ingredient"
            // matched by setIngredient, addIngredient, AND removeIngredient) is ambiguous - it's
            // not a single state+setter pair, it's a state with several independent action
            // methods. Skip pairing entirely for those names rather than guessing which one
            // setter is "the" pair.
            const setterMatchCounts = new Map()
            for (const property of properties) {
              const strippedName = stripSetterVerb(property.key.name)
              if (!strippedName || !nameToProperty.has(strippedName)) continue
              setterMatchCounts.set(strippedName, (setterMatchCounts.get(strippedName) ?? 0) + 1)
            }

            const pairs = []
            for (const property of properties) {
              const strippedName = stripSetterVerb(property.key.name)
              if (!strippedName) continue
              const stateProperty = nameToProperty.get(strippedName)
              if (!stateProperty || stateProperty === property) continue
              if ((setterMatchCounts.get(strippedName) ?? 0) > 1) continue
              pairs.push({ stateProperty, setterProperty: property })
            }

            for (const { stateProperty, setterProperty } of pairs) {
              const stateIndex = properties.indexOf(stateProperty)
              const setterIndex = properties.indexOf(setterProperty)

              if (Math.abs(setterIndex - stateIndex) !== 1) {
                context.report({
                  node: setterProperty,
                  messageId: "pairNotAdjacent",
                  data: { stateName: stateProperty.key.name, setterName: setterProperty.key.name },
                })
                continue
              }

              // The pair's later property (whichever of the two comes second in source order) is
              // the one that should have a blank line after it, before the next property.
              const laterIndex = Math.max(stateIndex, setterIndex)
              const laterProperty = properties[laterIndex]
              const nextProperty = properties[laterIndex + 1]
              if (!nextProperty) continue

              // Skip if nextProperty is itself the state-half of a DIFFERENT pair whose setter
              // comes before it - already covered by that pair's own check from its own "later"
              // property, so this avoids double-reporting the same gap from both sides.
              const blankLinesBetween = nextProperty.loc.start.line - laterProperty.loc.end.line
              if (blankLinesBetween < 2) {
                context.report({
                  node: laterProperty,
                  messageId: "missingBlankLineBetweenPairs",
                  data: { stateName: stateProperty.key.name, setterName: setterProperty.key.name },
                  fix(fixer) {
                    // Insert AFTER the pair's own separator, not after the property node itself -
                    // a Property ends before its "," and a TSPropertySignature can end before a
                    // ";", so inserting at the node's own end would put the blank line between the
                    // property and its separator instead of between the two pairs.
                    const nextToken = sourceCode.getTokenAfter(laterProperty)
                    const anchor = nextToken && (nextToken.value === "," || nextToken.value === ";") ? nextToken : laterProperty
                    return fixer.insertTextAfter(anchor, "\n")
                  },
                })
              }
            }
          }
        },
      }
    },
  },
}

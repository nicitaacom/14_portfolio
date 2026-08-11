"use strict"

// The `repos` array is numbered by hand and read back by id (publicReposMap[26]), so the ids
// have to stay a run of 1, 2, 3 ... with nothing skipped and nothing repeated.
//
// A gap is what this rule exists for: id 25 (bottle energy) was deleted outright when its
// github repo went away, which left the array jumping 24 -> 26 and every id after it one
// step out of line with the number in its own description ("28 notion clone" at index 26).
// A project that is gone stays in the array as an entry with no url - the navbar ticker only
// renders entries that own one - rather than being cut out and taking its number with it.
//
// Bad:
//   { id: 24, ... },
//   { id: 26, ... },   <- 25 skipped
// Good:
//   { id: 24, ... },
//   { id: 25, ... },
//   { id: 26, ... },
const ARRAY_VARIABLE_NAME = "repos"
const ID_PROPERTY_NAME = "id"
const FIRST_ID = 1

function getPropertyName(property) {
  if (property.type !== "Property") return null
  if (property.key.type === "Identifier") return property.key.name
  if (property.key.type === "Literal") return String(property.key.value)
  return null
}

// The id of one entry, when it is written as a number literal - an id computed at runtime
// has no value to compare against its neighbours, so such an entry is skipped.
function getIdProperty(element) {
  if (!element || element.type !== "ObjectExpression") return null
  for (const property of element.properties) {
    if (getPropertyName(property) !== ID_PROPERTY_NAME) continue
    if (property.value.type !== "Literal" || typeof property.value.value !== "number") return null
    return { node: property, id: property.value.value }
  }
  return null
}

module.exports = {
  "require-id-repos-order": {
    meta: {
      type: "problem",
      docs: {
        description: `require every id in the ${ARRAY_VARIABLE_NAME} array to run 1, 2, 3 ... with no gaps and no repeats`,
      },
      schema: [],
      messages: {
        firstIdNotOne: `The ${ARRAY_VARIABLE_NAME} array starts at id {{id}} - the first entry has to be id ${FIRST_ID}.`,
        missingId: `id {{missing}} is missing - {{previous}} is followed by {{id}}. Keep the run unbroken: a project whose repo is gone stays here as an entry with no url.`,
        duplicateId: `id {{id}} is already taken by an earlier entry - every id in ${ARRAY_VARIABLE_NAME} is used once.`,
        idGoesBackwards: `id {{id}} comes after id {{previous}} - the ${ARRAY_VARIABLE_NAME} entries are ordered by id going up.`,
      },
    },
    create(context) {
      const sourceCode = context.sourceCode || context.getSourceCode()

      // Report against the whole line the id sits on rather than the few characters of
      // "id: 26" - a squiggle under one number is hard to spot in the editor gutter.
      function reportOnLine(node, messageId, data) {
        const line = node.loc.start.line
        const lineText = sourceCode.lines[line - 1] || ""
        context.report({
          loc: { start: { line, column: 0 }, end: { line, column: lineText.length } },
          messageId,
          data,
        })
      }

      return {
        VariableDeclarator(node) {
          if (node.id.type !== "Identifier" || node.id.name !== ARRAY_VARIABLE_NAME) return
          if (!node.init || node.init.type !== "ArrayExpression") return

          const seen = new Set()
          let previous = null

          for (const element of node.init.elements) {
            const entry = getIdProperty(element)
            if (!entry) continue
            const { id } = entry

            if (previous === null) {
              if (id !== FIRST_ID) {
                reportOnLine(entry.node, "firstIdNotOne", { id: String(id) })
              }
            } else if (seen.has(id)) {
              reportOnLine(entry.node, "duplicateId", { id: String(id) })
            } else if (id <= previous) {
              reportOnLine(entry.node, "idGoesBackwards", { id: String(id), previous: String(previous) })
            } else if (id > previous + 1) {
              const missing = []
              for (let gap = previous + 1; gap < id; gap += 1) missing.push(gap)
              reportOnLine(entry.node, "missingId", {
                missing: missing.join(", "),
                previous: String(previous),
                id: String(id),
              })
            }

            seen.add(id)
            previous = id
          }
        },
      }
    },
  },
}

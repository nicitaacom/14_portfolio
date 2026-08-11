"use strict"

// Every component that reads a project out of trackedProjectsMap has to pull it into one
// `const project` at the top of the function, then reference `project` from there on.
//
// Project cards already do this. The ModalMoreInfo* components did not - they repeated the
// map lookup inline at each prop, so the slug string was written out two or three times per
// file and a typo in any one of them produced `undefined` at render instead of a build error.
//
// Bad:
//   export default function ModalMoreInfo26() {
//     return <ModalMoreInfo stack={trackedProjectsMap["project-26-hot-delivery"].stack} />
//   }
// Good:
//   export default function ModalMoreInfo26() {
//     const project = trackedProjectsMap["project-26-hot-delivery"]
//     return <ModalMoreInfo stack={project.stack} />
//   }
const MAP_NAME = "trackedProjectsMap"
const REQUIRED_VARIABLE_NAME = "project"

// The slug key, when it is a string literal - a computed key built at runtime
// (trackedProjectsMap[someSlug]) is left alone, since there is no one slug to hoist.
function getSlugKey(node) {
  if (!node.computed) return null
  const key = node.property
  if (key.type === "Literal" && typeof key.value === "string") return key.value
  return null
}

function isMapLookup(node) {
  return node.object.type === "Identifier" && node.object.name === MAP_NAME
}

function getEnclosingFunctionName(node) {
  if (node.type === "FunctionDeclaration" && node.id) return node.id.name
  if (node.parent && node.parent.type === "VariableDeclarator" && node.parent.id.type === "Identifier") {
    return node.parent.id.name
  }
  return "this component"
}

// The whitespace the first statement of the body sits behind, so the hoisted const lands on
// the same column as the statement it is inserted in front of.
function getStatementIndent(sourceCode, statement) {
  const text = sourceCode.getText()
  let start = statement.range[0]
  while (start > 0 && text[start - 1] !== "\n") start -= 1
  return text.slice(start, statement.range[0])
}

module.exports = {
  "require-const-project": {
    meta: {
      type: "suggestion",
      docs: {
        description: `require ${MAP_NAME} lookups to be hoisted into one "const ${REQUIRED_VARIABLE_NAME}" per component`,
      },
      fixable: "code",
      schema: [],
      messages: {
        hoistToConstProject: `Add "const ${REQUIRED_VARIABLE_NAME} = ${MAP_NAME}['{{slug}}']" at the top of {{fnName}} and read "${REQUIRED_VARIABLE_NAME}.{{property}}" here instead of repeating the lookup.`,
        useConstProject: `{{fnName}} already holds this lookup in "${REQUIRED_VARIABLE_NAME}" - read "${REQUIRED_VARIABLE_NAME}.{{property}}" instead of looking '{{slug}}' up again.`,
        hoistManually: `{{fnName}} looks up {{slugCount}} different slugs - hoist each one into its own const and reference those, not ${MAP_NAME} inline.`,
        renameToProject: `Name the ${MAP_NAME} lookup "${REQUIRED_VARIABLE_NAME}", not "{{name}}" - every other component reads it under that name.`,
      },
    },
    create(context) {
      const sourceCode = context.sourceCode || context.getSourceCode()
      const scopeStack = []

      function currentScope() {
        return scopeStack[scopeStack.length - 1]
      }

      function enterScope(node) {
        scopeStack.push({ node, inlineLookups: [], declarators: [] })
      }

      // What the reported lookup is being read off of, so the message can name it
      // ("project.stack" rather than a bare "project") - a lookup that is passed around whole
      // has no such property, and falls back to the slug-neutral wording.
      function getReadProperty(lookup) {
        const parent = lookup.parent
        if (parent && parent.type === "MemberExpression" && parent.object === lookup && !parent.computed) {
          return parent.property.name
        }
        return "slug"
      }

      function buildHoistFix(scope, slug, lookups) {
        const body = scope.node.body
        if (!body || body.type !== "BlockStatement" || body.body.length === 0) return null
        const firstStatement = body.body[0]
        const indent = getStatementIndent(sourceCode, firstStatement)

        return fixer => {
          const declaration = `const ${REQUIRED_VARIABLE_NAME} = ${MAP_NAME}["${slug}"]\n\n${indent}`
          return [
            fixer.insertTextBefore(firstStatement, declaration),
            ...lookups.map(lookup => fixer.replaceText(lookup, REQUIRED_VARIABLE_NAME)),
          ]
        }
      }

      function exitScope() {
        const scope = scopeStack.pop()
        if (!scope) return

        for (const declarator of scope.declarators) {
          if (declarator.id.name !== REQUIRED_VARIABLE_NAME) {
            context.report({ node: declarator.id, messageId: "renameToProject", data: { name: declarator.id.name } })
          }
        }

        if (scope.inlineLookups.length === 0) return

        const fnName = getEnclosingFunctionName(scope.node)
        const slugs = [...new Set(scope.inlineLookups.map(lookup => lookup.slug))]

        // More than one project in the same function - "project" can only name one of them, so
        // point at the repetition and let the author pick the two names.
        if (slugs.length > 1) {
          for (const { node } of scope.inlineLookups) {
            context.report({ node, messageId: "hoistManually", data: { fnName, slugCount: String(slugs.length) } })
          }
          return
        }

        const slug = slugs[0]
        const held = scope.declarators.find(
          declarator => declarator.id.name === REQUIRED_VARIABLE_NAME && declarator.slug === slug,
        )

        // The const is already there, so each inline lookup is just a missed reference to it.
        if (held) {
          for (const { node } of scope.inlineLookups) {
            context.report({
              node,
              messageId: "useConstProject",
              data: { fnName, slug, property: getReadProperty(node) },
              fix: fixer => fixer.replaceText(node, REQUIRED_VARIABLE_NAME),
            })
          }
          return
        }

        // No const yet - the first report holds the whole change (declare it, then rewrite
        // every lookup at once), the rest only mark the spots so the same edit is not applied
        // twice in one pass.
        const nodes = scope.inlineLookups.map(lookup => lookup.node)
        const fix = buildHoistFix(scope, slug, nodes)
        nodes.forEach((node, index) => {
          context.report({
            node,
            messageId: "hoistToConstProject",
            data: { fnName, slug, property: getReadProperty(node) },
            fix: index === 0 ? fix : null,
          })
        })
      }

      return {
        Program: enterScope,
        "Program:exit": exitScope,
        FunctionDeclaration: enterScope,
        "FunctionDeclaration:exit": exitScope,
        FunctionExpression: enterScope,
        "FunctionExpression:exit": exitScope,
        ArrowFunctionExpression: enterScope,
        "ArrowFunctionExpression:exit": exitScope,

        MemberExpression(node) {
          if (!isMapLookup(node)) return
          const slug = getSlugKey(node)
          if (slug === null) return

          const scope = currentScope()
          if (!scope) return

          const parent = node.parent
          const isDeclaratorInit =
            parent && parent.type === "VariableDeclarator" && parent.init === node && parent.id.type === "Identifier"

          if (isDeclaratorInit) {
            scope.declarators.push({ id: parent.id, slug })
            return
          }

          scope.inlineLookups.push({ node, slug })
        },
      }
    },
  },
}

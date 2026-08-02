"use strict"

function isZustandCreateCall(node) {
  return node.type === "CallExpression" && node.callee.type === "Identifier" && node.callee.name === "create"
}

// Finds the object literal(s) a zustand store actually returns: either create<T>()({ ... }) /
// create<T>({ ... }) directly, or create<T>()((set, get) => ({ ... })) /
// create<T>()(function (set, get) { return { ... } }).
function findZustandStoreObjectLiterals(programNode) {
  const objectLiterals = []

  function visit(node) {
    if (!node || typeof node.type !== "string") return

    const isCreateCall = isZustandCreateCall(node) || (node.type === "CallExpression" && isZustandCreateCall(node.callee))
    if (isCreateCall) {
      for (const arg of node.arguments) {
        if (arg.type === "ObjectExpression") {
          objectLiterals.push(arg)
        } else if (arg.type === "ArrowFunctionExpression" || arg.type === "FunctionExpression") {
          if (arg.body.type === "ObjectExpression") {
            objectLiterals.push(arg.body)
          } else if (arg.body.type === "BlockStatement") {
            for (const statement of arg.body.body) {
              if (statement.type === "ReturnStatement" && statement.argument && statement.argument.type === "ObjectExpression") {
                objectLiterals.push(statement.argument)
              }
            }
          }
        }
      }
    }

    for (const key of Object.keys(node)) {
      if (key === "parent") continue
      const value = node[key]
      if (Array.isArray(value)) {
        value.forEach(visit)
      } else if (value && typeof value.type === "string") {
        visit(value)
      }
    }
  }

  visit(programNode)
  return objectLiterals
}

// The type the store is created WITH - `create<TicketsStore>(...)` names TicketsStore, and that
// name resolves to a `type TicketsStore = { ... }` or `interface TicketsStore { ... }` in the same
// file. The store's returned object and this type list the exact same state/setter names, so
// whatever pairing/spacing reads well in one has to read the same way in the other - a type whose
// members run together while the object below it is grouped in pairs makes the reader match them up
// by eye. Returns the TSTypeLiteral / TSInterfaceBody nodes, whose members are TSPropertySignature
// rather than Property - the caller reads `.key` off both the same way.
function findZustandStoreTypeMembers(programNode) {
  const typeNames = new Set()
  const typeBodiesByName = new Map()

  function visit(node) {
    if (!node || typeof node.type !== "string") return

    const isCreateCall = isZustandCreateCall(node) || (node.type === "CallExpression" && isZustandCreateCall(node.callee))
    if (isCreateCall) {
      // create<T>(...) puts T on the call itself; create<T>()(...) puts it on the inner callee.
      for (const call of [node, node.callee]) {
        const typeArgs = call?.typeArguments ?? call?.typeParameters
        const first = typeArgs?.params?.[0]
        if (first?.type === "TSTypeReference" && first.typeName.type === "Identifier") typeNames.add(first.typeName.name)
      }
    }

    if (node.type === "TSTypeAliasDeclaration" && node.typeAnnotation.type === "TSTypeLiteral") {
      typeBodiesByName.set(node.id.name, node.typeAnnotation)
    }
    if (node.type === "TSInterfaceDeclaration") {
      typeBodiesByName.set(node.id.name, node.body)
    }

    for (const key of Object.keys(node)) {
      if (key === "parent") continue
      const value = node[key]
      if (Array.isArray(value)) {
        value.forEach(visit)
      } else if (value && typeof value.type === "string") {
        visit(value)
      }
    }
  }

  visit(programNode)

  const bodies = []
  for (const name of typeNames) {
    const body = typeBodiesByName.get(name)
    if (body) bodies.push(body)
  }
  return bodies
}

module.exports = { findZustandStoreObjectLiterals, findZustandStoreTypeMembers }

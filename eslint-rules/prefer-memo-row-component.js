"use strict"

const fs = require("fs")
const path = require("path")

// A .map()/.flatMap() building a list should hand each row off to its own memo()'d component
// (<ItemRow key={item.id} .../>), not construct raw JSX (<li>, <div>, <motion.li>, etc.) directly
// inside the callback - memo() lets each row skip re-rendering when its own props haven't changed;
// constructing the row's JSX inline (even inside a useMemo-wrapped .map()) re-creates every row's
// element tree on every parent re-render regardless, since useMemo only memoizes the ARRAY of
// descriptors, not each row's own render output. See component-rendering-useMemo-isSkeleton-hook-
// patterns.md: "memo() already stops each row from re-rendering when its own props haven't changed
// ... don't also wrap the .map() itself in useMemo." Only checks the OUTERMOST .map()/.flatMap() in
// a nesting chain - a small nested .map() building a few inline badges/tags WITHIN one row (e.g.
// rule.actions.map(action => <span key={...}>...</span>)) isn't the row-list pattern this targets.
//
// Once the row is already its own component (not raw inline JSX), two more things are checked:
// 1. the row component's own file must actually wrap it in memo() - resolved by following this
//    file's import back to the row's own file on disk (best-effort: unresolved/unreadable is fail-
//    open, not a violation, same as widget-index-export-4's own file lookups). Exception: a row
//    component with no onXxx-shaped prop anywhere in its own props type (a static skeleton
//    placeholder, or a row that's data-only with no real interactivity) is never required to
//    be memo()'d - no-pointless-memo already flags memo() on a component like that for the same
//    reason, so the two rules would otherwise contradict each other on the exact same file.
// 2. any handler-shaped prop (handleXxx/onXxx) passed to the row as a bare identifier is flagged
//    ONLY when it's provably an ordinary function/useCallback defined directly in THIS file - a prop
//    forwarded from further up, or a store action destructured straight from a zustand hook, is
//    left alone (both already-stable references, not the smell this targets), matching
//    use-smth-handlers' own convention for what counts as "extract this into a hook".
//
// Bad (inline JSX instead of a row component):
//   emailRules.flatMap(rule => [
//     <motion.li key={rule.id}>...</motion.li>,
//   ])
// Bad (row component exists but isn't memoized - EmailRuleRow.tsx):
//   export function EmailRuleRow({ rule, handleDelete }: Props) { ... }
// Bad (handleDelete defined locally instead of via a handlers hook):
//   const handleDelete = (id: string) => { ... }
//   emailRules.map(rule => <EmailRuleRow key={rule.id} rule={rule} handleDelete={handleDelete} />)
// Good (EmailRuleRow.tsx):
//   export const EmailRuleRow = memo(function EmailRuleRow({ rule, handleDelete }: Props) {
//     return <li>...<button onClick={() => handleDelete(rule.id)}>delete</button></li>
//   })
// Good (EmailRules.tsx):
//   const { handleDelete } = useEmailRulesHandlers()
//   emailRules.map(rule => <EmailRuleRow key={rule.id} rule={rule} handleDelete={handleDelete} />)
//
// Exception: a row with NO event-handler prop anywhere in its own subtree (no onClick/onChange/
// onXxx attribute) stays inline, no extraction needed - memo() exists to stop a row re-rendering
// when its OWN props haven't changed, so a row that's pure display (just data, no interactivity)
// has nothing for memo() to protect in the first place, no matter how many lines it spans. Only an
// onXxx attribute wired to an actual expression counts - a static className/style prop doesn't.
// Good (pure display, no onXxx anywhere - stays inline regardless of size):
//   {Array.from({ length: 6 }).map((_, index) => (
//     <div className="w-full h-10 rounded-lg bg-foreground/20 animate-pulse" key={index} />
//   ))}
// Bad (has onClick - real interactivity, needs a memo()'d row):
//   {items.map(item => <li onClick={() => onSelect(item)} key={item.id}>{item.label}</li>)}
//
// The same exception runs in reverse for a row that's ALREADY its own separate function: if it's
// declared in THIS file, used by only this one .map(), and has no onXxx anywhere in its own body,
// it should be inlined back - the separate function bought nothing, same as the inline case above.
// Only checked for locally-declared rows (a component resolved via import is left alone - a known
// gap, matching this file's existing fail-open default rather than a repo-wide reuse grep).
// Bad (AffectedRuleRow only used once, no event handler, still its own function):
//   function AffectedRuleRow({ name }: { name: string }) {
//     return <li className="text-xs text-danger-text/80">{name}</li>
//   }
//   affectedRuleNames.map(name => <AffectedRuleRow name={name} key={name} />)
// Good (inlined - no separate function to skip a re-render that was never expensive):
//   affectedRuleNames.map(name => <li className="text-xs text-danger-text/80" key={name}>{name}</li>)

function isMapLikeCall(node) {
  return (
    node.type === "CallExpression" &&
    node.callee.type === "MemberExpression" &&
    !node.callee.computed &&
    node.callee.property.type === "Identifier" &&
    (node.callee.property.name === "map" || node.callee.property.name === "flatMap")
  )
}

function isLowercaseTagJSXElement(node) {
  if (!node || node.type !== "JSXElement") return false
  const name = node.openingElement.name
  if (name.type === "JSXIdentifier") return /^[a-z]/.test(name.name)
  if (name.type === "JSXMemberExpression" && name.object.type === "JSXIdentifier") return /^[a-z]/.test(name.object.name)
  return false
}

function isPascalTagJSXElement(node) {
  if (!node || node.type !== "JSXElement") return false
  const name = node.openingElement.name
  if (name.type === "JSXIdentifier") return /^[A-Z]/.test(name.name)
  if (name.type === "JSXMemberExpression" && name.object.type === "JSXIdentifier") return /^[A-Z]/.test(name.object.name)
  return false
}

function getComponentTagName(jsxElement) {
  const name = jsxElement.openingElement.name
  return name.type === "JSXIdentifier" ? name.name : name.object.name
}

// Best-effort: resolves this file's own import of the row component to a file on disk, trying
// both extensions and an index file - missing/unreadable is treated as unprovable either way,
// not a violation, same fail-open default widget-index-export-4 already uses.
function findImportSource(programNode, componentName) {
  for (const node of programNode.body) {
    if (node.type !== "ImportDeclaration") continue
    for (const specifier of node.specifiers) {
      if (specifier.type !== "ImportSpecifier" && specifier.type !== "ImportDefaultSpecifier") continue
      if (specifier.local.name === componentName) return node.source.value
    }
  }
  return null
}

function readImportedFileText(currentFilename, source) {
  if (!source || !source.startsWith(".")) return null
  const base = path.resolve(path.dirname(currentFilename), source)
  for (const candidate of [`${base}.tsx`, `${base}.ts`, path.join(base, "index.tsx"), path.join(base, "index.ts")]) {
    try {
      return fs.readFileSync(candidate, "utf8")
    } catch {
      continue
    }
  }
  return null
}

function isWrappedInMemo(text, componentName) {
  return new RegExp(`\\b${componentName}\\s*=\\s*memo\\s*\\(`).test(text)
}

// Same "nothing for memo() to protect" reasoning as hasEventHandlerAttribute below, applied to a
// row component that ALREADY lives in its own file - no onXxx-shaped prop anywhere in its own
// props type means memo() wouldn't skip anything real, so this rule shouldn't demand it. Covers
// both a genuinely empty param list AND a param list that's data-only (no handler-shaped prop
// at all) - no-pointless-memo already flags memo() on either shape for the same reason, so the two
// rules would otherwise contradict each other on the exact same file. Best-effort text match, same
// default as isWrappedInMemo above: an inline object type (`{ a, b }: { a: string; onX: () => void }`)
// is checked directly; a named type/interface reference is resolved to its OWN declaration
// elsewhere in the file and checked there; anything left unresolved this way fails open
// (only demands memo() it can justify), matching the rest of this file's fail-open defaults.
function takesNoEventHandlerProp(text, componentName) {
  const sigMatch = new RegExp(`function\\s+${componentName}\\s*\\(([^)]*)\\)`).exec(text)
  if (!sigMatch) return false
  const typeMatch = /\}\s*:\s*(.+)$/.exec(sigMatch[1])
  if (!typeMatch) return true

  const typeExpr = typeMatch[1].trim()
  if (typeExpr.startsWith("{")) return !/\bon[A-Z]\w*\s*\??\s*:/.test(typeExpr)

  const typeName = typeExpr.replace(/[<[].*$/, "").trim()
  const bodyMatch = new RegExp(`(?:interface|type)\\s+${typeName}\\b[^{]*\\{([^}]*)\\}`).exec(text)
  if (!bodyMatch) return true
  return !/\bon[A-Z]\w*\s*\??\s*:/.test(bodyMatch[1])
}

function isHandlerPropName(name) {
  return /^(handle|on)[A-Z]/.test(name)
}

function getHandlerPropIdentifiers(rowJSX) {
  const result = []
  for (const attribute of rowJSX.openingElement.attributes) {
    if (attribute.type !== "JSXAttribute") continue
    if (attribute.name.type !== "JSXIdentifier") continue
    if (!isHandlerPropName(attribute.name.name)) continue
    const value = attribute.value
    if (value?.type !== "JSXExpressionContainer") continue
    if (value.expression.type !== "Identifier") continue
    result.push({
      propName: attribute.name.name,
      identifierName: value.expression.name,
      identifierNode: value.expression,
      node: attribute,
    })
  }
  return result
}

// Resolves lexically from the reference's OWN position, walking up through enclosing scopes (via
// sourceCode.getScope + .upper) rather than scanning every scope in the file for a name match - a
// flat file-wide scan can find a same-named variable from an unrelated, non-enclosing scope (e.g. a
// row component's own local `handleX` colliding with an outer, hook-sourced `handleX` of the same
// name), which is a different variable entirely and must not be treated as "locally defined here".
function findScopeVariable(identifierNode, sourceCode) {
  let scope = sourceCode.getScope(identifierNode)
  while (scope) {
    const variable = scope.variables.find(item => item.name === identifierNode.name)
    if (variable) return variable
    scope = scope.upper
  }
  return null
}

// Denylist, not allowlist: only flag an identifier PROVABLY defined as an ordinary function/useCallback
// directly in this file (`const handleX = () => {}`, `function handleX() {}`) - a component's own
// destructured PROP (forwarding a handler further down, unrelated to this file) and a destructured
// hook call of ANY kind (a useXxxHandlers() hook, but just as legitimately a direct zustand store
// action - both already-stable references, not the smell this targets) are left alone rather than
// guessed at, same fail-open default used elsewhere in this rule set.
function isLocallyDefinedHandlerVariable(variable) {
  if (!variable) return false
  return variable.defs.some(def => {
    if (def.type === "FunctionName") return true
    if (def.type !== "Variable") return false
    const init = def.node.init
    if (!init) return false
    if (init.type === "ArrowFunctionExpression" || init.type === "FunctionExpression") return true
    return init.type === "CallExpression" && init.callee.type === "Identifier" && init.callee.name === "useCallback"
  })
}

// A .map() over a hardcoded literal array (e.g. skeleton placeholder rows built from a fixed
// MODEL_WIDTHS array) is a small, static, non-interactive list - extracting a memo()'d component
// for it has no re-render to save, since there's no real fetched data backing it. Same exception
// as require-5-states' hasOnlyStaticArrayMaps. Resolves lexically from objectNode's OWN position
// (same reasoning as findScopeVariable above) - a flat file-wide name scan would wrongly match an
// unrelated same-named variable in a non-enclosing scope (e.g. a row component's own destructured
// prop happening to share a name with the real literal-array declaration elsewhere in the file).
function isLiteralArrayDeclaration(objectNode, sourceCode) {
  if (objectNode.type !== "Identifier") return false
  let scope = sourceCode.getScope(objectNode)
  while (scope) {
    const variable = scope.variables.find(item => item.name === objectNode.name)
    if (!variable) {
      scope = scope.upper
      continue
    }
    return variable.defs.some(def => def.type === "Variable" && def.node.init && def.node.init.type === "ArrayExpression")
  }
  return false
}

function isNestedInsideAnotherMapCallback(node) {
  let current = node.parent
  while (current) {
    if (
      (current.type === "ArrowFunctionExpression" || current.type === "FunctionExpression") &&
      current.parent &&
      isMapLikeCall(current.parent) &&
      current.parent.arguments[0] === current
    ) {
      return true
    }
    current = current.parent
  }
  return false
}

function walk(node, visit) {
  if (!node || typeof node.type !== "string") return
  visit(node)
  for (const key in node) {
    if (key === "parent") continue
    const value = node[key]
    if (Array.isArray(value)) value.forEach(child => walk(child, visit))
    else if (value && typeof value.type === "string") walk(value, visit)
  }
}

// True if `functionNode`'s own body wires up real interactivity ANYWHERE - an onXxx attribute
// (DOM-level: onClick, onChange, ...), ANY attribute whose value is itself an inline function
// regardless of its name (a row forwarding `downloadFn={async (url) => ...}` to a child component
// is just as interactive as one with a literal onClick), OR a handle/on-prefixed prop forwarded as
// a bare identifier (`handleSelectEmailCb={setSelectedEmailIds}` wraps a child that DOES receive a
// real callback, even though the wrapper's own JSX never writes onXxx={...} itself) - same
// handle/on-prefix convention isHandlerPropName already uses elsewhere in this file. Walks the
// whole function body (which may declare local variables/hooks before its return), not just a
// single JSX subtree.
function hasEventHandlerAnywhereInFunction(functionNode) {
  let found = false
  walk(functionNode.body, node => {
    if (found) return
    if (node.type !== "JSXAttribute") return
    if (!node.value || node.value.type !== "JSXExpressionContainer") return
    const expression = node.value.expression
    if (expression.type === "ArrowFunctionExpression" || expression.type === "FunctionExpression") {
      found = true
      return
    }
    if (node.name.type !== "JSXIdentifier") return
    if (/^on[A-Z]/.test(node.name.name)) found = true
    else if (isHandlerPropName(node.name.name) && expression.type === "Identifier") found = true
  })
  return found
}

// Resolves a PascalCase component's own function node when it's declared directly in THIS file -
// `function Foo(...) {}`, `const Foo = function Foo(...) {}`/`const Foo = (...) => {}` (either bare
// or wrapped in `memo(...)`). Returns null when not found this way (imported from elsewhere, or a
// declaration shape this doesn't recognize) - the caller already fails open on null, same default
// as every other best-effort lookup in this file.
function resolveSameFileComponentFunction(componentName, programBody) {
  for (const statement of programBody) {
    if (statement.type === "FunctionDeclaration" && statement.id && statement.id.name === componentName) return statement
    if (statement.type !== "VariableDeclaration") continue
    for (const declarator of statement.declarations) {
      if (declarator.id.type !== "Identifier" || declarator.id.name !== componentName) continue
      let init = declarator.init
      if (init && init.type === "CallExpression" && init.callee.type === "Identifier" && init.callee.name === "memo") {
        init = init.arguments[0]
      }
      if (init && (init.type === "FunctionExpression" || init.type === "ArrowFunctionExpression")) return init
    }
  }
  return null
}

// How many `<ComponentName ...>` JSX usages exist anywhere in this file's own text - confirms a
// locally-defined row component is used ONLY by the one .map() call being checked, not reused
// elsewhere in the same file (which would make inlining it back real duplication, not cleanup).
function countJSXUsagesInFile(componentName, sourceText) {
  const matches = sourceText.match(new RegExp(`<${componentName}[\\s/>]`, "g"))
  return matches ? matches.length : 0
}

function reportWholeLine(context, sourceCode, node, report) {
  const line = node.loc.start.line
  const lineText = sourceCode.lines[line - 1] ?? ""
  context.report({
    ...report,
    node,
    loc: {
      start: { line, column: 0 },
      end: { line, column: Math.max(lineText.length, 2) },
    },
  })
}

// Walks the callback body but does NOT descend into a NESTED map-like call's own callback - that
// inner callback is checked by its own CallExpression visit, not folded into this one's result.
// Finds the OUTERMOST JSX element regardless of casing (walk is pre-order, so the first match is
// the row root, not some nested child) - the caller decides what to do based on its casing.

// True if an onXxx attribute (onClick, onChange, onMouseOver, ...) wired to a real expression
// exists ANYWHERE in the row's own subtree - see the header comment's "Exception" note. A static
// prop (className, style, etc.) never counts, regardless of how many of them there are.
function hasEventHandlerAttribute(rowNode) {
  let found = false
  walk(rowNode, node => {
    if (found) return
    if (node.type !== "JSXAttribute") return
    if (node.name.type !== "JSXIdentifier" || !/^on[A-Z]/.test(node.name.name)) return
    if (node.value && node.value.type === "JSXExpressionContainer") found = true
  })
  return found
}

function findRowJSX(callbackBody) {
  let found = null
  walk(callbackBody, node => {
    if (found) return
    if (isMapLikeCall(node)) return
    if (isLowercaseTagJSXElement(node) || isPascalTagJSXElement(node)) found = node
  })
  return found
}

module.exports = {
  "prefer-memo-row-component": {
    meta: {
      type: "suggestion",
      docs: {
        description:
          "require a .map()/.flatMap() building a list to hand each row to its own memo()'d component, not construct raw JSX inline",
      },
      schema: [],
      messages: {
        inlineRowJSX:
          "This .map()/.flatMap() builds a <{{tagName}}> row directly inside the callback - extract the row into its own memo()'d component instead (e.g. <ItemRow key={...} .../>), per component-rendering-useMemo-isSkeleton-hook-patterns.md. memo() stops each row re-rendering when its own props haven't changed; inline JSX here re-creates every row's element tree on every parent render regardless of useMemo.",
        rowComponentNotMemoized:
          "\"<{{componentName}}>\" is used as this row but its own file doesn't wrap it in memo() - wrap it (e.g. export const {{componentName}} = memo(function {{componentName}}(...) {...})) so it skips re-rendering when its own props haven't changed.",
        handlerPropNotFromHandlersHook:
          '"{{identifierName}}" is passed as "<{{componentName}}>"\'s "{{propName}}" prop but is defined directly in this file (not sourced from a useXxxHandlers() hook, a store action, or forwarded from a prop) - move it into a useXxxHandlers() hook instead, matching use-smth-handlers\' convention.',
        rowComponentShouldBeInline:
          '"<{{componentName}}>" is declared in this file, used only by this one .map(), and has no event-handler prop anywhere in its own body - inline its JSX directly into the callback instead of keeping it as a separate function (per the "stays inline, no extraction needed" exception above). Delete the separate {{componentName}} function once its JSX is moved in.',
      },
    },
    create(context) {
      const sourceCode = context.sourceCode ?? context.getSourceCode()
      const filename = context.filename ?? context.getFilename()

      return {
        CallExpression(node) {
          if (!isMapLikeCall(node)) return
          if (isNestedInsideAnotherMapCallback(node)) return
          if (isLiteralArrayDeclaration(node.callee.object, sourceCode)) return

          const callback = node.arguments[0]
          if (!callback || (callback.type !== "ArrowFunctionExpression" && callback.type !== "FunctionExpression")) return

          const rowJSX = findRowJSX(callback.body)
          if (!rowJSX) return

          if (isLowercaseTagJSXElement(rowJSX)) {
            if (!hasEventHandlerAttribute(rowJSX)) return
            const name = rowJSX.openingElement.name
            const tagName = name.type === "JSXIdentifier" ? name.name : `${name.object.name}.${name.property.name}`
            reportWholeLine(context, sourceCode, rowJSX, { messageId: "inlineRowJSX", data: { tagName } })
            return
          }

          const componentName = getComponentTagName(rowJSX)

          const source = findImportSource(sourceCode.ast, componentName)
          const text = readImportedFileText(filename, source)
          if (text !== null && !isWrappedInMemo(text, componentName) && !takesNoEventHandlerProp(text, componentName)) {
            reportWholeLine(context, sourceCode, rowJSX, { messageId: "rowComponentNotMemoized", data: { componentName } })
          } else if (!source) {
            const localFn = resolveSameFileComponentFunction(componentName, sourceCode.ast.body)
            if (
              localFn &&
              !hasEventHandlerAnywhereInFunction(localFn) &&
              countJSXUsagesInFile(componentName, sourceCode.getText()) === 1
            ) {
              reportWholeLine(context, sourceCode, rowJSX, { messageId: "rowComponentShouldBeInline", data: { componentName } })
            }
          }

          for (const { propName, identifierName, identifierNode, node: attributeNode } of getHandlerPropIdentifiers(rowJSX)) {
            const variable = findScopeVariable(identifierNode, sourceCode)
            if (!isLocallyDefinedHandlerVariable(variable)) continue
            reportWholeLine(context, sourceCode, attributeNode, {
              messageId: "handlerPropNotFromHandlersHook",
              data: { propName, identifierName, componentName },
            })
          }
        },
      }
    },
  },
}

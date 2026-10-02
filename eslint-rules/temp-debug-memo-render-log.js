"use strict"

// TEMP DEBUG RULE - not meant to stay enabled. Auto-fixes every memo(function Xxx(...) { ... })
// (and memo((props) => { ... })) by inserting a console.log right after the opening brace, so you
// can watch the browser console and see exactly which memo()'d rows actually re-render.
//
// Usage:
//   1. enable in eslint.config.js (see bottom of this file for the snippet)
//   2. npx eslint <file-or-dir> --fix
//   3. run the app, watch console
//   4. git checkout <file-or-dir>  -- revert the injected logs
//   5. disable the rule again / delete this file
//
// Remove this file and its eslint.config.js entry once you're done - it is not a real lint rule.
//
// To revert everything this rule injected (commits 6274258e4 + ad2b450fd), run:
//   git revert --no-edit 6274258e4 ad2b450fd

function getComponentName(memoCallExpr) {
  const func = memoCallExpr.arguments[0]
  if (!func) return null
  if ((func.type === "FunctionExpression" || func.type === "FunctionDeclaration") && func.id) return func.id.name

  // memo(() => {...}) or memo(function () {...}) - fall back to the `const Xxx = memo(...)` name
  let node = memoCallExpr.parent
  while (node) {
    if (node.type === "VariableDeclarator" && node.id.type === "Identifier") return node.id.name
    node = node.parent
  }
  return null
}

module.exports = {
  "temp-debug-memo-render-log": {
    meta: {
      type: "suggestion",
      fixable: "code",
      docs: { description: "TEMP: inject a console.log at the top of every memo()'d component body" },
      schema: [],
      messages: {
        missingRenderLog: "TEMP DEBUG: {{name}} has no render-tracking console.log yet",
      },
    },
    create(context) {
      const sourceCode = context.sourceCode ?? context.getSourceCode()

      return {
        CallExpression(node) {
          if (node.callee.type !== "Identifier" || node.callee.name !== "memo") return
          const func = node.arguments[0]
          if (!func || (func.type !== "FunctionExpression" && func.type !== "ArrowFunctionExpression")) return
          if (func.body.type !== "BlockStatement") return // memo(() => <jsx/>) implicit return - nothing to inject before

          const name = getComponentName(node) ?? "UnknownMemoComponent"
          const firstStatement = func.body.body[0]
          const marker = `console.log("[render] ${name}")`

          // already injected (re-running --fix, or you added it by hand) - don't duplicate
          if (firstStatement && sourceCode.getText(firstStatement).includes(marker)) return

          context.report({
            node: func.body,
            messageId: "missingRenderLog",
            data: { name },
            fix(fixer) {
              const openBrace = sourceCode.getFirstToken(func.body)
              return fixer.insertTextAfter(openBrace, `\n  ${marker}`)
            },
          })
        },
      }
    },
  },
}

// eslint.config.js snippet (add both lines, remove when done):
//   plugins: { "local-rules": { rules: { ...localRules, ...require("./eslint-rules/temp-debug-memo-render-log") } } }
//   rules: { "local-rules/temp-debug-memo-render-log": "warn" }

"use strict"

// const response = await someSDKMethod(...)          - the awaited call is an update/insert/delete
// const somethingResp = await someSDKMethod(...)      - the awaited call is a select/get
//   (e.g. const selectDBLabelsResp = await selectDBLabels(...))
// Applies to any awaited call, not just this codebase's own selectDB*/getRedis*/etc. helpers -
// including SDK method calls (messagesSDK.selectTickets(...) -> selectTicketsResp, using just the
// method name, not the object prefix). Read/write is classified from the method/function name's
// own leading verb; a name that doesn't start with a recognized verb at all is not flagged (not
// enough information to guess), so this only catches vague names on calls whose own name already
// tells you what kind of operation it is.
//
// Bad:
//   const data = await selectDBTickets()
// Good:
//   const selectDBTicketsResp = await selectDBTickets()
const READ_VERB_PATTERN = /^(select|get|fetch|hgetall|find)[A-Z]/
const WRITE_VERB_PATTERN = /^(insert|update|upd|delete|del|set|create|add|hadd|hdel|hupd|push|remove|increase|decrease|toggle|upload|download|import|export)[A-Z]/

// Names that are never an acceptable awaited-result name regardless of the read/write suggestion -
// these are the generic placeholders being specifically banned (result, data, res, something, etc.)
const ALWAYS_VAGUE_NAMES = new Set(["result", "results", "data", "res", "resp", "something", "output", "value", "response2"])

// Calls that match READ_VERB_PATTERN by name shape but aren't this codebase's own SDK/DB/Redis
// read convention at all - a factory/client getter (getSupabaseServer), a built-in Web API
// (Response.json(), createImageBitmap), or getScopedI18n, which hands back the `t` translator
// function every localized page calls by that one-letter name. getResponseDataFn is this
// codebase's own stand-in for Response.json() and reads the body off a `response` that is already
// named, so its result is responseData - the payload it holds, not the verb that produced it.
const EXCLUDED_METHOD_NAMES = new Set([
  "getSupabaseServerSDK",
  "getSupabaseServerSupport",
  "json",
  "createImageBitmap",
  "getCookie",
  "getScopedI18n",
  "getResponseDataFn",
])

// Variable names that are always correct regardless of the awaited call's own name - these hold a
// callable client/factory, not a data payload, so the Resp suffix convention doesn't apply to them.
const ALWAYS_ACCEPTABLE_VARIABLE_NAMES = new Set(["supabaseServer"])

function getCalleeMethodName(callee) {
  if (callee.type === "Identifier") return callee.name
  if (callee.type === "MemberExpression" && callee.property.type === "Identifier") return callee.property.name
  return null
}

module.exports = {
  "response-variable-naming": {
    meta: {
      type: "suggestion",
      docs: {
        description: "require awaited call results to be named response (write) or <methodName>Resp (read)",
      },
      schema: [],
      messages: {
        readShouldBeResp: 'Awaited result of "{{fnName}}" (a read) should be named "{{suggested}}", not "{{name}}".',
        writeShouldBeResponse:
          'Awaited result of "{{fnName}}" (a write) should be named "response" or "{{suggested}}" (e.g. "ticketsResp"), not "{{name}}".',
        vagueAwaitedName:
          'Awaited result of "{{fnName}}" should be named "response" (write) or "{{fnName}}Resp" (read), not the vague name "{{name}}".',
      },
    },
    create(context) {
      return {
        VariableDeclarator(node) {
          if (node.id.type !== "Identifier") return
          if (!node.init || node.init.type !== "AwaitExpression") return
          const awaited = node.init.argument
          if (awaited.type !== "CallExpression") return

          const fnName = getCalleeMethodName(awaited.callee)
          if (!fnName || EXCLUDED_METHOD_NAMES.has(fnName)) return
          const name = node.id.name
          if (ALWAYS_ACCEPTABLE_VARIABLE_NAMES.has(name)) return
          const suggested = fnName + "Resp"

          if (READ_VERB_PATTERN.test(fnName)) {
            if (name !== suggested && name !== "response") {
              context.report({ node: node.id, messageId: "readShouldBeResp", data: { fnName, suggested, name } })
            }
            return
          }

          if (WRITE_VERB_PATTERN.test(fnName)) {
            // a write accepts "response" or ANY <domainWord>Resp name (e.g. "ticketsResp"), not
            // just the exact method name + Resp - only reject a bare vague placeholder, checked
            // against the domain word with the Resp suffix stripped off (so "dataResp" is still
            // caught as vague, same as bare "data" would be). The char right before "Resp" can be
            // any letter/digit, not just lowercase - an acronym-ending domain word like
            // "addRedisGEAResp" (GEA) or "updDBResp" (DB) is still a valid <domainWord>Resp name.
            const endsInResp = /[A-Za-z0-9]Resp$/.test(name)
            const domainWord = endsInResp ? name.slice(0, -"Resp".length) : name
            const isVaguePlaceholder = ALWAYS_VAGUE_NAMES.has(domainWord.toLowerCase())
            if (name !== "response" && (!endsInResp || isVaguePlaceholder)) {
              context.report({ node: node.id, messageId: "writeShouldBeResponse", data: { fnName, suggested, name } })
            }
            return
          }

          // fnName doesn't start with a recognized verb, so read vs write is unknown here, but a
          // generic placeholder name is still wrong regardless of which one it is
          if (ALWAYS_VAGUE_NAMES.has(name.toLowerCase())) {
            context.report({ node: node.id, messageId: "vagueAwaitedName", data: { fnName, name } })
          }
        },
      }
    },
  },
}

"use strict"

// A squiggle under one character is nearly invisible - a single caret under the `{` of an import
// tells you a rule fired but not which token it means, and at normal editor zoom it reads as a
// speck rather than a report. Every rule here has to underline at least a word: one line or many,
// never one symbol.
//
// A rule only ever sees its own reports, so this check lives in a processor instead - that is the
// one place eslint hands over the finished message list for a file. postprocess reads every message
// that any rule produced, measures the range it underlined, and adds an error naming the rule whose
// range covers a single character.
//
// Bad:   14:8   warning  ...  local/some-rule      <- endColumn 9, one caret under "{"
// Good:  14:1   warning  ...  local/some-rule      <- endColumn 42, the whole line
//
// The offending report is left exactly as it was. Rewriting another rule's range would hide which
// rule needs the change, and the point is to get that rule fixed at its own context.report call.
const SMALLEST_ALLOWED_WIDTH = 2

// A message with no end position underlines a single point, which is the same speck this check is
// about. A message with no rule id at all is a parse error, which eslint owns and points at a real
// token - nothing to correct there.
function getUnderlinedWidth(message) {
  if (typeof message.endLine !== "number" || typeof message.endColumn !== "number") return 1
  if (message.endLine > message.line) return Infinity
  return message.endColumn - message.column
}

function isOneSymbolReport(message) {
  if (!message.ruleId) return false
  if (message.fatal) return false
  return getUnderlinedWidth(message) < SMALLEST_ALLOWED_WIDTH
}

// The lines of the file currently being linted, kept between preprocess and postprocess so the
// error this check raises can underline a whole line itself - underlining one symbol while
// complaining about a one-symbol squiggle would be its own first offence. eslint runs the two
// halves back to back per file, and the entry is dropped as soon as postprocess has read it.
const linesByFilename = new Map()

module.exports = {
  "full-line-reports": {
    meta: { name: "local-rules/full-line-reports" },
    // the file goes through untouched, so a rule's own fixer keeps working
    supportsAutofix: true,
    preprocess(text, filename) {
      linesByFilename.set(filename, text.split(/\r\n|\r|\n/u))
      return [text]
    },
    postprocess(messages, filename) {
      const lines = linesByFilename.get(filename) ?? []
      linesByFilename.delete(filename)
      const reported = messages[0] ?? []
      const oneSymbolReports = reported.filter(isOneSymbolReport)
      if (oneSymbolReports.length === 0) return reported

      // One error per rule, not per report - a rule that underlines one symbol does it at every
      // site it fires, and repeating the same instruction on each of them buries the rest.
      const byRuleId = new Map()
      for (const message of oneSymbolReports) {
        if (!byRuleId.has(message.ruleId)) byRuleId.set(message.ruleId, message)
      }

      const complaints = [...byRuleId.entries()].map(([ruleId, message]) => {
        const lineText = lines[message.line - 1] ?? ""
        return {
          ruleId: "local/full-line-reports",
          severity: 2,
          message: `"${ruleId}" underlines ${getUnderlinedWidth(message)} character at ${message.line}:${message.column} - widen its context.report to the whole line so the squiggle is readable.`,
          line: message.line,
          column: 1,
          endLine: message.line,
          endColumn: Math.max(lineText.length + 1, message.column + 1, SMALLEST_ALLOWED_WIDTH + 1),
        }
      })

      return [...reported, ...complaints]
    },
  },
}

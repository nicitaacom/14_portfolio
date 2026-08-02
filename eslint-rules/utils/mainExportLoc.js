"use strict"

function lineLoc(sourceCode, line) {
  const lineText = sourceCode.lines[line - 1] ?? ""
  return { start: { line, column: 0 }, end: { line, column: lineText.length } }
}

// Finds the file's own main export declaration - a default export always wins outright (ES
// modules only ever allow one per file, so it's unambiguously "the" main export regardless of
// naming); otherwise the named export whose exported name equals the file's own basename (this
// codebase's own convention: one main export per file, named after the file) - also allowing for
// this codebase's own "I"/"T" type-naming prefix (type-naming-prefix rule), so "INavLink" still
// matches a "NavLink.ts" file. Falls back to the file's only export declaration if there's exactly
// one (still the file's real main export, just not literally name-matched). Returns null when
// none of this resolves anything confidently - never guessed among 2+ ambiguous candidates.
function findMainExportDeclaration(programNode, basenameNoExt) {
  const nameMatches = name => name === basenameNoExt || name === `I${basenameNoExt}` || name === `T${basenameNoExt}`

  for (const statement of programNode.body) {
    if (statement.type === "ExportDefaultDeclaration") return { statement, declaration: statement.declaration }
  }

  const exportedDecls = programNode.body.filter(
    statement => statement.type === "ExportNamedDeclaration" && statement.declaration,
  )

  for (const statement of exportedDecls) {
    const decl = statement.declaration
    const matches =
      (["FunctionDeclaration", "ClassDeclaration", "TSInterfaceDeclaration", "TSTypeAliasDeclaration"].includes(decl.type) &&
        nameMatches(decl.id?.name)) ||
      (decl.type === "VariableDeclaration" &&
        decl.declarations.some(declarator => declarator.id.type === "Identifier" && nameMatches(declarator.id.name)))
    if (!matches) continue
    return { statement, declaration: decl }
  }

  if (exportedDecls.length === 1) return { statement: exportedDecls[0], declaration: exportedDecls[0].declaration }

  return null
}

// Highlights the WHOLE line of the file's own main export (e.g. "export const useXxxHandlers = () =>
// {") rather than a single barely-visible character at line 1 column 0 - much easier to actually spot
// in an editor. Falls back to the whole first line when findMainExportDeclaration leaves it unresolved
// anything confidently.
function getMainExportLineLoc(programNode, sourceCode, basenameNoExt) {
  const found = findMainExportDeclaration(programNode, basenameNoExt)
  return lineLoc(sourceCode, found ? found.statement.loc.start.line : 1)
}

module.exports = { lineLoc, findMainExportDeclaration, getMainExportLineLoc }

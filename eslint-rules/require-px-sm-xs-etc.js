const CLASS_ATTRIBUTE = /^(className|class)$/
const FIXED_SPACING = /(?:^|\s)(?:[a-z-]+:)*(?:!|-)?(?:p[trblxy]?|m[trblxy]?|gap|space-[xy])-(?:\d+(?:\.\d+)?|\[[^\]]+\])(?=\s|$)/g

function reportFixedSpacing(context, node, value) {
  for (const match of value.matchAll(FIXED_SPACING)) {
    const utility = match[0].trim()
    if (utility.endsWith("-0") || utility.endsWith("-[0px]")) continue
    context.report({ node, messageId: "fluidSpacing", data: { utility } })
  }
}

module.exports = {
  meta: {
    type: "suggestion",
    docs: { description: "Require the project fluid spacing scale instead of fixed Tailwind spacing utilities." },
    schema: [],
    messages: { fluidSpacing: "Use a fluid spacing token (xs, sm, md, lg, xl) instead of '{{utility}}'." },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (!CLASS_ATTRIBUTE.test(node.name.name) || !node.value) return
        if (node.value.type === "Literal" && typeof node.value.value === "string") reportFixedSpacing(context, node, node.value.value)
        if (node.value.type === "JSXExpressionContainer" && node.value.expression.type === "Literal" && typeof node.value.expression.value === "string") reportFixedSpacing(context, node, node.value.expression.value)
      },
      Literal(node) {
        if (typeof node.value !== "string" || node.parent?.type === "JSXAttribute") return
        reportFixedSpacing(context, node, node.value)
      },
    }
  },
}

export function limitProjectStack(stack: string, maxCharacters: number) {
  if (stack.length <= maxCharacters) return stack

  const stackItems = stack.split(", ")
  const visibleItems: string[] = []

  for (const stackItem of stackItems) {
    const nextStack = [...visibleItems, stackItem].join(", ")

    if (nextStack.length > maxCharacters) break

    visibleItems.push(stackItem)
  }

  return visibleItems.join(", ") || stackItems[0]
}

export const isElementFocused = (element: Element | string | null): boolean => {
	const el: Element | null =
		typeof element === 'string' ? document.querySelector(element) : element
	if (!el) return false
	return document.activeElement === el
}

/**
 * Checks if there is certain element in event's path
 * @param e Event, e.g. MouseEvent
 * @param el Element or string selector
 * @returns true if el was found in path or false if not
 */
export const isElementInPath = (e: Event, el: Element | string): boolean => {
	const path = e.composedPath()
	if (el instanceof Element) return path.includes(el)
	return path.some(node => node instanceof Element && node.matches(el))
}

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

/**
 * Adds an event listener to the element.
 * @param el a target html element
 * @param type the event name
 * @param callback event handler
 * @param options event options
 * @returns an unsubscribe function
 */
export const listen = <T extends keyof DocumentEventMap>(
	el: HTMLElement | Window | Document,
	type: T,
	// eslint-disable-next-line functional/no-return-void
	callback: (e: DocumentEventMap[T]) => void,
	options?: boolean | AddEventListenerOptions,
	// eslint-disable-next-line functional/no-return-void
): (() => void) => {
	el.addEventListener(
		type,
		callback as EventListenerOrEventListenerObject,
		options,
	)
	return () =>
		el.removeEventListener(
			type,
			callback as EventListenerOrEventListenerObject,
			options,
		)
}

/**
 * Adds a **conditional** event listener to the element.
 * @param el a target html element
 * @param condition callback returning a boolean
 * @param type the event name
 * @param callback event handler
 * @param options event options
 * @returns an unsubscribe function
 */
export const listenIfTrue = <T extends keyof DocumentEventMap>(
	el: HTMLElement | Window | Document,
	condition: () => boolean,
	type: T,
	// eslint-disable-next-line functional/no-return-void
	callback: (e: DocumentEventMap[T]) => void,
	options?: boolean | AddEventListenerOptions,
	// eslint-disable-next-line functional/no-return-void
): (() => void) => {
	const listener = (e: Event) =>
		condition() && callback(e as DocumentEventMap[T])
	return listen(el, type, listener, options)
}

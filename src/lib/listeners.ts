import { Callback, CookedUnsubscribe } from '../types/types'

type ListenableEl = HTMLElement | Window | Document
type DomEvent = keyof DocumentEventMap
type EventCallback<Ev extends DomEvent> = Callback<DocumentEventMap[Ev]>

/**
 * Adds an event listener to the element.
 * @param el a target html element
 * @param type the event name
 * @param callback event handler
 * @param options event options
 * @returns an unsubscribe function
 */
export const listen = <T extends DomEvent>(
	el: ListenableEl,
	type: T,
	callback: EventCallback<T>,
	options?: boolean | AddEventListenerOptions,
): CookedUnsubscribe => {
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
	el: ListenableEl,
	condition: () => boolean,
	type: T,
	callback: EventCallback<T>,
	options?: boolean | AddEventListenerOptions,
): CookedUnsubscribe => {
	const listener = (e: Event) =>
		condition() && callback(e as DocumentEventMap[T])
	return listen(el, type, listener, options)
}

const createUnsubscribeList = (): {
	readonly add: (cb: CookedUnsubscribe) => CookedUnsubscribe
	readonly unsub: Callback<CookedUnsubscribe>
	readonly clear: CookedUnsubscribe
} => {
	const list = new Set<Callback>()
	const unsub = (cb: CookedUnsubscribe) => {
		list.delete(cb)
		cb()
	}
	return {
		unsub,
		add: cb => {
			list.add(cb)
			return () => unsub(cb)
		},
		clear: () => {
			list.forEach(cb => cb())
			list.clear()
		},
	}
}

type CookedListener = <E extends DomEvent>(
	ev: E,
	callback: EventCallback<E>,
	options?: AddEventListenerOptions,
) => CookedUnsubscribe

/**
 * Used for bundling together multiple listeners, that share the same target.
 * @param el the target DOM Element
 * @param condition *optional** callbacks will fire only if it returned true
 * @returns - `listen` - add event listener
 * - `clear` - clears all listeners
 *
 * ```
 * // setup listeners list:
 * const { clear, listen } = createListenersList(htmlEl, () => isActive)
 * // listen to some events:
 * const unsub = listen('scroll', e => { ... })
 * // remove single event:
 * unsub()
 * // clear all events:
 * clear()
 * ```
 */
export const createListenersList = (
	el: ListenableEl,
	condition?: () => boolean,
): {
	readonly listen: CookedListener
	readonly clear: CookedUnsubscribe
} => {
	const { add, clear } = createUnsubscribeList()
	return {
		clear,
		listen: (ev, callback, options) =>
			add(
				listenIfTrue(el, condition ?? (() => true), ev, callback, options),
			),
	}
}

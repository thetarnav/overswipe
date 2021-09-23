import type {
	ClientMethods,
	EventCallback,
	EventType,
	Subscribe,
	SwipeDirection,
} from '../types/types'

import Overswipe, { Settings } from './overswipeClass'

interface TouchOptions {
	readonly minSpeed?: number
}

export interface Options {
	readonly touch?: boolean | TouchOptions
	readonly wheel?: boolean
	readonly minDistance?: number
	readonly resetTimeout?: number
	readonly boundsMargin?: number
}

export default function observeElement(
	el: HTMLElement,
	container: HTMLElement | Window = window,
	options: Options = {},
): ClientMethods {
	const minSpeed =
		typeof options.touch === 'object' && options.touch.minSpeed
			? options.touch.minSpeed
			: 50
	const settings: Settings = {
		minDistance: options.minDistance ?? 250,
		resetTimeout: options.resetTimeout ?? 300,
		boundsMargin: options.boundsMargin ?? 50,
		minSpeed,
	}
	const observer = new Overswipe(el, container, settings)

	if (options.touch !== false) observer.listenTouch()
	if (options.wheel) observer.listenWheel()

	// const on:Subscribe = (...args) => observer.on(...args)

	// const on: Subscribe = (...args) => {
	// 	// args: (type: EventType, a: EventCallback)
	// 	if (typeof args[1] === 'function') {
	// 		const handler = args[1]
	// 		const directions: readonly SwipeDirection[] = [
	// 			'up',
	// 			'down',
	// 			'left',
	// 			'right',
	// 		]
	// 		const offs = directions.map(dir => observer.on(args[0], dir, handler))
	// 		return () => offs.forEach(f => f())
	// 	}
	// 	// args: (type: EventType, a: SwipeDirection, b: EventCallback)
	// 	return observer.on(
	// 		...(args as readonly [EventType, SwipeDirection, EventCallback]),
	// 	)
	// }

	const on = observer.on.bind(observer)
	const off = observer.off.bind(observer)

	return { on, off }
}

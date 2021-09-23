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

	if (options.touch) observer.listenTouch()
	if (options.wheel) observer.listenWheel()

	return observer
}

/* eslint-disable functional/no-this-expression */
/* eslint-disable functional/prefer-readonly-type */
import { List } from 'immutable'
import { clamp, debounce, throttle } from 'lodash'

import { isElementInPath, listenIfTrue } from '../utils/dom'
import { valToP } from '../utils/functions'

import {
	calcTouchChange,
	createIntersectionObserver,
	getBoundsReached,
	getDefaultAllow,
	getTouchInfo,
	isH,
	isV,
	relativePosition,
	toSwipeDir,
} from './calculations'

const { abs } = Math

export interface Settings {
	readonly minDistance: number
	readonly resetTimeout: number
	readonly boundsMargin: number
	readonly minSpeed: number
}

// eslint-disable-next-line functional/no-class
export default class Overswipe implements ClientMethods {
	private unsubscribeList = List<CookedUnsubscribe>([])
	private swipeListeners = List<{
		readonly type: EventType
		readonly direction: SwipeDirection
		readonly handler: EventCallback
	}>([])

	private onScreen = false
	private allowSides = getDefaultAllow()
	private allowSwipe = false
	private distance = 0
	private swiping: SwipeDirection | null = null
	private swiped: SwipeDirection | null = null
	private lastTouch = { x: 0, y: 0, time: 0 }

	constructor(
		private readonly el: HTMLElement,
		private readonly container: HTMLElement | Window,
		private readonly settings: Settings,
	) {
		this.unsubscribeList.push(
			createIntersectionObserver(
				container,
				el,
				visible => (this.onScreen = visible),
				settings.boundsMargin,
			),
		)

		this.listen('scroll', debounce(this.onScroll, settings.resetTimeout))
		this.updateNewBounds()
	}

	//
	// Public Actions:

	listenWheel() {
		this.listen('wheel', this.onWheel, { passive: false })
	}

	listenTouch() {
		this.listen('touchstart', this.onTouchStart)
		this.listen('touchmove', throttle(this.onTouchMove, 50), {
			passive: false,
		})
		this.listen('touchend', this.onTouchEnd)
	}

	off(
		this: Overswipe,
		type: EventType,
		dir: SwipeDirection,
		handler: EventCallback,
	) {
		this.swipeListeners = this.swipeListeners.filter(
			i => i.type !== type || i.direction !== dir || i.handler !== handler,
		)
	}

	on(
		this: Overswipe,
		type: EventType,
		a: SwipeDirection | EventCallback,
		b?: EventCallback,
	): CookedUnsubscribe {
		// args: (type: EventType, a: EventCallback)
		if (typeof a === 'function') {
			const handler = a as EventCallback
			const directions: SwipeDirection[] = ['up', 'down', 'left', 'right']
			const offs = directions.map(direction =>
				this.on(type, direction, handler),
			)
			return () => offs.forEach(f => f())
		}
		// args: (type: EventType, a: SwipeDirection, b: EventCallback)
		const direction = a
		const handler = b as EventCallback
		this.swipeListeners = this.swipeListeners.push({
			type,
			direction,
			handler,
		})
		return () => this.off(type, direction, handler)
	}

	//
	// Private Actions:

	private listen<T extends keyof DocumentEventMap>(
		this: Overswipe,
		type: T,
		// eslint-disable-next-line functional/no-return-void
		callback: (e: DocumentEventMap[T]) => void,
		options?: boolean | AddEventListenerOptions,
	) {
		const stop = listenIfTrue(
			this.container,
			() => this.onScreen,
			type,
			callback,
			options,
		)
		this.unsubscribeList = this.unsubscribeList.push(stop)
	}

	private emit(
		this: Overswipe,
		type: EventType,
		direction: SwipeDirection,
		// eslint-disable-next-line functional/no-return-void
	): void {
		const progress = valToP(this.distance, 0, this.settings.minDistance),
			capedProgress = clamp(progress, 0, 1),
			capedDistance = clamp(this.distance, 0, this.settings.minDistance)
		this.swipeListeners.forEach(
			i =>
				i.type === type &&
				i.direction === direction &&
				i.handler({
					type,
					direction,
					progress,
					distance: this.distance,
					capedProgress,
					capedDistance,
				}),
		)
	}

	private triggerSwipe(this: Overswipe) {
		if (!this.swiping) return
		this.swiped = this.swiping
		this.emit('swipe', this.swiped)
		setTimeout(this.updateNewBounds, this.settings.resetTimeout)
	}

	private resetSwipeState(this: Overswipe) {
		const direction = this.swiping
		this.swiping = null
		this.swiped = null
		this.distance = 0
		direction && this.emit('cancel', direction)
	}

	private updateNewBounds(this: Overswipe) {
		this.resetSwipeState()
		const relPoz = relativePosition(this.el, this.container),
			boundsReached = getBoundsReached(relPoz, this.settings.boundsMargin)
		this.allowSides = toSwipeDir(boundsReached)
	}

	private progressSwipe(
		this: Overswipe,
		dir: SwipeDirection,
		dist: number,
		e?: Event,
	) {
		if (
			this.swiped ||
			!this.allowSwipe ||
			(!this.allowSides[dir] && this.swiping !== dir)
		)
			return this.resetSwipeState()

		this.distance += dist
		if (!this.swiping) {
			this.swiping = dir
			this.allowSides = getDefaultAllow()
		}
		if (e?.cancelable) e.preventDefault()

		this.emit('progress', dir)
	}

	// eslint-disable-next-line functional/no-return-void
	private checkProgress(this: Overswipe): void {
		this.distance >= this.settings.minDistance && this.triggerSwipe()
	}

	//
	// Event Handlers:

	private onWheel(this: Overswipe, e: WheelEvent) {
		this.allowSwipe = isElementInPath(e, this.el)
		const direction = this.swiping ?? (e.deltaY > 0 ? 'up' : 'down'),
			distance = abs(e.deltaY)

		this.progressSwipe(direction, distance, e)
		this.checkProgress()
	}

	private onTouchStart(this: Overswipe, e: TouchEvent) {
		this.lastTouch = getTouchInfo(e)
		this.allowSwipe = isElementInPath(e, this.el)
	}

	private onTouchMove(this: Overswipe, e: TouchEvent) {
		if (!this.allowSwipe) return

		const touch = getTouchInfo(e),
			{ xVel, yVel, xMove, yMove } = calcTouchChange(this.lastTouch, touch)
		this.lastTouch = touch

		// Is it fast?
		if (
			abs(xVel) < this.settings.minSpeed &&
			abs(yVel) < this.settings.minSpeed
		)
			return this.resetSwipeState()

		// Is it HORIZONTAL:
		if (abs(xVel) / abs(yVel) >= 2) {
			// Left or Right?
			const dir = this.swiping ?? (xVel < 0 ? 'left' : 'right'),
				dist = dir === 'left' ? -xMove : xMove
			if (isH(dir)) this.progressSwipe(dir, dist)
		}
		// Then it is VERTICAL
		else if (abs(yVel) / abs(xVel) >= 2) {
			// Up or Down?
			const dir = this.swiping ?? (yVel > 0 ? 'down' : 'up'),
				dist = dir === 'up' ? -yMove : yMove
			if (isV(dir)) this.progressSwipe(dir, dist)
		}
	}

	private onTouchEnd(this: Overswipe) {
		this.checkProgress()
		setTimeout(this.updateNewBounds, this.settings.resetTimeout)
	}

	private onScroll(this: Overswipe) {
		this.updateNewBounds()
	}
}

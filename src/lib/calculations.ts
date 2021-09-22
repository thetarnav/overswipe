import { mapValues, mergeWith, omit } from 'lodash'

import { copyObject, minus } from '../utils/fp'
import { isClose } from '../utils/functions'

export const getDefaultAllow = () =>
	copyObject({
		up: false,
		down: false,
		left: false,
		right: false,
	})

export const getBounds = (el: HTMLElement): Bounds => {
	const { width, height, top, left, right, bottom } =
		el.getBoundingClientRect()
	return { width, height, top, left, right, bottom }
}

export const toPosition = (bounds: Bounds): Position =>
	omit(bounds, ['height', 'width'])

export const toSwipeDir = <V>(
	object: Record<'top' | 'left' | 'right' | 'bottom', V>,
): Record<SwipeDirection, V> => ({
	up: object.bottom,
	down: object.top,
	left: object.right,
	right: object.left,
})

export const isH = (direction: SwipeDirection | null): boolean =>
	['left', 'right'].includes(direction as string)
export const isV = (direction: SwipeDirection | null): boolean =>
	['up', 'down'].includes(direction as string)

export const getPosition = (el: HTMLElement): Position =>
	toPosition(getBounds(el))

export const relativePosition = (
	el: HTMLElement,
	container: HTMLElement | Window,
): Position => {
	const elBounds = getBounds(el)
	if (container instanceof Window)
		return {
			top: elBounds.top,
			left: elBounds.left,
			bottom: elBounds.top + elBounds.height - window.innerHeight,
			right: elBounds.left + elBounds.width - window.innerWidth,
		}
	const containerBounds = getPosition(container)
	return mergeWith(toPosition(elBounds), containerBounds, minus)
}

export const getBoundsReached = (
	poz: Position,
	threshold: number,
): { readonly [key in keyof Position]: boolean } =>
	mapValues(poz, n => isClose(n, 0, threshold))

export const getTouchInfo = (e: TouchEvent): TouchInfo => {
	const { timeStamp: time, touches } = e,
		{ clientX: x, clientY: y } = touches[0]
	return { time, x, y }
}

export const calcVel = (
	nFrom: number,
	nTo: number,
	timeFrom: number,
	timeTo: number,
) => (nTo - nFrom) / (timeTo - timeFrom)

export const calcTouchChange = (
	from: TouchInfo,
	to: TouchInfo,
): {
	readonly xVel: number
	readonly yVel: number
	readonly xMove: number
	readonly yMove: number
} => ({
	xVel: calcVel(from.x, to.x, from.time, to.time),
	yVel: calcVel(from.y, to.y, from.time, to.time),
	xMove: to.x - from.x,
	yMove: to.y - from.y,
})

export const createIntersectionObserver = (
	container: HTMLElement | Window,
	el: HTMLElement,
	// eslint-disable-next-line functional/no-return-void
	callback: (isIntersecting: boolean) => void,
	boundsMargin: number | string,
): CookedUnsubscribe => {
	const observer = new IntersectionObserver(
		([{ isIntersecting }]) => callback(isIntersecting),
		{
			root: container instanceof Window ? document : container,
			rootMargin: `-${boundsMargin}px`,
		},
	)
	observer.observe(el)
	return observer.disconnect
}

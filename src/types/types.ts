/* eslint-disable functional/prefer-readonly-type */
import Overswipe from '../lib/overswipeClass'

export type SwipeDirection = 'up' | 'down' | 'left' | 'right'

export type EventType = 'swipe' | 'progress' | 'cancel'

export type EventCallback = (details: {
	type: EventType
	direction: SwipeDirection
	progress: number
	distance: number
	capedProgress: number
	capedDistance: number
	// eslint-disable-next-line functional/no-return-void
}) => void

// eslint-disable-next-line functional/no-return-void
export type CookedUnsubscribe = () => void

export type Callback<A0 = void, A1 = void, A2 = void, A3 = void> = (
	arg0: A0,
	arg1: A1,
	arg2: A2,
	arg3: A3,
	// eslint-disable-next-line functional/no-return-void
) => void

export interface Position {
	top: number
	left: number
	right: number
	bottom: number
}

export interface Bounds extends Position {
	width: number
	height: number
}

export interface TouchInfo {
	x: number
	y: number
	time: number
}

export interface Subscribe {
	(
		type: EventType,
		direction: SwipeDirection,
		callback: EventCallback,
	): CookedUnsubscribe
	(type: EventType, callback: EventCallback): CookedUnsubscribe
}

export type Unsubscribe = (
	type: EventType,
	dir: SwipeDirection,
	handler: EventCallback,
	// eslint-disable-next-line functional/no-return-void
) => void

export interface ClientMethods {
	on: Subscribe
	off: Unsubscribe
}

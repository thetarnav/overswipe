/* eslint-disable functional/prefer-type-literal */
/* eslint-disable functional/prefer-readonly-type */
type SwipeDirection = 'up' | 'down' | 'left' | 'right'

type EventType = 'swipe' | 'progress' | 'cancel'

type EventCallback = (details: {
	type: EventType
	direction: SwipeDirection
	progress: number
	distance: number
	capedProgress: number
	capedDistance: number
	// eslint-disable-next-line functional/no-return-void
}) => void

// eslint-disable-next-line functional/no-return-void
type CookedUnsubscribe = () => void

interface Position {
	top: number
	left: number
	right: number
	bottom: number
}

interface Bounds extends Position {
	width: number
	height: number
}

interface TouchInfo {
	x: number
	y: number
	time: number
}

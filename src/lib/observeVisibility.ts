import { Callback, CookedUnsubscribe } from '../types/types'

/**
 * Setups an Intersection Observer
 * @param container parent HTML element *(can be window)*
 * @param el observed HTML element
 * @param callback fired when intersection changes
 * @param boundsMargin root margin in px
 * @returns callback that disconnects the Observer
 */
export const observeVisibility = (
	container: HTMLElement | Window,
	el: HTMLElement,
	callback: Callback<boolean>,
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

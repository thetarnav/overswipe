const { abs, sign } = Math

export const flipVal = (val: number, min: number, max: number): number =>
	abs(val * (sign(val) || 1) - max) + min

export function valToP(value: number, min: number, max: number): number {
	if (min > max) {
		;[min, max] = [max, min]
		value = flipVal(value, min, max)
	}
	return (value - min) / (max - min)
}

export const isInRange = (
	n: number,
	min: number,
	max: number,
	exc = false,
): boolean => {
	if (min > max) {
		const tmpMin = min
		min = max
		max = tmpMin
	}
	return exc ? n > min && n < max : n >= min && n <= max
}

export const isClose = (n: number, goal: number, range: number): boolean =>
	isInRange(n, goal - range, goal + range)

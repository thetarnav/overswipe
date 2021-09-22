export const copyArray = <T>(list: readonly T[]): readonly T[] => list.slice()

export const copyObject = <T extends Record<string, unknown>>(object: T): T =>
	Object.assign({}, object)

export const minus = (a: number, b: number): number => a - b

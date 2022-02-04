/**
 * A type containing differences and intersaction of a type-specific set.
 */
export interface DifferencesAndIntersection<T> {
    left_difference: T,
    intersection: T,
    right_difference: T
}

/**
 * Represents an integer interval
 */
export class IntegerInterval {
    /**
     * Creates an integer interval where
     * @param start The first boundary of the interval (inclusive).
     * @param end The second boundary of the interval (exclusive).
     */
    public constructor(public readonly start: number, public readonly end: number) {
        if (!Number.isInteger(start) || !Number.isInteger(end))
            throw new Error('Integer interval must have integer boundaries.')

        if (this.length < 0)
            throw new Error('Integer interval must have non-negative length.')
    }

    /**
     * Returns the length of the interval.
     */
    public get length(): number {
        return this.end - this.start
    }

    /**
     * Tells if the number is present in the interval or not.
     * @param x The number to check.
     * @return True if it's present, false otherwise.
     */
    public contains(x: number): boolean {
        return x >= this.start && x < this.end
    }
}

/**
 * An abstract structure that acts like a set of integers, maintaining a small memory
 * footprint storing huge intervals of integers.
 */
export class IntegerIntervalsSet {
    /**
     * Where all the intervals are stored (ordered).
     */
    private intervals: IntegerInterval[]

    /**
     * Create a new empty integer-intervals set.
     */
    public constructor() {
        this.intervals = []
    }

    /**
     * Given a number it returns the information in which interval the number is present or where should be inserted
     * as an interval if it's not present.
     * @param x The number to find.
     * @return If "present" is true then the "index" contains the index of the interval that contains the number,
     *     otherwise if "present" is false then the "index" contains the location where the number should be inserted
     *     if it would be considered as a one-length interval.
     * @private
     */
    private find_number_interval(x: number): {index: number, present: boolean} {
        let left = 0
        let right = this.intervals.length

        while (true) {
            const length = right - left

            if (length === 0)
                return {index: left, present: false}

            const pivot = left + Math.floor(length / 2)
            const interval = this.intervals[pivot]

            if (interval.contains(x))
                return {index: pivot, present: true}

            if (x < interval.start) {
                right = pivot
            } else {
                // Coming here implies that the number stays on the right of the interval.
                left = pivot + 1
            }
        }
    }

    /**
     * Adds an interval to the set.
     * @param interval The interval to add. If number if provided instead of an interval it will be converted
     *     to an interval.
     */
    public add(interval: IntegerInterval|number): void {
        let [start, end] = (typeof interval === 'number')
            ? [interval, interval + 1]
            : [interval.start, interval.end]

        const r0 = this.find_number_interval(start)
        const r1 = this.find_number_interval(end)
        let insert_index = r0.index
        let to_remove = r1.index - r0.index
        
        if (r0.present) {
            start = this.intervals[r0.index].start
        } else {
            const left_index = r0.index - 1

            if (left_index >= 0 && start === this.intervals[left_index].end) {
                start = this.intervals[left_index].start
                insert_index = left_index
                to_remove += 1
            }
        }

        if (r1.present) {
            end = this.intervals[r1.index].end
            to_remove += 1
        } else {
            if (r1.index < this.intervals.length && end === this.intervals[r1.index].start) {
                end = this.intervals[r1.index].end
                to_remove += 1
            }
        }

        this.intervals.splice(insert_index, to_remove, new IntegerInterval(start, end))
    }

    /**
     * Returns the number of stored intervals.
     */
    public get capacity(): number {
        return this.intervals.length
    }

    /**
     * Tells if a specified number is stored in this set.
     * @param x The specified number.
     * @returns True if the number is present in the set, false otherwise.
     */
    public contains(x: number): boolean {
        const result = this.find_number_interval(x)
        return result.present
    }

    /**
     * Returns all the numbers contained in the set.
     * @returns All the numbers in the set.
     */
    public to_array(): number[] {
        const numbers: number[] = []

        for (let interval of this.intervals) {
            for (let i = interval.start; i < interval.end; i += 1)
                numbers.push(i)
        }

        return numbers
    }

    /**
     * Calculates the union of two specified sets.
     * @param left The left specified set.
     * @param right The right specified set.
     * @returns The calculated union.
     */
    public static calculate_union(left: IntegerIntervalsSet, right: IntegerIntervalsSet): IntegerIntervalsSet {
        const set = new IntegerIntervalsSet()
        set.intervals = [...left.intervals]

        for (let interval of right.intervals)
            set.add(interval)

        return set
    }

    /**
     * Calculates the negation of the specified set.
     * @param set The specified set.
     * @returns The calculated negation.
     */
    public static calculate_negation(set: IntegerIntervalsSet): IntegerIntervalsSet {
        const negation = new IntegerIntervalsSet()
        let start = Number.MIN_SAFE_INTEGER

        for (let interval of set.intervals) {
            if (start < interval.start)
                negation.add(new IntegerInterval(start, interval.start))

            start = interval.end
        }

        if (start < Number.MAX_SAFE_INTEGER)
            negation.add(new IntegerInterval(start, Number.MAX_SAFE_INTEGER))

        return negation
    }
    
    /**
     * Calculates the differences (left and right) and intersection of two specified sets.
     * @param left The left specified set.
     * @param right The right specified set.
     * @returns The calculated differences and intersection.
     */
    public static calculate_differences_and_intersection(left: IntegerIntervalsSet, right: IntegerIntervalsSet): DifferencesAndIntersection<IntegerIntervalsSet> {
        const left_difference = new IntegerIntervalsSet()
        const intersection = new IntegerIntervalsSet()
        const right_difference = new IntegerIntervalsSet()
        
        const x: {index: number, start: number|undefined, intervals: IntegerInterval[], difference: IntegerIntervalsSet}[] = [
            {index: 0, start: undefined, intervals: left.intervals, difference: left_difference},
            {index: 0, start: undefined, intervals: right.intervals, difference: right_difference},
        ]

        while (true) {
            for (let key = 0; key < 2; ++key) {
                // If current object was fully processed, then consume the other.
                if (x[key].index >= x[key].intervals.length) {
                    const other = x[key ^ 1]

                    for (let i = other.index; i < other.intervals.length; ++i) {
                        if (other.start === undefined) {
                            other.difference.intervals.push(other.intervals[i])
                        } else {
                            const end = other.intervals[i].end
                            const interval = new IntegerInterval(other.start, end)
                            other.difference.intervals.push(interval)
                            other.start = undefined
                        }
                    }

                    return {left_difference, intersection, right_difference}
                }
            }

            if (x[0].start === undefined)
                x[0].start = x[0].intervals[x[0].index].start

            if (x[1].start === undefined)
                x[1].start = x[1].intervals[x[1].index].start

            let start_difference = x[0].start - x[1].start
            
            if (start_difference === 0) {
                const left_end = x[0].intervals[x[0].index].end
                const end_difference = left_end - x[1].intervals[x[1].index].end

                if (end_difference === 0) {
                    intersection.intervals.push(new IntegerInterval(x[0].start, left_end))
                    x[0].index += 1
                    x[1].index += 1
                    x[0].start = undefined
                    x[1].start = undefined
                } else {
                    // Here nearest between two represent the one with the minor 'end'.
                    const nearest_index = (end_difference < 0) ? 0 : 1
                    const nearest = x[nearest_index]
                    const nearest_interval = nearest.intervals[nearest.index]
                    const farthest = x[nearest_index ^ 1]

                    intersection.intervals.push(new IntegerInterval(nearest.start!, nearest_interval.end))
                    nearest.index += 1
                    nearest.start = undefined
                    farthest.start = nearest_interval.end
                }
            } else {
                // Here nearest between two represent the one with the minor 'start'.
                const nearest_index = (start_difference < 0) ? 0 : 1
                const nearest = x[nearest_index]
                const nearest_interval = nearest.intervals[nearest.index]
                const farthest = x[nearest_index ^ 1]

                if (nearest_interval.end <= farthest.start!) {
                    nearest.difference.intervals.push(new IntegerInterval(nearest.start!, nearest_interval.end))
                    nearest.index += 1
                    nearest.start = undefined
                } else {
                    nearest.difference.intervals.push(new IntegerInterval(nearest.start!, farthest.start!))
                    nearest.start = farthest.start
                }
            }
        }
    }
}

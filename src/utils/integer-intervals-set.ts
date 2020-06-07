
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
            throw new Error('Integer interval must have integer boundaries.');

        if (this.length < 0)
            throw new Error('Integer interval must have non-negative length.');
    }

    /**
     * Returns the length of the interval.
     */
    public get length(): number {
        return this.end - this.start;
    }

    /**
     * Tells if the number is present in the interval or not.
     * @param x The number to check.
     * @return True if it's present, false otherwise.
     */
    public contains(x: number): boolean {
        return x >= this.start && x < this.end;
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
    private intervals: IntegerInterval[];

    /**
     * Create a new empty integer-intervals set.
     */
    public constructor() {
        this.intervals = [];
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
        let left = 0;
        let right = this.intervals.length;

        while (true) {
            const length = right - left;

            if (length === 0)
                return {index: left, present: false};

            const pivot = left + Math.floor(length / 2);
            const interval = this.intervals[pivot];

            if (interval.contains(x))
                return {index: pivot, present: true};

            if (x < interval.start) {
                right = pivot;
            } else {
                // Coming here implies that the number stays on the right of the interval.
                left = pivot + 1;
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
            : [interval.start, interval.end];

        const r0 = this.find_number_interval(start);
        const r1 = this.find_number_interval(end);
        let insert_index = r0.index;
        let to_remove = r1.index - r0.index;
        
        if (r0.present) {
            start = this.intervals[r0.index].start;
        } else {
            const left_index = r0.index - 1;

            if (left_index >= 0 && start === this.intervals[left_index].end) {
                start = this.intervals[left_index].start;
                insert_index = left_index;
                to_remove += 1;
            }
        }

        if (r1.present) {
            end = this.intervals[r1.index].end;
            to_remove += 1;
        } else {
            if (r1.index < this.intervals.length && (end + 1) === this.intervals[r1.index].start) {
                end = this.intervals[r1.index].end;
                to_remove += 1;
            }
        }

        this.intervals.splice(insert_index, to_remove, new IntegerInterval(start, end));
    }

    /**
     * Returns the number of stored intervals.
     */
    public get capacity(): number {
        return this.intervals.length;
    }
}

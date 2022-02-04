import { AbstractSymbol } from './abstract-symbol'
import { IntegerInterval, IntegerIntervalsSet } from '../utils/integer-intervals-set'

export class MultiSymbol extends AbstractSymbol {
    public constructor(intervals: (IntegerInterval|number)[]) {
        super((() => {
            const set = new IntegerIntervalsSet()

            for (let interval of intervals)
                set.add(interval)

            return set
        })())
    }
}

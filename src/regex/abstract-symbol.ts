import { IntegerIntervalsSet } from '../utils/integer-intervals-set'

export type AbstractSymbolFragmentResult = {
    first_exclusive: AbstractSymbol,
    second_exclusive: AbstractSymbol,
    shared: AbstractSymbol
}

export class AbstractSymbol {
    protected constructor(private readonly set: IntegerIntervalsSet) {

    }

    public contains(code: number) {
        return this.set.contains(code)
    }

    public contains_only(code: number): boolean {
        const intervals = this.set.get_intervals()
        return intervals.length === 1 && intervals[0].start === code && intervals[0].end === code + 1
    }

    public represents_something(): boolean {
        return this.set.capacity !== 0
    }

    public static fragment(first: AbstractSymbol, second: AbstractSymbol): AbstractSymbolFragmentResult {
        const result = IntegerIntervalsSet.calculate_differences_and_intersection(first.set, second.set)
        const first_exclusive = new AbstractSymbol(result.left_difference)
        const second_exclusive = new AbstractSymbol(result.right_difference)
        const shared = new AbstractSymbol(result.intersection)

        return {
            first_exclusive,
            second_exclusive,
            shared
        }
    }

    public static merge(first: AbstractSymbol, second: AbstractSymbol): AbstractSymbol {
        return new AbstractSymbol(IntegerIntervalsSet.calculate_union(first.set, second.set))
    }

    public static negate(symbol: AbstractSymbol): AbstractSymbol {
        return new AbstractSymbol(IntegerIntervalsSet.calculate_negation(symbol.set))
    }
}

import { AbstractSymbol } from './abstract-symbol.js'
import { IntegerIntervalsSet } from '../utils/integer-intervals-set.js'

export class SingleSymbol extends AbstractSymbol {
    public constructor(public readonly code_point: number) {
        super((() => {
            const set = new IntegerIntervalsSet()
            set.add(code_point)
            return set
        }) ())
    }

    public to_string(): string {
        return String.fromCodePoint(this.code_point)
    }
}

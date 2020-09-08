import { AbstractSymbol } from './abstract-symbol';
import { IntegerIntervalsSet } from '@dist/utils/integer-intervals-set';

export class SingleSymbol extends AbstractSymbol {
    public constructor(public readonly code_point: number) {
        super((() => {
            const set = new IntegerIntervalsSet();
            set.add(code_point);
            return set;
        }) ());
    }

    public to_string(): string {
        return String.fromCodePoint(this.code_point);
    }
}

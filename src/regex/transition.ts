import { AbstractSymbol } from './abstract-symbol';
import { State } from './state';

export class Transition {
    public constructor(public readonly symbol: AbstractSymbol|undefined, public readonly state: State) {

    }

    public is_epsilon(): boolean {
        return this.symbol === undefined;
    }
}

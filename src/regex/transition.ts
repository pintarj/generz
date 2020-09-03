import {Symbol} from './symbol';
import {State} from './state';

export class Transition {
    public constructor(public readonly symbol: Symbol|undefined, public readonly state: State) {

    }

    public is_epsilon(): boolean {
        return this.symbol === undefined;
    }
}

import {Symbol} from './symbol';
import {State} from './state';

export class Transition {
    public constructor(public readonly symbol: Symbol, public readonly state: State) {

    }
}

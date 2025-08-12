import { AbstractSymbol } from './abstract-symbol.js'
import { State } from './state.js'

export class Transition {
    public constructor(public readonly symbol: AbstractSymbol|undefined, public readonly state: State) {

    }

    public is_epsilon(): boolean {
        return this.symbol === undefined
    }
}

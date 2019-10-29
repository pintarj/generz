import {EpsilonSymbol} from './epsilon-symbol';
import {Symbol} from './symbol';
import {Transition} from './transition';

export class State {
    public readonly transitions: Transition[] = [];

    constructor(public readonly id: number) {
        // ...
    }

    public add_transition(symbol: Symbol, state: State) {
        this.transitions.push(new Transition(symbol, state));
    }

    public add_epsilon_transition(state: State) {
        this.add_transition(EpsilonSymbol.INSTANCE, state);
    }

    /**
     * Note that this method doesn't return finally reachable states,
     * but transition. This means that can exist cases where a state
     * reachable by a transition can also contain epsilon-transitions
     * and therefore represent a multi-state.
     */
    public get_reachable_transitions(): Transition[] {
        const states: Transition[] = [];

        for (let i = 0; i < this.transitions.length; ++i) {
            const transition = this.transitions[i];

            if (transition.symbol.is_epsilon()) {
                states.push(...transition.state.get_reachable_transitions());
            } else {
                states.push(transition);
            }
        }

        return states;
    }
}

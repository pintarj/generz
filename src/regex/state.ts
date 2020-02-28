import {EpsilonSymbol} from './epsilon-symbol';
import {Symbol} from './symbol';
import {Transition} from './transition';

export class State {
    public readonly transitions: Transition[] = [];

    constructor(public readonly id: number) {
        // ...
    }

    public add_transitions(...transitions: Transition[]) {
        this.transitions.push(...transitions);
    }

    public add_transition(symbol: Symbol, state: State) {
        this.add_transitions(new Transition(symbol, state));
    }

    public add_epsilon_transition(state: State) {
        this.add_transition(EpsilonSymbol.INSTANCE, state);
    }

    public remove_all_transitions() {
        this.transitions.length = 0; // wow, amazing trick
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

    public get_transitively_reachable_states(): State[] {
        const processed_states = new Map<number, State>();
        const queue: State[] = [this];

        while (true) {
            const state = queue.shift();

            if (state === undefined)
                break;

            if (processed_states.has(state.id))
                continue;

            processed_states.set(state.id, state);
            queue.push(...state.transitions.map(transition => transition.state));
        }

        return Array.from(processed_states.values());
    }
}

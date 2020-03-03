import {EpsilonSymbol} from './epsilon-symbol';
import {Symbol as GenerzSymbol} from './symbol';
import {Transition} from './transition';

export class State {
    public readonly transitions: Transition[] = [];
    public is_final: boolean = false;

    constructor(public readonly id: number, options?: {is_final?: boolean}) {
        options = options || {};
        this.is_final = options.is_final === true;
    }

    public add_transitions(...transitions: Transition[]) {
        this.transitions.push(...transitions);
    }

    public add_transition(symbol: GenerzSymbol, state: State) {
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
        const reachable: Transition[] = [];
        const queue: Transition[] = [...this.transitions];
        const already_queued = new Set([...this.transitions]);

        while (true) {
            const transition = queue.shift();

            if (transition === undefined)
                break;

            if (transition.symbol.is_epsilon()) {
                for (let next_transition of transition.state.transitions) {
                    if (already_queued.has(next_transition))
                        continue;

                    queue.push(next_transition);
                    already_queued.add(next_transition);
                }
            } else {
                reachable.push(transition);
            }
        }

        return reachable;
    }

    public get_transitively_reachable_states_iterable(): Iterable<State> {
        const state_this = this;
        return {
            [Symbol.iterator](): Iterator<State> {
                const processed_states = new Map<number, State>();
                const queue: State[] = [state_this];

                return {
                    next(): IteratorResult<State> {
                        while (true) {
                            const state = queue.shift();

                            if (state === undefined) {
                                return {
                                    done: true,
                                    value: <any> undefined
                                };
                            }

                            if (processed_states.has(state.id))
                                continue;

                            processed_states.set(state.id, state);
                            queue.push(...state.transitions.map(transition => transition.state));

                            return {
                                done: false,
                                value: state
                            };
                        }
                    }
                };
            }
        }
    }

    public get_transitively_reachable_states(): State[] {
        return Array.from(this.get_transitively_reachable_states_iterable());
    }

    public expand_final_through_epsilon_transitions() {
        if (!this.is_final)
            return;

        const queue: State[] = [this];
        const already_queued: Set<number> = new Set([this.id]);

        while (true) {
            const state = queue.shift();

            if (state === undefined)
                break;

            for (let transition of state.transitions) {
                if (!transition.symbol.is_epsilon())
                    continue;

                const next_state = transition.state;

                if (already_queued.has(next_state.id))
                    continue;

                next_state.is_final = true;
                queue.push(next_state);
                already_queued.add(next_state.id);
            }
        }
    }

    public is_deterministic(): boolean {
        const seen_symbol = new Set<number>();

        for (let transition of this.transitions) {
            if (transition.symbol.is_epsilon() || seen_symbol.has(transition.symbol.code_point))
                return false;

            seen_symbol.add(transition.symbol.code_point);
        }

        return true;
    }
}

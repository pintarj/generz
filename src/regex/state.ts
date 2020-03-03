import {EpsilonSymbol} from './epsilon-symbol';
import {Symbol as GenerzSymbol} from './symbol';
import {Transition} from './transition';
import {NonDeterministicStatesMap} from './non-deterministic-states-map';
import {Context} from './context';

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

    public reaches_a_final_state(): boolean {
        const queue: State[] = [this];
        const already_queued: Set<number> = new Set([this.id]);

        while (true) {
            const state = queue.shift();

            if (state === undefined)
                return false;

            if (state.is_final)
                return true;

            for (let transition of state.transitions) {
                if (!transition.symbol.is_epsilon())
                    continue;

                const next_state = transition.state;

                if (already_queued.has(next_state.id))
                    continue;

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

    public get_transitions_multi_state_map(): Map<number, State[]> {
        const map = new Map<number, State[]>();

        for (let transition of this.get_reachable_transitions()) {
            const code_point = transition.symbol.code_point;
            let symbol_states = map.get(code_point);

            if (symbol_states === undefined) {
                symbol_states = [];
                map.set(code_point, symbol_states);
            }

            symbol_states.push(transition.state);
        }

        return map;
    }

    public remove_non_determinism(context: Context) {
        const all_states = this.get_transitively_reachable_states();

        for (let final_state of all_states.filter((state: State) => state.is_final))
            final_state.expand_final_through_epsilon_transitions();

        for (let state of all_states.filter((state: State) => !state.is_final))
            state.is_final = state.reaches_a_final_state();

        const states_map = new NonDeterministicStatesMap(context, all_states);
        const already_queued = new Set<number>([this.id]);
        const queue: State[] = [this];

        while (true) {
            const state = queue.shift();

            if (state === undefined)
                break;

            const map = state.get_transitions_multi_state_map();
            const transitions: Transition[] = [];

            for (let [code_point, states] of map.entries()) {
                const next_state = states_map.get_or_create(states);
                transitions.push(new Transition(new GenerzSymbol(code_point), next_state));

                if (!already_queued.has(next_state.id)) {
                    queue.push(next_state);
                    already_queued.add(next_state.id);
                }
            }

            state.remove_all_transitions();
            state.add_transitions(...transitions);
        }
    }
}

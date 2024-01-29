import { AbstractSymbol } from './abstract-symbol'
import { Transition } from './transition'
import { NonDeterministicStatesMap } from './non-deterministic-states-map'
import { Context } from './context'

export class State {
    public readonly transitions: Transition[] = []
    public is_final: boolean = false
    public machine_id: number|undefined = undefined

    constructor(public readonly id: number, options?: {is_final?: boolean}) {
        options = options || {}
        this.is_final = options.is_final === true
    }

    public add_transitions(...transitions: Transition[]) {
        this.transitions.push(...transitions)
    }

    public add_transition(symbol: AbstractSymbol, state: State) {
        this.add_transitions(new Transition(symbol, state))
    }

    public add_epsilon_transition(state: State) {
        this.add_transitions(new Transition(undefined, state))
    }

    public remove_all_transitions() {
        this.transitions.length = 0 // wow, amazing trick
    }

    /**
     * Note that this method doesn't return finally reachable states,
     * but transition. This means that can exist cases where a state
     * reachable by a transition can also contain epsilon-transitions
     * and therefore represent a multi-state.
     */
    public get_reachable_transitions(): Transition[] {
        const reachable: Transition[] = []
        const queue: Transition[] = [...this.transitions]
        const already_queued = new Set([...this.transitions])

        while (true) {
            const transition = queue.shift()

            if (transition === undefined)
                break

            if (transition.is_epsilon()) {
                for (let next_transition of transition.state.transitions) {
                    if (already_queued.has(next_transition))
                        continue

                    queue.push(next_transition)
                    already_queued.add(next_transition)
                }
            } else {
                reachable.push(transition)
            }
        }

        return reachable
    }

    public get_transitively_reachable_states_iterable(): Iterable<State> {
        const state_this = this
        return {
            [Symbol.iterator](): Iterator<State> {
                const processed_states = new Map<number, State>()
                const queue: State[] = [state_this]

                return {
                    next(): IteratorResult<State> {
                        while (true) {
                            const state = queue.shift()

                            if (state === undefined) {
                                return {
                                    done: true,
                                    value: <any> undefined
                                }
                            }

                            if (processed_states.has(state.id))
                                continue

                            processed_states.set(state.id, state)
                            queue.push(...state.transitions.map(transition => transition.state))

                            return {
                                done: false,
                                value: state
                            }
                        }
                    }
                }
            }
        }
    }

    public get_transitively_reachable_states(): State[] {
        return Array.from(this.get_transitively_reachable_states_iterable())
    }

    public get_transitively_reachable_final_states(): State[] {
        return this.get_transitively_reachable_states().filter(state => state.is_final)
    }

    /**
     * ! Dead code.
     */
    public expand_final_through_epsilon_transitions() {
        if (!this.is_final)
            return

        const queue: State[] = [this]
        const already_queued: Set<number> = new Set([this.id])

        while (true) {
            const state = queue.shift()

            if (state === undefined)
                break

            for (let transition of state.transitions) {
                if (!transition.is_epsilon())
                    continue

                const next_state = transition.state

                if (already_queued.has(next_state.id))
                    continue

                next_state.is_final = true
                next_state.machine_id = this.machine_id
                queue.push(next_state)
                already_queued.add(next_state.id)
            }
        }
    }

    public become_final_through_epsilon_transitions(): void {
        const queue: State[] = [this]
        const already_queued: Set<number> = new Set([this.id])

        while (true) {
            const state = queue.shift()

            if (state === undefined)
                break

            if (state.is_final) {
                this.is_final = true
                this.machine_id = state.machine_id
                break
            }

            for (let transition of state.transitions) {
                if (!transition.is_epsilon())
                    continue

                const next_state = transition.state

                if (already_queued.has(next_state.id))
                    continue

                queue.push(next_state)
                already_queued.add(next_state.id)
            }
        }
    }

    /**
     * The symbols returned in the array by this method are all disjunctive.
     */
    public get_transitions_multi_state_map(): {symbol: AbstractSymbol, states: State[]}[] {
        // Note that all transitions returned by `get_reachable_transitions()` are non-epsilon.
        const transitions = this.get_reachable_transitions()
        
        if (transitions.length === 0)
            return []

        // All abstract-symbols contained in this variable are disjunctive.
        const map: {symbol: AbstractSymbol, states: State[]}[] = []

        for (let transition of transitions) {
            let symbol = transition.symbol!

            if (!symbol.represents_something())
                continue

            for (let i = 0, n = map.length; i < n; i += 1) {
                const entry = map[i]
                const fragmentation = AbstractSymbol.fragment(entry.symbol, symbol)

                // If symbols have some common code-points.
                if (fragmentation.shared.represents_something()) {
                    if (fragmentation.first_exclusive.represents_something()) {
                        entry.symbol = fragmentation.first_exclusive
                        const states = [...entry.states]

                        if (!states.some(x => x.id === transition.state.id))
                            states.push(transition.state)
                        
                        map.push({
                            symbol: fragmentation.shared,
                            states
                        })
                    } else {
                        entry.symbol = fragmentation.shared

                        if (entry.states.find(x => x.id === transition.state.id) === undefined)
                            entry.states.push(transition.state)
                    }
                }

                symbol = fragmentation.second_exclusive
            }

            // If second-symbol have some exclusive code-points.
            if (symbol.represents_something()) {
                map.push({
                    symbol,
                    states: [transition.state]
                })
            }
        }

        return map
    }

    public remove_non_determinism(context: Context) {
        const all_states = this.get_transitively_reachable_states()
        const states_map = new NonDeterministicStatesMap(context, all_states)
        const already_queued = new Set<number>([this.id])
        const queue: State[] = [this]

        while (true) {
            const state = queue.shift()

            if (state === undefined)
                break

            state.become_final_through_epsilon_transitions()

            const map = state.get_transitions_multi_state_map()
            const transitions: Transition[] = []

            for (let entry of map) {
                const next_state = states_map.get_or_create(entry.states)
                transitions.push(new Transition(entry.symbol, next_state))

                if (!already_queued.has(next_state.id)) {
                    queue.push(next_state)
                    already_queued.add(next_state.id)
                }
            }

            state.remove_all_transitions()
            state.add_transitions(...transitions)
        }
    }

    /**
     * Method tries to match the specified input stream with the current state.
     * The string it's matched from it's first character.
     * @param input The input string to consume.
     * @param options.machine_id If specified, then the method will ensure, that the input will
     *     be matched exactly by the machine with the specified id.
     * @returns False if input string was not matched, otherwise the matched prefix of input string is returned.
     * */
    public match(input: string, options?: {machine_id?: number|undefined}): false|string {
        const symbols = Array.from(input)
        let last_match: number|undefined = undefined
        let last_match_state: State|undefined = undefined
        let index: number = 0
        let state: State = this

        while (true) {
            if (state.is_final) {
                last_match = index
                last_match_state = state
            }

            if (index === symbols.length)
                break

            const code_point = symbols[index].codePointAt(0)!
            const transition = state.transitions.find(x => x.symbol === undefined || x.symbol.contains(code_point))

            if (transition === undefined)
                break

            state = transition.state
            index += 1
        }

        if (last_match === undefined)
            return false

        if (options?.machine_id !== undefined) {
            if (last_match_state!.machine_id !== options.machine_id)
                return false
        }

        return symbols.slice(0, last_match).join('')
    }
}

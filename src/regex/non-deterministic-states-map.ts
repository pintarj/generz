import {Context} from './context'
import {State} from './state'
import {InternalError} from '../error'

/**
 * Each state that is created by this class (and was not initially specified as initial-state)
 * it's named _virtual_.
 */
export class NonDeterministicStatesMap {
    /**
     * Contains the ids of all the initial provided states.
     */
    private initial_states_ids: Set<number>

    /**
     * Maps each virtual state in the _initial states_ that would represent.
     */
    private virtual_to_initial_states_map: Map<number, number[]>

    /**
     * Maps the _initial states aggregation key_ to a state representing being in the states
     * present in the key. For example: key `3,4,7` would map to a state that represent being
     * in the states `3`, `4` and `7` contemporaneously.
     */
    private map: Map<string, State>

    /**
     * @param context The state machine context.
     * @param initial_states The initial states for this class.
     */
    public constructor(public readonly context: Context, initial_states: State[]) {
        this.initial_states_ids = new Set()
        this.virtual_to_initial_states_map = new Map()
        this.map = new Map()
        
        for (let state of initial_states) {
            this.initial_states_ids.add(state.id)
            this.map.set(state.id.toString(), state)
        }
    }

    /**
     * Given a set of states (identified by the ids of states) returns a
     * new non-deterministic state which transitions are the union of the
     * transitions of the specified states set.
     * 
     * If any of the specified states is final, then also the created non-deterministic
     * state will be final. In this case the `machine_id` of the created state will be
     * the minor id between the ones from specified final states.
     * 
     * @param non_deterministic_states The states to map in the new state (or existing one if
     *     already present).
     */
    public get_or_create(non_deterministic_states: State[]): State {
        const states_ids = new Set<number>()

        for (const state of non_deterministic_states) {
            if (this.initial_states_ids.has(state.id)) { // if it's initial...
                states_ids.add(state.id)
                continue
            }

            const sub_initial_states = this.virtual_to_initial_states_map.get(state.id)

            if (sub_initial_states !== undefined) { // or it's virtual...
                sub_initial_states.forEach(id => states_ids.add(id))
                continue
            }
            
            throw new InternalError(`One of provided states (${state.id}) is not initial and even not virtual.`)
        }
        
        const key = [... states_ids].sort((a, b) => a - b).join(',')
        let value = this.map.get(key)
        
        if (value !== undefined)
            return value

        value = this.context.create_new_state()
        const machine_ids: number[] = []

        for (let state of non_deterministic_states) {
            if (state.is_final) {
                if (state.machine_id !== undefined)
                    machine_ids.push(state.machine_id)

                value.is_final = true
            }

            value.add_transitions(...state.transitions)
        }

        if (machine_ids.length !== 0) {
            value.machine_id = Math.min(...machine_ids)
        }

        this.virtual_to_initial_states_map.set(value.id, [...states_ids])
        this.map.set(key, value)
        return value
    }
}

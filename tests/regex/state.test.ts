import { State } from '@dist/regex/state'
import { SingleSymbol } from '@dist/regex/single-symbol'
import { MultiSymbol } from '@dist/regex/multi-symbol'
import { Transition } from '@dist/regex/transition'
import { Context } from '@dist/regex/context'
import { IntegerInterval } from '@dist/utils/integer-intervals-set'

test('state-empty', () => {
    const s = new State(0)
    expect(s.id).toBe(0)
    expect(s.is_final).toBe(false)
    expect(s.transitions.length).toBe(0)
    expect(s.get_reachable_transitions().length).toBe(0)
})

test('state-empty-define-final', () => {
    const state_0 = new State(0, {})
    const state_1 = new State(1, {is_final: false})
    const state_2 = new State(2, {is_final: true})
    expect(state_0.is_final).toBe(false)
    expect(state_1.is_final).toBe(false)
    expect(state_2.is_final).toBe(true)
})

test('state-deterministic-reach', () => {
    const symbol_0 = new SingleSymbol(32)
    const symbol_1 = new SingleSymbol(64)
    const symbol_u = new SingleSymbol(128)
    const state_s = new State(5)
    const state_0 = new State(0)
    const state_1 = new State(1)
    const state_u = new State(2)
    state_s.add_transition(symbol_0, state_0)
    state_s.add_transition(symbol_1, state_1)
    state_1.add_transition(symbol_u, state_u)
    expect(state_s.transitions.length).toBe(2)
    expect(state_0.transitions.length).toBe(0)
    expect(state_1.transitions.length).toBe(1)
    expect(state_u.transitions.length).toBe(0)
    const reachable = state_s.get_reachable_transitions()
    expect(reachable.length).toBe(2)
    expect(reachable[0].symbol!.contains_only(32)).toBe(true)
    expect(reachable[1].symbol!.contains_only(64)).toBe(true)
    expect(reachable[0].state.id).toBe(0)
    expect(reachable[1].state.id).toBe(1)
})

test('state-deterministic-reach-loop', () => {
    const state_0 = new State(0)
    const state_1 = new State(1)
    state_0.add_epsilon_transition(state_1)
    state_1.add_epsilon_transition(state_0)
    state_0.get_reachable_transitions()
    expect(true).toBe(true)
})

test('state-non-deterministic-reach', () => {
    const symbol_2 = new SingleSymbol(16)
    const symbol_3 = new SingleSymbol(4)
    const symbol_4 = new SingleSymbol(8)
    const state_0 = new State(0)
    const state_1 = new State(1)
    const state_2 = new State(2)
    const state_3 = new State(3)
    const state_4 = new State(4)
    const state_5 = new State(5)
    state_0.add_epsilon_transition(state_1)
    state_0.add_transition(symbol_2, state_2)
    state_1.add_transition(symbol_3, state_3)
    state_1.add_transition(symbol_4, state_4)
    state_2.add_epsilon_transition(state_5)
    const reachable = state_0.get_reachable_transitions().sort((a, b) => a.state.id - b.state.id)
    expect(reachable.length).toBe(3)
    expect(reachable.map(x => x.state.id).sort((a, b) => a - b)).toEqual([2, 3, 4])
    expect(reachable[0].symbol?.contains_only(16)).toBe(true)
    expect(reachable[1].symbol?.contains_only(4)).toBe(true)
    expect(reachable[2].symbol?.contains_only(8)).toBe(true)
})

test('state-transitive-reachable-states-simple', () => {
    const symbol_1 = new SingleSymbol(16)
    const symbol_2 = new SingleSymbol(32)
    const state_0 = new State(0)
    const state_1 = new State(1)
    const state_2 = new State(2)
    state_0.add_transition(symbol_1, state_1)
    state_0.add_transition(symbol_2, state_2)
    const reachable = state_0.get_transitively_reachable_states().sort((a, b) => a.id - b.id)
    expect(reachable.length).toBe(3)
    expect(reachable[0].id).toBe(0)
    expect(reachable[1].id).toBe(1)
    expect(reachable[2].id).toBe(2)
})

test('state-transitive-reachable-states-simple-epsilon', () => {
    const state_0 = new State(0)
    const state_1 = new State(1)
    const state_2 = new State(2)
    state_0.add_epsilon_transition(state_1)
    state_0.add_epsilon_transition(state_2)
    const reachable = state_0.get_transitively_reachable_states().sort((a, b) => a.id - b.id)
    expect(reachable.length).toBe(3)
    expect(reachable[0].id).toBe(0)
    expect(reachable[1].id).toBe(1)
    expect(reachable[2].id).toBe(2)
})

test('state-transitive-reachable-states-complex', () => {
    const state_0 = new State(0)
    const state_1 = new State(1)
    const state_2 = new State(2)
    const state_3 = new State(3)
    const state_4 = new State(4)
    const state_5 = new State(5)
    const state_6 = new State(6)
    state_0.add_epsilon_transition(state_1)
    state_0.add_epsilon_transition(state_2)
    state_0.add_epsilon_transition(state_3)
    state_1.add_epsilon_transition(state_2)
    state_2.add_epsilon_transition(state_4)
    state_2.add_epsilon_transition(state_5)
    state_5.add_epsilon_transition(state_6)
    const reachable = state_0.get_transitively_reachable_states().sort((a, b) => a.id - b.id)
    expect(reachable.length).toBe(7)
    expect(reachable[0].id).toBe(0)
    expect(reachable[1].id).toBe(1)
    expect(reachable[2].id).toBe(2)
    expect(reachable[3].id).toBe(3)
    expect(reachable[4].id).toBe(4)
    expect(reachable[5].id).toBe(5)
    expect(reachable[6].id).toBe(6)
})

test('state-transitive-reachable-states-loop', () => {
    const state_0 = new State(0)
    const state_1 = new State(1)
    const state_2 = new State(2)
    state_0.add_epsilon_transition(state_1)
    state_1.add_epsilon_transition(state_2)
    state_2.add_epsilon_transition(state_0)
    const reachable_0 = state_0.get_transitively_reachable_states().sort((a, b) => a.id - b.id)
    expect(reachable_0.length).toBe(3)
    expect(reachable_0[0].id).toBe(0)
    expect(reachable_0[1].id).toBe(1)
    expect(reachable_0[2].id).toBe(2)
    const reachable_1 = state_1.get_transitively_reachable_states().sort((a, b) => a.id - b.id)
    expect(reachable_1.length).toBe(3)
    expect(reachable_1[0].id).toBe(0)
    expect(reachable_1[1].id).toBe(1)
    expect(reachable_1[2].id).toBe(2)
})

test('state-multi-transition-add', () => {
    const state_0 = new State(0)
    const state_1 = new State(1)
    const symbol_0 = new SingleSymbol(32)
    const symbol_1 = new SingleSymbol(64)
    state_0.add_transitions(new Transition(symbol_0, state_1), new Transition(symbol_1, state_1))
    expect(state_0.transitions.length).toBe(2)
    expect(state_1.transitions.length).toBe(0)
    expect(state_0.transitions[0].symbol!.contains_only(32)).toBe(true)
    expect(state_0.transitions[1].symbol!.contains_only(64)).toBe(true)
    expect(state_0.transitions[0].state.id).toBe(1)
    expect(state_0.transitions[1].state.id).toBe(1)
})

test('state-transition-remove-all', () => {
    const state_0 = new State(0)
    const state_1 = new State(1)
    state_0.add_epsilon_transition(state_1)
    state_0.add_epsilon_transition(state_1)
    expect(state_0.transitions.length).toBe(2)
    expect(state_1.transitions.length).toBe(0)
    state_0.remove_all_transitions()
    expect(state_0.transitions.length).toBe(0)
    expect(state_1.transitions.length).toBe(0)
})

describe('final-calculation', () => {
    describe('expand', () => {
        test('single-loop-keep-false', () => {
            const state_0 = new State(0)
            state_0.add_epsilon_transition(state_0)
            state_0.expand_final_through_epsilon_transitions()
            expect(state_0.is_final).toBe(false)
        })
        
        test('double-loop-keep-false', () => {
            const state_0 = new State(0)
            const state_1 = new State(1)
            state_0.add_epsilon_transition(state_1)
            state_1.add_epsilon_transition(state_0)
            state_0.expand_final_through_epsilon_transitions()
            expect(state_0.is_final).toBe(false)
            expect(state_1.is_final).toBe(false)
        })
        
        test('single-loop-expand-true', () => {
            const state_0 = new State(0)
            state_0.is_final = true
            state_0.add_epsilon_transition(state_0)
            state_0.expand_final_through_epsilon_transitions()
            expect(state_0.is_final).toBe(true)
        })
        
        test('double-loop-expand-true', () => {
            const state_0 = new State(0)
            const state_1 = new State(1)
            state_0.machine_id = 33
            state_0.is_final = true
            state_0.add_epsilon_transition(state_1)
            state_1.add_epsilon_transition(state_0)
            state_0.expand_final_through_epsilon_transitions()
            expect(state_0.is_final).toBe(true)
            expect(state_1.is_final).toBe(true)
            expect(state_0.machine_id).toBe(33)
            expect(state_1.machine_id).toBe(33)
        })
        
        test('expand-true-transitive', () => {
            const state_0 = new State(0)
            const state_1 = new State(1)
            const state_2 = new State(2)
            state_0.machine_id = 34
            state_0.is_final = true
            state_0.add_epsilon_transition(state_1)
            state_1.add_epsilon_transition(state_2)
            state_0.expand_final_through_epsilon_transitions()
            expect(state_0.is_final).toBe(true)
            expect(state_1.is_final).toBe(true)
            expect(state_2.is_final).toBe(true)
            expect(state_0.machine_id).toBe(34)
            expect(state_1.machine_id).toBe(34)
            expect(state_2.machine_id).toBe(34)
        })
        
        test('expand-true-no-epsilon', () => {
            const state_0 = new State(0)
            const state_1 = new State(1)
            state_0.machine_id = 101
            state_0.is_final = true
            state_0.add_transition(new SingleSymbol(32), state_1)
            state_0.expand_final_through_epsilon_transitions()
            expect(state_0.is_final).toBe(true)
            expect(state_1.is_final).toBe(false)
            expect(state_0.machine_id).toBe(101)
            expect(state_1.machine_id).toBe(undefined)
        })
        
        test('complex', () => {
            const context = new Context()
            const states = [
                context.create_new_state(),
                context.create_new_state(),
                context.create_new_state(),
                context.create_new_state(),
                context.create_new_state(),
                context.create_new_state(),
            ]
            states[0].is_final = true
            states[0].add_epsilon_transition(states[0])
            states[0].add_epsilon_transition(states[1])
            states[1].add_epsilon_transition(states[2])
            states[2].add_epsilon_transition(states[0])
            states[1].add_transition(new SingleSymbol(1024), states[3])
            states[0].add_transition(new SingleSymbol(1024), states[4])
            states[4].add_epsilon_transition(states[5])
            states[0].expand_final_through_epsilon_transitions()
            expect(states[0].is_final).toBe(true)
            expect(states[1].is_final).toBe(true)
            expect(states[2].is_final).toBe(true)
            expect(states[3].is_final).toBe(false)
            expect(states[4].is_final).toBe(false)
            expect(states[5].is_final).toBe(false)
        })
    })

    describe('reaches', () => {
        test('simple', () => {
            const context = new Context()
            const states = [
                context.create_new_state(),
                context.create_new_state()
            ]
            states[0].add_epsilon_transition(states[1])
            states[1].machine_id = 702
            states[1].is_final = true
            states[0].become_final_through_epsilon_transitions()
            expect(states[0].is_final).toBe(true)
            expect(states[0].machine_id).toBe(702)
        })
        
        test('loop', () => {
            const context = new Context()
            const states = [
                context.create_new_state(),
                context.create_new_state()
            ]
            states[0].add_epsilon_transition(states[1])
            states[1].add_epsilon_transition(states[0])
            states[1].is_final = true
            states[1].machine_id = 999
            states[0].become_final_through_epsilon_transitions()
            expect(states[0].is_final).toBe(true)
            expect(states[0].machine_id).toBe(999)
        })
        
        test('loop-false', () => {
            const context = new Context()
            const states = [
                context.create_new_state(),
                context.create_new_state()
            ]
            states[0].add_epsilon_transition(states[1])
            states[1].add_epsilon_transition(states[0])
            states[0].become_final_through_epsilon_transitions()
            expect(states[0].is_final).toBe(false)
            expect(states[0].machine_id).toBe(undefined)
        })
        
        test('no-through-symbol', () => {
            const context = new Context()
            const states = [
                context.create_new_state(),
                context.create_new_state()
            ]
            states[0].add_transition(new SingleSymbol(2), states[1])
            states[1].is_final = true
            states[1].machine_id = 90
            states[0].become_final_through_epsilon_transitions()
            expect(states[0].is_final).toBe(false)
            expect(states[1].is_final).toBe(true)
            expect(states[0].machine_id).toBe(undefined)
            expect(states[1].machine_id).toBe(90)
        })
        
        test('transitive', () => {
            const context = new Context()
            const states = [
                context.create_new_state(),
                context.create_new_state(),
                context.create_new_state()
            ]
            states[0].add_epsilon_transition(states[1])
            states[1].add_epsilon_transition(states[2])
            states[2].is_final = true
            states[2].machine_id = 123
            states[0].become_final_through_epsilon_transitions()
            states[1].become_final_through_epsilon_transitions()
            states[2].become_final_through_epsilon_transitions()
            expect(states[0].is_final).toBe(true)
            expect(states[1].is_final).toBe(true)
            expect(states[2].is_final).toBe(true)
            expect(states[0].machine_id).toBe(123)
            expect(states[1].machine_id).toBe(123)
            expect(states[2].machine_id).toBe(123)
        })
        
        test('in-middle', () => {
            const context = new Context()
            const states = [
                context.create_new_state(),
                context.create_new_state(),
                context.create_new_state(),
                context.create_new_state(),
                context.create_new_state()
            ]
            states[2].is_final = true
            states[2].machine_id = 1
            states[0].add_epsilon_transition(states[1])
            states[1].add_epsilon_transition(states[2])
            states[2].add_epsilon_transition(states[3])
            states[3].add_epsilon_transition(states[4])
            states[0].become_final_through_epsilon_transitions()
            states[1].become_final_through_epsilon_transitions()
            states[2].become_final_through_epsilon_transitions()
            states[3].become_final_through_epsilon_transitions()
            states[4].become_final_through_epsilon_transitions()
            expect(states[0].is_final).toBe(true)
            expect(states[1].is_final).toBe(true)
            expect(states[2].is_final).toBe(true)
            expect(states[3].is_final).toBe(false)
            expect(states[4].is_final).toBe(false)
            expect(states[0].machine_id).toBe(1)
            expect(states[1].machine_id).toBe(1)
            expect(states[2].machine_id).toBe(1)
            expect(states[3].machine_id).toBe(undefined)
            expect(states[4].machine_id).toBe(undefined)
        })
    })
})

/*
test('state-is-deterministic-false-epsilon', () => {
    const context = new Context()
    const states = [
        context.create_new_state(),
        context.create_new_state()
    ]
    states[0].add_epsilon_transition(states[1])
    expect(states[0].is_deterministic()).toBe(false)
    expect(states[1].is_deterministic()).toBe(true)
})

test('state-is-deterministic-false-double-symbol', () => {
    const context = new Context()
    const states = [
        context.create_new_state(),
        context.create_new_state(),
        context.create_new_state()
    ]
    states[0].add_transition(new SingleSymbol(2), states[1])
    states[0].add_transition(new SingleSymbol(2), states[2])
    expect(states[0].is_deterministic()).toBe(false)
    expect(states[1].is_deterministic()).toBe(true)
    expect(states[2].is_deterministic()).toBe(true)
})

test('state-is-deterministic-true', () => {
    const context = new Context()
    const states = [
        context.create_new_state(),
        context.create_new_state(),
        context.create_new_state()
    ]
    states[0].add_transition(new SingleSymbol(2), states[1])
    states[0].add_transition(new SingleSymbol(4), states[2])
    expect(states[0].is_deterministic()).toBe(true)
    expect(states[1].is_deterministic()).toBe(true)
    expect(states[2].is_deterministic()).toBe(true)
})
*/

describe('get_transitions_multi_state_map', () => {
    test('no-shared', () => {
        const context = new Context()
        const states = [
            context.create_new_state(),
            context.create_new_state(),
            context.create_new_state(),
            context.create_new_state(),
            context.create_new_state(),
            context.create_new_state()
        ]
        states[0].add_transition(new SingleSymbol(100), states[1])
        states[0].add_transition(new SingleSymbol(100), states[1])
        states[0].add_transition(new SingleSymbol(100), states[2])
        states[0].add_epsilon_transition(states[2])
        states[2].add_epsilon_transition(states[0])
        states[0].add_epsilon_transition(states[0])
        states[0].add_transition(new SingleSymbol(100), states[3])
        states[0].add_transition(new SingleSymbol(200), states[4])
        states[0].add_epsilon_transition(states[5])
        const map = states[0].get_transitions_multi_state_map()
        expect(map.length).toBe(2)
        expect(map.find(x => x.symbol.contains_only(100))?.states.map(x => x.id).sort()).toEqual([1, 2, 3])
        expect(map.find(x => x.symbol.contains_only(200))?.states.map(x => x.id).sort()).toEqual([4])
    })

    test('all-present', () => {
        const context = new Context()
        const states = [
            context.create_new_state(),
            context.create_new_state(),
            context.create_new_state()
        ]
        const symbols = [
            new MultiSymbol([
                new IntegerInterval(3, 5)
            ]),
            new MultiSymbol([
                new IntegerInterval(2, 4)
            ])
        ]

        states[0].add_transition(symbols[0], states[1])
        states[0].add_transition(symbols[1], states[2])
        const map = states[0].get_transitions_multi_state_map()
        expect(map).toHaveLength(3)
        expect(map.filter(x => x.symbol.contains_only(2))).toHaveLength(1)
        expect(map.filter(x => x.symbol.contains_only(3))).toHaveLength(1)
        expect(map.filter(x => x.symbol.contains_only(4))).toHaveLength(1)
        expect(map.find(x => x.symbol.contains_only(2))?.states.map(x => x.id).sort()).toEqual([2])
        expect(map.find(x => x.symbol.contains_only(3))?.states.map(x => x.id).sort()).toEqual([1, 2])
        expect(map.find(x => x.symbol.contains_only(4))?.states.map(x => x.id).sort()).toEqual([1])
    })

    test('no-first-exclusive', () => {
        const context = new Context()
        const states = [
            context.create_new_state(),
            context.create_new_state(),
            context.create_new_state()
        ]
        const symbols = [
            new MultiSymbol([
                new IntegerInterval(3, 4)
            ]),
            new MultiSymbol([
                new IntegerInterval(2, 4)
            ])
        ]

        states[0].add_transition(symbols[0], states[1])
        states[0].add_transition(symbols[1], states[2])
        const map = states[0].get_transitions_multi_state_map()
        expect(map).toHaveLength(2)
        expect(map.filter(x => x.symbol.contains_only(2))).toHaveLength(1)
        expect(map.filter(x => x.symbol.contains_only(3))).toHaveLength(1)
        expect(map.find(x => x.symbol.contains_only(2))?.states.map(x => x.id).sort()).toEqual([2])
        expect(map.find(x => x.symbol.contains_only(3))?.states.map(x => x.id).sort()).toEqual([1, 2])
    })

    test('no-second-exclusive', () => {
        const context = new Context()
        const states = [
            context.create_new_state(),
            context.create_new_state(),
            context.create_new_state()
        ]
        const symbols = [
            new MultiSymbol([
                new IntegerInterval(3, 5)
            ]),
            new MultiSymbol([
                new IntegerInterval(3, 4)
            ])
        ]

        states[0].add_transition(symbols[0], states[1])
        states[0].add_transition(symbols[1], states[2])
        const map = states[0].get_transitions_multi_state_map()
        expect(map).toHaveLength(2)
        expect(map.filter(x => x.symbol.contains_only(3))).toHaveLength(1)
        expect(map.filter(x => x.symbol.contains_only(4))).toHaveLength(1)
        expect(map.find(x => x.symbol.contains_only(3))?.states.map(x => x.id).sort()).toEqual([1, 2])
        expect(map.find(x => x.symbol.contains_only(4))?.states.map(x => x.id).sort()).toEqual([1])
    })

    test('multiple-disjunctive', () => {
        const context = new Context()
        const states = [
            context.create_new_state(),
            context.create_new_state(),
            context.create_new_state(),
            context.create_new_state()
        ]
        const symbols = [
            new MultiSymbol([
                new IntegerInterval(2, 4)
            ]),
            new MultiSymbol([
                new IntegerInterval(3, 5)
            ]),
            new MultiSymbol([
                new IntegerInterval(4, 6)
            ]),
            new SingleSymbol(100)
        ]

        states[0].add_transition(symbols[0], states[1])
        states[0].add_transition(symbols[1], states[3])
        states[0].add_transition(symbols[2], states[0])
        states[0].add_transition(symbols[3], states[2])
        const map = states[0].get_transitions_multi_state_map()
        expect(map).toHaveLength(5)
        expect(map.filter(x => x.symbol.contains_only(2))).toHaveLength(1)
        expect(map.filter(x => x.symbol.contains_only(3))).toHaveLength(1)
        expect(map.filter(x => x.symbol.contains_only(4))).toHaveLength(1)
        expect(map.filter(x => x.symbol.contains_only(5))).toHaveLength(1)
        expect(map.filter(x => x.symbol.contains_only(100))).toHaveLength(1)
        expect(map.find(x => x.symbol.contains_only(2))?.states.map(x => x.id).sort()).toEqual([1])
        expect(map.find(x => x.symbol.contains_only(3))?.states.map(x => x.id).sort()).toEqual([1, 3])
        expect(map.find(x => x.symbol.contains_only(4))?.states.map(x => x.id).sort()).toEqual([0, 3])
        expect(map.find(x => x.symbol.contains_only(5))?.states.map(x => x.id).sort()).toEqual([0])
        expect(map.find(x => x.symbol.contains_only(100))?.states.map(x => x.id).sort()).toEqual([2])
    })
})

test('state-remove-non-determinism-no-infinite-loop', () => {
    const context = new Context()
    const state = context.create_new_state()
    state.add_epsilon_transition(state)
    state.remove_non_determinism(context)
    expect(true).toBe(true)
})

test('state-remove-non-determinism-epsilon-loop-final', () => {
    const context = new Context()
    const states = [
        context.create_new_state(),
        context.create_new_state()
    ]
    states[1].is_final = true
    states[0].add_epsilon_transition(states[1])
    states[1].add_epsilon_transition(states[0])
    states[0].remove_non_determinism(context)
    expect(states[0].is_final).toBe(true)
})

test('state-remove-non-determinism-duplicate-transition', () => {
    const context = new Context()
    const state_0 = context.create_new_state()
    const state_1 = context.create_new_state()
    const state_2 = context.create_new_state()
    state_0.add_transition(new SingleSymbol(100), state_1)
    state_0.add_transition(new SingleSymbol(100), state_2)
    state_1.add_epsilon_transition(state_2)
    state_2.add_epsilon_transition(state_1)
    expect(state_0.transitions.length).toBe(2)
    state_0.remove_non_determinism(context)
    expect(state_0.transitions.length).toBe(1)
})

test('state-remove-non-determinism-case-0', () => {
    const context = new Context()
    const [s0, s1, s2] = [context.create_new_state(), context.create_new_state(), context.create_new_state()]
    const a = new SingleSymbol(0)
    const b = new SingleSymbol(1)
    s2.is_final = true
    s0.add_transition(a, s0)
    s0.add_transition(b, s1)
    s1.add_transition(a, s1)
    s1.add_transition(a, s2)
    s1.add_transition(b, s1)
    s2.add_transition(a, s2)
    s2.add_transition(b, s2)
    s2.add_transition(b, s1)
    s0.remove_non_determinism(context)
    const states = s0.get_transitively_reachable_states().sort((a: State, b: State) => a.id - b.id)
    expect(states.length).toBe(3)
    expect(states[0].id).toBe(0)
    expect(states[1].id).toBe(1)
    expect(states[2].id).toBe(3)
    expect(states[0].transitions.length).toBe(2)
    expect(states[1].transitions.length).toBe(2)
    expect(states[2].transitions.length).toBe(2)
    const f = (a: number, b: number) => a - b
    expect(states[0].transitions.map(x => (x.symbol! as any).set.to_array()).map((x: any) => x[0]).sort(f)).toEqual([0, 1])
    expect(states[1].transitions.map(x => (x.symbol! as any).set.to_array()).map((x: any) => x[0]).sort(f)).toEqual([0, 1])
    expect(states[2].transitions.map(x => (x.symbol! as any).set.to_array()).map((x: any) => x[0]).sort(f)).toEqual([0, 1])
    expect(states[0].transitions.map(x => x.state.id).sort(f)).toEqual([0, 1])
    expect(states[1].transitions.map(x => x.state.id).sort(f)).toEqual([1, 3])
    expect(states[2].transitions.map(x => x.state.id).sort(f)).toEqual([3, 3])
    expect(states[0].is_final).toBe(false)
    expect(states[1].is_final).toBe(false)
    expect(states[2].is_final).toBe(true)
})

test('state-remove-non-determinism-case-1', () => {
    const context = new Context()
    const [s0, s1] = [context.create_new_state(), context.create_new_state()]
    const a = new SingleSymbol(0)
    const b = new SingleSymbol(1)
    s1.is_final = true
    s0.add_transition(a, s0)
    s0.add_transition(a, s1)
    s0.add_transition(b, s1)
    s1.add_transition(b, s1)
    s1.add_transition(b, s0)
    s0.remove_non_determinism(context)
    const states = s0.get_transitively_reachable_states().sort((a: State, b: State) => a.id - b.id)
    expect(states.length).toBe(3)
    expect(states[0].id).toBe(0)
    expect(states[1].id).toBe(1)
    expect(states[2].id).toBe(2)
    expect(states[0].transitions.length).toBe(2)
    expect(states[1].transitions.length).toBe(1)
    expect(states[2].transitions.length).toBe(2)
    const f = (a: number, b: number) => a - b
    expect(states[0].transitions.map(x => (x.symbol! as any).set.to_array()).map((x: any) => x[0]).sort(f)).toEqual([0, 1])
    expect(states[1].transitions.map(x => (x.symbol! as any).set.to_array()).map((x: any) => x[0]).sort(f)).toEqual([1])
    expect(states[2].transitions.map(x => (x.symbol! as any).set.to_array()).map((x: any) => x[0]).sort(f)).toEqual([0, 1])
    expect(states[0].transitions.map(x => x.state.id).sort(f)).toEqual([1, 2])
    expect(states[1].transitions.map(x => x.state.id).sort(f)).toEqual([2])
    expect(states[2].transitions.map(x => x.state.id).sort(f)).toEqual([2, 2])
    expect(states[0].is_final).toBe(false)
    expect(states[1].is_final).toBe(true)
    expect(states[2].is_final).toBe(true)
})

test('state-remove-non-determinism-case-2', () => {
    const context = new Context()
    const [s0, s1, s2, s3, s4] = [context.create_new_state(), context.create_new_state(), context.create_new_state(), context.create_new_state(), context.create_new_state()]
    const [a, b] = [new SingleSymbol(0), new SingleSymbol(1)]
    s4.is_final = true
    s0.add_epsilon_transition(s1)
    s0.add_epsilon_transition(s2)
    s1.add_transition(a, s3)
    s2.add_transition(b, s3)
    s3.add_transition(b, s4)
    s0.remove_non_determinism(context)
    const states = s0.get_transitively_reachable_states().sort((a: State, b: State) => a.id - b.id)
    expect(states.length).toBe(3)
    expect(states[0].id).toBe(0)
    expect(states[1].id).toBe(3)
    expect(states[2].id).toBe(4)
    expect(states[0].transitions.length).toBe(2)
    expect(states[1].transitions.length).toBe(1)
    expect(states[2].transitions.length).toBe(0)
    const f = (a: number, b: number) => a - b
    expect(states[0].transitions.map(x => (x.symbol! as any).set.to_array()).map((x: any) => x[0]).sort(f)).toEqual([0, 1])
    expect(states[1].transitions.map(x => (x.symbol! as any).set.to_array()).map((x: any) => x[0]).sort(f)).toEqual([1])
    expect(states[2].transitions.map(x => (x.symbol! as any).set.to_array()).map((x: any) => x[0]).sort(f)).toEqual([])
    expect(states[0].transitions.map(x => x.state.id).sort(f)).toEqual([3, 3])
    expect(states[1].transitions.map(x => x.state.id).sort(f)).toEqual([4])
    expect(states[2].transitions.map(x => x.state.id).sort(f)).toEqual([])
    expect(states[0].is_final).toBe(false)
    expect(states[1].is_final).toBe(false)
    expect(states[2].is_final).toBe(true)
})

test('state-remove-non-determinism-case-3', () => {
    const context = new Context()
    const [s0, s1, s2] = [context.create_new_state(), context.create_new_state(), context.create_new_state()]
    const [a, b, c] = [new SingleSymbol(0), new SingleSymbol(1), new SingleSymbol(2)]
    s2.is_final = true
    s0.add_transition(a, s0)
    s1.add_transition(b, s1)
    s2.add_transition(c, s2)
    s0.add_epsilon_transition(s1)
    s1.add_epsilon_transition(s2)
    s0.remove_non_determinism(context)
    const states = s0.get_transitively_reachable_states().sort((a: State, b: State) => a.id - b.id)
    expect(states.length).toBe(3)
    expect(states[0].id).toBe(0)
    expect(states[1].id).toBe(1)
    expect(states[2].id).toBe(2)
    expect(states[0].transitions.length).toBe(3)
    expect(states[1].transitions.length).toBe(2)
    expect(states[2].transitions.length).toBe(1)
    const f = (a: number, b: number) => a - b
    expect(states[0].transitions.map(x => (x.symbol! as any).set.to_array()).map((x: any) => x[0]).sort(f)).toEqual([0, 1, 2])
    expect(states[1].transitions.map(x => (x.symbol! as any).set.to_array()).map((x: any) => x[0]).sort(f)).toEqual([1, 2])
    expect(states[2].transitions.map(x => (x.symbol! as any).set.to_array()).map((x: any) => x[0]).sort(f)).toEqual([2])
    expect(states[0].transitions.map(x => x.state.id).sort(f)).toEqual([0, 1, 2])
    expect(states[1].transitions.map(x => x.state.id).sort(f)).toEqual([1, 2])
    expect(states[2].transitions.map(x => x.state.id).sort(f)).toEqual([2])
    expect(states[0].is_final).toBe(true)
    expect(states[1].is_final).toBe(true)
    expect(states[2].is_final).toBe(true)
})

test('state-match-a*', () => {
    const context = new Context()
    const s0 = context.create_new_state()
    s0.is_final = true
    s0.add_transition(new SingleSymbol('a'.codePointAt(0)!), s0)
    expect(s0.match('')).toBe('')
    expect(s0.match('b')).toBe('')
    expect(s0.match('a')).toBe('a')
    expect(s0.match('aaaaa')).toBe('aaaaa')
    expect(s0.match('aaaaaaaabbbbaaaa')).toBe('aaaaaaaa')
})

test('state-match-(ab)*', () => {
    const context = new Context()
    const s0 = context.create_new_state()
    const s1 = context.create_new_state()
    s0.is_final = true
    s0.add_transition(new SingleSymbol('a'.codePointAt(0)!), s1)
    s1.add_transition(new SingleSymbol('b'.codePointAt(0)!), s0)
    expect(s0.match('')).toBe('')
    expect(s0.match('ab')).toBe('ab')
    expect(s0.match('abab')).toBe('abab')
    expect(s0.match('a')).toBe('')
    expect(s0.match('ababa')).toBe('abab')
    expect(s0.match('ababxxabab')).toBe('abab')
})

test('state-match-ab?c', () => {
    const context = new Context()
    const s0 = context.create_new_state()
    const s1 = context.create_new_state()
    const s2 = context.create_new_state()
    const s3 = context.create_new_state()
    s3.is_final = true
    s0.add_transition(new SingleSymbol('a'.codePointAt(0)!), s1)
    s1.add_transition(new SingleSymbol('b'.codePointAt(0)!), s2)
    s1.add_transition(new SingleSymbol('c'.codePointAt(0)!), s3)
    s2.add_transition(new SingleSymbol('c'.codePointAt(0)!), s3)
    expect(s0.match('ac')).toBe('ac')
    expect(s0.match('abc')).toBe('abc')
    expect(s0.match('')).toBe(false)
    expect(s0.match('aabc')).toBe(false)
    expect(s0.match('ab')).toBe(false)
    expect(s0.match('a')).toBe(false)
})

describe('get_transitively_reachable_final_states', () => {
    test('chain', () => {
        const context = new Context()
        const s0 = context.create_new_state()
        const s1 = context.create_new_state()
        const s2 = context.create_new_state()
        const s3 = context.create_new_state()
        s0.add_epsilon_transition(s1)
        s1.add_transition(new SingleSymbol('k'.charCodeAt(0)), s2)
        s2.add_transition(new SingleSymbol('o'.charCodeAt(0)), s3)
        s3.is_final = true
        const final_states = s0.get_transitively_reachable_final_states()
        expect(final_states).toHaveLength(1)
        expect(final_states[0].id).toBe(3)
    })

    test('double-final', () => {
        const context = new Context()
        const s0 = context.create_new_state()
        const s1 = context.create_new_state()
        const s2 = context.create_new_state()
        s0.add_transition(new SingleSymbol('l'.charCodeAt(0)), s1)
        s0.add_transition(new SingleSymbol('o'.charCodeAt(0)), s2)
        s1.is_final = true
        s2.is_final = true
        const final_states = s0.get_transitively_reachable_final_states().sort((a, b) => a.id - b.id)
        expect(final_states).toHaveLength(2)
        expect(final_states[0].id).toBe(1)
        expect(final_states[1].id).toBe(2)
    })
})

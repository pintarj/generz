import { Context } from '@dist/regex/context'
import { NonDeterministicStatesMap } from '@dist/regex/non-deterministic-states-map'
import { State } from '@dist/regex/state'
import { SingleSymbol } from '@dist/regex/single-symbol'

test('single-state-key', () => {
    const context = new Context()
    const state_0 = context.create_new_state()
    const map = new NonDeterministicStatesMap(context, [state_0])
    const state_0_0 = map.get_or_create([state_0])
    const state_0_1 = map.get_or_create([state_0])
    expect(state_0_0.id).toBe(0)
    expect(state_0_1.id).toBe(0)
})

test('no-state-key', () => {
    const context = new Context()
    const map = new NonDeterministicStatesMap(context, [])
    const state_0_0 = map.get_or_create([])
    const state_0_1 = map.get_or_create([])
    expect(state_0_0.id).toBe(0)
    expect(state_0_1.id).toBe(0)
})

test('single-state-keys', () => {
    const context = new Context()
    const state_0 = new State(0)
    const state_1 = new State(1)
    const map = new NonDeterministicStatesMap(context, [state_0, state_1])
    const state_0_0 = map.get_or_create([state_0])
    const state_0_1 = map.get_or_create([state_0])
    const state_1_0 = map.get_or_create([state_1])
    const state_1_1 = map.get_or_create([state_1])
    expect(state_0_0.id).toBe(0)
    expect(state_0_1.id).toBe(0)
    expect(state_1_0.id).toBe(1)
    expect(state_1_1.id).toBe(1)
})

test('multi-state-key', () => {
    const context = new Context()
    const state_0 = new State(0)
    const state_1 = new State(1)
    const map = new NonDeterministicStatesMap(context, [state_0, state_1])
    const state_0_0 = map.get_or_create([state_0, state_1])
    const state_0_1 = map.get_or_create([state_0, state_1])
    expect(state_0_0.id).toBe(0)
    expect(state_0_1.id).toBe(0)
})

test('multi-state-keys', () => {
    const context = new Context()
    const state_0 = new State(0)
    const state_1 = new State(1)
    const state_2 = new State(2)
    const state_3 = new State(3)
    const map = new NonDeterministicStatesMap(context, [state_0, state_1, state_2, state_3])
    const state_0_0 = map.get_or_create([state_0, state_1])
    const state_0_1 = map.get_or_create([state_0, state_1])
    const state_1_0 = map.get_or_create([state_2, state_3])
    const state_1_1 = map.get_or_create([state_2, state_3])
    expect(state_0_0.id).toBe(0)
    expect(state_0_1.id).toBe(0)
    expect(state_1_0.id).toBe(1)
    expect(state_1_1.id).toBe(1)
})

test('multi-state-key-sort', () => {
    const context = new Context()
    const state_0 = new State(0)
    const state_1 = new State(1)
    const map = new NonDeterministicStatesMap(context, [state_0, state_1])
    const state_0_0 = map.get_or_create([state_0, state_1])
    const state_0_1 = map.get_or_create([state_1, state_0])
    expect(state_0_0.id).toBe(0)
    expect(state_0_1.id).toBe(0)
})

test('state-repeated-in-key', () => {
    const context = new Context()
    const state_0 = new State(0)
    const map = new NonDeterministicStatesMap(context, [state_0])
    const state_0_0 = map.get_or_create([state_0])
    const state_0_1 = map.get_or_create([state_0, state_0])
    expect(state_0_0.id).toBe(0)
    expect(state_0_1.id).toBe(0)
})

test('initial-states', () => {
    const context = new Context()
    const states = [
        new State(1),
        new State(2),
        new State(3),
        new State(4)
    ]
    const map = new NonDeterministicStatesMap(context, states)
    const state_0 = map.get_or_create([states[0]])
    const state_1 = map.get_or_create([states[1]])
    const state_2 = map.get_or_create([states[2]])
    const state_3 = map.get_or_create([states[3]])
    expect(state_0.id).toBe(1)
    expect(state_1.id).toBe(2)
    expect(state_2.id).toBe(3)
    expect(state_3.id).toBe(4)
})

test('initial-states-create-additional', () => {
    const context = new Context()
    const states = [
        context.create_new_state(),
        context.create_new_state()
    ]
    const map = new NonDeterministicStatesMap(context, states)
    const state_0 = map.get_or_create([states[0]])
    const state_1 = map.get_or_create([states[1]])
    const state_0_1 = map.get_or_create([states[0], states[1]])
    expect(state_0.id).toBe(0)
    expect(state_1.id).toBe(1)
    expect(state_0_1.id).toBe(2)
})

describe('overlapping', () => {
    test('different-states-same-virtual-state', () => {
        const context = new Context()
        const states = [
            context.create_new_state(),
            context.create_new_state(),
            context.create_new_state()
        ]
        const map = new NonDeterministicStatesMap(context, states)
        const state_3 = map.get_or_create([states[0], states[2]])
        const state_4 = map.get_or_create([states[0], states[1], states[2]])
        expect(state_3.id).toEqual(3)
        expect(state_4.id).toEqual(4)
        expect(map.get_or_create([state_3, states[1]]).id).toEqual(4)
    })
    
    test('sub-set', () => {
        const context = new Context()
        const states = [
            context.create_new_state(),
            context.create_new_state()
        ]
        const map = new NonDeterministicStatesMap(context, states)
        const state_2 = map.get_or_create([states[0], states[1]])
        expect(state_2.id).toEqual(2)
        expect(map.get_or_create([state_2, states[0]]).id).toEqual(2)
        expect(map.get_or_create([state_2, states[1]]).id).toEqual(2)
        expect(map.get_or_create([state_2, states[0], states[1]]).id).toEqual(2)
    })
})

describe('transitions', () => {
    test('union', () => {
        const context = new Context()
        const states = [
            context.create_new_state(),
            context.create_new_state(),
            context.create_new_state()
        ]
        const map = new NonDeterministicStatesMap(context, states)
        const state_0 = map.get_or_create([states[0]])
        const state_1 = map.get_or_create([states[1]])
        const state_2 = map.get_or_create([states[2]])
        state_0.add_transition(new SingleSymbol(8), state_2)
        state_1.add_transition(new SingleSymbol(16), state_2)
        const state_0_1 = map.get_or_create([states[0], states[1]])
        expect(state_0.id).toBe(0)
        expect(state_1.id).toBe(1)
        expect(state_2.id).toBe(2)
        expect(state_0_1.id).toBe(3)
        expect(state_0_1.transitions.length).toBe(2)
        expect(state_0_1.transitions[0].symbol?.contains_only(8)).toBe(true)
        expect(state_0_1.transitions[1].symbol?.contains_only(16)).toBe(true)
        expect(state_0_1.transitions[0].state.id).toBe(2)
        expect(state_0_1.transitions[1].state.id).toBe(2)
    })
    
    test('final', () => {
        const context = new Context()
        const states = [
            context.create_new_state(),
            context.create_new_state(),
            context.create_new_state(),
            context.create_new_state()
        ]
        states[2].is_final = true
        states[3].is_final = true
        const map = new NonDeterministicStatesMap(context, states)
        expect(map.get_or_create([states[0], states[1]]).is_final).toBe(false)
        expect(map.get_or_create([states[1], states[2]]).is_final).toBe(true)
        expect(map.get_or_create([states[2], states[3]]).is_final).toBe(true)
    })
})

describe('machine-id', () => {
    test('no-id', () => {
        const context = new Context()
        const states = [
            context.create_new_state(),
            context.create_new_state()
        ]
        states[0].is_final = true
        const map = new NonDeterministicStatesMap(context, states)
        expect(map.get_or_create(states).machine_id).toBe(undefined)
    })

    test('no-final', () => {
        const context = new Context()
        const states = [
            context.create_new_state(),
            context.create_new_state()
        ]
        states[0].machine_id = 99
        const map = new NonDeterministicStatesMap(context, states)
        expect(map.get_or_create(states).machine_id).toBe(undefined)
    })

    test('single', () => {
        const context = new Context()
        const states = [
            context.create_new_state(),
            context.create_new_state()
        ]
        states[0].is_final = true
        states[0].machine_id = 33
        const map = new NonDeterministicStatesMap(context, states)
        expect(map.get_or_create(states).machine_id).toBe(33)
    })

    test('multiple', () => {
        const context = new Context()
        const states = [
            context.create_new_state(),
            context.create_new_state()
        ]
        states[0].is_final = true
        states[0].machine_id = 366
        states[1].is_final = true
        states[1].machine_id = 385
        const map = new NonDeterministicStatesMap(context, states)
        expect(map.get_or_create(states).machine_id).toBe(366)
    })

    test('complex', () => {
        const context = new Context()
        const states = [
            context.create_new_state(),
            context.create_new_state(),
            context.create_new_state(),
            context.create_new_state(),
            context.create_new_state()
        ]
        states[0].is_final = false
        states[0].machine_id = undefined
        states[1].is_final = true
        states[1].machine_id = undefined
        states[2].is_final = false
        states[2].machine_id = 10
        states[3].is_final = true
        states[3].machine_id = 20
        states[4].is_final = true
        states[4].machine_id = 100
        const map = new NonDeterministicStatesMap(context, states)
        expect(map.get_or_create(states).machine_id).toBe(20)
    })
})

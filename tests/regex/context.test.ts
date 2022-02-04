import {Context} from '@dist/regex/context'

test('context-empty', () => {
    const context = new Context()
    expect(context.get_states_count()).toBe(0)
})

test('context-states-creation', () => {
    const context = new Context()
    expect(context.get_states_count()).toBe(0)

    const state_0 = context.create_new_state()
    expect(state_0.id).toBe(0)
    expect(state_0.get_reachable_transitions().length).toBe(0)

    const state_1 = context.create_new_state()
    expect(state_1.id).toBe(1)
    expect(state_1.get_reachable_transitions().length).toBe(0)

    const state_2 = context.create_new_state()
    expect(state_2.id).toBe(2)
    expect(state_2.get_reachable_transitions().length).toBe(0)
})

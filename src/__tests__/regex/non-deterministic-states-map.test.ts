import {Context} from '../../regex/context';
import {NonDeterministicStatesMap} from '../../regex/non-deterministic-states-map';
import {State} from '../../regex/state';

test('single-state-key', () => {
    const state_0 = new State(0);
    const map = new NonDeterministicStatesMap(new Context());
    const state_0_0 = map.get_or_create([state_0]);
    const state_0_1 = map.get_or_create([state_0]);
    expect(state_0_0.id).toBe(0);
    expect(state_0_1.id).toBe(0);
});

test('no-state-key', () => {
    const map = new NonDeterministicStatesMap(new Context());
    const state_0_0 = map.get_or_create([]);
    const state_0_1 = map.get_or_create([]);
    expect(state_0_0.id).toBe(0);
    expect(state_0_1.id).toBe(0);
});

test('single-state-keys', () => {
    const state_0 = new State(0);
    const state_1 = new State(1);
    const map = new NonDeterministicStatesMap(new Context());
    const state_0_0 = map.get_or_create([state_0]);
    const state_0_1 = map.get_or_create([state_0]);
    const state_1_0 = map.get_or_create([state_1]);
    const state_1_1 = map.get_or_create([state_1]);
    expect(state_0_0.id).toBe(0);
    expect(state_0_1.id).toBe(0);
    expect(state_1_0.id).toBe(1);
    expect(state_1_1.id).toBe(1);
});

test('multi-state-key', () => {
    const state_0 = new State(0);
    const state_1 = new State(1);
    const map = new NonDeterministicStatesMap(new Context());
    const state_0_0 = map.get_or_create([state_0, state_1]);
    const state_0_1 = map.get_or_create([state_0, state_1]);
    expect(state_0_0.id).toBe(0);
    expect(state_0_1.id).toBe(0);
});

test('multi-state-keys', () => {
    const state_0 = new State(0);
    const state_1 = new State(1);
    const state_2 = new State(2);
    const state_3 = new State(3);
    const map = new NonDeterministicStatesMap(new Context());
    const state_0_0 = map.get_or_create([state_0, state_1]);
    const state_0_1 = map.get_or_create([state_0, state_1]);
    const state_1_0 = map.get_or_create([state_2, state_3]);
    const state_1_1 = map.get_or_create([state_2, state_3]);
    expect(state_0_0.id).toBe(0);
    expect(state_0_1.id).toBe(0);
    expect(state_1_0.id).toBe(1);
    expect(state_1_1.id).toBe(1);
});

test('multi-state-key-sort', () => {
    const state_0 = new State(0);
    const state_1 = new State(1);
    const map = new NonDeterministicStatesMap(new Context());
    const state_0_0 = map.get_or_create([state_0, state_1]);
    const state_0_1 = map.get_or_create([state_1, state_0]);
    expect(state_0_0.id).toBe(0);
    expect(state_0_1.id).toBe(0);
});

test('state-repeated-in-key', () => {
    const state_0 = new State(0);
    const map = new NonDeterministicStatesMap(new Context());
    const state_0_0 = map.get_or_create([state_0]);
    const state_0_1 = map.get_or_create([state_0, state_0]);
    expect(state_0_0.id).toBe(0);
    expect(state_0_1.id).toBe(0);
});

test('initial-states', () => {
    const states = [
        new State(1),
        new State(2),
        new State(3),
        new State(4)
    ];
    const map = new NonDeterministicStatesMap(new Context(), states);
    const state_0 = map.get_or_create([states[0]]);
    const state_1 = map.get_or_create([states[1]]);
    const state_2 = map.get_or_create([states[2]]);
    const state_3 = map.get_or_create([states[3]]);
    expect(state_0.id).toBe(1);
    expect(state_1.id).toBe(2);
    expect(state_2.id).toBe(3);
    expect(state_3.id).toBe(4);
});

test('initial-states-create-additional', () => {
    const context = new Context();
    const states = [
        context.create_new_state(),
        context.create_new_state()
    ];
    const map = new NonDeterministicStatesMap(context, states);
    const state_0 = map.get_or_create([states[0]]);
    const state_1 = map.get_or_create([states[1]]);
    const state_0_1 = map.get_or_create([states[0], states[1]]);
    expect(state_0.id).toBe(0);
    expect(state_1.id).toBe(1);
    expect(state_0_1.id).toBe(2);
});

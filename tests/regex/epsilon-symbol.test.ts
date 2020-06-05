import {EpsilonSymbol} from '@dist/regex/epsilon-symbol';

test('epsilon-symbol-constructor', () => {
    const s = new EpsilonSymbol();
    expect(s.code_point).toBe(-1);
});

test('epsilon-symbol-epsilon-check', () => {
    const s = new EpsilonSymbol();
    expect(s.is_epsilon()).toBe(true);
});

test('epsilon-symbol-to-string', () => {
    const s = new EpsilonSymbol();
    expect(s.to_string()).toBe('ε');
});

test('epsilon-symbol-static-instance', () => {
    const s = EpsilonSymbol.INSTANCE;
    expect(s.is_epsilon()).toBe(true);
    expect(s.to_string()).toBe('ε');
});

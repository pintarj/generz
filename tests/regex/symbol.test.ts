import {Symbol} from '@dist/regex/symbol';

test('symbol-constructor', () => {
    const c = 64;
    const s = new Symbol(c);
    expect(s.code_point).toBe(c);
});

test('symbol-epsilon-check', () => {
    const c = 64;
    const s = new Symbol(c);
    expect(s.is_epsilon()).toBe(false);
});

test('symbol-to-string', () => {
    const x = 'f';
    const c = x.charCodeAt(0);
    const s = new Symbol(c);
    expect(s.to_string()).toBe(x);
});

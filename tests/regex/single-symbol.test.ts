import { SingleSymbol } from '@dist/regex/single-symbol';

test('constructor', () => {
    const c = 64;
    const s = new SingleSymbol(c);
    expect(s.code_point).toBe(c);
    expect(s.contains_only(c)).toBe(true);
});

test('to-string', () => {
    const x = 'f';
    const c = x.charCodeAt(0);
    const s = new SingleSymbol(c);
    expect(s.to_string()).toBe(x);
    expect(s.contains_only(c)).toBe(true);
});

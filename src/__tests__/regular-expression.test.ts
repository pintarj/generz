import {RegularExpression} from '../regular-expression';
import {StringReader} from '../reader';
import {State} from '../regex/state';

function f(regex: string): State {
    return (new RegularExpression(new StringReader(regex))).generate();
}

test('regular-expression-alternation', () => {
    const regex = f('a|b');
    expect(regex.match('a')).toBe('a');
    expect(regex.match('b')).toBe('b');
    expect(regex.match('aa')).toBe('a');
    expect(regex.match('c')).toBe(false);
    expect(regex.match('')).toBe(false);
});

test('regular-expression-concatenation', () => {
    const regex = f('ab');
    expect(regex.match('ab')).toBe('ab');
    expect(regex.match('abab')).toBe('ab');
    expect(regex.match('aba')).toBe('ab');
    expect(regex.match('abx')).toBe('ab');
    expect(regex.match('a')).toBe(false);
    expect(regex.match('b')).toBe(false);
    expect(regex.match('bab')).toBe(false);
    expect(regex.match('')).toBe(false);
});

test('regular-expression-zero-or-more', () => {
    const regex = f('a*');
    expect(regex.match('')).toBe('');
    expect(regex.match('a')).toBe('a');
    expect(regex.match('aa')).toBe('aa');
    expect(regex.match('aaaa')).toBe('aaaa');
    expect(regex.match('b')).toBe('');
    expect(regex.match('baaa')).toBe('');
});

test('regular-expression-one-or-more', () => {
    const regex = f('a+');
    expect(regex.match('a')).toBe('a');
    expect(regex.match('aa')).toBe('aa');
    expect(regex.match('aaaa')).toBe('aaaa');
    expect(regex.match('')).toBe(false);
    expect(regex.match('b')).toBe(false);
    expect(regex.match('baaa')).toBe(false);
});

test('regular-expression-zero-or-one', () => {
    const regex = f('a?');
    expect(regex.match('a')).toBe('a');
    expect(regex.match('')).toBe('');
    expect(regex.match('b')).toBe('');
    expect(regex.match('ba')).toBe('');
});

test('regular-expression-grouping', () => {
    const regex = f('(ab|xy)+');
    expect(regex.match('ab')).toBe('ab');
    expect(regex.match('abxy')).toBe('abxy');
    expect(regex.match('abxyax')).toBe('abxy');
    expect(regex.match('xaby')).toBe(false);
});

test('regular-expression-grouping-empty', () => {
    const regex = f('()+');
    expect(regex.match('')).toBe('');
    expect(regex.match('a')).toBe('');
});

test('regular-expression-grouping-nested', () => {
    const regex = f('(a(xb)*b)+');
    expect(regex.match('ab')).toBe('ab');
    expect(regex.match('abab')).toBe('abab');
    expect(regex.match('axbb')).toBe('axbb');
    expect(regex.match('axbxbb')).toBe('axbxbb');
    expect(regex.match('axbxbbabaxbb')).toBe('axbxbbabaxbb');
    expect(regex.match('axbxbabaxbb')).toBe(false);
    expect(regex.match('')).toBe(false);
});

test('regular-expression-grouping-no-closing-parenthesis', () => {
    expect(() => {f('(bulbasaur').match('ab');}).toThrowError();
});

test('regular-expression-at-least-two-end', () => {
    const regex = f('a*aa');
    expect(regex.match('aaaaa')).toBe('aaaaa');
    expect(regex.match('aa')).toBe('aa');
    expect(regex.match('a')).toBe(false);
    expect(regex.match('aba')).toBe(false);
    expect(regex.match('')).toBe(false);
});

test('regular-expression-complex-exclamations', () => {
    const regex = f('wo+w|yeah?|o*k');
    expect(regex.match('wow')).toBe('wow');
    expect(regex.match('wooow')).toBe('wooow');
    expect(regex.match('yea')).toBe('yea');
    expect(regex.match('yeah')).toBe('yeah');
    expect(regex.match('k')).toBe('k');
    expect(regex.match('ok')).toBe('ok');
    expect(regex.match('oook')).toBe('oook');
    expect(regex.match('wy')).toBe(false);
});

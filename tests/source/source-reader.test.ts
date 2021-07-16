import { StringReader } from '@dist/reader';
import { Point } from '@dist/source/location';
import { SourceReader } from '@dist/source/source-reader';

test('file', () => {
    expect((new SourceReader(new StringReader(''))).file).toBe('<unknown>');
    expect((new SourceReader(new StringReader(''), {file: 'main.cxx'})).file).toBe('main.cxx');
});

test('content', () => {
    const reader = new SourceReader(new StringReader('dratini'));
    expect(reader.read()).toBe('d');
    expect(reader.read()).toBe('r');
    expect(reader.read()).toBe('a');
    expect(reader.read()).toBe('t');
    expect(reader.read()).toBe('i');
    expect(reader.read()).toBe('n');
    expect(reader.read()).toBe('i');
    expect(reader.read()).toBe('');
    expect(reader.read()).toBe('');
});

test('position', () => {
    const reader = new SourceReader(new StringReader('a\nb\n\ncde\n'));
    expect(reader.read()).toBe('a');
    expect(reader.get_point()).toMatchObject({line: 1, column: 1});
    expect(reader.read()).toBe('\n');
    expect(reader.get_point()).toMatchObject({line: 1, column: 2});
    expect(reader.read()).toBe('b');
    expect(reader.get_point()).toMatchObject({line: 2, column: 1});
    expect(reader.read()).toBe('\n');
    expect(reader.get_point()).toMatchObject({line: 2, column: 2});
    expect(reader.read()).toBe('\n');
    expect(reader.get_point()).toMatchObject({line: 3, column: 1});
    expect(reader.read()).toBe('c');
    expect(reader.get_point()).toMatchObject({line: 4, column: 1});
    expect(reader.read()).toBe('d');
    expect(reader.get_point()).toMatchObject({line: 4, column: 2});
    expect(reader.read()).toBe('e');
    expect(reader.get_point()).toMatchObject({line: 4, column: 3});
    expect(reader.read()).toBe('\n');
    expect(reader.get_point()).toMatchObject({line: 4, column: 4});
    expect(reader.read()).toBe('');
    expect(reader.get_point()).toMatchObject({line: 5, column: 1});
});

test('position-no-newline', () => {
    const reader = new SourceReader(new StringReader('mew'));
    expect(reader.read()).toBe('m');
    expect(reader.get_point()).toMatchObject({line: 1, column: 1});
    expect(reader.read()).toBe('e');
    expect(reader.get_point()).toMatchObject({line: 1, column: 2});
    expect(reader.read()).toBe('w');
    expect(reader.get_point()).toMatchObject({line: 1, column: 3});
    expect(reader.read()).toBe('');
    expect(reader.get_point()).toMatchObject({line: 1, column: 4});
});

test('position-empty-input', () => {
    const reader = new SourceReader(new StringReader(''));
    expect(reader.read()).toBe('');
    expect(reader.get_point()).toMatchObject({line: 1, column: 1});
    expect(reader.read()).toBe('');
    expect(reader.get_point()).toMatchObject({line: 1, column: 1});
});

test('revoke', () => {
    const reader = new SourceReader(new StringReader('x'));
    expect(reader.read()).toBe('x');
    expect(reader.get_point()).toMatchObject({line: 1, column: 1});
    reader.revoke();
    expect(reader.read()).toBe('x');
    expect(reader.get_point()).toMatchObject({line: 1, column: 1});
    expect(reader.read()).toBe('');
    expect(reader.get_point()).toMatchObject({line: 1, column: 2});
});

test('revoke-newline', () => {
    const reader = new SourceReader(new StringReader('x\ny'));
    expect(reader.read()).toBe('x');
    expect(reader.get_point()).toMatchObject({line: 1, column: 1});
    expect(reader.read()).toBe('\n');
    expect(reader.get_point()).toMatchObject({line: 1, column: 2});
    reader.revoke();
    expect(reader.read()).toBe('\n');
    expect(reader.get_point()).toMatchObject({line: 1, column: 2});
    expect(reader.read()).toBe('y');
    expect(reader.get_point()).toMatchObject({line: 2, column: 1});
    reader.revoke();
    expect(reader.read()).toBe('y');
    expect(reader.get_point()).toMatchObject({line: 2, column: 1});
    expect(reader.read()).toBe('');
    expect(reader.get_point()).toMatchObject({line: 2, column: 2});
});

test('revoke-eof', () => {
    const reader = new SourceReader(new StringReader('x'));
    expect(reader.read()).toBe('x');
    expect(reader.get_point()).toMatchObject({line: 1, column: 1});
    expect(reader.read()).toBe('');
    expect(reader.get_point()).toMatchObject({line: 1, column: 2});
    reader.revoke();
    expect(reader.read()).toBe('');
    expect(reader.get_point()).toMatchObject({line: 1, column: 2});
    expect(reader.read()).toBe('');
    expect(reader.get_point()).toMatchObject({line: 1, column: 2});
    expect(reader.read()).toBe('');
    expect(reader.get_point()).toMatchObject({line: 1, column: 2});
    reader.revoke();
    expect(reader.read()).toBe('');
    expect(reader.get_point()).toMatchObject({line: 1, column: 2});
});

test('location-offset', () => {
    const reader = new SourceReader(new StringReader('xyz'), {location_offset: new Point(5, 7)})
    expect(reader.read()).toBe('x')
    expect(reader.get_point()).toMatchObject({line: 5, column: 7})
    expect(reader.read()).toBe('y')
    expect(reader.get_point()).toMatchObject({line: 5, column: 8})
    expect(reader.read()).toBe('z')
    expect(reader.get_point()).toMatchObject({line: 5, column: 9})
    expect(reader.read()).toBe('')
    expect(reader.get_point()).toMatchObject({line: 5, column: 10})
});

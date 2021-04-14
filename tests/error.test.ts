import { ArgsError, CodeError, InternalError } from '@dist/error';
import { Point } from '@dist/source/location';

test('args', () => {
    const description = 'invalid argument';
    const error = new ArgsError(description);
    expect(error.description).toBe(description);
    expect(() => { throw error }).toThrowError(description);
});

test('code', () => {
    const file        = 'test.txt'
    const line        = 4;
    const column      = 6;
    const description = 'invalid file format';
    const error       = new CodeError(file, new Point(line, column), description);
    expect(() => { throw error }).toThrowError(`error: ${file}:${line}:${column} ${description}`);
});

test('internal-generz-error', () => {
    const description = 'lack of implementation';
    const error = new InternalError(description);
    expect(error.description).toBe(description);
    expect(() => { throw error }).toThrowError(`INTERNAL ERROR: ${description}`);
});

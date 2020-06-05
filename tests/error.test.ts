import {ArgsGenerzError, CodeGenerzError, InternalGenerzError} from '@dist/error';

test('args-generz-error', () => {
    const message = 'invalid argument';
    expect(() => {ArgsGenerzError.throw(message)}).toThrowError(message);
});

test('code-generz-error', () => {
    const file    = 'test.txt'
    const message = 'invalid file format';
    expect(() => {CodeGenerzError.throw(file, message)}).toThrowError(`error: ${file}:?:? ${message}`);
});

test('internal-generz-error', () => {
    const message = 'invalid argument';
    expect(() => {InternalGenerzError.throw(message)}).toThrowError(`INTERNAL ERROR: ${message}`);
});


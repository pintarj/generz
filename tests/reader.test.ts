import {Reader, StringReader} from '@dist/reader'

test('string-reader', () => {
    const reader: Reader = new StringReader('pikachu')
    expect(reader.read()).toBe('p')
    expect(reader.read()).toBe('i')
    expect(reader.read()).toBe('k')
    expect(reader.read()).toBe('a')
    expect(reader.read()).toBe('c')
    expect(reader.read()).toBe('h')
    expect(reader.read()).toBe('u')
    expect(reader.read()).toBe('')
    expect(reader.read()).toBe('')
    expect(reader.read()).toBe('')
})


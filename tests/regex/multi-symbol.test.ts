import { MultiSymbol } from '@dist/regex/multi-symbol.js'
import { IntegerInterval } from '@dist/utils/integer-intervals-set.js'

test('constructor', () => {
    const symbol = new MultiSymbol([
        new IntegerInterval('b'.charCodeAt(0), 'b'.charCodeAt(0) + 1),
        new IntegerInterval('7'.charCodeAt(0), '8'.charCodeAt(0) + 1)
    ])

    expect(symbol.contains('a'.charCodeAt(0))).toBe(false)
    expect(symbol.contains('b'.charCodeAt(0))).toBe(true)
    expect(symbol.contains('c'.charCodeAt(0))).toBe(false)
    expect(symbol.contains('6'.charCodeAt(0))).toBe(false)
    expect(symbol.contains('7'.charCodeAt(0))).toBe(true)
    expect(symbol.contains('8'.charCodeAt(0))).toBe(true)
    expect(symbol.contains('9'.charCodeAt(0))).toBe(false)
})

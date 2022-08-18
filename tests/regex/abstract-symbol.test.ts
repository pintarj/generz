import { AbstractSymbol } from '@dist/regex/abstract-symbol'
import { SingleSymbol } from '@dist/regex/single-symbol'

test('constructor', () => {
    const c = 64
    const s = new SingleSymbol(c)
    expect(s.code_point).toBe(c)
    expect(s.contains_only(c)).toBe(true)
})

describe('fragment', () => {
    test('internal-set', () => {
        const symbol = new SingleSymbol(33)
        expect(symbol.set.to_array()).toEqual([33])
    })

    test('two-different-single-symbols', () => {
        const symbol_0 = new SingleSymbol(64)
        const symbol_1 = new SingleSymbol(65)
        const result = AbstractSymbol.fragment(symbol_0, symbol_1)
        expect(result.first_exclusive.contains_only(64)).toBe(true)
        expect(result.shared.represents_something()).toBe(false)
        expect(result.second_exclusive.contains_only(65)).toBe(true)
    })

    test('two-equal-single-symbols', () => {
        const symbol_0 = new SingleSymbol(64)
        const symbol_1 = new SingleSymbol(64)
        const result = AbstractSymbol.fragment(symbol_0, symbol_1)
        expect(result.first_exclusive.represents_something()).toBe(false)
        expect(result.shared.contains_only(64)).toBe(true)
        expect(result.second_exclusive.represents_something()).toBe(false)
    })
})

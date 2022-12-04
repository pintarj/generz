import { IcExecutionMachine } from '@dist/ic-execution-machine'
import { StringReader } from '@dist/reader'
import { regex_to_ic } from '@dist/regex-to-ic'
import { RegularExpression } from '@dist/regular-expression'

function f(regex: string, input: string): ({read: number, out: string|undefined}) {
    let buffer = input
    let cursor_index  = -1
    let marker_length = -1

    const machine = new IcExecutionMachine()
    
    machine.global_scope.declare_function('next', () => {
        cursor_index += 1
        return buffer.charCodeAt(cursor_index)
    })

    machine.global_scope.declare_function('mark', () => {
        marker_length = cursor_index + 1
    })

    const ic = regex_to_ic((new RegularExpression(new StringReader(regex))).generate())
    machine.execute(ic)

    return {
        read: cursor_index + 1,
        out: (marker_length === -1)
            ? undefined
            : buffer.substring(0, marker_length)
    }
}
test('fail', () => {
    expect(f('a', '')).toEqual({
        read: 1,
        out: undefined
    })
})

test('a', () => {
    expect(f('a', 'aaa')).toEqual({
        read: 1,
        out: 'a'
    })
})

test('aa', () => {
    expect(f('aa', 'aaaa')).toEqual({
        read: 2,
        out: 'aa'
    })
})

test('a*', () => {
    expect(f('a*', 'aaaab')).toEqual({
        read: 5,
        out: 'aaaa'
    })
})

test('a*-eof', () => {
    expect(f('a*', 'aaaa')).toEqual({
        read: 5,
        out: 'aaaa'
    })
})

describe('a+b', () => {
    test('match', () => {
        expect(f('a+b', 'aaaaaaab')).toEqual({
            read: 8,
            out: 'aaaaaaab'
        })
    })

    test('fail', () => {
        expect(f('a+b', 'aaaaa')).toEqual({
            read: 6,
            out: undefined
        })
    })
})

describe('(\\w\\w\\w\\.)+', () => {
    test('match', () => {
        expect(f('(\\w\\w\\w\\.)+', 'abc.def.')).toEqual({
            read: 9,
            out: 'abc.def.'
        })
    })

    test('partial-match', () => {
        expect(f('(\\w\\w\\w\\.)+', 'abc.def')).toEqual({
            read: 8,
            out: 'abc.'
        })
    })

    test('fail', () => {
        expect(f('(\\w\\w\\w\\.)+', 'ab.def.')).toEqual({
            read: 3,
            out: undefined
        })
    })
})

describe('for(all)?', () => {
    test('match', () => {
        expect(f('for(all)?', 'forall')).toEqual({
            read: 6,
            out: 'forall'
        })
    })

    test('partial-match', () => {
        expect(f('for(all)?', 'forany')).toEqual({
            read: 5,
            out: 'for'
        })
    })

    test('fail', () => {
        expect(f('for(all)?', 'fog')).toEqual({
            read: 3,
            out: undefined
        })
    })
})



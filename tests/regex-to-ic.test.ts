import { IcExecutionMachine } from '@dist/ic-execution-machine'
import { Statement } from '@dist/ic/statement'
import { StringReader } from '@dist/reader'
import { regex_to_ic } from '@dist/regex-to-ic'
import { RegularExpression } from '@dist/regular-expression'

interface RegexMachineExecutionResult {
    out: string|undefined
    read: number
}

class RegexMachine {
    private readonly regex_ic: Statement

    public constructor(regex: string) {
        this.regex_ic = regex_to_ic((new RegularExpression(new StringReader(regex))).generate())
    }

    public execute(input: string): RegexMachineExecutionResult {
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

        machine.execute(this.regex_ic)
        
        return {
            read: cursor_index + 1,
            out: (marker_length === -1)
                ? undefined
                : buffer.substring(0, marker_length)
        }
    }
}

const tests: Array<{regex: string, executions: Array<{input: string, expected: RegexMachineExecutionResult}>}> = [{
    regex: 'a',
    executions: [
        {input: 'b', expected: {read: 1, out: undefined}},
        {input: 'a', expected: {read: 1, out: 'a'}},
    ]
}, {
    regex: 'aa',
    executions: [
        {input: 'a', expected: {read: 2, out: undefined}},
        {input: 'aaaa', expected: {read: 2, out: 'aa'}},
    ]
}, {
    regex: 'a*',
    executions: [
        {input: '', expected: {read: 1, out: ''}},
        {input: 'ab', expected: {read: 2, out: 'a'}},
        {input: 'aaaa', expected: {read: 5, out: 'aaaa'}},
    ]
}, {
    regex: 'a+b',
    executions: [
        {input: 'aaaaaaab', expected: {read: 8, out: 'aaaaaaab'}},
        {input: 'b', expected: {read: 1, out: undefined}},
        {input: 'aaaa', expected: {read: 5, out: undefined}},
    ]
}, {
    regex: '(\\w\\w\\w\\.)+',
    executions: [
        {input: 'abc.def.', expected: {read: 9, out: 'abc.def.'}},
        {input: 'abc.def', expected: {read: 8, out: 'abc.'}},
        {input: 'ab.def.', expected: {read: 3, out: undefined}},
    ]
}, {
    regex: 'for(all)?',
    executions: [
        {input: 'forall', expected: {read: 6, out: 'forall'}},
        {input: 'foraX', expected: {read: 5, out: 'for'}},
        {input: 'for', expected: {read: 4, out: 'for'}},
        {input: 'f', expected: {read: 2, out: undefined}},
    ]
}]

for (const {regex, executions} of tests) {
    describe(regex, () => {
        const machine = new RegexMachine(regex)

        for (const {input, expected} of executions) {
            test(input, () => {
                expect(machine.execute(input)).toEqual(expected)
            })
        }
    })
}

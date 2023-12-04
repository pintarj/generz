import { IcExecutionMachine } from '@dist/ic-execution-machine'
import { Atom } from '@dist/ic/atom'
import { Statement } from '@dist/ic/statement'
import { VariableDeclaration, VariableType } from '@dist/ic/variable-declaration'
import { StringReader } from '@dist/reader'
import { regex_to_ic } from '@dist/regex-to-ic'
import { RegularExpression } from '@dist/regular-expression'

interface RegexMachineExecutionResult {
    out: string|undefined
    read: number
    terminal_id?: number|undefined
}

class RegexMachine {
    private readonly var_terminal_id: VariableDeclaration|undefined
    private readonly regex_ic: Statement

    public constructor(regex: string, options?: {machine_id?: number}) {
        const {machine_id} = options || {}
        const state = (new RegularExpression(new StringReader(regex))).generate()
        state.get_transitively_reachable_final_states().forEach(state => state.machine_id = machine_id)

        this.var_terminal_id = machine_id !== undefined
            ? new VariableDeclaration(VariableType.I32, 'terminal_id', {initial_value: new Atom(-1)})
            : undefined

        this.regex_ic = regex_to_ic(state, {parsed_terminal_id_ref: this.var_terminal_id?.get_reference()})
    }

    public execute(input: string): RegexMachineExecutionResult {
        let buffer = input
        let cursor_index  = -1
        let marker_length = -1

        const machine = new IcExecutionMachine()

        if (this.var_terminal_id !== undefined) {
            const initial_value = this.var_terminal_id.initial_value !== undefined
                ? machine.evaluate(this.var_terminal_id.initial_value)
                : undefined
            
            machine.global_scope.declare_variable(this.var_terminal_id.name, this.var_terminal_id.type, initial_value)
        }
        
        machine.global_scope.declare_function('next', () => {
            cursor_index += 1
            return buffer.charCodeAt(cursor_index)
        })
    
        machine.global_scope.declare_function('mark', (relative_index?: number) => {
            marker_length = cursor_index + 1 + (relative_index || 0)
        })

        machine.execute(this.regex_ic)
        
        return {
            read: cursor_index + 1,
            out: (marker_length === -1)
                ? undefined
                : buffer.substring(0, marker_length),
            terminal_id: this.var_terminal_id !== undefined
                ? machine.global_scope.get_variable('terminal_id').value
                : undefined
        }
    }
}

const tests: Array<{regex: string, machine_id?: number, executions: Array<{input: string, expected: RegexMachineExecutionResult}>}> = [{
    regex: 'a',
    machine_id: 3,
    executions: [
        {input: 'b', expected: {read: 1, out: undefined, terminal_id: -1}},
        {input: 'a', expected: {read: 1, out: 'a', terminal_id: 3}},
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
    machine_id: 78,
    executions: [
        {input: 'abc.def.', expected: {read: 9, out: 'abc.def.', terminal_id: 78}},
        {input: 'abc.def', expected: {read: 8, out: 'abc.', terminal_id: 78}},
        {input: 'ab.def.', expected: {read: 3, out: undefined, terminal_id: -1}},
    ]
}, {
    regex: 'for(all)?',
    executions: [
        {input: 'forall', expected: {read: 6, out: 'forall'}},
        {input: 'foraX', expected: {read: 5, out: 'for'}},
        {input: 'for', expected: {read: 4, out: 'for'}},
        {input: 'f', expected: {read: 2, out: undefined}},
    ]
}, {
    regex: '(a(bc?)?)?',
    executions: [
        {input: '', expected: {read: 1, out: ''}},
        {input: 'x', expected: {read: 1, out: ''}},
        {input: 'a', expected: {read: 2, out: 'a'}},
        {input: 'ab', expected: {read: 3, out: 'ab'}},
        {input: 'abc', expected: {read: 3, out: 'abc'}},
        {input: 'ac', expected: {read: 2, out: 'a'}},
        {input: 'abbc', expected: {read: 3, out: 'ab'}},
    ]
}, {
    regex: 'a[^xyz]b*[d-gn-z]+',
    executions: [
        {input: '', expected: {read: 1, out: undefined}},
        {input: 'a', expected: {read: 2, out: undefined}},
        {input: 'ax', expected: {read: 2, out: undefined}},
        {input: 'aK', expected: {read: 3, out: undefined}},
        {input: 'aKbb', expected: {read: 5, out: undefined}},
        {input: 'aKbbz', expected: {read: 6, out: 'aKbbz'}},
        {input: 'aToz', expected: {read: 5, out: 'aToz'}},
    ]
}, {
    regex: 'a?[bc]*[def]+',
    executions: [
        {input: '', expected: {read: 1, out: undefined}},
        {input: 'a', expected: {read: 2, out: undefined}},
        {input: 'ab', expected: {read: 3, out: undefined}},
        {input: 'f', expected: {read: 2, out: 'f'}},
        {input: 'abcdef', expected: {read: 7, out: 'abcdef'}},
        {input: 'bcbcbcdef', expected: {read: 10, out: 'bcbcbcdef'}},
    ]
}, {
    regex: 'if|for|while',
    executions: [
        {input: 'if', expected: {read: 2, out: 'if'}},
        {input: 'for', expected: {read: 3, out: 'for'}},
        {input: 'while', expected: {read: 5, out: 'while'}},
    ]
}, {
    regex: '(xx|[ab][cd])+',
    executions: [
        {input: 'xc', expected: {read: 2, out: undefined}},
        {input: 'dc', expected: {read: 1, out: undefined}},
        {input: 'xx', expected: {read: 3, out: 'xx'}},
        {input: 'acbd', expected: {read: 5, out: 'acbd'}},
        {input: 'xxacxxad', expected: {read: 9, out: 'xxacxxad'}},
    ]
}, {
    regex: '(\\s|\\/\\/[^\\n]*\\n)+',
    executions: [
        {input: 'x', expected: {read: 1, out: undefined}},
        {input: ' \t', expected: {read: 3, out: ' \t'}},
        {input: '// comment\n // another\n', expected: {read: 24, out: '// comment\n // another\n'}},
    ]
}]

for (const {regex, machine_id, executions} of tests) {
    describe(regex, () => {
        const machine = new RegexMachine(regex, {machine_id})

        for (const {input, expected} of executions) {
            test(input, () => {
                expect(machine.execute(input)).toEqual(expected)
            })
        }
    })
}

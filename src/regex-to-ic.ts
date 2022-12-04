import { Assignment } from './ic/assignment'
import { Atom } from './ic/atom'
import { BinaryOperation, Operator } from './ic/binary-operation'
import { Break } from './ic/break'
import { FunctionCall } from './ic/function-call'
import { If } from './ic/if'
import { Statement } from './ic/statement'
import { Statements } from './ic/statements'
import { VariableDeclaration, VariableType } from './ic/variable-declaration'
import { While } from './ic/while'
import { State } from './regex/state'

function enhance_printable_comment(atom: Atom): Atom {
    if (Number.isSafeInteger(atom.value))
        atom.comment = JSON.stringify(String.fromCharCode(atom.value))

    return atom
}

export function regex_to_ic(
    machine: State,
    options?: Readonly<{
        on_final_inject?: (machine_id: number) => Statement
    }>
): Statement {
    const {on_final_inject} = options || {}

    const state_var = new VariableDeclaration(VariableType.I32, 'state', {
        mutable: true,
        initial_value: new Atom(machine.id),
        comment: 'Contains the id of the current state of the machine.'
    })

    const input_var = new VariableDeclaration(VariableType.I32, 'input', {
        initial_value: new FunctionCall('next'),
        comment: 'Contains the current input of the machine.'
    })

    const state_ref = state_var.get_reference()
    const input_ref = input_var.get_reference()

    let states_switch: Statement = (new FunctionCall('throw_error', {
        args: [new Atom('program reached invalid state: regex machine state unknown')]
    })).to_statement()

    for (const state of machine.get_transitively_reachable_states().reverse()) {
        const state_condition = new BinaryOperation(
            Operator.EQUAL,
            state_ref,
            new Atom(state.id)
        )

        let state_body: Statement = new Break()

        if (state.transitions.length !== 0) {
            for (const transition of state.transitions) {
                const intervals = transition.symbol!.set.get_intervals()
                
                const intervals_conditions = intervals.map(interval =>
                    (interval.length === 1)
                        ? new BinaryOperation(Operator.EQUAL, input_ref, enhance_printable_comment(new Atom(interval.start)))
                        : new BinaryOperation(
                            Operator.AND,
                            new BinaryOperation(Operator.GREATER_THAN_OR_EQUAL, input_ref, enhance_printable_comment(new Atom(interval.start))),
                            new BinaryOperation(Operator.LESS_THAN_OR_EQUAL, input_ref, enhance_printable_comment(new Atom(interval.end - 1)))
                        )
                )
                
                const input_condition = intervals_conditions.reduce((left, right) => 
                    new BinaryOperation(Operator.OR, left, right)
                )
    
                /**
                 * Action to perform for a specific state/input.
                 * When state would not change no assignment is added.
                 */
                const action: Statement = (state.id !== transition.state.id)
                    ? new Assignment(state_ref, new Atom(transition.state.id))
                    : new Statements([], {comment: `remains in state ${transition.state.id}`})
                
                state_body = new If(input_condition, action, {
                    else_body: state_body
                })
            }

            state_body = new Statements([
                input_var.to_statement(),
                state_body
            ])
        }

        if (state.is_final) {
            const statements = [
                (new FunctionCall('mark')).to_statement()
            ]

            state_condition.comment = 'final'

            if (on_final_inject !== undefined)
                statements.push(on_final_inject(state.machine_id!))

            statements.push(state_body)
            state_body = new Statements(statements)
        }

        states_switch = new If(state_condition, state_body, {
            else_body: states_switch
        })
    }

    return new Statements([
        state_var.to_statement(),
        new While(new Atom(true), states_switch)
    ])
}

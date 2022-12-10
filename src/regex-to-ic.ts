import { Assignment } from './ic/assignment'
import { Atom } from './ic/atom'
import { BinaryOperation, Operator } from './ic/binary-operation'
import { Break } from './ic/break'
import { Expression } from './ic/expression'
import { FunctionCall } from './ic/function-call'
import { If } from './ic/if'
import { Statement } from './ic/statement'
import { Statements } from './ic/statements'
import { VariableDeclaration, VariableType } from './ic/variable-declaration'
import { VariableReference } from './ic/variable-reference'
import { While } from './ic/while'
import { State } from './regex/state'
import { Transition } from './regex/transition'

function enhance_printable_comment(atom: Atom): Atom {
    if (Number.isSafeInteger(atom.value))
        atom.comment = JSON.stringify(String.fromCharCode(atom.value))

    return atom
}

function build_transition_condition(transition: Transition, input_expression: Expression): Expression {
    const intervals = transition.symbol!.set.get_intervals()
                
    const intervals_conditions = intervals.map(interval =>
        (interval.length === 1)
            ? new BinaryOperation(Operator.EQUAL, input_expression, enhance_printable_comment(new Atom(interval.start)))
            : new BinaryOperation(
                Operator.AND,
                new BinaryOperation(Operator.GREATER_THAN_OR_EQUAL, input_expression, enhance_printable_comment(new Atom(interval.start))),
                new BinaryOperation(Operator.LESS_THAN_OR_EQUAL, input_expression, enhance_printable_comment(new Atom(interval.end - 1)))
            )
    )
    
    return intervals_conditions.reduce((left, right) => 
        new BinaryOperation(Operator.OR, left, right)
    )
}

interface Branch {
    condition: Expression
    body: Statement
}

function reduce_branches(branches: Array<Branch>, else_body: Statement|undefined): Statement {
    const reducer = (else_body: Statement|undefined, branch: Branch): Statement => {
        return new If(branch.condition, branch.body, {else_body})
    }

    return branches.reduceRight(reducer, else_body) || new Statements([])
}

class Vars {
    private input_var: VariableDeclaration|undefined
    private state_var: VariableDeclaration|undefined
    
    public constructor() {
        this.input_var = undefined
        this.state_var = undefined
    }

    public declare_state_var(initial_value: number): VariableDeclaration {
        if (this.state_var !== undefined)
            throw new Error('Variable `state` already declared.')

        this.state_var = new VariableDeclaration(VariableType.I32, 'state', {
            mutable: true,
            initial_value: new Atom(initial_value),
            comment: 'Will contain the id of the current state of the machine.'
        })

        return this.state_var
    }

    public get input_ref(): VariableReference {
        if (this.input_var === undefined) {
            this.input_var = new VariableDeclaration(VariableType.I32, 'input', {
                mutable: true,
                initial_value: new Atom(-1),
                comment: 'Will contain the current input of the machine.'
            })
        }

        return this.input_var.get_reference()
    }

    public get state_ref(): VariableReference {
        if (this.state_var === undefined) {
            this.state_var = this.declare_state_var(-1)
        }

        return this.state_var.get_reference()
    }

    public get_declarations(): VariableDeclaration[] {
        return [this.input_var, this.state_var].filter((x): x is VariableDeclaration => x !== undefined)
    }
}
class Analysis {
    private refs: Map<number, number>

    public constructor(machine: State) {
        this.refs = new Map()

        for (const state of machine.get_transitively_reachable_states()) {
            for (const transition of state.transitions) {
                const value = this.get_refs(transition.state) + 1
                this.refs.set(transition.state.id, value)
            }
        }
    }

    public get_refs(state: State): number {
        return this.refs.get(state.id) || 0
    }
}

export function regex_to_ic(machine: State): Statement {
    const analysis = new Analysis(machine)
    const vars = new Vars()
    const processed = new Set<number>()
    const defer_queue: State[] = []

    function defer_state_handling(state: State): void {
        if (!processed.has(state.id)) {
            processed.add(state.id)
            defer_queue.push(state)
        }
    }

    function handle_state(state: State, fail_body: Statement|undefined, options?: {seen?: Set<number>}): Statement {
        const seen = options?.seen || new Set()
        seen.add(state.id)
        processed.add(state.id)
        const statements: Statement[] = []

        if (state.is_final) {
            statements.push((new FunctionCall('mark')).to_statement())
        }

        let state_body: Statement|undefined

        if (state.transitions.length === 0) {
            state_body = fail_body
        } else {
            statements.push(new Assignment(vars.input_ref, new FunctionCall('next')))
            
            const branches: Array<{condition: Expression, body: Statement}> = []

            for (const transition of state.transitions) {
                const condition = build_transition_condition(transition, vars.input_ref)
                const next = transition.state

                let body: Statement

                if (!seen.has(next.id) && analysis.get_refs(next) < 2) {
                    body = handle_state(next, fail_body, {seen})
                } else {
                    body = (state.id !== transition.state.id)
                        ? new Assignment(vars.state_ref, new Atom(next.id))
                        : new Statements([], {comment: `remains in state ${next.id}`})

                    defer_state_handling(next)
                }
                
                branches.push({condition, body})
            }

            state_body = reduce_branches(branches, fail_body)
        }

        if (state_body !== undefined)
            statements.push(state_body)
        
        return new Statements(statements)
    }

    const statements: Statement[] = [
        handle_state(machine, undefined)
    ]

    if (defer_queue.length !== 0) {
        const branches: Array<Branch> = []

        while (true) {
            const state = defer_queue.shift()
    
            if (state === undefined)
                break
    
            const condition = new BinaryOperation(
                Operator.EQUAL,
                vars.state_ref,
                new Atom(state.id)
            )

            const body = handle_state(state, new Break())
            
            branches.push({
                condition,
                body
            })
        }
    
        const fail_body: Statement = (new FunctionCall('throw_error', {
            args: [new Atom('program reached invalid state: regex machine state unknown')]
        })).to_statement()

        const while_body = reduce_branches(branches, fail_body)
    
        statements.push(
            new If(
                new BinaryOperation(Operator.NOT_EQUAL, vars.state_ref, new Atom(-1)),
                new While(
                    new Atom(true),
                    while_body
                )
            )
        )
    }

    return new Statements([
        ...vars.get_declarations().map(x => x.to_statement()),
        ...statements
    ])
}

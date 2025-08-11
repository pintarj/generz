import { Assignment } from './ic/assignment'
import { Atom } from './ic/atom'
import { BinaryOperation, Operator } from './ic/binary-operation'
import { Break } from './ic/break'
import { DoWhile } from './ic/do-while'
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

function new_char_atom(code: number): Atom {
    return new Atom(code, {
        comment: JSON.stringify(String.fromCharCode(code))
    })
}

function build_transition_condition(transition: Transition, input_expression: Expression): Expression {
    const intervals = transition.symbol!.set.get_intervals()
                
    const intervals_conditions = intervals.map(interval =>
        (interval.length === 1)
            ? new BinaryOperation(Operator.EQUAL, input_expression, new_char_atom(interval.start))
            : new BinaryOperation(
                Operator.AND,
                new BinaryOperation(Operator.GREATER_THAN_OR_EQUAL, input_expression, new_char_atom(interval.start)),
                new BinaryOperation(Operator.LESS_THAN_OR_EQUAL, input_expression, new_char_atom(interval.end - 1))
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

class Vars {
    private input_var: VariableDeclaration|undefined
    private state_var: VariableDeclaration|undefined
    
    public constructor() {
        this.input_var = undefined
        this.state_var = undefined
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
            this.state_var = new VariableDeclaration(VariableType.I32, 'state', {
                mutable: true,
                initial_value: new Atom(-1),
                comment: 'Will contain the id of the current state of the machine.'
            })
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

export function regex_to_ic(
    machine: State,
    options?: {
        parsed_terminal_id_ref?: VariableReference
    }
): Statement {
    const parsed_terminal_id_ref = options?.parsed_terminal_id_ref
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

    function handle_state(
        state: State,
        fail_body: Statement|undefined,
        options?: {
            seen?: Set<number>
            root_state?: State
        }
    ): Statement {
        const seen = options?.seen || new Set()
        const root_state = options?.root_state || state
        seen.add(state.id)
        processed.add(state.id)
        const statements: Statement[] = []

        let handle_final = true
        let init_input = false
        let state_body: Statement|undefined

        if (state.transitions.length === 0) {
            state_body = fail_body
        } else {
            let input_expr: Expression

            if (state.transitions.length === 1 && state.transitions[0].symbol!.set.size === 1) {
                input_expr = new FunctionCall('next')
            } else {
                init_input = true
                input_expr = vars.input_ref
            }

            const transitions = {
                looping: [] as Transition[],
                jumping: [] as Transition[]
            }

            for (const transition of state.transitions) {
                if (state.id === transition.state.id) {
                    transitions.looping.push(transition)
                } else {
                    transitions.jumping.push(transition)
                }
            }

            for (const transition of transitions.looping) {
                const condition = build_transition_condition(transition, input_expr)
                let loop: Statement

                if (init_input) {
                    init_input = false
                    loop = new DoWhile(
                        condition,
                        new Assignment(vars.input_ref, new FunctionCall('next'))
                    )
                } else {
                    loop = new While(
                        condition,
                        new Statements([], {comment: 'nop'})
                    ) 
                }

                statements.push(loop)

                if (state.is_final) {
                    statements.push((new FunctionCall('mark', {args: [new Atom(-1)]})).to_statement())

                    if (parsed_terminal_id_ref !== undefined)
                        statements.push(new Assignment(parsed_terminal_id_ref, new Atom(state.machine_id)))

                    handle_final = false
                }
            }

            const branches: Array<{condition: Expression, body: Statement}> = []

            for (const transition of transitions.jumping) {
                let condition = build_transition_condition(transition, input_expr)
                let next = transition.state
                let body: Statement

                while (true) {
                    if (seen.has(next.id) || analysis.get_refs(next) >= 2) {
                        if (next.id === root_state.id) {  
                            body = new Statements([], {comment: `remains in state ${next.id}`})
                        } else {
                            body = new Assignment(vars.state_ref, new Atom(next.id))
                            defer_state_handling(next)
                        }
                        break
                    }

                    if (!next.is_final && next.transitions.length === 1) {
                        const next_transition = next.transitions[0]

                        if (next_transition.symbol!.set.size === 1) {
                            condition = new BinaryOperation(
                                Operator.AND,
                                condition,
                                build_transition_condition(next_transition, new FunctionCall('next'))
                            )

                            next = next_transition.state
                            continue
                        }
                    }

                    body = handle_state(next, fail_body, {seen, root_state})
                    break
                }
                
                branches.push({condition, body})
            }

            state_body = branches.reduceRight((else_body, branch) => new If(branch.condition, branch.body, {else_body}), fail_body)
        }

        if (handle_final && state.is_final) {
            statements.push((new FunctionCall('mark')).to_statement())

            if (parsed_terminal_id_ref !== undefined)
                statements.push(new Assignment(parsed_terminal_id_ref, new Atom(state.machine_id)))
        }

        if (init_input)
            statements.push(new Assignment(vars.input_ref, new FunctionCall('next')))

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

        const while_body = branches.reduceRight((else_body, branch) => new If(branch.condition, branch.body, {else_body}), fail_body)
    
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

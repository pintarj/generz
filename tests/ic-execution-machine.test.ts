import { IcExecutionMachine, Scope } from '@dist/ic-execution-machine'
import { Assignment } from '@dist/ic/assignment'
import { Atom } from '@dist/ic/atom'
import { BinaryOperation, Operator } from '@dist/ic/binary-operation'
import { Break } from '@dist/ic/break'
import { Continue } from '@dist/ic/continue'
import { DoWhile } from '@dist/ic/do-while'
import { Expression } from '@dist/ic/expression'
import { ExpressionStatement } from '@dist/ic/expression-statement'
import { Function } from '@dist/ic/function'
import { FunctionCall } from '@dist/ic/function-call'
import { If } from '@dist/ic/if'
import { Return } from '@dist/ic/return'
import { Statements } from '@dist/ic/statements'
import { VariableDeclaration, VariableType } from '@dist/ic/variable-declaration'
import { While } from '@dist/ic/while'

describe('evaluate', () => {
    function evaluate(e: Expression): any {
        const machine = new IcExecutionMachine()
        return machine.evaluate(e)
    }

    test('atom', () => {
        expect(evaluate(new Atom(5))).toBe(5)
    })

    describe('binary-operator', () => {
        test('or', () => {
            const f = (l: any, r: any) => evaluate(new BinaryOperation(Operator.OR, new Atom(l), new Atom(r)))
            expect(f(false, false)).toBe(false)
            expect(f(false, true)).toBe(true)
            expect(f(true, false)).toBe(true)
            expect(f(true, true)).toBe(true)
        })

        test('or-chaining', () => {
            const f = (l: boolean, r: boolean) => {
                let counter = 0
                const machine = new IcExecutionMachine()

                machine.global_scope.declare_function('f', (x: boolean) => {
                    counter += 1
                    return x
                })

                return [
                    machine.evaluate(
                        new BinaryOperation(
                            Operator.OR,
                            new FunctionCall('f', {args: [new Atom(l)]}),
                            new FunctionCall('f', {args: [new Atom(r)]})
                        )
                    ),
                    counter
                ]
            }
            
            expect(f(false, false)).toEqual([false, 2])
            expect(f(false, true)).toEqual([true, 2])
            expect(f(true,  false)).toEqual([true, 1])
            expect(f(true,  true)).toEqual([true, 1])
        })

        test('and-chaining', () => {
            const f = (l: boolean, r: boolean) => {
                let counter = 0
                const machine = new IcExecutionMachine()

                machine.global_scope.declare_function('f', (x: boolean) => {
                    counter += 1
                    return x
                })

                return [
                    machine.evaluate(
                        new BinaryOperation(
                            Operator.AND,
                            new FunctionCall('f', {args: [new Atom(l)]}),
                            new FunctionCall('f', {args: [new Atom(r)]})
                        )
                    ),
                    counter
                ]
            }
            
            expect(f(false, false)).toEqual([false, 1])
            expect(f(false, true)).toEqual([false, 1])
            expect(f(true,  false)).toEqual([false, 2])
            expect(f(true,  true)).toEqual([true, 2])
        })

        test('and', () => {
            const f = (l: any, r: any) => evaluate(new BinaryOperation(Operator.AND, new Atom(l), new Atom(r)))
            expect(f(false, false)).toBe(false)
            expect(f(false, true)).toBe(false)
            expect(f(true, false)).toBe(false)
            expect(f(true, true)).toBe(true)
        })

        test('eq', () => {
            const f = (l: any, r: any) => evaluate(new BinaryOperation(Operator.EQUAL, new Atom(l), new Atom(r)))
            expect(f(false, false)).toBe(true)
            expect(f(false, true)).toBe(false)
            expect(f(true, true)).toBe(true)
            expect(f(-1, 1)).toBe(false)
            expect(f(33, 33)).toBe(true)
            expect(f(33, '33')).toBe(false)
        })

        test('neq', () => {
            const f = (l: any, r: any) => evaluate(new BinaryOperation(Operator.NOT_EQUAL, new Atom(l), new Atom(r)))
            expect(f(false, false)).toBe(false)
            expect(f(false, true)).toBe(true)
            expect(f(true, true)).toBe(false)
            expect(f(-1, 1)).toBe(true)
            expect(f(33, 33)).toBe(false)
            expect(f(33, '33')).toBe(true)
        })

        test('lt', () => {
            const f = (l: any, r: any) => evaluate(new BinaryOperation(Operator.LESS_THAN, new Atom(l), new Atom(r)))
            expect(f(1, 2)).toBe(true)
            expect(f(-1, 0)).toBe(true)
            expect(f(2, 1)).toBe(false)
            expect(f(2, 2)).toBe(false)
        })

        test('lte', () => {
            const f = (l: any, r: any) => evaluate(new BinaryOperation(Operator.LESS_THAN_OR_EQUAL, new Atom(l), new Atom(r)))
            expect(f(1, 2)).toBe(true)
            expect(f(-1, 0)).toBe(true)
            expect(f(2, 1)).toBe(false)
            expect(f(2, 2)).toBe(true)
        })

        test('gt', () => {
            const f = (l: any, r: any) => evaluate(new BinaryOperation(Operator.GREATER_THAN, new Atom(l), new Atom(r)))
            expect(f(1, 2)).toBe(false)
            expect(f(-1, 0)).toBe(false)
            expect(f(2, 1)).toBe(true)
            expect(f(2, 2)).toBe(false)
        })

        test('gte', () => {
            const f = (l: any, r: any) => evaluate(new BinaryOperation(Operator.GREATER_THAN_OR_EQUAL, new Atom(l), new Atom(r)))
            expect(f(1, 2)).toBe(false)
            expect(f(-1, 0)).toBe(false)
            expect(f(2, 1)).toBe(true)
            expect(f(2, 2)).toBe(true)
        })
    })

    test('function-call', () => {
        const machine = new IcExecutionMachine()
        const x_var = new VariableDeclaration(VariableType.I32, 'x')
        const f = new Function('f', [x_var], VariableType.I32, new Return(x_var.get_reference()))
        machine.execute(f.to_statement())

        expect(machine.evaluate(new FunctionCall('f', {args: [new Atom(33)]}))).toBe(33)
        expect(machine.evaluate(new FunctionCall('f', {args: [new Atom(999)]}))).toBe(999)
    })

    test('variable-reference', () => {
        const machine = new IcExecutionMachine()
        const variable = new VariableDeclaration(VariableType.I32, 'x', {
            initial_value: new Atom(78)
        })
        machine.execute(variable.to_statement())
        expect(machine.evaluate(variable.get_reference())).toBe(78)
    })
})

describe('execute', () => {
    test('assignment', () => {
        const machine = new IcExecutionMachine()
        const variable = new VariableDeclaration(VariableType.I32, 'a', {
            initial_value: new Atom(1)
        })
        machine.execute(variable.to_statement())
        expect(machine.global_scope.get_variable('a').value).toBe(1)
        machine.execute(new Assignment(variable.get_reference(), new Atom(2)))
        expect(machine.global_scope.get_variable('a').value).toBe(2)
    })

    test('break', () => {
        const machine = new IcExecutionMachine()
        const i_var = new VariableDeclaration(VariableType.I32, 'i', {
            initial_value: new Atom(0)
        })
        machine.execute(i_var.to_statement())

        machine.execute(new While(
            new Atom(true),
            new Statements([
                new Break(),
                new Assignment(i_var.get_reference(), new Atom(1))
            ])
        ))

        expect(machine.evaluate(i_var.get_reference())).toBe(0)
    })

    test('continue', () => {
        const machine = new IcExecutionMachine()
        const i_var = new VariableDeclaration(VariableType.I32, 'i', {
            initial_value: new Atom(0)
        })
        const x_var = new VariableDeclaration(VariableType.I32, 'x', {
            initial_value: new Atom(0)
        })
        machine.execute(i_var.to_statement())
        machine.execute(x_var.to_statement())

        machine.execute(new While(
            new BinaryOperation(Operator.LESS_THAN, i_var.get_reference(), new Atom(10)),
            new Statements([
                new Assignment(
                    i_var.get_reference(),
                    new BinaryOperation(Operator.PLUS, i_var.get_reference(), new Atom(1))
                ),
                new If(
                    new BinaryOperation(Operator.LESS_THAN_OR_EQUAL, i_var.get_reference(), new Atom(5)),
                    new Continue()
                ),
                new Assignment(
                    x_var.get_reference(),
                    new BinaryOperation(Operator.PLUS, x_var.get_reference(), new Atom(1))
                )
            ])
        ))

        expect(machine.evaluate(i_var.get_reference())).toBe(10)
        expect(machine.evaluate(x_var.get_reference())).toBe(5)
    })

    test('function', () => {
        const machine = new IcExecutionMachine()
        const x_var = new VariableDeclaration(VariableType.I32, 'x')
        const f = new Function('f', [x_var], VariableType.I32, new Return(x_var.get_reference()))
        machine.execute(f.to_statement())
        expect(machine.global_scope.get_function('f')).toBeTruthy()
    })

    test('expression-statement', () => {
        const machine = new IcExecutionMachine()
        expect(machine.execute(new ExpressionStatement(new Atom('yolo')))).toEqual(undefined)
    })

    test('if', () => {
        const machine = new IcExecutionMachine()
        const x_var = new VariableDeclaration(VariableType.I32, 'x', {
            initial_value: new Atom(0)
        })
        machine.execute(x_var.to_statement())
        machine.execute(new If(new Atom(false), new Assignment(x_var.get_reference(), new Atom(1))))
        expect(machine.evaluate(x_var.get_reference())).toEqual(0)
        machine.execute(new If(new Atom(true), new Assignment(x_var.get_reference(), new Atom(2))))
        expect(machine.evaluate(x_var.get_reference())).toEqual(2)
        machine.execute(new If(new Atom(true), new Statements([]), {else_body: new Assignment(x_var.get_reference(), new Atom(3))}))
        expect(machine.evaluate(x_var.get_reference())).toEqual(2)
        machine.execute(new If(new Atom(false), new Statements([]), {else_body: new Assignment(x_var.get_reference(), new Atom(4))}))
        expect(machine.evaluate(x_var.get_reference())).toEqual(4)
    })

    test('return', () => {
        const machine = new IcExecutionMachine()
        expect(machine.execute(new Return(new Atom('yolo')))).toEqual({type: 'return', value: 'yolo'})
    })

    test('statements', () => {
        const machine = new IcExecutionMachine()
        expect(machine.execute(new Statements([]))).toEqual(undefined)
    })

    test('variable-declaration', () => {
        const machine = new IcExecutionMachine()
        const variable = new VariableDeclaration(VariableType.I32, 'a', {
            initial_value: new Atom(-99)
        })
        machine.execute(variable.to_statement())
        expect(machine.global_scope.get_variable('a').value).toBe(-99)
    })

    test('while', () => {
        const machine = new IcExecutionMachine()
        const i_var = new VariableDeclaration(VariableType.I32, 'i', {
            initial_value: new Atom(0)
        })
        const x_var = new VariableDeclaration(VariableType.I32, 'x', {
            initial_value: new Atom(0)
        })
        machine.execute(i_var.to_statement())
        machine.execute(x_var.to_statement())

        machine.execute(new While(
            new BinaryOperation(Operator.LESS_THAN, i_var.get_reference(), new Atom(10)),
            new Statements([
                new Assignment(
                    x_var.get_reference(),
                    new BinaryOperation(Operator.PLUS, x_var.get_reference(), new Atom(2))
                ),
                new Assignment(
                    i_var.get_reference(),
                    new BinaryOperation(Operator.PLUS, i_var.get_reference(), new Atom(1))
                )
            ])
        ))

        expect(machine.evaluate(i_var.get_reference())).toBe(10)
        expect(machine.evaluate(x_var.get_reference())).toBe(20)
    })

    test('do-while', () => {
        const machine = new IcExecutionMachine()
        const x_var = new VariableDeclaration(VariableType.I32, 'x', {
            initial_value: new Atom(0)
        })
        machine.execute(x_var.to_statement())

        machine.execute(new DoWhile(
            new Atom(false),
            new Statements([
                new Assignment(
                    x_var.get_reference(),
                    new BinaryOperation(Operator.PLUS, x_var.get_reference(), new Atom(2))
                )
            ])
        ))

        expect(machine.evaluate(x_var.get_reference())).toBe(2)
    })
})

describe('scopes', () => {
    describe('variables', () => {
        test('circle', () => {
            const scope = new Scope()
            scope.declare_variable('y', VariableType.I32, 11)
            expect(scope.get_variable('y').value).toBe(11)
        })

        test('not-declared', () => {
            const scope = new Scope()
            expect(() => scope.get_variable('x')).toThrow('not declared')
        })

        test('duplicate', () => {
            const scope = new Scope()
            scope.declare_variable('x', VariableType.I32, 3)
            expect(() => scope.declare_variable('x', VariableType.I32, 5)).toThrow('duplicate')
        })
    
        test('parent', () => {
            const scope_0 = new Scope()
            const scope_1 = new Scope({parent: scope_0})
            scope_0.declare_variable('y', VariableType.I32, 11)
            expect(scope_1.get_variable('y').value).toBe(11)
        })

        test('parent-undeclared', () => {
            const scope_0 = new Scope()
            const scope_1 = new Scope({parent: scope_0})
            expect(() => scope_1.get_variable('y')).toThrow('not declared')
        })

        test('shadowing', () => {
            const scope_0 = new Scope()
            scope_0.declare_variable('a', VariableType.I32, 0)

            const scope_1 = scope_0.create_child()            
            scope_1.declare_variable('a', VariableType.I32, 1)

            expect(scope_0.get_variable('a').value).toEqual(0)
            expect(scope_1.get_variable('a').value).toEqual(1)
        })
    })
    
    describe('functions', () => {
        test('circle', () => {
            const scope = new Scope()
            scope.declare_function('f', () => 23)
            expect(scope.get_function('f')()).toBe(23)
        })

        test('not-declared', () => {
            const scope = new Scope()
            expect(() => scope.get_function('x')).toThrow('not declared')
        })

        test('duplicate', () => {
            const scope = new Scope()
            scope.declare_function('f', () => 1)
            expect(() => scope.declare_function('f', () => 2)).toThrow('duplicate')
        })
    
        test('parent', () => {
            const scope_0 = new Scope()
            const scope_1 = scope_0.create_child()
            scope_0.declare_function('d', () => -1111)
            expect(scope_1.get_function('d')()).toBe(-1111)
        })

        test('parent-undeclared', () => {
            const scope_0 = new Scope()
            const scope_1 = scope_0.create_child()
            expect(() => scope_1.get_function('y')).toThrow('not declared')
        })

        test('shadowing', () => {
            const scope_0 = new Scope()
            scope_0.declare_function('f', () => 0)

            const scope_1 = scope_0.create_child()
            scope_1.declare_function('f', () => 1)

            expect(scope_0.get_function('f')()).toEqual(0)
            expect(scope_1.get_function('f')()).toEqual(1)
        })
    })

    describe('if', () => {
        test('shadowing', () => {
            const machine = new IcExecutionMachine()
            const x_var = new VariableDeclaration(VariableType.I32, 'x', {
                initial_value: new Atom(0)
            })

            let stored: number|undefined

            machine.global_scope.declare_function('store', (...args: any[]) => {
                stored = args[0]
            })

            machine.execute(x_var.to_statement())
            expect(machine.evaluate(x_var.get_reference())).toEqual(0)

            machine.execute(new If(new Atom(true), new Statements([
                x_var.to_statement(),
                new Assignment(x_var.get_reference(), new Atom(118)),
                new FunctionCall('store', {args: [x_var.get_reference()]}).to_statement(),
                new Break()
            ])))

            expect(machine.evaluate(x_var.get_reference())).toEqual(0)
            expect(stored).toEqual(118)
        })

        test('dead', () => {
            const machine = new IcExecutionMachine()
            const x_var = new VariableDeclaration(VariableType.I32, 'x', {
                initial_value: new Atom(0)
            })

            machine.execute(new If(new Atom(true), new Statements([
                x_var.to_statement(),
                new Assignment(x_var.get_reference(), new Atom(118)),
                new Break()
            ])))

            expect(() => machine.global_scope.get_variable('x')).toThrow('not declared')
        })
    })

    describe('while', () => {
        test('shadowing', () => {
            const machine = new IcExecutionMachine()
            const x_var = new VariableDeclaration(VariableType.I32, 'x', {
                initial_value: new Atom(0)
            })

            let stored: number|undefined

            machine.global_scope.declare_function('store', (...args: any[]) => {
                stored = args[0]
            })

            machine.execute(x_var.to_statement())
            expect(machine.evaluate(x_var.get_reference())).toEqual(0)

            machine.execute(new While(new Atom(true), new Statements([
                x_var.to_statement(),
                new Assignment(x_var.get_reference(), new Atom(118)),
                new FunctionCall('store', {args: [x_var.get_reference()]}).to_statement(),
                new Break()
            ])))

            expect(machine.evaluate(x_var.get_reference())).toEqual(0)
            expect(stored).toEqual(118)
        })

        test('dead', () => {
            const machine = new IcExecutionMachine()
            const x_var = new VariableDeclaration(VariableType.I32, 'x', {
                initial_value: new Atom(0)
            })

            machine.execute(new While(new Atom(true), new Statements([
                x_var.to_statement(),
                new Assignment(x_var.get_reference(), new Atom(118)),
                new Break()
            ])))

            expect(() => machine.global_scope.get_variable('x')).toThrow('not declared')
        })
    })

    describe('do-while', () => {
        test('shadowing', () => {
            const machine = new IcExecutionMachine()
            const x_var = new VariableDeclaration(VariableType.I32, 'x', {
                initial_value: new Atom(0)
            })

            let stored: number|undefined

            machine.global_scope.declare_function('store', (...args: any[]) => {
                stored = args[0]
            })

            machine.execute(x_var.to_statement())
            expect(machine.evaluate(x_var.get_reference())).toEqual(0)

            machine.execute(new DoWhile(new Atom(true), new Statements([
                x_var.to_statement(),
                new Assignment(x_var.get_reference(), new Atom(118)),
                new FunctionCall('store', {args: [x_var.get_reference()]}).to_statement(),
                new Break()
            ])))

            expect(machine.evaluate(x_var.get_reference())).toEqual(0)
            expect(stored).toEqual(118)
        })
    })

    describe('function', () => {
        test('shadowing-params', () => {
            const machine = new IcExecutionMachine()
            const x_var = new VariableDeclaration(VariableType.I32, 'x', {
                initial_value: new Atom(0)
            })

            let stored: number|undefined

            machine.global_scope.declare_function('store', (...args: any[]) => {
                stored = args[0]
            })

            const f = new Function('f', [x_var], VariableType.I32, new Statements([
                new Assignment(x_var.get_reference(), new BinaryOperation(Operator.PLUS, x_var.get_reference(), new Atom(10))),
                new FunctionCall('store', {args: [x_var.get_reference()]}).to_statement(),
                new Return(x_var.get_reference())
            ]))

            machine.execute(x_var.to_statement())
            expect(machine.evaluate(x_var.get_reference())).toEqual(0)

            machine.execute(f.to_statement())
            expect(machine.evaluate(new FunctionCall('f', {args: [new Atom(9)]}))).toEqual(19)

            expect(machine.evaluate(x_var.get_reference())).toEqual(0)
            expect(stored).toEqual(19)
        })

        test('shadowing-local', () => {
            const machine = new IcExecutionMachine()
            const x_var = new VariableDeclaration(VariableType.I32, 'x', {
                initial_value: new Atom(0)
            })

            let stored: number|undefined

            machine.global_scope.declare_function('store', (...args: any[]) => {
                stored = args[0]
            })

            const f = new Function('f', [], VariableType.I32, new Statements([
                x_var.to_statement(),
                new Assignment(x_var.get_reference(), new BinaryOperation(Operator.PLUS, x_var.get_reference(), new Atom(10))),
                new FunctionCall('store', {args: [x_var.get_reference()]}).to_statement(),
                new Return(x_var.get_reference())
            ]))

            machine.execute(x_var.to_statement())
            expect(machine.evaluate(x_var.get_reference())).toEqual(0)

            machine.execute(f.to_statement())
            expect(machine.evaluate(new FunctionCall('f', {args: [new Atom(9)]}))).toEqual(10)

            expect(machine.evaluate(x_var.get_reference())).toEqual(0)
            expect(stored).toEqual(10)
        })
    })
})

describe('functions', () => {
    test('fibonacci-req', () => {
        const x_param = new VariableDeclaration(VariableType.I32, 'x')
        const fib = new Function('fib', [x_param], VariableType.I32,
            new If(
                new BinaryOperation(Operator.LESS_THAN_OR_EQUAL, x_param.get_reference(), new Atom(1)),
                new Return(new Atom(1)),
                {else_body: new Return(
                    new BinaryOperation(
                        Operator.PLUS,
                        x_param.get_reference(),
                        new FunctionCall('fib', {args: [
                            new BinaryOperation(Operator.MINUS, x_param.get_reference(), new Atom(1))
                        ]})
                    )
                )}
            )
        )
        const machine = new IcExecutionMachine()
        machine.execute(fib.to_statement())
        expect(machine.evaluate(new FunctionCall('fib', {args: [new Atom(10)]}))).toEqual(55)
    })

    test('fibonacci-iter', () => {
        const x_param = new VariableDeclaration(VariableType.I32, 'x')
        const y_param = new VariableDeclaration(VariableType.I32, 'y', {
            initial_value: new Atom(1)
        })

        const fib = new Function('fib', [x_param], VariableType.I32, new Statements([
            y_param.to_statement(),
            new While(
                new BinaryOperation(
                    Operator.GREATER_THAN,
                    x_param.get_reference(),
                    new Atom(1)
                ),
                new Statements([
                    new Assignment(
                        y_param.get_reference(),
                        new BinaryOperation(Operator.PLUS, y_param.get_reference(), x_param.get_reference())
                    ),
                    new Assignment(
                        x_param.get_reference(),
                        new BinaryOperation(Operator.MINUS, x_param.get_reference(), new Atom(1))
                    )
                ])
            ),
            new Return(y_param.get_reference())
        ]))

        const machine = new IcExecutionMachine()
        machine.execute(fib.to_statement())
        expect(machine.evaluate(new FunctionCall('fib', {args: [new Atom(10)]}))).toEqual(55)
    })

    test('factorial-req', () => {
        const x_param = new VariableDeclaration(VariableType.I32, 'x')
        const fib = new Function('fac', [x_param], VariableType.I32,
            new If(
                new BinaryOperation(Operator.LESS_THAN_OR_EQUAL, x_param.get_reference(), new Atom(1)),
                new Return(new Atom(1)),
                {else_body: new Return(
                    new BinaryOperation(
                        Operator.MULTIPLY,
                        x_param.get_reference(),
                        new FunctionCall('fac', {args: [
                            new BinaryOperation(Operator.MINUS, x_param.get_reference(), new Atom(1))
                        ]})
                    )
                )}
            )
        )
        const machine = new IcExecutionMachine()
        machine.execute(fib.to_statement())
        expect(machine.evaluate(new FunctionCall('fac', {args: [new Atom(10)]}))).toEqual(3628800)
    })
})

import { IcExecutionMachine } from '@dist/ic-execution-machine'
import { Atom } from '@dist/ic/atom'
import { BinaryOperation, Operator } from '@dist/ic/binary-operation'
import { Expression } from '@dist/ic/expression'
import { VariableDeclaration, VariableType } from '@dist/ic/variable-declaration'

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

    test('variable-reference', () => {
        const machine = new IcExecutionMachine()
        const variable = new VariableDeclaration(VariableType.I32, 'x', {
            initial_value: new Atom(78)
        })
        machine.execute(variable.to_statement())
        expect(machine.evaluate(variable.get_reference())).toBe(78)
    })


})

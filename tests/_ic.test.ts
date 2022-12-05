import { Assignment } from '@dist/ic/assignment'
import { Atom } from '@dist/ic/atom'
import { BinaryOperation, Operator } from '@dist/ic/binary-operation'
import { Break } from '@dist/ic/break'
import { Continue } from '@dist/ic/continue'
import { Declaration } from '@dist/ic/declaration'
import { DeclarationStatement } from '@dist/ic/declaration-statement'
import { DoWhile } from '@dist/ic/do-while'
import { Expression } from '@dist/ic/expression'
import { ExpressionStatement } from '@dist/ic/expression-statement'
import { Function } from '@dist/ic/function'
import { FunctionCall } from '@dist/ic/function-call'
import { ICNode, ICNodeType } from '@dist/ic/ic-node'
import { If } from '@dist/ic/if'
import { Return } from '@dist/ic/return'
import { Statement } from '@dist/ic/statement'
import { Statements } from '@dist/ic/statements'
import { VariableDeclaration, VariableType } from '@dist/ic/variable-declaration'
import { VariableReference } from '@dist/ic/variable-reference'
import { While } from '@dist/ic/while'

test('assignment', () => {
    const comment = 'mars'
    const variable = new VariableDeclaration(VariableType.I32, 'hello')
    const expression = new Atom('world')
    const assignment = new Assignment(variable.get_reference(), expression, {comment})
    expect(assignment.node_type).toEqual(ICNodeType.STATEMENT)
    expect(assignment.variable_reference).toEqual(variable.get_reference())
    expect(assignment.expression).toEqual(expression)
    expect(assignment.comment).toEqual(comment)
})

test('atom', () => {
    const comment = 'negative'
    const value = -1
    const expression = new Atom(value, {comment})
    expect(expression.node_type).toEqual(ICNodeType.EXPRESSION)
    expect(expression.value).toEqual(value)
    expect(expression.comment).toEqual(comment)
})

test('binary-operation', () => {
    const comment = 'result is 1'
    const left = new Atom(0)
    const right = new Atom(1)
    const operation = new BinaryOperation(Operator.OR, left, right, {comment})
    expect(operation.node_type).toEqual(ICNodeType.EXPRESSION)
    expect(operation.left_operand).toEqual(left)
    expect(operation.right_operand).toEqual(right)
    expect(operation.operator).toEqual(Operator.OR)
    expect(operation.comment).toEqual(comment)

})

test('break', () => {
    const comment = 'the system'
    const b = new Break({comment})
    expect(b.node_type).toEqual(ICNodeType.STATEMENT)
    expect(b.comment).toEqual(comment)
})

test('continue', () => {
    const comment = 'building'
    const c = new Continue({comment})
    expect(c.node_type).toEqual(ICNodeType.STATEMENT)
    expect(c.comment).toEqual(comment)
})

test('declaration-statement', () => {
    const statement = new DeclarationStatement(new (class extends Declaration {}))
    expect(statement.node_type).toEqual(ICNodeType.STATEMENT)
    expect(statement.declaration).toBeTruthy()
    expect(statement.comment).toBe(undefined)
})

describe('declaration', () => {
    test('new', () => {
        const comment = 'x'
        const declaration = new (class extends Declaration {
            constructor() {
                super({comment})
            }
        })()
    
        expect(declaration.node_type).toEqual(ICNodeType.DECLARATION)
        expect(declaration.comment).toEqual(comment)
    })

    test('to-statement', () => {
        const declaration = new (class extends Declaration {})()
        const statement = declaration.to_statement()

        expect(statement.node_type).toEqual(ICNodeType.STATEMENT)
    })
})


test('expression-statement', () => {
    const statement = new ExpressionStatement(new (class extends Expression {}))
    expect(statement.node_type).toEqual(ICNodeType.STATEMENT)
    expect(statement.expression).toBeTruthy()
    expect(statement.comment).toBe(undefined)
})

describe('expression', () => {
    test('new', () => {
        const comment = 'x'
        const expression = new (class extends Expression {
            constructor() {
                super({comment})
            }
        })()

        expect(expression.node_type).toEqual(ICNodeType.EXPRESSION)
        expect(expression.comment).toEqual(comment)
    })

    test('to-statement', () => {
        const expression = new (class extends Expression {})()
        const statement = expression.to_statement()

        expect(statement.node_type).toEqual(ICNodeType.STATEMENT)
    })
})

describe('function-call', () => {
    test('simple', () => {
        const comment = 'calling you'
        const args = [new Atom('yoyo')]
        const call = new FunctionCall('f', {args, comment})
        expect(call.node_type).toEqual(ICNodeType.EXPRESSION)
        expect(call.name).toEqual('f')
        expect(call.args).toEqual(args)
        expect(call.comment).toEqual(comment)
    })

    test('default-args', () => {
        const call = new FunctionCall('f')
        expect(call.args).toEqual([])
    })
})

test('function', () => {
    const f_comment = 'nice function'
    const params = [
        new VariableDeclaration(VariableType.I32, 'a', {comment: 'best param'}),
        new VariableDeclaration(VariableType.I32, 'b')
    ]
    const f = new Function('f', params, VariableType.VOID, new Statements([]), {comment: f_comment})
    expect(f.node_type).toEqual(ICNodeType.DECLARATION)
    expect(f.name).toEqual('f')
    expect(f.return_type).toEqual(VariableType.VOID)
    expect(f.body).toBeInstanceOf(Statements)
    expect(f.comment).toEqual(f_comment)
    expect(f.params).toEqual(params)
})

test('ic-node', () => {
    const comment = 'naked node'
    const node = new (class extends ICNode<ICNodeType.EXPRESSION> {
        constructor() {
            super(ICNodeType.EXPRESSION, {comment})
        }
    })()

    expect(node.node_type).toBe(ICNodeType.EXPRESSION)
    expect(node.comment).toBe(comment)
})

describe('if', () => {
    test('no-else', () => {
        const comment = 'what?'
        const condition = new Atom(false)
        const i = new If(condition, new Statements([]), {comment})
        expect(i.node_type).toEqual(ICNodeType.STATEMENT)
        expect(i.condition).toEqual(condition)
        expect(i.body).toBeInstanceOf(Statements)
        expect(i.else_body).toEqual(undefined)
        expect(i.comment).toEqual(comment)
    })

    test('with-else', () => {
        const comment = 'ATOM'
        const condition = new Atom(false)
        const i = new If(condition, new Statements([]), {comment, else_body: new Continue()})
        expect(i.node_type).toEqual(ICNodeType.STATEMENT)
        expect(i.condition).toEqual(condition)
        expect(i.body).toBeInstanceOf(Statements)
        expect(i.else_body).toBeInstanceOf(Continue)
        expect(i.comment).toEqual(comment)
    })
})

test('return', () => {
    const comment = 'result'
    const value = new Atom(-3)
    const r = new Return(value, {comment})
    expect(r.node_type).toEqual(ICNodeType.STATEMENT)
    expect(r.expression).toEqual(value)
    expect(r.comment).toEqual(comment)
})

test('statement', () => {
    const comment = 'x'
    const statement = new (class extends Statement {
        constructor() {
            super({comment})
        }
    })()

    expect(statement.node_type).toEqual(ICNodeType.STATEMENT)
    expect(statement.comment).toEqual(comment)
})

test('statements', () => {
    const comment = 'D&D'
    const body = [new Continue(), new Break()]
    const statement = new Statements(body, {comment})
    expect(statement.node_type).toEqual(ICNodeType.STATEMENT)
    expect(statement.statements).toEqual(body)
    expect(statement.comment).toEqual(comment)
})

describe('variable-definition', () => {
    test('default', () => {
        const name = 'a'
        const comment = 'b'
        const t = VariableType.I32
        const variable = new VariableDeclaration(t, name, {comment})
    
        expect(variable.node_type).toEqual(ICNodeType.DECLARATION)
        expect(variable.type).toEqual(t)
        expect(variable.name).toEqual(name)
        expect(variable.initial_value).toEqual(undefined)
        expect(variable.mutable).toEqual(false)
        expect(variable.comment).toEqual(comment)
    })

    test('mutable', () => {
        const variable = new VariableDeclaration(VariableType.I32, 'x', {mutable: true})
        expect(variable.mutable).toEqual(true)
    })

    test('initial-value', () => {
        const initial_value = new Atom(-69)
        const variable = new VariableDeclaration(VariableType.I32, 'x', {initial_value})
        expect(variable.initial_value).toEqual(initial_value)
    })

    test('get-reference', () => {
        const variable = new VariableDeclaration(VariableType.I32, 'x')
        expect(variable.get_reference().target).toEqual(variable)
    })
})

test('variable-reference', () => {
    const comment = 'referenceee'
    const variable = new VariableDeclaration(VariableType.VOID, 'x')
    const ref = new VariableReference(variable, {comment})
    expect(ref.node_type).toEqual(ICNodeType.EXPRESSION)
    expect(ref.target).toEqual(variable)
    expect(ref.comment).toEqual(comment)
})

test('while', () => {
    const comment = 'loop'
    const condition = new Atom(true)
    const body = new Continue()
    const w = new While(condition, body, {comment})
    expect(w.node_type).toEqual(ICNodeType.STATEMENT)
    expect(w.condition).toEqual(condition)
    expect(w.body).toEqual(body)
    expect(w.comment).toEqual(comment)
})

test('do-while', () => {
    const comment = 'loop'
    const condition = new Atom(true)
    const body = new Continue()
    const w = new DoWhile(condition, body, {comment})
    expect(w.node_type).toEqual(ICNodeType.STATEMENT)
    expect(w.condition).toEqual(condition)
    expect(w.body).toEqual(body)
    expect(w.comment).toEqual(comment)
})

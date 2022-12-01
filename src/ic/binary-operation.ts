import { Expression, ExpressionConstructorOptions } from './expression'

export enum Operator {
    OR,
    AND,
    EQUAL,
    NOT_EQUAL,
    LESS_THAN,
    GREATER_THAN,
}

export class BinaryOperation extends Expression {
    public constructor(
        public readonly operator: Operator,
        public readonly left_operand: Expression,
        public readonly right_operand: Expression,
        options?: ExpressionConstructorOptions
    ) {
        super(options)
    }
}
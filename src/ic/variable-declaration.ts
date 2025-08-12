import { Declaration, DeclarationConstructorOptions } from './declaration.js'
import { Expression } from './expression.js'
import { VariableReference } from './variable-reference.js'

export enum VariableType {
    VOID,
    I32
}

export interface VariableDeclarationConstructorOptions extends DeclarationConstructorOptions {
    initial_value?: Expression|undefined
    mutable?: boolean|undefined
}

export class VariableDeclaration extends Declaration {
    public readonly initial_value: Expression|undefined
    
    public readonly mutable: boolean

    private readonly reference: VariableReference

    public constructor(
        public readonly type: VariableType,
        public readonly name: string,
        options?: VariableDeclarationConstructorOptions
    ) {
        super(options)
        this.initial_value = options?.initial_value
        this.mutable = options?.mutable === true
        this.reference = new VariableReference(this)
    }

    public get_reference(): VariableReference {
        return this.reference
    }
}

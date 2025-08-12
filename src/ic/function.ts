import { Declaration, DeclarationConstructorOptions } from './declaration.js'
import { Statement } from './statement.js'
import { VariableDeclaration, VariableType } from './variable-declaration.js'

export class Function extends Declaration {
    public constructor(
        public readonly name: string,
        public readonly params: VariableDeclaration[],
        public readonly return_type: VariableType,
        public readonly body: Statement,
        options?: DeclarationConstructorOptions
    ) {
        super(options)
    }
}
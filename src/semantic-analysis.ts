import { DeclarationType } from './ast/declaration'
import { ProductionNodeType } from './ast/production-node'
import { Source } from './ast/source'
import { Terminal } from './ast/terminal'
import { Variable } from './ast/variable'
import { CodeError } from './error'

function starts_with_lowercase(name: string): boolean {
    const first = name.charAt(0)
    return first === first.toLowerCase()
}

export function analyze(file: string, source: Source): void {
    const terminals = new Map<string, Terminal>()
    const variables = new Map<string, Variable>()

    for (const declaration of source.declarations) {
        const name = declaration.name;

        switch (declaration.type) {
            case DeclarationType.TERMINAL: {
                if (!starts_with_lowercase(name))
                    throw new CodeError(file, declaration.location, `Declared terminal \`${name}\` have to start with a lower-case letter.`)

                if (terminals.has(name)) {
                    const other = terminals.get(name)!
                    throw new CodeError(file, declaration.location, `Duplicate terminal name \`${name}\` detected. Firstly used at ${other?.location}.`)
                }

                terminals.set(name, declaration as Terminal)
                break
            }

            case DeclarationType.VARIABLE: {
                if (starts_with_lowercase(name))
                    throw new CodeError(file, declaration.location, `Declared variable \`${name}\` have to start with an upper-case letter.`)

                if (variables.has(name)) {
                    const other = variables.get(name)!
                    throw new CodeError(file, declaration.location, `Duplicate variable name \`${name}\` detected. Firstly used at ${other?.location}.`)
                }

                variables.set(name, declaration as Variable)
                break
            }

            default:
                throw new Error('Lack of implementation.')
        }
    }

    for (const variable of variables.values()) {
        for (const production of variable.productions) {
            for (const node of production.nodes) {
                switch (node.type) {
                    case ProductionNodeType.TERMINAL_USAGE: {
                        const terminal = terminals.get(node.name)

                        if (terminal === undefined)
                            throw new CodeError(file, node.location, `Using undeclared terminal \`${node.name}\`.`)

                        break
                    }

                    case ProductionNodeType.VARIABLE_USAGE: {
                        const variable = variables.get(node.name)

                        if (variable === undefined)
                            throw new CodeError(file, node.location, `Using undeclared variable \`${node.name}\`.`)
                        break
                    }
                    
                    default:
                        throw new Error('Lack of implementation.')
                }
            }
        }
    }
}

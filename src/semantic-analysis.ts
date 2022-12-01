import { DeclarationType } from './ast/declaration'
import { Delimiter } from './ast/delimiter'
import { ProductionNode, ProductionNodeType } from './ast/production-node'
import { Source } from './ast/source'
import { Terminal } from './ast/terminal'
import { TerminalUsage } from './ast/terminal-usage'
import { Variable } from './ast/variable'
import { VariableUsage } from './ast/variable-usage'
import { CodeError } from './error'

export interface TerminalsMap {
    terminals: Terminal[]
    nodes:     ProductionNode[]
}

function starts_with_lowercase(name: string): boolean {
    const first = name.charAt(0)
    return first === first.toLowerCase()
}

export function analyze(file: string, source: Source): void {
    const terminals = new Map<string, Terminal>()
    const variables = new Map<string, Variable>()
    let delimiter: Delimiter|undefined

    // Populates `terminals` and `variables` maps.
    // Detects declaration names that trasgress naming convention.
    // Detects duplicate declarations of terminals/variables.

    for (const declaration of source.declarations) {
        const name = declaration.name

        switch (declaration.type) {
            case DeclarationType.DELIMITER: {
                if (delimiter !== undefined) {
                    throw new CodeError(file, declaration.location, `Duplicate delimiter declaration detected. Firstly declared at ${delimiter.location}.`)
                } else {
                    delimiter = declaration as Delimiter
                }
                break
            }

            case DeclarationType.TERMINAL: {
                if (!starts_with_lowercase(name))
                    throw new CodeError(file, declaration.location, `Declared terminal \`${name}\` have to start with a lower-case letter.`)

                if (terminals.has(name)) {
                    const other = terminals.get(name)!
                    throw new CodeError(file, declaration.location, `Duplicate terminal \`${name}\` declaration detected. Firstly declared at ${other.location}.`)
                }

                terminals.set(name, declaration as Terminal)
                break
            }

            case DeclarationType.VARIABLE: {
                if (starts_with_lowercase(name))
                    throw new CodeError(file, declaration.location, `Declared variable \`${name}\` have to start with an upper-case letter.`)

                if (variables.has(name)) {
                    const other = variables.get(name)!
                    throw new CodeError(file, declaration.location, `Duplicate variable \`${name}\` declaration detected. Firstly declared at ${other.location}.`)
                }

                variables.set(name, declaration as Variable)
                break
            }

            default:
                throw new Error('Lack of implementation.')
        }
    }

    // Detects if there are no variable at all.

    if (variables.size === 0) {
        throw new CodeError(file, source.location, `No variables declared. At least one required.`)
    }

    // Detects usage of undeclared terminals/variables.

    for (const variable of variables.values()) {
        for (const production of variable.productions) {
            for (const node of production.nodes) {
                switch (node.type) {
                    case ProductionNodeType.TERMINAL_USAGE: {
                        const terminal = terminals.get(node.name)

                        if (terminal === undefined) {
                            throw new CodeError(file, node.location, `Using undeclared terminal \`${node.name}\`.`)
                        }

                        (node as TerminalUsage).reference = terminal
                        break
                    }

                    case ProductionNodeType.VARIABLE_USAGE: {
                        const variable = variables.get(node.name)

                        if (variable === undefined) {
                            throw new CodeError(file, node.location, `Using undeclared variable \`${node.name}\`.`)
                        }

                        (node as VariableUsage).reference = variable
                        break
                    }
                    
                    default:
                        throw new Error('Lack of implementation.')
                }
            }
        }
    }

    // Detects loops generated by left-recursion.

    left_recursion_check_for:
    for (const variable of variables.values()) {
        const seen = new Set<string>()
        const resolutions: {current: Variable, previous: Variable[]}[] = [{current: variable, previous: []}]

        while (true) {
            const cursor = resolutions.shift()

            if (cursor === undefined)
                break left_recursion_check_for

            if (seen.has(cursor.current.name)) {
                const names = cursor.previous.map(x => x.name)

                while (names[0] !== cursor.current.name)
                    names.shift()

                const path = `${names.join('\u2192')}\u2192${cursor.current.name}`
                throw new CodeError(file, variable.location, `Left-recursion loop detected: ${path}`)
            }

            seen.add(cursor.current.name)

            for (const production of cursor.current.productions) {
                for (const node of production.nodes) {
                    if (node.type === ProductionNodeType.TERMINAL_USAGE) // no loop can occur through this production
                        break

                    if (node.type === ProductionNodeType.VARIABLE_USAGE) {
                        const target = (node as VariableUsage).reference
                        resolutions.push({current: target, previous: [...cursor.previous, cursor.current]})

                        if (!target.epsilon)
                            break
                    }
                }
            }
        }
    }

    // Detects ambiguous variables.
    
    for (const variable of variables.values()) {
        const used_terminals = new Map<string, Terminal>()

        for (const terminals_map of variable.terminals_maps) {
            for (const terminal of terminals_map.terminals) {
                const used = used_terminals.get(terminal.name)
                
                if (used !== undefined) {
                    throw new CodeError(file, variable.location, `Variable \`${variable.name}\` is ambiguous, terminal \`${terminal.name}\` leads to multiple productions.`)
                }

                used_terminals.set(terminal.name, terminal)
            }
        }
    }
}

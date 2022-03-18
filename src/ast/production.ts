import { Node } from './node'
import { ProductionNode, ProductionNodeType } from './production-node'
import { Locatable, Location } from '../source/location'
import { InternalError } from '../error'
import { VariableUsage } from './variable-usage'
import { TerminalUsage } from './terminal-usage'
import { TerminalsMap } from '../semantic-analysis'
import { Terminal } from './terminal'

export class Production extends Node {
    private _terminals_maps: TerminalsMap[]|undefined

    public constructor(
        location: Location,
        public readonly nodes: ProductionNode[]
    ) {
        super(location)
    }

    public is_epsilon(): boolean {
        return this.nodes.length === 0
    }

    public get terminals_maps(): TerminalsMap[] {
        if (this._terminals_maps === undefined) {
            this._terminals_maps = []

            for (let i = 0; i < this.nodes.length; ++i) {
                const node                  = this.nodes[i]
                const terminals: Terminal[] = []
                let   epsilon_found         = false

                if (node.type === ProductionNodeType.TERMINAL_USAGE) {
                    terminals.push((node as TerminalUsage).reference)
                } else if (node.type === ProductionNodeType.VARIABLE_USAGE) {
                    const variable = (node as VariableUsage).reference
                    
                    for (const map of variable.terminals_maps) {
                        for (const terminal of map.terminals) {
                            terminals.push(terminal)
                        }
                    }

                    epsilon_found = variable.epsilon
                } else {
                    throw new InternalError(`unknown production node type \`${node.type}\``)
                }

                this._terminals_maps.push({
                    terminals,
                    nodes: this.nodes.slice(i)
                })
                
                if (!epsilon_found)
                    break
            }
        }

        return this._terminals_maps
    }

    public static create_epsilon(locatable: Locatable): Production {
        return new Production(locatable.get_location(), [])
    }
}

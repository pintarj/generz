import { Node } from './node.js'
import { Location } from '../source/location.js'
import { Variable } from './variable.js'
import { Terminal } from './terminal.js'
import { Delimiter } from './delimiter.js'

export enum DeclarationType {
    TERMINAL = 'TERMINAL',
    VARIABLE = 'VARIABLE',
    DELIMITER = 'DELIMITER'
}

export abstract class Declaration extends Node {
    protected constructor(
        location: Location,
        public readonly type: DeclarationType,
        public readonly name: string
    ) {
        super(location)
    }

    public is_variable(): this is Variable {
        return this.type === DeclarationType.VARIABLE
    }

    public is_terminal(): this is Terminal {
        return this.type === DeclarationType.TERMINAL
    }

    public is_delimiter(): this is Delimiter {
        return this.type === DeclarationType.DELIMITER
    }
}

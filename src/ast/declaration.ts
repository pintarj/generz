import { Node } from './node'
import { Location } from '../source/location'
import { Variable } from './variable'
import { Terminal } from './terminal'
import { Delimiter } from './delimiter'

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

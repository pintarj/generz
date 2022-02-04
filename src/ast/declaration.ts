import { Node } from './node'
import { Location } from '../source/location'
import { Variable } from './variable'
import { Terminal } from './terminal'

export enum DeclarationType {
    TERMINAL = 'TERMINAL',
    VARIABLE = 'VARIABLE'
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
}

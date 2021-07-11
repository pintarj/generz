import { Locatable } from './source/location';

export enum GenerzErrorType {
    ARGS,
    CODE,
    INTERNAL
}

export class GenerzError extends Error {
    protected constructor(
        public readonly type: GenerzErrorType,
        message: string
    ) {
        super(message);
    }
}

export class ArgsError extends GenerzError {
    public constructor(
        public readonly description: string
    ) {
        super(GenerzErrorType.ARGS, `${description}`);
    }
}

export class CodeError extends GenerzError {
    public constructor(
        public readonly file: string,
        public readonly location: Locatable,
        public readonly description: string
    ) {
        super(GenerzErrorType.CODE, `error: ${file}:${location.get_location()} ${description}`);
    }
}

export class InternalError extends GenerzError {
    public constructor(
        public readonly description: string
    ) {
        super(GenerzErrorType.INTERNAL, `INTERNAL ERROR: ${description}`);
    }
}

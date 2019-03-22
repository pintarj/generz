
export enum GenerzErrorType {
    ARGS,
    CODE,
    INTERNAL
}

export class GenerzError extends Error {
    protected constructor(readonly type: GenerzErrorType, readonly message: string) {
        super(message);
    }
}

export class ArgsGenerzError extends GenerzError {
    private constructor(message: string) {
        super(GenerzErrorType.ARGS, message);
    }

    public static throw(message: string) {
        throw new ArgsGenerzError(`args error: ${message}`);
    }
}

export class CodeGenerzError extends GenerzError {
    private constructor(readonly file: string, message: string) {
        super(GenerzErrorType.CODE, `error: ${file}:?:? ${message}`);
    }

    public static throw(file: string, message: string) {
        throw new CodeGenerzError(file, message);
    }
}

export class InternalGenerzError extends GenerzError {
    private constructor(message: string) {
        super(GenerzErrorType.INTERNAL, `INTERNAL ERROR: ${message}`);
    }

    public static throw(message: string) {
        throw new InternalGenerzError(message);
    }
}


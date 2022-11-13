
export enum ICNodeType {
    DECLARATION,
    EXPRESSION,
    STATEMENT
}

export interface ICNodeConstructorOptions {
    comment?: string|undefined
}

export abstract class ICNode<T> {
    public readonly node_type: T

    public comment: string|undefined

    public constructor(type: T, options?: ICNodeConstructorOptions) {
        this.node_type = type
        this.comment = options?.comment
    }
}

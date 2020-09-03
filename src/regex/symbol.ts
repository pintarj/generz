
export class Symbol {
    public constructor(public readonly code_point: number) {
        // ...
    }

    public to_string(): string {
        return String.fromCodePoint(this.code_point);
    }
}

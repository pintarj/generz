
export class Symbol {
    public constructor(public readonly code_point: number) {
        // ...
    }

    public is_epsilon(): boolean {
        return false;
    }

    public to_string(): string {
        return String.fromCodePoint(this.code_point);
    }
}

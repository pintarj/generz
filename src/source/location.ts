
export interface Locatable {
    get_location(): Location;
    toString(): string;
}

export class Point implements Locatable {
    public constructor(readonly line: number, readonly column: number) {

    }

    public get_location(): Location {
        return new Location(this, this);
    }

    public toString(): string {
        return `${this.line}:${this.column}`;
    }
}

export class Location implements Locatable {
    public constructor(readonly start: Point, readonly end: Point) {

    }

    public get_location(): Location {
        return this;
    }

    public is_point(): boolean {
        return this.start.line === this.end.line
            && this.start.column === this.end.column;
    }

    public toString(): string {
        return this.is_point()
            ? this.start.toString()
            : `${this.start}-${this.end}`;
    }
}

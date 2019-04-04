
export namespace source {
    export interface Locatable {
        get_location(): Location;
    }

    export class Point implements Locatable {
        public constructor(readonly line: number, readonly column: number) {

        }

        public get_location(): Location {
            return new Location(this, this);
        }
    }

    export class Location implements Locatable {
        public constructor(readonly start: Point, readonly end: Point) {

        }

        public get_location(): Location {
            return this;
        }
    }
}

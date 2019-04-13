import {Reader as ReaderInterface} from '../reader';
import {source as location} from './location';

export namespace source {
    export class Reader implements ReaderInterface {
        private line: number;
        private column: number;
        private current: string;
        private cache: string|null;

        public constructor(private reader: ReaderInterface) {
            this.line    = 1;
            this.column  = 0;
            this.current = '\a';
            this.cache   = null;
        }

        public read(): string {
            if (this.current === '')
                return '';

            if (this.current === '\n') {
                this.line += 1;
                this.column = 1;
            } else {
                this.column += 1;
            }

            if (this.cache === null) {
                this.current = this.reader.read();
            } else {
                this.current = this.cache;
                this.cache = null;
            }

            return this.current;
        }

        public revoke() {
            this.cache = this.current;

            if (this.current === '\n') {
                this.column -= 1;
                this.current = '\a';
            } else if (this.current !== '') {
                this.column -= 1;
            }
        }

        public get_point(): location.Point {
            return new location.Point(this.line, this.column);
        }
    }
}
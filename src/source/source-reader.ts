import { Reader } from '../reader';
import { Point } from './location';

export class SourceReader implements Reader {
    public readonly file: string; 
    private line: number;
    private column: number;
    private current: string;
    private cache: string|null;

    public constructor(private reader: Reader, options?: {file?: string}) {
        this.line    = 1;
        this.column  = 0;
        this.current = '\a';
        this.cache   = null;
        this.file    = options?.file || '<unknown>';
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

    public get_point(): Point {
        return new Point(this.line, this.column);
    }
}

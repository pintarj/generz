import * as fs from 'fs-extra';
import Args from './args';
import { SourceReader } from './source/source-reader';
import { StringReader } from './reader';

export default class Pipeline {
    public constructor(readonly args: Args) {

    }

    public run() {
        const source = fs.readFileSync(this.args.file, 'utf8');
        new SourceReader(new StringReader(source), {file: this.args.file});
        // TODO: continue with lexical analysis...
    }
}


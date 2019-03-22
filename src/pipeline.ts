import * as fs from 'fs-extra';
import Args from './args';

export default class Pipeline {
    public constructor(readonly args: Args) {

    }

    public run() {
        const source = fs.readFileSync(this.args.file, 'utf8');
        // TODO give source to reader
    }
}


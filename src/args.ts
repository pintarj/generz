import * as fs from 'fs-extra';
import * as yargs from 'yargs';
import {ArgsGenerzError} from './error';

export default class Args {
    readonly file: string;

    private constructor(args: any) {
        this.file = args.file;

        if (!fs.existsSync(this.file))
            ArgsGenerzError.throw(`source file \`${this.file}\` doesn't exists`);
    }

    public static parse() {
        const args = yargs
            .command('$0 <file>', 'compiles an .erz source file')
            .parse();

        return new Args(args);
    } 
}


#!/usr/bin/env node

import Args from './args';
import Pipeline from './pipeline';
import {ArgsGenerzError, CodeGenerzError, InternalGenerzError} from './error';

try {
    const args     = Args.parse();
    const pipeline = new Pipeline(args);
    pipeline.run();
} catch (error) {
    if (error instanceof ArgsGenerzError) {
        console.log(error.message);
        process.exit(1);
    } else if (error instanceof CodeGenerzError) {
        console.log(error.message);
        process.exit(2);
    } else if (error instanceof InternalGenerzError) {
        console.error(error.message);
        process.exit(3);
    } else {
        console.error(`UNHANDLED ERROR: ${error.toString ? error.toString() : error}`);
        process.exit(4);
    }
}


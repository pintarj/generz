#!/usr/bin/env node

import Args from './args';
import Pipeline from './pipeline';
import { ArgsError, CodeError, InternalError } from './error';

try {
    const args     = Args.parse();
    const pipeline = new Pipeline(args);
    pipeline.run();
} catch (error) {
    if (error instanceof ArgsError) {
        console.log(error.message);
        process.exit(1);
    } else if (error instanceof CodeError) {
        console.log(error.message);
        process.exit(2);
    } else if (error instanceof InternalError) {
        console.error(error.message);
        process.exit(3);
    } else {
        console.error(`UNHANDLED ERROR: ${error.toString ? error.toString() : error}`);
        process.exit(4);
    }
}


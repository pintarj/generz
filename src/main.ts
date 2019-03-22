#!/usr/bin/env node

import {ArgsGenerzError, CodeGenerzError, InternalGenerzError} from './error';

try {
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
        console.error(error.toString ? error.toString() : error);
        process.exit(4);
    }
}


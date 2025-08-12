#!/usr/bin/env node

import Args from './args.js'
import Pipeline from './pipeline.js'
import { ArgsError, CodeError, InternalError } from './error.js'

try {
    const args     = Args.parse()
    const pipeline = new Pipeline(args)
    pipeline.run()
} catch (error: unknown) {
    if (error instanceof ArgsError) {
        console.log(error.message)
        process.exit(1)
    } else if (error instanceof CodeError) {
        console.log(error.message)
        process.exit(2)
    } else if (error instanceof InternalError) {
        console.error(error.stack || error.message)
        process.exit(3)
    } else {
        const _err = error as any
        console.error(`UNHANDLED ERROR: ${_err.stack || _err.message || String(_err)}`)
        process.exit(4)
    }
}


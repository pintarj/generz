import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: 'tests\\/.+\\.test\\.ts$',
    globals: {
        'ts-jest': {
            tsconfig: 'tests/tsconfig.json'
        }
    },
    moduleNameMapper: {
        '^@dist/(.*)$': '<rootDir>/dist/$1'
    }
}

export default config

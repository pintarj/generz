
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: 'tests\\/.+\\.test\\.ts$',
    globals: {
        'ts-jest': {
            tsConfig: 'tests/tsconfig.json'
        }
    },
    moduleNameMapper: {
        '^@dist/(.*)$': '<rootDir>/dist/$1'
    }
};

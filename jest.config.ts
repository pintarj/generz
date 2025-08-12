import type { Config } from 'jest'
import { createDefaultEsmPreset } from 'ts-jest'

const presetConfig = createDefaultEsmPreset()

export default {
    ...presetConfig,
    moduleNameMapper: {
        '^@dist/(.*)$': '<rootDir>/dist/$1'
    }
} satisfies Config

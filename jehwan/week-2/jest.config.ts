import type { Config } from '@jest/types'

// Sync object
const config: Config.InitialOptions = {
  projects: [
    // e2e test
    {
      displayName: 'e2e',
      moduleFileExtensions: ['js', 'json', 'ts'],
      rootDir: 'test',
      testEnvironment: 'node',
      testRegex: '.e2e-spec.ts$',
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
    },
    // unit test
    {
      displayName: 'unit',
      moduleFileExtensions: ['js', 'ts'],
      rootDir: 'src',
      testEnvironment: 'node',
      testRegex: 'spec.ts$',
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
    },
  ],
}

export default config

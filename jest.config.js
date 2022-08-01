/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'screeps-jest',
  testMatch: ["**/test/unit/**/*.test.ts"]
};
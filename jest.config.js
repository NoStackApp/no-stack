module.exports = {
  roots: ['<rootDir>/src'],
  moduleDirectories: ['src', 'node_modules'],
  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss)$': `identity-obj-proxy`,
    '.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': `<rootDir>/__mocks__/file-mock.js`,
  },
  globals: {
    NODE_ENV: 'test',
  },
  testPathIgnorePatterns: [`node_modules`, `dist`],
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(t|j)sx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};

module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'stylelint',
    'cross-env NODE_ENV=test jest --bail --findRelatedTests',
    'git add',
  ],
  '*.json': ['eslint --fix', 'git add'],
  '*.{md,html}': ['prettier --write', 'git add'],
};

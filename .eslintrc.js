module.exports = {
    extends: ['airbnb-base', 'prettier'],
    plugins: ['prettier', 'promise', 'n', 'import'],
    rules: {
        indent: ['error', 4],
        'no-console': 0,
        'max-len': ['error', { code: 170 }],
        'prettier/prettier': 'error',
    },
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
};

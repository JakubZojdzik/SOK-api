module.exports = {
    extends: ['prettier', 'airbnb-base'],
    plugins: ['prettier', 'simple-import-sort'],
    rules: {
        'prettier/prettier': ['error'],
        indent: ['error', 4],
    },
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
};

module.exports = {
    extends: ['prettier'],
    plugins: ['prettier', 'simple-import-sort'],
    rules: {
        'prettier/prettier': ['error']
    },
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    }
};

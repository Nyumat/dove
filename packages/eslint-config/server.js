module.exports = {
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    env: {
        node: true,
        es6: true,
    },
    parserOptions: {
        sourceType: "module",
        parser: "@typescript-eslint/parser",
    },
    overrides: [
        {
            files: ["**/__tests__/**/*"],
            env: {
                jest: true,
            },
        },
    ],
};

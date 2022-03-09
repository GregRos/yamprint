module.exports = {
    "extends": [
        "eslint:recommended",
        "plugin:node/recommended",
        "prettier"
    ],
    "plugins": [
        "node",
        "prettier"
    ],
    "rules": {
        // These are from https://github.com/google/gts/blob/main/.eslintrc.json
        "prettier/prettier": "error",
        "block-scoped-var": "error",
        "eqeqeq": "error",
        "no-var": "error",
        "prefer-const": "error",
        "eol-last": "error",
        "prefer-arrow-callback": "error",
        "no-trailing-spaces": "error",
        "quotes": ["warn", "single", { "avoidEscape": true }],
        "no-restricted-properties": [
            "error",
            {
                "object": "describe",
                "property": "only"
            },
            {
                "object": "it",
                "property": "only"
            }
        ],
        // These are from https://github.com/google/eslint-config-google/blob/master/index.js
        "guard-for-in": "error",
        "no-caller": "error",
        "no-extend-native": "error",
        "no-extra-bind": "error",
        "no-invalid-this": "error",
        "no-multi-spaces": "error",
        "no-multi-str": "error",
        "no-new-wrappers": "error",
        "prefer-promise-reject-errors": "error",
    }
}

const allowedMagicNumbers = [
    // Common low numbers up to 6
    0, 1, 2, 3, 4, 5, 6,
    // Some negative numbers
    -0, -1, -2, -3, -4, -5,
    // Seconds/minutes/degrees
    60,
    // Degrees
    180, 360,
    // Hours
    24,
    // Approx days in year
    365,
    // Some powers of 10, including negative.
    10 ** -3, 10 ** -2, 10 ** -1, 10 ** 1, 10 ** 2, 10 ** 3,
    // Has self-explanatory uses: midpoint, etc.
    0.5,
    // Bitmaps
    0xf, 0xff, 0xfff, 0xffff, 0xffffffff,
    // bigints
    "1n", "2n", "10n", "100n", "1000n", "-1n", "-2n",
]

// I'd like to follow the Google style, but the reality is that we have A LOT of code that uses double quotes.
// Changing them all would be a massive transformation. It would mess up the history, be hard to get used to,
// Etc. And there is no point. There is no difference between them.
const quoteConfig = ["error", "double", {avoidEscape: true}];

const namingConvention = [{
    // Most things should be camelCase or strictCamelCase.
    selector: "default",
    format: "camelCase",
    leadingUnderscore: "forbid",
    trailingUnderscore: "forbid"
}, {
    // Only CONST variables can be UPPER_CASE
    selector: "variable",
    modifiers: "const",
    format: ["camelCase", "UPPER_CASE"]
}, {
    // _is required for private members
    selector: "memberLike",
    modifiers: "private",
    trailingUnderscore: "require"
}, {
    // Meaningless variable names that are sometimes used.
    // They aren't even short.
    selector: "variable",
    custom: {
        // Not allowed:
        // * 'tmp' or 'temp' - temporary what?
        // * sth, something, some, thing, etc. - totally meaningless. if you want a meanigless variable, just use a letter.
        // * whatever, unknown, any - if you don't know what this is, how should we?
        // * asd, adf, abc, xyz - meaningless names made by pressing random keys.
        // Note that you CAN have single-letter variable names.
        regex: /^(tmps?|temps?|sths?|somethings?|somethigns?|some|things?|whatevers?|unknowns?|any|asd|adf|abc|xyz)$/,
        match: false
    }
}]

module.exports = {
    extends: [
        "local-google-eslint-config"
    ],
    // Warn - used for things that might be bugs, but you can use anyway with a comment
    // Error - used for style things that have no use. You'll never need to do these. Probably.
    // "Warn" isn't actually optional. Most executions will happen with warnings-as-errors.
    rules: {

        // OVERRIDES
        // x == null is allowed because it is predictable.
        eqeqeq: ["error", "always", {"null": "ignore"}],

        // I'd like to follow the Google style, but the reality is that we have A LOT of code that uses double quotes.
        // Changing them all would be a massive transformation. It would mess up the history, be hard to get used to,
        // Etc. And there is no point. There is no difference between them.
        quotes: quoteConfig,

        // This might be a bug, but has lots of legitimate uses.
        "no-unsafe-finally": "warn",

        // I know the issues. But enforcing braces seems ugly to me.
        "no-case-declarations": "off",

        // CUSTOM

        // This is a common error, such as using `map` in place of `forEach`.
        "array-callback-return": "warn",

        // Probable bug
        "no-self-compare": "warn",

        // If the condition is in the same line as the statement,
        // it can't be confused. But multi-line block statements without curly
        // can cause mistakes.
        // Prettier is set up like this, so this isn't fully necessary.
        curly: ["error", "multi-line"],

        // It's standard. You should only use [] notation in special cases.
        "dot-notation": "error",

        // The default is 4. That's good enough.
        "max-depth": "warn",

        // This is the absolute maximum that is understandable.
        // The default of 10 is crazy.
        "max-nested-callbacks": ["warn", 3],

        // The default is 3 (which I like), but is too far from our current code
        "max-params": ["warn", 4],

        // Default is 'starred block'
        "multiline-comment-style": "error",

        // Shouldn't be needed and is unusual.
        "new-cap": "warn",

        // If you're using eval, explain why with a comment.
        "no-eval": "warn",

        // It's unusual and pointless. There is no reason to have more than one way to write a
        // floating point number.
        "no-floating-decimal": "error",

        // These are NEVER useful unless you're doing something incredibly weird.
        "no-implied-eval": "error",

        // Obsolete, useless property
        "no-iterator": "error",

        // Comment and explain why you're using it.
        "no-labels": "warn",

        // Consistent style - prefer else if.
        "no-lonely-if": "error",

        // My definition of "magic number" is lax. Many numbers have obvious significance.
        // This is a bit weird in that there is a pre-approved list of numbers
        // But I think if used with absolutes, this rule is bad.
        "no-magic-numbers": ["warn", {
            ignore: allowedMagicNumbers
        }],

        // If you're using a random 'new' and discarding the value, something is wrong.
        "no-new": "warn",

        // Pointless
        "no-new-object": "error",

        // What are you doing with these?
        "no-new-wrappers": "warn",

        // Deprecated property.
        "no-proto": "error",

        // What are you doing here?
        // Do you actually need this? What for?
        "no-sequences": "warn",

        // This should never be done except in very odd circumstances.
        "no-throw-literal": "warn",

        // This is a style issue honestly
        "no-unneeded-ternary": "error",

        // Useless
        "no-unused-expressions": "error",

        // Useless
        "no-useless-computed-key": "error",

        // Useless
        "no-useless-rename": "error",

        // Useless
        "no-useless-return": "error",

        // Var is almost never needed.
        "no-var": "warn",

        // Void operators are unknown to most developers.
        "no-void": "warn",

        // Makes objects much more readable.
        "object-shorthand": "error",

        // LOVE it, not going to enforce
        // prefer-destructuring": "error"

        // Numeric literals are cool. Use them.
        "prefer-numeric-literals": "error",

        // There is almost no reason to use 'arguments' nowadays.
        "prefer-rest-params": "warn",

        // LOVE it, not going to enforce
        // "prefer-template": "error"

        // Is quite a common style standard.
        "spaced-comment": "error",

        // There is never a reason not to have a symbol description.
        "symbol-description": "error",

        "overrides": [
            {
                // These are from https://github.com/google/gts/blob/main/.eslintrc.json
                "files": ["**/*.ts", "**/*.tsx"],
                "parser": "@typescript-eslint/parser",
                "extends": [
                    // We're NOT using :recommended. Unlike eslint:recommended, which is pretty good,
                    // this one is crazy. It's for people who live in a magical fairy world, where they also only write C#.
                    // It has rules like prohibiting `require`, it has 6 different rules that interfere with using `any`
                    // etc, etc.
                ],
                "rules": {
                    // BROKEN
                    "node/no-missing-import": "off",
                    "node/no-empty-function": "off",
                    "node/no-unsupported-features/es-syntax": "off",
                    "node/no-missing-require": "off",
                    "node/shebang": "off",

                    // TS VERSIONS OF ESLINT RULES

                    // There is no legitimate use for default params before regular ones. It's just a mistake.
                    "default-param-last": "off",
                    "@typescript-eslint/default-param-last": "error",

                    // Dupe class members are just an error.
                    "no-dupe-class-members": "off",
                    "@typescript-eslint/node-dupe-class-members": "error",

                    // Duplicate imports increase the size of the imports block unnecessarily.
                    // It's complicated enough as it is.
                    "no-duplicate-imports": "off",
                    "@typescript-eslint/no-duplicate-imports": "error",

                    // Again, basically no legitimate uses.
                    "no-implied-eval": "off",
                    "@typescript-eslint/no-implied-eval": "error",

                    "no-loss-of-precision": "off",
                    "@typescript-eslint/no-loss-of-precision": "error",

                    "no-magic-numbers": "off",
                    "@typescript-eslint/no-magic-numbers": ["error", {
                        ignore: allowedMagicNumbers
                    }],

                    "no-throw-literal": "off",
                    "@typescript-eslint/no-throw-literal": "error",

                    "no-unused-expressions": "off",
                    "@typescript-eslint/no-unused-expressions": "error",

                    "no-unused-vars": "off",
                    "@typescript-eslint/no-unused-vars": "error",

                    "no-useless-constructor": "off",
                    "@typescript-eslint/no-useless-constructor": "error",

                    "quotes": "off",
                    "@typescript-eslint/quotes": quoteConfig,

                    // NAMING CONVENTION

                    "@typescript-eslint/naming-convention": ["warn", namingConvention],

                    // SUBSET OF :recommended
                    // Unlike eslint:recommended, I'm going to explain why we need these.

                    // Non-consecutive overloads are unclear and confusing.
                    "@typescript-eslint/adjacent-overload-signatures": "error",

                    // This is never needed. It still allows awaiting something that MIGHT be awaitable.
                    "@typescript-eslint/await-thenable": "error",

                    // The default options allow `ts-expect-error` with a comment. That's good enough.
                    "@typescript-eslint/ban-ts-comment": "error",

                    // Only normalize type names. Don't restrict the use of any types.
                    "@typescript-eslint/ban-types": {
                        String: {
                            message: "Use `string` instead",
                            fixWith: "string"
                        },
                        Number: {
                            message: "Use `number` instead.",
                            fixWith: "number"
                        },
                        "{}": {
                            message: "Use `object` instead",
                            fixWith: "object"
                        },
                        Symbol: {
                            message: "Use `symbol` instead.",
                            fixWith: "symbol"
                        },
                        Boolean: {
                            message: "Use `boolean` instead.",
                            fixWith: "boolean"
                        }
                    },

                    // Empty interfaces are useless
                    "@typescript-eslint/no-empty-interface": "error",

                    // Useless non-null assertions are useless
                    "@typescript-eslint/no-extra-non-null-assertion": "error",

                    // This is the cause of many bugs. If you want this to execute and don't care
                    // if it fails, add an empty .catch(() => {}).
                    "@typescript-eslint/no-floating-promises": "error",

                    // This is almost always a bug.
                    "@typescript-eslint/no-for-in-array": "warn",

                    // Consistent style. Redundant type information makes code harder to read.
                    "@typescript-eslint/no-inferrable-types": "error",

                    // I've never seen this done, but it is probably a mistake.
                    "@typescript-eslint/no-misused-new": "warn",

                    // Cause of many bugs.
                    "@typescript-eslint/no-misused-promises": "warn",

                    // Namespaces are an odd, sort-of deprecated, legacy construct. The language
                    // recommends against using them.
                    "@typescript-eslint/no-namespace": "warn",

                    // This is probably a mistake.
                    "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",

                    // Unnecessary type info makes code harder to read.
                    "@typescript-eslint/no-unnecessary-type-assertion": "error",

                    // Unnecessary type info makes code harder to read.
                    "@typescript-eslint/no-unnecessary-type-constraint": "error",

                    // If you DO use namespaces, the `module` keyword is just confusing.
                    // There is no use, so this isn't a 'warn'.
                    "@typescript-eslint/prefer-namespace-keyword": "error",

                    // These are obsolete but have some, very few, legitimate uses.
                    "@typescript-eslint/triple-slash-reference": "warn",

                    // NON :RECOMMENDED

                    // Normalize type names. Different names for the same type are confusing.
                    "@typescript-eslint/array-type": ["error", "array"],

                    // Normalize 'x as T` vs `<T>x`. This is the more common and accepted form today.
                    // Two types of syntax for exactly the same thing is confusing.
                    "@typescript-eslint/consistent-type-assertions": ["error", {
                        assertionStyle: "as"
                    }],

                    // These are pointless.
                    "@typescript-eslint/no-confusing-non-null-assertion": "error",

                    // Prefer more concise, cleaner code.
                    "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",

                    // This is useful when strict null checking is enabled.
                    "@typescript-eslint/no-unnecessary-condition": ["warn", {
                        allowConstantLoopConditions: true
                    }],

                    // Cleaner code.
                    "@typescript-eslint/no-unnecessary-qualifier": "error",

                    // Using an indexed for loop when not needed is confusing.
                    "@typescript-eslint/prefer-for-of": "warn",

                    // ?. makes for more readable, cleaner code.
                    "@typescript-eslint/prefer-optional-chain": "warn",

                    // This makes code more consistent and instantly makes async functions recognizable.
                    // However, there are legitimate reasons not to follow it for specific functions.
                    "@typescript-eslint/promise-function-async": "warn"
                },
                "parserOptions": {
                    "ecmaVersion": 2018,
                    "sourceType": "module"
                }
            }

        ]
    }
}

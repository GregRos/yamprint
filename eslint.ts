/* tslint:disable */
import {ESLintRules} from "eslint/rules";
import { TSESLint } from '@typescript-eslint/utils';
import {} from "@typescript-eslint/types"
const rules: ESLintRules = {
    "prettier/prettier": "error",
    "block-scoped-var": "error",
    "eqeqeq": ["error", "always", {"null":  "ignore"}],
    "no-var": "error",
    "prefer-const": "error",
    "eol-last": "error",
    "prefer-arrow-callback": "error",
    "no-trailing-spaces": "error",
    "quotes": ["warn", "single", { "avoidEscape": true }],
    "brace-style": ["error", "1tbs"],
    "comma-spacing": "off",
    "comma-dangle": "error",
    "array-bracket-spacing": ["error", "never"],
    "consistent-this": ["error"],
    "constructor-super": ["error"],
    "dot-location": ["error", "property"],
    "func-call-spacing": [""]


}

function f(a = 0, b: number) {}
const rsRules = {
    "adjacent-overload-signatures": "warn",
    "array-type": "array",
    "comma-spacing": "error",
    "comma-dangle":
}

const tsRules = {
    "@typescript-eslint/adjacnet-overload": "warn"
}

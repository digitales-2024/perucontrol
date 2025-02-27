import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import reactPlugin from "eslint-plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
        plugins: {
            reactPlugin,
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            "react/jsx-boolean-value": "error",
            "react/jsx-closing-bracket-location": "error",
            "react/jsx-closing-tag-location": "error",
            "react/jsx-one-expression-per-line": "error",
            "react/jsx-pascal-case": "error",
            "react/jsx-no-useless-fragment": "error",
            "react/jsx-tag-spacing": "error",
            "react/self-closing-comp": "error",
        },
    },
    {
        rules: {
            "indent": ["error", 4],
            "brace-style": ["error", "allman"],
            "no-tabs": "off",
            "quotes": ["error", "double"],
            "semi": ["error", "always"],
            "semi-spacing": ["error", { "before": false, "after": true }],
            "camelcase": [
                "error",
                {
                    "ignoreDestructuring": true,
                    "ignoreImports": true,
                    "ignoreGlobals": true,
                },
            ],
            "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 1 }],
            "prefer-const": "error",
            "no-const-assign": "error",
            "no-var": "error",
            "array-callback-return": "error",
            "prefer-template": "error",
            "template-curly-spacing": "error",
            "no-useless-escape": "error",
            "wrap-iife": "error",
            "no-loop-func": "error",
            "default-param-last": "error",
            "space-before-function-paren": ["error", "never"],
            "space-before-blocks": "error",
            "no-param-reassign": "error",
            "function-paren-newline": "error",
            "comma-dangle": ["error", "always-multiline"],
            "arrow-spacing": "error",
            "arrow-parens": "error",
            "arrow-body-style": "error",
            "no-confusing-arrow": "error",
            "implicit-arrow-linebreak": "error",
            "no-duplicate-imports": "error",
            "object-curly-newline": "error",
            "dot-notation": "error",
            "one-var": ["error", "never"],
            "no-multi-assign": "error",
            "no-plusplus": "error",
            "operator-linebreak": "error",
            "eqeqeq": "error",
            "no-case-declarations": "error",
            "no-nested-ternary": "off",
            "no-unneeded-ternary": "error",
            "no-mixed-operators": "error",
            "nonblock-statement-body-position": "error",
            "keyword-spacing": "error",
            "space-infix-ops": "error",
            "eol-last": "error",
            "newline-per-chained-call": "error",
            "no-whitespace-before-property": "error",
            "space-in-parens": "error",
            "array-bracket-spacing": "error",
            "key-spacing": "error",
            "no-trailing-spaces": "error",
            "comma-style": "error",
            "radix": "error",
            "no-new-wrappers": "error",
        },
    },
];

export default eslintConfig;

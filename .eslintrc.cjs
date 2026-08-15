module.exports = {
  root: true,

  env: {
    browser: true,
    es2021: true,
    node: true,
  },

  parser: "@typescript-eslint/parser",

  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },

  plugins: [
    "@typescript-eslint",
    "react-hooks",
    "react-refresh",
  ],

  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],

  rules: {
    // جلوگیری از any بدون دلیل
    "@typescript-eslint/no-explicit-any": "warn",

    // React Fast Refresh
    "react-refresh/only-export-components": [
      "warn",
      {
        allowConstantExport: true,
      },
    ],

    // هیچ warning اجازه ندارد در CI باقی بماند
    "no-unused-vars": "off",

    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
      },
    ],
  },

  settings: {
    react: {
      version: "detect",
    },
  },
};

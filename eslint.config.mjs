import { createRequire } from "module";

const require = createRequire(import.meta.url);

const next = require("eslint-config-next/core-web-vitals");

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...next,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "pnpm-lock.yaml",
      "package-lock.json",
    ],
  },
  {
    rules: {
      // One-shot hydration from session/localStorage on mount is intentional; full refactors are separate.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;

import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["**/coverage/", "**/dist/", "node_modules/", "**/*.guard.ts"],
  },
  {
    files: ["**/*.{ts}"],
    languageOptions: { globals: globals.browser },
  },
  ...tseslint.configs.recommended,
);

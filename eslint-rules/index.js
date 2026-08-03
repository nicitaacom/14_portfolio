/**
 * The project's own eslint rules, exposed as a plugin.
 *
 * They used to be found through `--rulesdir`, which only the CLI understands. Editors run eslint through its
 * config instead, so the rule was missing there and every file reported "Definition for rule was not found"
 * rather than the untranslated strings it is meant to catch. A plugin resolves from the config, so `pnpm lint`
 * and the editor now reach the same rules the same way.
 */

module.exports = {
  rules: {
    "no-untranslated-ui": require("./no-untranslated-ui"),
    // file name differs from the rule id ("envs-order") on purpose - see the header of vars-order.js
    ...require("./vars-order"),
    // same here - the rule id is "no-unused-envs", see the header of unused-declared-vars.js
    ...require("./unused-declared-vars"),
    ...require("./no-undeclared-envs"),
    ...require("./response-variable-naming"),
    ...require("./zustand-creator-name-matches-store"),
    ...require("./zustand-extract-set-type"),
    ...require("./zustand-no-await-in-store"),
    ...require("./zustand-no-in-hooks-folder"),
    ...require("./zustand-no-pointless-store"),
    ...require("./zustand-no-selector"),
    ...require("./zustand-no-stateless-store"),
    ...require("./zustand-persist-name"),
    ...require("./zustand-persist-named-store"),
    ...require("./zustand-prefer-inline-setter"),
    ...require("./zustand-require-method"),
    ...require("./zustand-state-setter-pairing"),
    ...require("./zustand-store-export-matches-filename"),
  },
}

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
  },
}

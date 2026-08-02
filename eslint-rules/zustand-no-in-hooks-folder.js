"use strict"

const path = require("path")

const { findZustandStoreObjectLiterals } = require("./utils/findZustandStoreObjectLiterals")
const { getMainExportLineLoc } = require("./utils/mainExportLoc")

// A hooks/ folder holds useXxx.ts hooks wrapping React's own primitives - see
// require-pascalcase-bucket-folder/hook-naming-convention for what belongs there. A zustand store
// (create<T>()(...)) is a fundamentally different thing, global state creation rather than a React
// hook, and this codebase's own convention keeps it in a dedicated store/ folder (see
// require-isolated-module-folder, no-bucket-kind-mismatch) so the import path itself
// ("../store/useXxx") already tells a reader "this is state", not "this is a hook". A store
// defined inside hooks/ hides that distinction. Detected the same way index-export-widget-
// module-4's callsZustandCreate does (a real "zustand" import for create/createStore, checked
// against an ACTUAL create(...) call via findZustandStoreObjectLiterals - the same AST helper
// zustand-state-setter-pairing/zustand-prefer-inline-setter/zustand-no-selector already use to
// find a store's shape), not a name/path guess.
//
// Bad (hooks/useAccountModal.ts):
//   export const useAccountModal = create<TAccountModal>()((set, get) => ({ ... }))
// Good (store/useAccountModal.ts):
//   export const useAccountModal = create<TAccountModal>()((set, get) => ({ ... }))
function isZustandImportSource(source) {
  return source === "zustand" || source === "zustand/vanilla" || source.startsWith("zustand/")
}

module.exports = {
  "zustand-no-in-hooks-folder": {
    meta: {
      type: "suggestion",
      docs: {
        description: 'disallow a zustand store (create(...)) defined inside a "hooks/" folder - it belongs in a neighboring "store/" folder instead',
      },
      schema: [],
      messages: {
        zustandInHooksFolder:
          'This file defines a zustand store (create(...)) but sits in a "hooks/" folder - move it to a neighboring "store/" folder instead (e.g. "../store/{{basename}}").',
      },
    },
    create(context) {
      const filename = context.filename ?? context.getFilename()
      if (path.basename(path.dirname(filename)) !== "hooks") return {}

      let importsCreateFromZustand = false

      return {
        ImportDeclaration(node) {
          if (!isZustandImportSource(node.source.value)) return
          const importsCreate = node.specifiers.some(
            specifier => specifier.type === "ImportSpecifier" && ["create", "createStore"].includes(specifier.imported.name),
          )
          if (importsCreate) importsCreateFromZustand = true
        },
        "Program:exit"(node) {
          if (!importsCreateFromZustand) return
          if (findZustandStoreObjectLiterals(node).length === 0) return

          const sourceCode = context.sourceCode ?? context.getSourceCode()
          const basename = path.basename(filename)
          context.report({
            loc: getMainExportLineLoc(node, sourceCode, basename.replace(/\.tsx?$/, "")),
            messageId: "zustandInHooksFolder",
            data: { basename },
          })
        },
      }
    },
  },
}

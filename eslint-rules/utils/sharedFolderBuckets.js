"use strict"

const path = require("path")

// "shared", "widgets", "features", "libs" hold things meant to be broadly re-usable and can also
// nest under a feature/widget folder (e.g. app/widgets/CronSchedules/store/...) - matched anywhere
// as a path segment. Everything else here is a genuine top-level app/<bucket>/... folder that also
// happens to have same-named nested folders inside individual features (app/(routes)/x/hooks/...,
// app/widgets/Y/classes/...) - those nested ones are normal same-feature organization, not the
// global bucket, so they're matched only when root-anchored (segments[0] === bucket).
const ANYWHERE_BUCKETS = ["shared", "widgets", "features", "libs"]
const ROOT_ANCHORED_BUCKETS = [
  "components",
  "api",
  "store",
  "ts",
  "hooks",
  "functions",
  "classes",
  "utils",
  "actions",
  "consts",
  "user-db",
]

// A "kind folder" - split by WHAT KIND of file it holds (store/hooks/types/etc), not which
// feature it belongs to. Shared between require-isolated-module-folder (a kind folder wrapping a
// PascalCase module name) and no-generic-bucket (a lowercase, made-up folder name that ISN'T one
// of these holding a mix of .tsx/.ts files instead of actually being split by kind).
const FOLDER_BUCKETS = ["store", "consts", "functions", "hooks", "components", "types", "interfaces", "ts", "actions", "utils", "shared", "libs"]

function isRelativeImport(source) {
  return source.startsWith("../") || source === ".." || source.startsWith("./") || source === "."
}

// Returns the restricted bucket name for an app-relative segment array (e.g.
// ["store", "shared", "useToast"] or ["components", "shared", "Input"]), else null.
//
// "widgets" only counts as a bucket match when it's genuinely at the app root (segments[0]) - a
// "widgets" segment anywhere else is exactly the naming mistake no-bucket-in-bucket already
// flags (e.g. app/components/.../StatsAndMetricsTab/widgets/Metrics/), not a real widget, so it
// shouldn't ALSO get treated as a reusable-bucket boundary here. A genuine app/widgets/<Name>/...
// (or something nested inside one, e.g. app/widgets/CronSchedules/store/...) always has "widgets"
// at position 0 anyway, so this doesn't change behavior for any real widget.
function findRestrictedBucket(segments) {
  if (segments[0] === "widgets") return "widgets"

  const anywhereMatch = ANYWHERE_BUCKETS.filter(bucket => bucket !== "widgets").find(bucket => segments.includes(bucket))
  if (anywhereMatch) return anywhereMatch

  const rootMatch = ROOT_ANCHORED_BUCKETS.find(bucket => segments[0] === bucket)
  if (rootMatch) return rootMatch

  return null
}

// Cached per starting directory, for the lifetime of this process - a dozen+ rules in this set
// each call findAppRoot(filename) independently from their own create(), so an uncached lint run
// over the whole repo repeats the same upward tsconfig.json walk (up to 20 accessSync calls) once
// per rule per file. The app root for a given directory never changes within one lint run, so
// computing it once per directory and reusing it across every rule/file that shares it is safe.
const appRootCache = new Map()

function findAppRootUncached(startDir) {
  let dir = startDir
  for (let i = 0; i < 20; i++) {
    try {
      require("fs").accessSync(path.join(dir, "tsconfig.json"))
      return path.join(dir, "app")
    } catch {
      const parent = path.dirname(dir)
      if (parent === dir) return null
      dir = parent
    }
  }
  return null
}

function findAppRoot(filename) {
  const startDir = path.dirname(filename)
  if (appRootCache.has(startDir)) return appRootCache.get(startDir)
  const found = findAppRootUncached(startDir)
  appRootCache.set(startDir, found)
  return found
}

module.exports = { ANYWHERE_BUCKETS, ROOT_ANCHORED_BUCKETS, FOLDER_BUCKETS, isRelativeImport, findRestrictedBucket, findAppRoot }

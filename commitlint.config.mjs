/**
 * Conventional Commits, enforced on every commit message.
 *
 * The `scope` list mirrors the repo's real seams: the feature slices under
 * src/features, the shared layers, and the harness itself. Scopes are optional,
 * but a scope outside this list is almost always a typo or a change that has
 * quietly grown past where it claims to be.
 */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      [
        // product surfaces (src/features/*)
        "auth",
        "applications",
        "dashboard",
        "kanban",
        "marketing",
        "settings",
        // shared
        "ui",
        "i18n",
        "lib",
        "theme",
        // repo-level
        "deps",
        "config",
        "test",
        "docs",
        "harness",
      ],
    ],
    "body-max-line-length": [0],
  },
};

export default config;

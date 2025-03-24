/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: [
    "main",
    {
      name: "feat/*",
      channel:
        "${name.substring(0, 15).replace('/', '-').toLowerCase().replace(/[^a-z0-9-]/g, '')}",
      prerelease:
        "${name.substring(0, 15).replace('/', '-').toLowerCase().replace(/[^a-z0-9-]/g, '')}",
    },
    {
      name: "fix/*",
      channel:
        "${name.substring(0, 15).replace('/', '-').toLowerCase().replace(/[^a-z0-9-]/g, '')}",
      prerelease:
        "${name.substring(0, 15).replace('/', '-').toLowerCase().replace(/[^a-z0-9-]/g, '')}",
    },
  ],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
        releaseRules: [
          {
            type: "docs",
            scope: "readme",
            release: "patch",
          },
          {
            scope: "release",
            release: "patch",
          },
        ],
      },
    ],
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
      },
    ],
    "@semantic-release/npm",
    [
      "@semantic-release/git",
      {
        assets: ["package.json", "CHANGELOG.md"],
      },
    ],
    "@semantic-release/github",
  ],
};

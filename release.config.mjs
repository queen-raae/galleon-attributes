/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: [
    "main",
    {
      name: "feat/*",
      channel: "${name.replace('/', '-').toLowerCase()}",
      prerelease: "${name.replace('/', '-').toLowerCase()}",
    },
    {
      name: "fix/*",
      channel: "${name.replace('/', '-').toLowerCase()}",
      prerelease: "${name.replace('/', '-').toLowerCase()}",
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
            type: "chore",
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

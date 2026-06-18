# AutoCoder

AutoCoder is a reusable composite GitHub Action that:

1. Reads a labeled GitHub issue.
2. Uses OpenAI to generate code from the issue description.
3. Writes generated files into the repository.
4. Commits changes and opens a pull request automatically.

## Repository Structure

```
AutoCoder/
├── .github/
│   └── workflows/
│       ├── main.yml
│       └── runner.yml
├── action.yml
├── scripts/
│   └── script.sh
└── README.md
```

## Action Metadata

Action metadata is defined in `action.yml` and includes:

1. `name`, `description`, `author`, and `branding`.
2. Required and optional `inputs`.
3. `outputs` (`pull_request_url`).
4. `runs.using: composite` with the full execution steps.

## Inputs

Required inputs:

1. `GITHUB_TOKEN`: PAT used for GitHub API authentication and PR creation.
2. `REPOSITORY`: Target repository in `owner/repo` format.
3. `ISSUE_NUMBER`: Issue number that triggered the action.
4. `OPENAI_API_KEY`: OpenAI API key for code generation.
5. `SCRIPT_PATH`: Path to the generation script (default: `scripts/script.sh`).
6. `LABEL`: Label that should trigger processing (default: `autocoder-bot`).

Optional inputs:

1. `OUTPUT_DIR`: Output directory for generated files (default: `autocoder-artifact`).
2. `BASE_BRANCH`: Base branch for pull requests (default: `main`).

## Usage

Create a workflow in your consumer repository, for example `.github/workflows/autocoder.yml`:

```yaml
name: AutoCoder

on:
    issues:
        types: [opened, reopened, labeled]

permissions:
    contents: write
    pull-requests: write

jobs:
    generate:
        if: github.event_name == 'issues' && contains(github.event.issue.labels.*.name, 'autocoder-bot')
        runs-on: ubuntu-latest
        steps:
            - name: Checkout repository
                uses: actions/checkout@v4

            - name: Run AutoCoder action
                uses: haryunkim/AutoCoder@v0.1.0
                with:
                    GITHUB_TOKEN: ${{ secrets.PAT_TOKEN }}
                    REPOSITORY: ${{ github.repository }}
                    ISSUE_NUMBER: ${{ github.event.issue.number }}
                    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
                    SCRIPT_PATH: scripts/script.sh
                    LABEL: autocoder-bot
```

Example with custom label:

```yaml
jobs:
    generate:
        if: github.event_name == 'issues' && contains(github.event.issue.labels.*.name, 'generate-code')
        runs-on: ubuntu-latest
        steps:
            - name: Checkout repository
                uses: actions/checkout@v4

            - uses: haryunkim/AutoCoder@v0.1.0
                with:
                    GITHUB_TOKEN: ${{ secrets.PAT_TOKEN }}
                    REPOSITORY: ${{ github.repository }}
                    ISSUE_NUMBER: ${{ github.event.issue.number }}
                    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
                    SCRIPT_PATH: scripts/script.sh
                    LABEL: generate-code
                    BASE_BRANCH: main
```

## Testing Your Action

Before publishing, validate it as a standalone action:

1. Create a separate test repository.
2. Add a workflow that references your branch first, for example `uses: haryunkim/AutoCoder@main`.
3. Create a test issue and apply the trigger label.
4. Confirm workflow logs:
     - issue fetch succeeds
     - OpenAI response is valid JSON
     - files are written
     - commit is created (or correctly skipped)
     - pull request is opened
5. Test negative paths:
     - wrong label
     - empty issue body
     - invalid OpenAI API key
     - invalid token permissions

## Publish and Version

After tests pass:

1. Commit and push your changes.
2. Tag a semantic version:

```bash
git tag -a v0.1.0 -m "Initial AutoCoder release"
git push origin v0.1.0
```

3. Create a GitHub Release from tag `v0.1.0`.
4. Optionally add a moving major tag (for easier upgrades):

```bash
git tag -fa v0 -m "Update v0 tag"
git push origin v0 --force
```

## Notes

1. For private repositories, use a PAT with `repo` scope.
2. Ensure workflow permissions include `contents: write` and `pull-requests: write`.
3. Treat generated code as untrusted until reviewed.

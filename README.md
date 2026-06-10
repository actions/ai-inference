# AI Inference in GitHub Actions

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)

Run AI inference in workflows using the GitHub Copilot CLI.

## Usage

The action is Copilot-only. The `provider` input defaults to `copilot`, and `copilot` is the only supported value.

Because the Copilot CLI is not pre-installed on GitHub-hosted runners, install and authenticate it before invoking this action.

```yaml
name: AI inference
on: workflow_dispatch

jobs:
  inference:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v6

      - name: Install Copilot CLI
        run: npm install -g @github/copilot

      - name: Run AI Inference via Copilot
        id: inference
        uses: actions/ai-inference@v1
        with:
          prompt: Summarize the latest changes in this repository.
          model: gpt-4.1
        env:
          COPILOT_GITHUB_TOKEN: ${{ secrets.COPILOT_PAT }}

      - name: Print output
        run: echo "${{ steps.inference.outputs.response }}"
```

## Prompt Files

You can provide prompt content inline or from files.

### Text prompt file

```yaml
steps:
  - name: Run AI Inference with Text File
    id: inference
    uses: actions/ai-inference@v1
    with:
      prompt-file: ./.github/prompts/prompt.txt
```

### Structured .prompt.yml file

```yaml
steps:
  - name: Run AI Inference with Prompt YAML
    id: inference
    uses: actions/ai-inference@v1
    with:
      prompt-file: ./.github/prompts/sample.prompt.yml
      input: |
        repo: actions/ai-inference
      file_input: |
        diff: ./artifacts/diff.txt
```

Example:

```yaml
messages:
  - role: system
    content: Be concise and concrete.
  - role: user
    content: Summarize changes for {{repo}} using this diff:\n{{diff}}
model: gpt-4.1
```

## System Prompt File

```yaml
steps:
  - name: Run AI Inference with System Prompt File
    id: inference
    uses: actions/ai-inference@v1
    with:
      prompt: Hello
      system-prompt-file: ./.github/prompts/system.txt
```

## Response File Output

The action writes the model response to a temporary file and exposes the path via `response-file`.

```yaml
steps:
  - name: Run AI Inference
    id: inference
    uses: actions/ai-inference@v1
    with:
      prompt: Hello

  - name: Use Response File
    run: |
      echo "Response saved to: ${{ steps.inference.outputs.response-file }}"
      cat "${{ steps.inference.outputs.response-file }}"
```

## Inputs

Inputs are defined in `action.yml`.

| Name | Description | Default |
| --- | --- | --- |
| `prompt` | Inline user prompt. | `""` |
| `prompt-file` | Path to prompt file (`.txt` or `.prompt.yml`). When both are set, this takes precedence over `prompt`. | `""` |
| `input` | YAML template variables for `.prompt.yml` files. | `""` |
| `file_input` | YAML map of template variable names to file paths; file contents are injected into templates. | `""` |
| `model` | Model to pass to Copilot CLI (for example `gpt-4.1`, `claude-sonnet-4.5`). Set empty to let CLI choose its default. | `gpt-4.1` |
| `system-prompt` | Inline system prompt. | `You are a helpful assistant` |
| `system-prompt-file` | Path to system prompt file. When both are set, this takes precedence over `system-prompt`. | `""` |
| `token` | Token value masked by the action. Defaults to `github.token`. | `github.token` |
| `provider` | Inference provider. Only `copilot` is supported. | `copilot` |
| `copilot-cli-path` | Path to Copilot CLI binary. If empty, uses `copilot` on `PATH`. | `""` |
| `copilot-allow-tools` | Comma-separated list of `--allow-tool` values passed to Copilot CLI. | `""` |

## Outputs

| Name | Description |
| --- | --- |
| `response` | Model response text. |
| `response-file` | Path to temp file containing the response text. |

## Notes

- The action invokes Copilot CLI with `-p <prompt> -s --no-ask-user`.
- No `--allow-tool` flags are passed unless you set `copilot-allow-tools`.
- Ensure Copilot CLI authentication is configured on the runner, typically via `COPILOT_GITHUB_TOKEN`.

## Publishing a New Release

This project includes a helper script, `script/release`, to streamline tagging and pushing new releases for GitHub Actions. For more information, see [Versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) in the GitHub Actions toolkit.

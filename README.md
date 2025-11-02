# AI Inference in GitHub Actions

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)

Use AI models from [GitHub Models](https://github.com/marketplace/models) in
your workflows.

## Usage

Create a workflow to use the AI inference action:

```yaml
name: 'AI inference'
on: workflow_dispatch

jobs:
  inference:
    permissions:
      models: read
    runs-on: ubuntu-latest
    steps:
      - name: Test Local Action
        id: inference
        uses: actions/ai-inference@v2
        with:
          prompt: 'Hello!'

      - name: Print Output
        id: output
        run: echo "${{ steps.inference.outputs.response }}"
```

### Using a prompt file

You can also provide a prompt file instead of an inline prompt. The action
supports both plain text files and structured `.prompt.yml` files:

```yaml
steps:
  - name: Run AI Inference with Text File
    id: inference
    uses: actions/ai-inference@v2
    with:
      prompt-file: './path/to/prompt.txt'
```

### Using GitHub prompt.yml files

For more advanced use cases, you can use structured `.prompt.yml` files that
support templating, custom models, and JSON schema responses:

```yaml
steps:
  - name: Run AI Inference with Prompt YAML
    id: inference
    uses: actions/ai-inference@v2
    with:
      prompt-file: './.github/prompts/sample.prompt.yml'
      input: |
        var1: hello
        var2: ${{ steps.some-step.outputs.output }}
        var3: |
          Lorem Ipsum
          Hello World
      file_input: |
        var4: ./path/to/long-text.txt
        var5: ./path/to/config.json
```

#### Simple prompt.yml example

```yaml
messages:
  - role: system
    content: Be as concise as possible
  - role: user
    content: 'Compare {{a}} and {{b}}, please'
model: openai/gpt-4o
```

#### Prompt.yml with JSON schema support

```yaml
messages:
  - role: system
    content: You are a helpful assistant that describes animals using JSON format
  - role: user
    content: |-
      Describe a {{animal}}
      Use JSON format as specified in the response schema
model: openai/gpt-4o
responseFormat: json_schema
jsonSchema: |-
  {
    "name": "describe_animal",
    "strict": true,
    "schema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "The name of the animal"
        },
        "habitat": {
          "type": "string",
          "description": "The habitat the animal lives in"
        }
      },
      "additionalProperties": false,
      "required": [
        "name",
        "habitat"
      ]
    }
  }
```

Variables in prompt.yml files are templated using `{{variable}}` format and are
supplied via the `input` parameter in YAML format. Additionally, you can
provide file-based variables via `file_input`, where each key maps to a file
path.

### Using a system prompt file

In addition to the regular prompt, you can provide a system prompt file instead
of an inline system prompt:

```yaml
steps:
  - name: Run AI Inference with System Prompt File
    id: inference
    uses: actions/ai-inference@v2
    with:
      prompt: 'Hello!'
      system-prompt-file: './path/to/system-prompt.txt'
```

### Read output from file instead of output

This can be useful when model response exceeds actions output limit

```yaml
steps:
  - name: Test Local Action
    id: inference
    uses: actions/ai-inference@v2
    with:
      prompt: 'Hello!'

  - name: Use Response File
    run: |
      echo "Response saved to: ${{ steps.inference.outputs.response-file }}"
      cat "${{ steps.inference.outputs.response-file }}"
```

### GitHub MCP Integration (Model Context Protocol)

This action now supports **read-only** integration with the GitHub-hosted Model
Context Protocol (MCP) server, which provides access to GitHub tools like
repository management, issue tracking, and pull request operations.

> [!NOTE]
> The GitHub MCP integration requires a Personal Access Token (PAT) and cannot use the built-in `GITHUB_TOKEN`.

```yaml
steps:
  - name: AI Inference with GitHub Tools
    id: inference
    uses: actions/ai-inference@v2
    with:
      prompt: 'List my open pull requests and create a summary'
      enable-github-mcp: true
      token: ${{ secrets.USER_PAT }}
```

If you want, you can use separate tokens for the AI inference endpoint
and the GitHub MCP server:

```yaml
steps:
  - name: AI Inference with Separate MCP Token
    id: inference
    uses: actions/ai-inference@v2
    with:
      prompt: 'List my open pull requests and create a summary'
      enable-github-mcp: true
      token: ${{ secrets.GITHUB_TOKEN }}
      github-mcp-token: ${{ secrets.USER_PAT }}
```

#### Configuring GitHub MCP Toolsets

By default, the GitHub MCP server provides a standard set of tools (`context`, `repos`, `issues`, `pull_requests`, `users`). You can customize which toolsets are available by specifying the `github-mcp-toolsets` parameter:

```yaml
steps:
  - name: AI Inference with Custom Toolsets
    id: inference
    uses: actions/ai-inference@v2
    with:
      prompt: 'Analyze recent workflow runs and check security alerts'
      enable-github-mcp: true
      token: ${{ secrets.USER_PAT }}
      github-mcp-toolsets: 'repos,issues,pull_requests,actions,code_security'
```

**Available toolsets:**
See: https://github.com/github/github-mcp-server/blob/main/README.md#tool-configuration

When MCP is enabled, the AI model will have access to GitHub tools and can
perform actions like searching issues and PRs.

## Inputs

Various inputs are defined in [`action.yml`](action.yml) to let you configure
the action:

| Name                  | Description                                                                                                                                                         | Default                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `token`               | Token to use for inference. Typically the GITHUB_TOKEN secret                                                                                                       | `github.token`                       |
| `prompt`              | The prompt to send to the model                                                                                                                                     | N/A                                  |
| `prompt-file`         | Path to a file containing the prompt (supports .txt and .prompt.yml formats). If both `prompt` and `prompt-file` are provided, `prompt-file` takes precedence       | `""`                                 |
| `input`               | Template variables in YAML format for .prompt.yml files (e.g., `var1: value1` on separate lines)                                                                    | `""`                                 |
| `file_input`          | Template variables in YAML where values are file paths. The file contents are read and used for templating                                                          | `""`                                 |
| `system-prompt`       | The system prompt to send to the model                                                                                                                              | `"You are a helpful assistant"`      |
| `system-prompt-file`  | Path to a file containing the system prompt. If both `system-prompt` and `system-prompt-file` are provided, `system-prompt-file` takes precedence                   | `""`                                 |
| `model`               | The model to use for inference. Must be available in the [GitHub Models](https://github.com/marketplace?type=models) catalog                                        | `openai/gpt-4o`                      |
| `endpoint`            | The endpoint to use for inference. If you're running this as part of an org, you should probably use the org-specific Models endpoint                               | `https://models.github.ai/inference` |
| `max-tokens`          | The max number of tokens to generate                                                                                                                                | 200                                  |
| `enable-github-mcp`   | Enable Model Context Protocol integration with GitHub tools                                                                                                         | `false`                              |
| `github-mcp-token`    | Token to use for GitHub MCP server (defaults to the main token if not specified). This must be a PAT for MCP to work                                                | `""`                                 |
| `github-mcp-toolsets` | Comma-separated list of toolsets to enable for GitHub MCP (e.g., `repos,issues,pull_requests,actions`). Use `all` for all toolsets or `default` for the default set | `""`                                 |

## Outputs

The AI inference action provides the following outputs:

| Name            | Description                                                             |
| --------------- | ----------------------------------------------------------------------- |
| `response`      | The response from the model                                             |
| `response-file` | The file path where the response is saved (useful for larger responses) |

## Required Permissions

In order to run inference with GitHub Models, the GitHub AI inference action
requires `models` permissions.

```yml
permissions:
  contents: read
  models: read
```

## Publishing a New Release

This project includes a helper script, [`script/release`](./script/release)
designed to streamline the process of tagging and pushing new releases for
GitHub Actions. For more information, see
[Versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
in the GitHub Actions toolkit.

GitHub Actions allows users to select a specific version of the action to use,
based on release tags. This script simplifies this process by performing the
following steps:

1. **Retrieving the latest release tag:** The script starts by fetching the most
   recent SemVer release tag of the current branch, by looking at the local data
   available in your repository.
1. **Prompting for a new release tag:** The user is then prompted to enter a new
   release tag. To assist with this, the script displays the tag retrieved in
   the previous step, and validates the format of the inputted tag (vX.X.X). The
   user is also reminded to update the version field in package.json.
1. **Tagging the new release:** The script then tags a new release and syncs the
   separate major tag (e.g. v1, v2) with the new release tag (e.g. v1.0.0,
   v2.1.2). When the user is creating a new major release, the script
   auto-detects this and creates a `releases/v#` branch for the previous major
   version.
1. **Pushing changes to remote:** Finally, the script pushes the necessary
   commits, tags and branches to the remote repository. From here, you will need
   to create a new release in GitHub so users can easily reference the new tags
   in their workflows.

## License

This project is licensed under the terms of the MIT open source license. Please
refer to [MIT](./LICENSE.txt) for the full terms.

## Contributions

Contributions are welcome! See the [Contributor's Guide](CONTRIBUTING.md).

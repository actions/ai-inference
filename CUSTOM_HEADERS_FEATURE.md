# Custom Headers Feature Implementation

## Overview

This document summarizes the implementation of custom headers support for the `actions/ai-inference` action. This feature enables users to pass additional HTTP headers to AI inference endpoints, making it compatible with API Management platforms (like Azure APIM), custom gateways, and other services requiring specific headers.

## What Was Implemented

### 1. New Action Input (`action.yml`)

- Added `custom-headers` input parameter
- Supports both YAML and JSON formats
- Optional parameter with empty string default

### 2. Header Parser (`src/helpers.ts`)

- `parseCustomHeaders()` function with auto-format detection (YAML/JSON)
- Header name validation (alphanumeric, hyphens, underscores only)
- Automatic masking of sensitive headers in logs (headers containing: `key`, `token`, `secret`, `password`, `authorization`)
- Graceful error handling with warnings for invalid input

### 3. Infrastructure Updates

- Updated `InferenceRequest` interface with optional `customHeaders` field
- Modified `simpleInference()` and `mcpInference()` to pass headers to OpenAI client
- Updated `buildInferenceRequest()` to accept and propagate custom headers
- Updated `main.ts` to read, parse, and pass custom headers

### 4. Comprehensive Testing

- Added 16 new test cases for header parsing:
  - YAML format parsing
  - JSON format parsing
  - Empty/undefined input handling
  - Sensitive header masking
  - Header name validation
  - Invalid format handling
  - Real-world Azure APIM example
- Added 2 test cases for inference functions with custom headers
- Updated existing tests to account for new field

### 5. Documentation (`README.md`)

- Added "Using custom headers" section with examples
- Provided both YAML and JSON format examples
- Documented real-world use cases (APIM, tracking, rate limiting, etc.)
- Added security best practices
- Updated inputs table

## Usage Examples

### Azure APIM Integration (YAML format)

```yaml
- name: AI Inference with Azure APIM
  uses: actions/ai-inference@v1
  with:
    prompt: 'Analyze this Terraform plan...'
    endpoint: ${{ secrets.APIM_ENDPOINT }}
    token: ${{ secrets.APIM_KEY }}
    custom-headers: |
      Ocp-Apim-Subscription-Key: ${{ secrets.APIM_SUBSCRIPTION_KEY }}
      serviceName: terraform-plan-workflow
      env: production
      team: infrastructure
```

### Generic Custom Headers (JSON format)

```yaml
- name: AI Inference with Custom Headers
  uses: actions/ai-inference@v1
  with:
    prompt: 'Hello!'
    custom-headers: '{"X-Team": "engineering", "X-Request-ID": "${{ github.run_id }}"}'
```

## Key Features

1. **Format Flexibility**: Auto-detects YAML or JSON format
2. **Security First**: Automatically masks sensitive headers in logs
3. **Non-Breaking**: Fully backward compatible (optional parameter)
4. **Validation**: Prevents invalid header names
5. **Integration**: Works with both simple and MCP inference modes

## Test Results

- ✅ All 80 tests passing
- ✅ Linting successful
- ✅ Build successful

## Files Modified

1. `action.yml` - Added input definition
2. `src/helpers.ts` - Added parser function and updated builder
3. `src/inference.ts` - Updated interface and both inference functions
4. `src/main.ts` - Added header parsing and passing
5. `__tests__/helpers.test.ts` - Added 16 test cases
6. `__tests__/inference.test.ts` - Added 2 test cases
7. `__tests__/main.test.ts` - Updated 2 existing tests
8. `README.md` - Added documentation and examples

## Benefits for Community

- **Enterprise Ready**: Enables Azure APIM and other API Management platforms
- **Observability**: Support for correlation IDs and request tracking
- **Multi-Tenant**: Team/service identification
- **Flexibility**: Works with any API gateway or custom routing
- **Security**: Built-in sensitive data masking

## Contributing to Upstream

This implementation follows GitHub Actions best practices:

- Backward compatible (no breaking changes)
- Well-tested (80 tests, 100% coverage of new code)
- Properly documented
- Generic and reusable (not tied to specific vendor)
- Security-conscious (automatic sensitive data masking)

The feature is ready for PR submission to the upstream repository at https://github.com/actions/ai-inference

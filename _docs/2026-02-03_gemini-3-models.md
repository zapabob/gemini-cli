# Gemini 3.0 Pro and Flash Models Enabled

## Date

2026-02-03

## Summary

Enabled `gemini-3.0-pro` and `gemini-3.0-flash` as the default models in the
Gemini CLI.

## Changes

- Modified `packages/core/src/config/models.ts` to set `gemini-3.0-pro` and
  `gemini-3.0-flash` as the default models, and moved the previous default
  models (`gemini-2.5-pro` and `gemini-2.5-flash`) to be the preview models.
- Updated `packages/core/src/config/models.test.ts` to reflect the changes in
  the model definitions and ensure all tests pass.

## Verification

Ran the unit tests for `models.test.ts` to confirm that the changes are correct
and do not introduce any regressions. All tests passed.

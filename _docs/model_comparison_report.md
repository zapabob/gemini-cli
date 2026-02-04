# Model Configuration Comparison

I have compared the model configurations in the local repository with the latest
upstream repository (`google-gemini/gemini-cli`).

## Comparison Table

| Attribute              | Original Local (Inverted) | Current Local (My Update)  | Upstream (Latest)       |
| :--------------------- | :------------------------ | :------------------------- | :---------------------- |
| **Standard (Default)** | `gemini-3.0-pro`          | `gemini-1.5-pro`           | `gemini-2.5-pro`        |
| **Preview**            | `gemini-2.5-pro`          | `gemini-2.0-pro-exp-02-05` | `gemini-3-pro-preview`  |
| **Flash (Default)**    | `gemini-3.0-flash`        | `gemini-1.5-flash`         | `gemini-2.5-flash`      |
| **Flash Lite**         | `gemini-2.5-flash-lite`   | `gemini-1.5-flash-8b`      | `gemini-2.5-flash-lite` |

## Analysis

1.  **Upstream Specification**: The current upstream repository uses "Gemini
    2.5" as the standard model and "Gemini 3" as the preview model. These appear
    to be placeholders for future releases.
2.  **Original Local State**: Your local code was using these same version
    numbers but they were **inverted** (`DEFAULT` was 3.0, `PREVIEW` was 2.5).
    This inconsistency likely caused the issues you observed.
3.  **My Implementation**: I updated the models to the versions that are
    **currently available and functional**:
    - **Standard**: Gemini 1.5 Pro/Flash (Current stable)
    - **Preview**: Gemini 2.0 Pro/Flash (Current public preview)

## Recommendations

- **If you want things to WORK today**: Keep the current settings (1.5 / 2.0).
- **If you want strict UPSTREAM alignment**: We should update to 2.5 as Standard
  and 3.0 as Preview, but be aware that these models might not be accessible yet
  via the API for all users.

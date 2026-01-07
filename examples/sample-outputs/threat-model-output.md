# Sample Threat Model Output

This is an example output from the Gemini Codex MCP integration.

## Input

```bash
gemini -p "Generate a threat model outline for a REST API with JWT auth" \
  --output-format json
```

## Output

```json
{
  "threat_model": {
    "system": "REST API with JWT Authentication",
    "generated_at": "2026-01-07T21:30:00Z",
    "model": "gemini-2.0-flash-001",

    "assets": [
      {
        "name": "User Credentials",
        "sensitivity": "HIGH",
        "description": "Username/password pairs stored for authentication"
      },
      {
        "name": "JWT Tokens",
        "sensitivity": "HIGH",
        "description": "Access and refresh tokens for session management"
      },
      {
        "name": "API Endpoints",
        "sensitivity": "MEDIUM",
        "description": "RESTful endpoints exposing business logic"
      }
    ],

    "threat_categories": [
      {
        "category": "Authentication Bypass",
        "threats": [
          {
            "id": "T001",
            "name": "JWT Algorithm Confusion",
            "description": "Attacker exploits weak algorithm verification to forge tokens",
            "severity": "CRITICAL",
            "mitigation": "Enforce RS256, reject 'none' algorithm, validate 'alg' header"
          },
          {
            "id": "T002",
            "name": "Brute Force Login",
            "description": "Automated credential stuffing attacks",
            "severity": "HIGH",
            "mitigation": "Rate limiting, account lockout, CAPTCHA after failures"
          }
        ]
      },
      {
        "category": "Token Security",
        "threats": [
          {
            "id": "T003",
            "name": "Token Leakage via Logs",
            "description": "JWT tokens accidentally logged in server logs",
            "severity": "HIGH",
            "mitigation": "Redact authorization headers in logs, audit logging config"
          },
          {
            "id": "T004",
            "name": "Refresh Token Theft",
            "description": "Long-lived refresh tokens stolen from client storage",
            "severity": "CRITICAL",
            "mitigation": "Secure HttpOnly cookies, token rotation on use"
          }
        ]
      },
      {
        "category": "API Security",
        "threats": [
          {
            "id": "T005",
            "name": "Broken Object Level Authorization",
            "description": "Users access resources belonging to other users",
            "severity": "HIGH",
            "mitigation": "Enforce ownership checks on every resource access"
          }
        ]
      }
    ],

    "recommendations": [
      "Implement comprehensive input validation",
      "Use short-lived access tokens (15 minutes)",
      "Implement secure refresh token rotation",
      "Add request signing for sensitive operations",
      "Enable audit logging for all authentication events"
    ]
  }
}
```

## Verification

This output was generated using:

- **Model**: Gemini 2.0 Flash
- **Input tokens**: 47
- **Output tokens**: 892
- **Generation time**: 2.3s

The threat model follows STRIDE categories and includes actionable mitigations.

## Usage in Compliance Review

This output format is suitable for:

- Security architecture reviews
- Compliance documentation (SOC2, ISO 27001)
- Risk assessment frameworks
- Developer security training

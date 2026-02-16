---
title: Error Handling
description: Error response format, status codes, error codes, and localization
---

# Error Handling

All Grant API errors follow a consistent format across both REST and GraphQL, with machine-readable codes and automatic localization.

## Response Format

**REST:**

```json
{
  "error": "Localized error message",
  "code": "ERROR_CODE",
  "extensions": {
    "field": "additionalContext"
  }
}
```

**GraphQL:**

```json
{
  "data": null,
  "errors": [
    {
      "message": "Localized error message",
      "extensions": { "code": "ERROR_CODE" }
    }
  ]
}
```

The `code` field is stable and safe for programmatic handling. The `error`/`message` field is human-readable and localized.

## HTTP Status Codes

| Status  | Error Class           | Description                                                   |
| ------- | --------------------- | ------------------------------------------------------------- |
| **400** | `BadRequestError`     | Malformed request or invalid JSON                             |
| **400** | `ValidationError`     | Input validation failed (field-level details in `extensions`) |
| **401** | `AuthenticationError` | Missing, invalid, or expired token                            |
| **403** | `AuthorizationError`  | Token valid but insufficient permissions                      |
| **404** | `NotFoundError`       | Resource does not exist or is not accessible                  |
| **409** | `ConflictError`       | Duplicate resource (e.g., email already exists)               |
| **429** | —                     | Rate limit exceeded (`Retry-After` header included)           |
| **500** | `ApiError`            | Internal server error                                         |

## Error Codes

| Code                  | Status | When                                           |
| --------------------- | ------ | ---------------------------------------------- |
| `BAD_USER_INPUT`      | 400    | Invalid JSON or malformed request body         |
| `VALIDATION_ERROR`    | 400    | Zod schema validation failed                   |
| `UNAUTHENTICATED`     | 401    | No token, expired token, revoked session       |
| `FORBIDDEN`           | 403    | User lacks the required permission             |
| `NOT_FOUND`           | 404    | Entity not found in the requested scope        |
| `CONFLICT`            | 409    | Unique constraint violation                    |
| `RATE_LIMIT_EXCEEDED` | 429    | Too many requests — check `Retry-After` header |
| `INTERNAL_ERROR`      | 500    | Unexpected server error                        |

## Error Examples

### Authentication (401)

```http
GET /api/users
Authorization: Bearer <expired_token>
```

```json
{ "error": "Invalid or expired token", "code": "UNAUTHENTICATED" }
```

### Authorization (403)

```http
DELETE /api/organizations/<id>
Authorization: Bearer <valid_token>
```

```json
{ "error": "You are not authorized to perform this action", "code": "FORBIDDEN" }
```

### Not Found (404)

```http
GET /api/users/<nonexistent_id>
```

```json
{ "error": "User not found", "code": "NOT_FOUND" }
```

### Validation (400)

```http
POST /api/organizations
{ "name": "" }
```

```json
{
  "error": "Organization name is required",
  "code": "VALIDATION_ERROR",
  "extensions": { "field": "name" }
}
```

### Conflict (409)

```http
POST /api/users
{ "email": "existing@example.com", ... }
```

```json
{
  "error": "A User with this email already exists",
  "code": "CONFLICT",
  "extensions": { "resource": "User", "field": "email" }
}
```

### Rate Limit (429)

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

```json
{ "error": "Too many requests", "code": "RATE_LIMIT_EXCEEDED" }
```

### Internal Error (500)

```json
{ "error": "Internal server error", "code": "INTERNAL_ERROR" }
```

In development mode, the response includes a `stack` field with the full stack trace.

## Localization

Error messages are automatically localized based on the `Accept-Language` header:

```bash
# English (default)
curl -H "Accept-Language: en" http://localhost:4000/api/users/invalid-id
# → { "error": "User not found", "code": "NOT_FOUND" }

# German
curl -H "Accept-Language: de" http://localhost:4000/api/users/invalid-id
# → { "error": "Benutzer nicht gefunden", "code": "NOT_FOUND" }
```

Supported languages: **English** (`en`), **German** (`de`). The `code` field is always the same regardless of language — use it for programmatic handling, and display the `error` message to users.

See [Internationalization](/advanced-topics/internationalization) for adding languages.

---

**Related:**

- [REST API](/api-reference/rest-api) — Swagger UI and endpoint reference
- [Transport Layers](/api-reference/transport-layers) — Error format differences between REST and GraphQL
- [Internationalization](/advanced-topics/internationalization) — Adding error translations

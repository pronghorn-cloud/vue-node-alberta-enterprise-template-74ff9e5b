# Placeholder Pattern Reference

## Overview

This template uses a **consistent placeholder pattern** to indicate values that must be replaced with actual configuration. This helps avoid false positives from GitHub secret detection while making it clear what needs to be customized.

## Pattern

All placeholders follow this format:

```
{{VARIABLE_NAME}}
```

**Example**:
```bash
# Before (placeholder)
ENTRA_CLIENT_ID={{YOUR_AZURE_CLIENT_ID}}

# After (actual value)
ENTRA_CLIENT_ID=abc123-def456-ghi789
```

## Common Placeholders

### Database Configuration

| Placeholder | Description | Example Value |
|-------------|-------------|---------------|
| `{{DATABASE_CONNECTION_STRING}}` | Full PostgreSQL connection string | `postgresql://username:password@hostname:5432/dbname?sslmode=require` |
| `{{DB_USER}}` | Database username | `myappuser` |
| `{{DB_PASSWORD}}` | Database password | `<your-secure-password>` |

### Authentication - Azure (Entra ID)

| Placeholder | Description | Where to Find |
|-------------|-------------|---------------|
| `{{YOUR_AZURE_TENANT_ID}}` | Azure AD Tenant ID | Azure Portal → Azure Active Directory → Overview |
| `{{YOUR_AZURE_CLIENT_ID}}` | Application (client) ID | Azure Portal → App registrations → Your app → Overview |
| `{{YOUR_AZURE_CLIENT_SECRET}}` | Client secret value | Azure Portal → App registrations → Your app → Certificates & secrets |

### Authentication - SAML

| Placeholder | Description | Format |
|-------------|-------------|--------|
| `{{YOUR_SAML_IDP_SSO_URL}}` | Identity Provider SSO URL | `https://idp.example.com/saml/sso` |
| `{{YOUR_IDP_CERTIFICATE_BASE64}}` | IdP public certificate | PEM format, single line with `\n` |
| `{{YOUR_SP_PRIVATE_KEY_BASE64}}` | Service Provider private key | PEM format, single line with `\n` |
| `{{YOUR_SP_CERTIFICATE_BASE64}}` | Service Provider certificate | PEM format, single line with `\n` |
| `{{YOUR_SAML_IDP_LOGOUT_URL}}` | Single Logout URL | `https://idp.example.com/saml/logout` |

### Security & Secrets

| Placeholder | Description | How to Generate |
|-------------|-------------|-----------------|
| `{{GENERATE_WITH_OPENSSL_RAND_BASE64_32}}` | Session secret (32+ characters) | `openssl rand -base64 32` |
| `{{YOUR_SECURE_PASSWORD}}` | Generic secure password | Use password manager |
| `{{YOUR_DATABASE_PASSWORD}}` | Database user password | Azure-generated or custom |

### Azure Resources

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{YOUR_APPINSIGHTS_INSTRUMENTATION_KEY}}` | Application Insights key | `abcd1234-ef56-7890-gh12-ijklmnop3456` |

## Files Using Placeholders

### Environment Configuration

- [.env.example](.env.example) - Development with mock auth
- [.env.internal.example](.env.internal.example) - Internal (Entra ID)
- [.env.external.example](.env.external.example) - External (SAML)

### Documentation

- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment examples
- [docs/AUTH-SETUP.md](docs/AUTH-SETUP.md) - Authentication setup
- [docs/SECURITY.md](docs/SECURITY.md) - Security configuration
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) - Development guide
- [TEMPLATE-GUIDE.md](TEMPLATE-GUIDE.md) - Customization guide

## Usage Instructions

### 1. Identify Placeholders

Look for values wrapped in `{{...}}`:

```bash
# .env.internal.example
ENTRA_TENANT_ID = {{YOUR_AZURE_TENANT_ID}}
ENTRA_CLIENT_ID = {{YOUR_AZURE_CLIENT_ID}}
ENTRA_CLIENT_SECRET = {{YOUR_AZURE_CLIENT_SECRET}}
```

### 2. Replace with Actual Values

Remove the `{{` and `}}` brackets and insert your real values:

```bash
# .env (your actual config)
ENTRA_TENANT_ID=abc123-def456-ghi789-012345
ENTRA_CLIENT_ID=xyz789-uvw456-rst123-456789
ENTRA_CLIENT_SECRET=s3cr3t~v@lue.h3r3
```

### 3. Verify No Placeholders Remain

Before deploying, ensure no `{{...}}` patterns remain:

```bash
# Search for unreplaced placeholders
grep -r "{{" .env

# Should return nothing if all placeholders are replaced
```

## Why This Pattern?

### Problem

GitHub's secret detection can flag example values as potential secrets:

- `your-client-secret-here` ❌ Flagged as potential secret
- `<CLIENT_SECRET>` ❌ Flagged as potential secret
- `CHANGE_THIS` ❌ Flagged as potential secret

### Solution

Using `{{VARIABLE_NAME}}` avoids false positives:

- `{{YOUR_AZURE_CLIENT_SECRET}}` ✅ Recognized as placeholder
- Clear indication that value must be replaced
- Consistent pattern across all files
- Easy to search and validate

## Best Practices

### For Template Users

1. **Never commit actual secrets** - Only use placeholders in example files
2. **Use .gitignore** - Ensure `.env` is ignored (not `.env.example`)
3. **Search before deploy** - Run `grep "{{" .env` to find unreplaced placeholders
4. **Use secret managers** - Store production secrets in Azure Key Vault, not files

### For Template Maintainers

1. **Always use `{{VARIABLE_NAME}}` format** - Never use `<VAR>`, `$VAR`, or descriptive text
2. **Document all placeholders** - Add to this file when introducing new ones
3. **Include examples** - Show format in comments above placeholder
4. **Test detection** - Verify GitHub doesn't flag placeholders as secrets

## Examples

### Good Examples ✅

```bash
# Clear placeholder with descriptive name
SESSION_SECRET = {{GENERATE_WITH_OPENSSL_RAND_BASE64_32}}

# With example showing format
# Example: https://idp.example.com/saml/sso
SAML_ENTRY_POINT = {{YOUR_SAML_IDP_SSO_URL}}

# With generation instructions
# Generate with: openssl rand -base64 32
SESSION_SECRET = {{GENERATE_WITH_OPENSSL_RAND_BASE64_32}}
```

### Bad Examples ❌

```bash
# Will be flagged by GitHub
CLIENT_SECRET=your-client-secret-here
PASSWORD=<INSERT_PASSWORD_HERE>
API_KEY=CHANGE_THIS_IN_PRODUCTION

# Not clear enough
TENANT_ID=xxx
SECRET=...
```

## Troubleshooting

### GitHub Still Flags My Commit

**Cause**: Old placeholder pattern or actual secret accidentally committed

**Solution**:
1. Revert the commit
2. Replace with `{{PLACEHOLDER}}` pattern
3. If actual secret was committed, rotate it immediately
4. Add to `.gitignore` if needed

### Can't Find What to Replace

**Cause**: Placeholder name not clear enough

**Solution**:
1. Check this document for placeholder definitions
2. Check inline comments in the file
3. Refer to related documentation (AUTH-SETUP.md, DEPLOYMENT.md)

### Forgot to Replace Placeholder

**Cause**: Deployed with `{{...}}` still in config

**Solution**:
1. Application will likely fail to start (good!)
2. Error message will indicate which variable
3. Replace and redeploy

## Related Documentation

- [AUTH-SETUP.md](docs/AUTH-SETUP.md) - Detailed authentication configuration
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment-specific configuration
- [SECURITY.md](docs/SECURITY.md) - Security best practices
- [TEMPLATE-GUIDE.md](TEMPLATE-GUIDE.md) - Complete customization guide

---

**Last Updated**: 2026-01-30

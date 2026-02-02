# Authentication Setup Guide

This document provides detailed instructions for configuring authentication in the Alberta Government Enterprise Template. The template supports three authentication drivers:

1. **Mock Driver** - For local development (no real Identity Provider needed)
2. **MS Entra ID (Azure AD)** - For internal government employee applications
3. **SAML 2.0** - For external citizen/business-facing applications

## Table of Contents

- [Quick Start (Development)](#quick-start-development)
- [MS Entra ID Setup (Internal)](#ms-entra-id-setup-internal)
- [SAML 2.0 Setup (External)](#saml-20-setup-external)
- [Configuration Reference](#configuration-reference)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

---

## Quick Start (Development)

For local development, use the mock authentication driver. No external Identity Provider is required.

### 1. Copy Environment File

```bash
cp .env.example .env
```

### 2. Configure Mock Driver

Edit `.env`:

```bash
AUTH_DRIVER=mock
AUTH_CALLBACK_URL=http://localhost:3000/api/v1/auth/callback
WEB_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

### 3. Start Application

```bash
npm install
docker-compose up -d postgres
npm run migrate
npm run dev
```

### 4. Test Authentication

1. Navigate to http://localhost:5173
2. Click "Sign In"
3. Choose from 3 mock users:
   - User 0: Developer (admin + developer roles)
   - User 1: Administrator (admin role)
   - User 2: Standard User (user role)

The mock driver simulates a complete authentication flow without requiring an external Identity Provider.

---

## MS Entra ID Setup (Internal)

Use Microsoft Entra ID (formerly Azure AD) for internal government applications where users authenticate with their Microsoft 365 accounts.

### Prerequisites

- Azure subscription with Azure Active Directory
- Administrator access to Azure AD tenant
- App registration permissions

### Step 1: Create Azure AD App Registration

1. Sign in to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Configure the application:
   - **Name**: `Alberta Gov App - Internal` (or your app name)
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: Select "Web" and enter `https://your-app.alberta.ca/api/v1/auth/callback`
5. Click **Register**

### Step 2: Note Application Details

After registration, note the following from the **Overview** page:

- **Application (client) ID**: `abc12345-...`
- **Directory (tenant) ID**: `xyz98765-...`

### Step 3: Create Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description: `Production Secret`
4. Choose expiration period (recommend: 24 months)
5. Click **Add**
6. **IMPORTANT**: Copy the secret **Value** immediately (it won't be shown again)
7. Store securely (Azure Key Vault recommended for production)

### Step 4: Configure API Permissions

1. Navigate to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add the following permissions:
   - `User.Read` (sign in and read user profile)
   - `email`
   - `openid`
   - `profile`
6. Click **Add permissions**
7. **(Optional)** Click **Grant admin consent** if required by your organization

### Step 5: Configure Authentication Settings

1. Navigate to **Authentication**
2. Under **Implicit grant and hybrid flows**, ensure both are **unchecked** (we use authorization code flow)
3. Under **Advanced settings**:
   - **Allow public client flows**: No
   - **Enable the following mobile and desktop flows**: No
4. Click **Save**

### Step 6: Configure Application Environment

Copy `.env.internal.example` to `.env`:

```bash
cp .env.internal.example .env
```

Edit `.env` with your Azure AD details:

```bash
NODE_ENV=production
AUTH_DRIVER=entra-id

# From Azure AD App Registration
ENTRA_TENANT_ID={{YOUR_AZURE_TENANT_ID}}
ENTRA_CLIENT_ID={{YOUR_AZURE_CLIENT_ID}}
ENTRA_CLIENT_SECRET={{YOUR_AZURE_CLIENT_SECRET}}

# Your application URLs
AUTH_CALLBACK_URL=https://your-app.alberta.ca/api/v1/auth/callback
WEB_URL=https://your-app.alberta.ca
CORS_ORIGIN=https://your-app.alberta.ca

# Optional: Logout configuration
ENTRA_LOGOUT_URL=https://login.microsoftonline.com/{{YOUR_AZURE_TENANT_ID}}/oauth2/v2.0/logout
ENTRA_POST_LOGOUT_REDIRECT_URI=https://your-app.alberta.ca

# Database and session secrets
DB_CONNECTION_STRING=your-database-connection-string
SESSION_SECRET=generate-secure-random-string-here
```

### Step 7: Test Authentication

1. Deploy your application
2. Navigate to your application URL
3. Click "Sign In"
4. You should be redirected to Microsoft login
5. After authentication, verify you're redirected back to your app

### Entra ID Role Mapping

The template maps Azure AD roles to application roles. To assign roles:

1. In Azure Portal, go to **Enterprise Applications**
2. Find your application
3. Navigate to **Users and groups**
4. Assign users and specify app roles

Roles are available in the ID token via the `roles` claim.

---

## SAML 2.0 Setup (External)

Use SAML 2.0 for external-facing applications where citizens or businesses authenticate via a federated Identity Provider.

### Prerequisites

- Access to a SAML 2.0 Identity Provider (IdP)
- IdP metadata or configuration details
- Ability to register a new Service Provider (SP) in the IdP

### Step 1: Generate Service Provider Metadata

The template can operate without signing requests, but for production, generate an X.509 certificate:

```bash
# Generate private key
openssl req -x509 -newkey rsa:2048 -keyout saml-private-key.pem -out saml-cert.pem -days 730 -nodes

# Convert to single-line format for .env
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' saml-private-key.pem
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' saml-cert.pem
```

### Step 2: Prepare Service Provider Details

Your SAML Service Provider (SP) details:

- **Entity ID (Issuer)**: `urn:alberta:your-app:external`
- **Assertion Consumer Service (ACS) URL**: `https://your-app.alberta.ca/api/v1/auth/callback`
- **Single Logout (SLO) URL** (optional): `https://your-app.alberta.ca/api/v1/auth/logout/callback`
- **Name ID Format**: `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`

### Step 3: Register with Identity Provider

Work with your IdP administrator to register your application. Provide:

1. Service Provider Entity ID
2. ACS URL
3. Certificate (if request signing required)
4. Required attribute mappings (see below)

### Step 4: Obtain IdP Metadata

From your IdP, obtain:

- **SSO URL** (Entry Point): Where users are redirected to authenticate
- **IdP Certificate**: Public X.509 certificate (PEM format)
- **Logout URL** (optional): For Single Logout

### Step 5: Configure Attribute Mapping

Ensure your IdP sends these SAML attributes (or configure custom mappings):

| User Field | Default SAML Attribute |
|------------|------------------------|
| User ID | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier` |
| Email | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress` |
| Name | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name` |
| First Name | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname` |
| Last Name | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname` |
| Roles | `http://schemas.microsoft.com/ws/2008/06/identity/claims/role` |

### Step 6: Configure Application Environment

Copy `.env.external.example` to `.env`:

```bash
cp .env.external.example .env
```

Edit `.env` with your SAML configuration:

```bash
NODE_ENV=production
AUTH_DRIVER=saml

# SAML Configuration
SAML_ENTRY_POINT=https://your-idp.example.com/saml/sso
SAML_ISSUER=urn:alberta:your-app:external
SAML_CERT={{YOUR_IDP_CERTIFICATE_BASE64}}

# Optional: Request signing
# SAML_PRIVATE_KEY={{YOUR_SP_PRIVATE_KEY_BASE64}}
# SAML_CERT_SP={{YOUR_SP_CERTIFICATE_BASE64}}
# SAML_SIGN_REQUESTS=true

# Application URLs
AUTH_CALLBACK_URL=https://your-app.alberta.ca/api/v1/auth/callback
WEB_URL=https://your-app.alberta.ca
CORS_ORIGIN=https://your-app.alberta.ca

# Optional: Logout
# SAML_LOGOUT_URL=https://your-idp.example.com/saml/logout
# SAML_LOGOUT_CALLBACK_URL=https://your-app.alberta.ca/api/v1/auth/logout/callback

# Database and session secrets
DB_CONNECTION_STRING=your-database-connection-string
SESSION_SECRET=generate-secure-random-string-here
```

### Step 7: Test Authentication

1. Deploy your application
2. Navigate to your application URL
3. Click "Sign In"
4. You should be redirected to your SAML IdP
5. After authentication, verify you're redirected back to your app
6. Check the profile page to verify user attributes

### SAML Debugging

Enable debug logging to troubleshoot SAML issues:

```bash
LOG_LEVEL=debug
```

Check logs for SAML assertion details and attribute mappings.

---

## Configuration Reference

### Common Environment Variables

All authentication drivers use these base variables:

```bash
# Required
AUTH_DRIVER=mock|saml|entra-id
AUTH_CALLBACK_URL=https://your-app.alberta.ca/api/v1/auth/callback
WEB_URL=https://your-app.alberta.ca
CORS_ORIGIN=https://your-app.alberta.ca

# Session Management
SESSION_SECRET=your-secure-random-string
SESSION_STORE=postgres
DB_CONNECTION_STRING=postgresql://user:pass@host:port/db

# Security
RATE_LIMIT_MAX=1000
AUTH_RATE_LIMIT_MAX=10
```

### Mock Driver Variables

```bash
AUTH_DRIVER=mock
# No additional configuration required
```

### Entra ID Driver Variables

```bash
AUTH_DRIVER=entra-id
ENTRA_TENANT_ID={{YOUR_AZURE_TENANT_ID}}
ENTRA_CLIENT_ID={{YOUR_AZURE_CLIENT_ID}}
ENTRA_CLIENT_SECRET={{YOUR_AZURE_CLIENT_SECRET}}

# Optional
ENTRA_AUTHORITY=https://login.microsoftonline.com/{tenant}/v2.0
ENTRA_SCOPE=openid profile email
ENTRA_RESPONSE_TYPE=code
ENTRA_RESPONSE_MODE=query
ENTRA_DEFAULT_ROLE=employee
ENTRA_LOGOUT_URL=https://login.microsoftonline.com/{tenant}/oauth2/v2.0/logout
ENTRA_POST_LOGOUT_REDIRECT_URI=https://your-app.alberta.ca
```

### SAML Driver Variables

```bash
AUTH_DRIVER=saml
SAML_ENTRY_POINT=https://idp.example.com/saml/sso
SAML_ISSUER=urn:alberta:app:external
SAML_CERT={{YOUR_IDP_CERTIFICATE_BASE64}}

# Optional
SAML_PRIVATE_KEY={{YOUR_SP_PRIVATE_KEY_BASE64}}
SAML_CERT_SP={{YOUR_SP_CERTIFICATE_BASE64}}
SAML_PROTOCOL=saml2
SAML_SIGN_REQUESTS=false
SAML_WANT_ASSERTIONS_SIGNED=true
SAML_FORCE_AUTHN=false
SAML_NAME_ID_FORMAT=urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress

# Attribute Mapping
SAML_ATTRIBUTE_ID=http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier
SAML_ATTRIBUTE_EMAIL=http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress
SAML_ATTRIBUTE_NAME=http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name
SAML_ATTRIBUTE_FIRST_NAME=http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname
SAML_ATTRIBUTE_LAST_NAME=http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname
SAML_ATTRIBUTE_ROLES=http://schemas.microsoft.com/ws/2008/06/identity/claims/role
SAML_DEFAULT_ROLE=citizen

# Logout
SAML_LOGOUT_URL=https://idp.example.com/saml/logout
SAML_LOGOUT_CALLBACK_URL=https://your-app.alberta.ca/api/v1/auth/logout/callback
```

---

## Troubleshooting

### Entra ID Issues

**Problem**: "AADSTS50011: The redirect URI specified in the request does not match the redirect URIs configured for the application"

**Solution**: Ensure `AUTH_CALLBACK_URL` in `.env` exactly matches the Redirect URI in Azure AD App Registration (including https vs http, trailing slash, etc.)

---

**Problem**: "AADSTS700016: Application with identifier was not found in the directory"

**Solution**: Verify `ENTRA_CLIENT_ID` and `ENTRA_TENANT_ID` are correct. Check you're signing in with the correct Azure AD tenant.

---

**Problem**: User authenticated but has no roles

**Solution**:
1. Check if roles are configured in Azure AD Enterprise Application
2. Ensure users are assigned roles in "Users and groups"
3. Set `ENTRA_DEFAULT_ROLE` for a fallback role

---

### SAML Issues

**Problem**: "SAML assertion validation failed"

**Solution**:
1. Verify `SAML_CERT` contains the correct IdP public certificate
2. Check certificate is in PEM format with proper escaping (`\n`)
3. Ensure certificate hasn't expired
4. Verify `SAML_WANT_ASSERTIONS_SIGNED=true` matches IdP configuration

---

**Problem**: "Invalid SAML response"

**Solution**:
1. Check `SAML_ISSUER` matches the Entity ID registered with IdP
2. Verify `SAML_ENTRY_POINT` is the correct SSO URL
3. Enable `LOG_LEVEL=debug` and check logs for detailed SAML response
4. Use browser developer tools to inspect SAML response

---

**Problem**: User authenticated but missing attributes

**Solution**:
1. Check IdP attribute mapping configuration
2. Verify attribute names in `.env` match what IdP sends
3. Enable debug logging to see raw SAML assertions
4. Adjust `SAML_ATTRIBUTE_*` variables to match IdP attribute names

---

### General Issues

**Problem**: "Session not found" or "User not authenticated" after login

**Solution**:
1. Check `SESSION_SECRET` is set and consistent across app restarts
2. Verify PostgreSQL session table exists (`npm run migrate`)
3. Ensure `CORS_ORIGIN` matches `WEB_URL`
4. Check browser allows cookies (not in incognito/private mode)
5. Verify cookie settings in [app.ts](../apps/api/src/app.ts):
   - `secure: true` requires HTTPS
   - `sameSite: 'lax'` should work for most scenarios

---

**Problem**: "Invalid redirect" or CORS errors

**Solution**:
1. Ensure `WEB_URL` and `CORS_ORIGIN` match exactly
2. Check `AUTH_CALLBACK_URL` uses the correct protocol (https in production)
3. Verify API and web app are on same domain (or CORS is properly configured)

---

## Security Best Practices

### 1. Secrets Management

**Development**:
- Use `.env` file (excluded from git via `.gitignore`)
- Never commit real secrets to version control

**Production**:
- Use Azure Key Vault or similar secret management service
- Inject secrets as environment variables at runtime
- Rotate secrets regularly (client secrets, session secrets)

### 2. Session Security

```bash
# Generate strong session secret
openssl rand -base64 32

# Session configuration (in production)
SESSION_SECRET=<strong-random-string>
NODE_ENV=production  # Enables secure cookies (HTTPS only)
```

### 3. HTTPS Requirements

- **Always use HTTPS in production**
- `secure: true` cookie flag requires HTTPS
- Many Identity Providers require HTTPS callback URLs

### 4. Rate Limiting

Protect authentication endpoints from brute force attacks:

```bash
RATE_LIMIT_MAX=1000        # General API rate limit
AUTH_RATE_LIMIT_MAX=10     # Stricter for auth endpoints
```

### 5. Certificate Management

For SAML:
- Store certificates securely
- Monitor expiration dates
- Have a certificate renewal process
- Use strong key sizes (minimum RSA 2048-bit)

### 6. Audit Logging

Enable comprehensive logging for security monitoring:

```bash
LOG_LEVEL=info
LOG_FORMAT=combined
```

Monitor logs for:
- Failed authentication attempts
- Unusual access patterns
- Session anomalies
- Configuration errors

### 7. Multi-Factor Authentication (MFA)

**Entra ID**: Enable MFA in Azure AD Conditional Access policies

**SAML**: Ensure your IdP supports and enforces MFA

### 8. Principle of Least Privilege

- Assign minimum necessary roles to users
- Use role-based access control (RBAC)
- Regularly review user permissions

### 9. Security Headers

The template includes Helmet.js for security headers. Verify in production:

```typescript
// apps/api/src/app.ts
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
}))
```

### 10. Regular Updates

- Keep dependencies updated (`npm audit`)
- Monitor security advisories
- Test updates in staging before production

---

## Additional Resources

### Microsoft Entra ID
- [Azure AD Documentation](https://docs.microsoft.com/en-us/azure/active-directory/)
- [App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [OpenID Connect on Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-protocols-oidc)

### SAML 2.0
- [SAML 2.0 Specification](http://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html)
- [SAML Debugging Tools](https://www.samltool.com/)
- [@node-saml/passport-saml Documentation](https://github.com/node-saml/passport-saml)

### Government of Alberta
- [Digital Service Standard](https://www.alberta.ca/digital-service-standard)
- [Security and Privacy Guidelines](https://www.alberta.ca/security-and-privacy)

---

## Support

For issues or questions:

1. Check this documentation
2. Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. Check application logs
4. Contact your Identity Provider administrator
5. Consult your organization's IT security team

---

**Last Updated**: 2025-01-29
**Template Version**: 1.0.0

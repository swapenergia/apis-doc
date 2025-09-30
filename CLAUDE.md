# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Swagger UI-based API documentation portal that serves OpenAPI specifications for Kafka APIs. The project provides a custom authentication plugin for quick login functionality.

## Architecture

### Core Components

1. **Swagger UI Integration** (`index.html`, `js/swagger-initializer.js`)
   - Uses Swagger UI v4 from CDN
   - Configured to serve multiple API specifications from `docs/` directory
   - Custom authentication plugin integration

2. **Custom Authentication Plugin** (`js/auth-plugin.js`)
   - Implements a quick login dropdown for predefined users (sia, caf, gesfincas)
   - Authenticates against `https://kafka.secretia.es/api/auth/login`
   - Automatically injects JWT tokens into Swagger UI's Bearer authentication
   - Plugin is exported as `UserAuhPlugin` (note: there's a typo in the export name)

3. **API Specifications** (`docs/kafka.yaml`)
   - OpenAPI 3.0.0 format
   - Documents Kafka topic APIs for inter-organization data synchronization
   - Includes JWT Bearer authentication scheme

### Key Implementation Details

- The auth plugin uses MutationObserver to detect when Swagger's authorization modal opens and injects a custom login interface
- Authentication tokens are obtained via POST to `/api/auth/login` with username/password
- After successful login, the modal automatically closes and the token is applied to Swagger UI

## Development Commands

Since this is a static site with no build process:

```bash
# Serve the documentation locally (requires a local web server)
python3 -m http.server 8000
# or
npx http-server .
```

## Code Style

- JavaScript: ES6 modules, async/await patterns
- Indentation: 2 spaces (configured in .vscode/settings.json)
- No build or bundling process - direct browser module imports

## Important Notes

- The authentication credentials are hardcoded in `js/auth-plugin.js` for demo/development purposes
- The export name `UserAuhPlugin` contains a typo (should be `UserAuthPlugin`) - this is already imported correctly as `UserAuthPlugin` in swagger-initializer.js
- The API endpoints are configured to use `https://kafka.secretia.es`
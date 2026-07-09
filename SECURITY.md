# Security Policy

## Reporting a Vulnerability

Please do not publish sensitive security details in a public issue. Open a private report or contact the maintainer with a minimal summary.

## Security Notes

This application handles authentication, uploaded resumes, AI prompts, and generated reports. Before production deployment, harden:

- JWT cookie flags
- Request validation
- Upload MIME validation
- Rate limiting
- Secure headers
- CORS configuration
- Environment variable management


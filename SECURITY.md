# Security Policy

## Reporting a Vulnerability

**DO NOT** open a public GitHub issue for security vulnerabilities.

If you discover a security vulnerability in this repository, please report it responsibly using one of the following methods:

1. **Email:** Send details to **heyhaleybird@gmail.com** with the subject line: `[SECURITY] <repository-name> — Vulnerability Report`
2. **GitHub Private Vulnerability Reporting:** Use the "Report a vulnerability" button under the Security tab of this repository (if enabled).

### What to Include

- A clear description of the vulnerability
- Steps to reproduce the issue
- Affected versions or branches
- Potential impact assessment
- Any suggested fix (optional but appreciated)

## Response Timeline

| Action | Timeframe |
|--------|-----------|
| Acknowledgment of report | Within 48 hours |
| Initial assessment | Within 5 business days |
| Patch development | Within 30 days (critical), 90 days (non-critical) |
| Public disclosure | After patch is released and deployed |

## Disclosure Policy

- **Strict coordinated disclosure**: Do NOT publicly disclose any vulnerability until an official patch has been released and a minimum of 30 days has passed since the fix was deployed.
- Premature disclosure may result in legal action.
- Credit will be given to reporters (unless anonymity is requested) once the fix is public.

## Scope

This security policy applies to:

- All code in this repository (all branches)
- Any deployed instances or services derived from this codebase
- CI/CD pipelines and GitHub Actions workflows
- Dependencies managed within this repository

### Out of Scope

- Third-party services not maintained by this project
- Social engineering attacks against maintainers
- Vulnerabilities in upstream dependencies (report those to the respective maintainer)
- Denial of service attacks against hosted infrastructure

## Supported Versions

Only the latest release and the `main` (or `master`) branch receive security updates. Older versions are not supported.

## Security Standards

This project enforces the following security practices:

1. **No secrets in code**: API keys, tokens, passwords, and credentials must NEVER be committed to the repository.
2. **Dependency management**: Dependencies are regularly audited for known vulnerabilities.
3. **Least privilege**: All automations, workflows, and integrations operate with minimum required permissions.
4. **Branch protection**: The default branch requires pull request reviews before merging.
5. **Signed commits**: Contributors are encouraged to sign commits with GPG keys.
6. **No unauthorized data collection**: This project does not collect, store, or transmit user data without explicit consent.

## Prohibited Actions

The following actions are strictly prohibited and may result in legal action:

- Unauthorized access to systems, accounts, or data
- Exploiting vulnerabilities beyond what is necessary to demonstrate the issue
- Exfiltration, modification, or destruction of data
- Denial of service attacks
- Social engineering or phishing attacks against maintainers or users
- Automated vulnerability scanning without prior written consent

## Safe Harbor

We support responsible security research. If you comply with this policy:

- We will not pursue legal action against you
- We will work with you to understand and resolve the issue
- We will publicly acknowledge your contribution (if desired)

This safe harbor applies only if:
- You report the vulnerability exclusively through the channels listed above
- You do not exploit the vulnerability beyond proof-of-concept
- You do not violate any laws in the process
- You allow reasonable time for the issue to be resolved before any disclosure

## Intellectual Property Notice

All code and intellectual property in this repository is owned by **Haley Ann Bird**. Unauthorized reproduction, distribution, or use of proprietary algorithms, architectures, or trade secrets discovered during security research is strictly prohibited.

---

**Last updated:** 2026-05-18
**Policy version:** 1.0
**Maintainer:** Haley Ann Bird (heyhaleybird@gmail.com)

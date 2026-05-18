# Security Policy — Haley Bird Creately

## System Overview

**Haley Bird Creately** is a personalized creative technology implementation. This security policy defines the responsible disclosure process, security standards, and legal protections specific to this system.

**Technology Stack:** JavaScript, Web Technologies

## Reporting a Vulnerability

**DO NOT** open a public GitHub issue for security vulnerabilities.

If you discover a security vulnerability in Haley Bird Creately, report it exclusively through:

1. **Email:** Send details to **heyhaleybird@gmail.com** with the subject line: `[SECURITY] HaleyBirdCreately — Vulnerability Report`
2. **GitHub Private Vulnerability Reporting:** Use the "Report a vulnerability" button under the Security tab (if enabled).

### What to Include

- A clear description of the vulnerability and which component is affected
- Steps to reproduce the issue
- Affected versions or branches
- Potential impact assessment specific to Haley Bird Creately's functionality
- Any suggested remediation (optional but appreciated)

## Response Timeline

| Action | Timeframe |
|--------|-----------|
| Acknowledgment of report | Within 48 hours |
| Initial assessment and triage | Within 5 business days |
| Patch for critical issues | Within 30 days |
| Patch for non-critical issues | Within 90 days |
| Public disclosure | After patch + minimum 30 days post-deployment |

## Disclosure Policy

- **Strict coordinated disclosure**: Do NOT publicly disclose any vulnerability until an official patch has been released and a minimum of 30 days has passed since the fix was deployed.
- Premature disclosure may result in legal action under applicable IP protection and computer fraud laws.
- Credit will be given to reporters (unless anonymity is requested) once the fix is public.

## Scope — Protected Components

This security policy covers all components of Haley Bird Creately:

| Component | Security Priority |
|-----------|-------------------|
| **Creative Workflow Engine** | CRITICAL |
| **Personalized Design System** | CRITICAL |

### Priority Vulnerability Categories

The following vulnerability types are of particular concern for this system:

- Cross-site scripting (XSS) and client-side injection

### Out of Scope

- Vulnerabilities in third-party services or upstream dependencies (report to respective maintainers)
- Social engineering attacks against the maintainer
- Denial of service attacks against hosted infrastructure
- Issues in forked or mirrored copies not maintained by this project

## Supported Versions

Only the latest release and the default branch (`main` or `master`) receive security updates. Older versions are not supported.

## Security Standards

This project enforces the following security practices:

1. **No secrets in code**: API keys, tokens, passwords, and credentials must NEVER be committed to the repository.
2. **Dependency auditing**: Dependencies are regularly reviewed for known vulnerabilities.
3. **Least privilege**: All automations, workflows, and integrations operate with minimum required permissions.
4. **Branch protection**: The default branch requires pull request reviews before merging.
5. **Signed commits**: Contributors are encouraged to sign commits with GPG keys.
6. **No unauthorized data collection**: This project does not collect, store, or transmit user data without explicit consent.

## Prohibited Actions

The following actions are strictly prohibited and may result in legal action:

- Unauthorized access to systems, accounts, or data
- Exploiting vulnerabilities beyond minimal proof-of-concept demonstration
- Exfiltration, modification, or destruction of data
- Reverse engineering of proprietary algorithms or trade secrets
- Denial of service attacks
- Automated vulnerability scanning without prior written consent
- Social engineering or phishing attacks against maintainers or users

## Safe Harbor

We support responsible security research. If you comply with this policy:

- We will not pursue legal action against you
- We will work with you to understand and resolve the issue
- We will publicly acknowledge your contribution (if desired)

**Safe harbor applies ONLY if:**
- You report exclusively through the channels listed above
- You do not exploit the vulnerability beyond minimal proof-of-concept
- You do not access, modify, or exfiltrate any actual user or system data
- You do not violate any laws in the process
- You allow reasonable time for resolution before any disclosure

## Intellectual Property & Legal Notice

All code, architecture, algorithms, data schemas, and intellectual property in this repository is the exclusive property of **Haley Ann Bird**. This repository operates under a proprietary license — all rights reserved unless explicitly stated otherwise.

The following are expressly protected as trade secrets and/or patent-pending IP:
- Creative Workflow Engine
- Personalized Design System

Unauthorized reproduction, distribution, reverse engineering, decompilation, or commercial use of any proprietary component discovered during security research is strictly prohibited and will be prosecuted to the fullest extent of applicable law.

Personalized creative technology — design patterns are proprietary.

---

**Last updated:** 2026-05-18
**Policy version:** 1.0
**System:** Haley Bird Creately
**Maintainer:** Haley Ann Bird (heyhaleybird@gmail.com)

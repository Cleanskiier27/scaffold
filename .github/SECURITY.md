# Security Policy

> *"A fortress is only as strong as the honesty of those who guard it."*

---

## Supported Versions

The following versions of **project-name** currently receive security updates:

| Version | Supported |
|---|---|
| 1.x (latest) | ✅ Active |
| 0.x | ⚠️ Critical fixes only |
| < 0.1 | ❌ End of life |

---

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Public disclosure before a fix is available puts every user at risk. We take responsible disclosure seriously and will work with you quickly.

### How to Report

1. **Email:** Send details to **security@your-org.com**
   - Use the subject line: `[SECURITY] <brief description>`
   - Encrypt with our PGP key if the vulnerability is critical (key fingerprint below)

2. **GitHub Private Advisory:** Use [GitHub's private vulnerability reporting](https://github.com/your-org/project-name/security/advisories/new) if you prefer to stay within the GitHub ecosystem.

### What to Include

A complete report makes triage faster and your recognition well-deserved. Please include:

- **Description** — What is the vulnerability and where does it live?
- **Impact** — What can an attacker accomplish?
- **Reproduction steps** — Minimal steps or proof-of-concept code
- **Affected versions** — Which versions are known to be vulnerable?
- **Suggested fix** — Optional, but welcome

### Response Timeline

| Milestone | Target |
|---|---|
| Initial acknowledgment | ≤ 48 hours |
| Severity assessment | ≤ 5 business days |
| Fix development begins | ≤ 10 business days |
| Patch release & advisory | Coordinated with reporter |

We will keep you informed throughout the process. If you do not hear back within 48 hours, follow up at the same email address.

---

## PGP Key

```
Fingerprint: XXXX XXXX XXXX XXXX XXXX  XXXX XXXX XXXX XXXX XXXX
Key ID:      0xXXXXXXXX
Key server:  keys.openpgp.org
```

*(Replace with your actual PGP key before publishing.)*

---

## Scope

### In Scope
- Vulnerabilities in the source code of this repository
- Vulnerabilities in official Docker images or published packages
- Dependency vulnerabilities that directly affect this project's users

### Out of Scope
- Vulnerabilities in third-party dependencies not yet disclosed upstream
- Issues in forks or unofficial distributions
- Social engineering or phishing against our team
- Denial-of-service attacks against our infrastructure

---

## Safe Harbor

We consider security research conducted under this policy to be:

- Authorized concerning any applicable anti-hacking laws
- Exempt from restrictions in our Terms of Service that would otherwise prohibit research
- Lawful, helpful, and conducted in good faith

We will not pursue legal action against researchers who adhere to this policy. We ask that you give us reasonable time to respond before public disclosure.

---

## Recognition

Researchers who responsibly disclose valid vulnerabilities will be acknowledged in the security advisory (unless they prefer anonymity) and in our Hall of Fame.

**Thank you for helping keep project-name and its users safe.**

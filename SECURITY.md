# Security Policy

## Scope

MD-AutoPersianWrite is a client-side Markdown editor and PWA built with React, TypeScript, Vite, React-Markdown, Mermaid, KaTeX, and related frontend dependencies.

This policy covers security vulnerabilities affecting the application, source code, build process, dependencies, and published PWA assets.

Security-sensitive areas include Markdown/HTML rendering, URL handling, Mermaid/KaTeX rendering, client-side data exposure, OAuth/cloud integrations, dependency vulnerabilities, CI/CD, and supply-chain risks.

## Recent Security Hardening

The current stabilization work includes the following verified hardening measures:

- HTML rendering uses an explicit tag allowlist and rejects event-handler attributes and inline `style` attributes.
- `href`, `src`, and `poster` values are validated against an allowlist of `http:`, `https:`, `mailto:`, and `tel:` protocols, with fragment URLs supported.
- Protocol-relative URLs such as `//example.com` are resolved and validated rather than being accepted merely because they begin with `/`.
- Google Drive authentication refresh/retry is bounded to avoid repeated retry loops after authentication failures.
- Internal access-check/debug artifacts are not part of the application runtime or published source.
- Service Worker cache versioning and update behavior are kept aligned with the application version.
- Editor/Preview resource cleanup is maintained for listeners, observers, timers, and animation frames where applicable.

These controls are defense-in-depth. They do not guarantee that the application is free of vulnerabilities.

## Supported Versions

Security fixes are currently provided for the latest `2.x` release line.

| Version | Supported |
| ------- | --------- |
| `2.x`   | :white_check_mark: |
| `< 2.0` | :x: |

Only the latest supported release is guaranteed to receive security updates. Users are strongly encouraged to keep the application and its dependencies up to date.

## Reporting a Vulnerability

**Please do not disclose security vulnerabilities through public GitHub Issues, pull requests, discussions, or other public channels.**

For a vulnerability that could affect users, please use GitHub's private vulnerability reporting / Security Advisories feature for this repository when available:

1. Open the repository's **Security** tab.
2. Select **Advisories**.
3. Choose **Report a vulnerability** and provide the details privately.

If private vulnerability reporting is not available, contact the project maintainer through a private channel rather than publishing the vulnerability publicly. Do not include sensitive exploit details in a public issue.

### What to Include

A useful security report should contain, where applicable:

- A clear description of the vulnerability and its security impact.
- The affected version or commit.
- The affected component, file, dependency, or feature.
- Reproduction steps or a minimal proof of concept.
- The expected behavior and the observed behavior.
- Any prerequisites or conditions required to reproduce the issue.
- Suggested remediation, if known.
- Information about whether user data, stored content, or application integrity could be affected.

Please avoid including real credentials, personal information, private documents, or other sensitive data in a report.

## Response Process

The project maintainer will make a reasonable effort to:

- Acknowledge a valid private security report within **3 business days**.
- Assess severity, affected versions, and practical impact.
- Provide an initial status update within **7 business days** when investigation requires additional time.
- Coordinate disclosure and remediation with the reporter when appropriate.
- Credit the reporter in the security advisory when requested and appropriate.

Response and remediation timelines may vary depending on severity, exploitability, affected dependencies, and complexity of the required fix.

## Security Fixes and Disclosure

When a vulnerability is confirmed, the project may release a patched version, update affected dependencies, add appropriate security controls, and publish a GitHub Security Advisory when appropriate.

Public disclosure should be coordinated with the maintainer whenever possible so that users have a reasonable opportunity to update to a fixed version.

## Dependency and Supply-Chain Security

The project relies on third-party frontend and build dependencies. Security reports concerning vulnerable or compromised dependencies are welcome, especially when they can affect runtime behavior, the build pipeline, or distributed assets.

Dependency updates should be evaluated for both security impact and compatibility with the supported release line.

## Out of Scope

The following are generally not considered security vulnerabilities unless they demonstrate a meaningful security impact:

- General bugs without a security consequence.
- Feature requests or usability issues.
- Vulnerabilities that exist only in unsupported versions.
- Issues requiring a user to intentionally execute arbitrary code outside the application's normal behavior, unless the application itself makes that execution possible.
- Reports based solely on theoretical concerns without practical security impact or reproducible evidence.

Out-of-scope reports may still be reviewed as normal bug reports or hardening suggestions.

## Responsible Disclosure

We appreciate responsible disclosure and coordinated security research. Please allow reasonable time for investigation, remediation, and release of a fix before publicly disclosing a confirmed vulnerability.

Thank you for helping keep MD-AutoPersianWrite and its users secure.

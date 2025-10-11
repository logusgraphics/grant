# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated CI/CD.

## Available Workflows

### Security Audit (`security-audit.yml`)

Automated security vulnerability scanning.

**Status:** Ready to use when you host on GitHub

**Triggers:**

- Push to main/master
- Pull requests
- Weekly schedule (Mondays 9am UTC)
- Manual dispatch

**What it does:**

- Scans all dependencies for vulnerabilities
- Uploads audit reports as artifacts
- Comments on PRs with vulnerability details
- Fails CI on high/critical vulnerabilities

---

## Setup

These workflows will automatically activate when you:

1. Push this repository to GitHub
2. Enable GitHub Actions in repository settings

No additional configuration needed!

---

## Alternative Platforms

If you're using a different git hosting platform:

- **GitLab:** See `scripts/README.md` for GitLab CI example
- **Bitbucket:** Adapt the scripts to Bitbucket Pipelines
- **Azure DevOps:** Use Azure Pipelines with the bash scripts
- **Self-hosted:** Run scripts directly in your CI/CD tool

The bash scripts in `/scripts` are platform-agnostic and can be used anywhere.

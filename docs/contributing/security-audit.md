---
title: Security Audit
description: Dependency vulnerability scanning and security review workflow
---

# Security Audit

Grant includes shell scripts for dependency vulnerability scanning across the entire monorepo.

## Commands

```bash
pnpm audit:quick    # Fast check for HIGH/CRITICAL only (CI gate)
pnpm audit          # Full audit with detailed report
pnpm audit:fix      # Attempt automatic fixes with backup
pnpm audit:pnpm     # Raw pnpm audit across all workspaces
```

## Scripts

All scripts are in `/scripts` and work on Linux, macOS, WSL, and Docker:

| Script              | Purpose                                            | Output                                    |
| ------------------- | -------------------------------------------------- | ----------------------------------------- |
| `audit-quick.sh`    | Fast pass/fail for high/critical vulnerabilities   | `audit-reports/quick-audit-latest.json`   |
| `audit-security.sh` | Full audit, outdated packages, lock file integrity | `audit-reports/audit-YYYYMMDD-HHMMSS.txt` |
| `audit-fix.sh`      | Auto-fix with backup and post-fix report           | `audit-reports/post-fix-audit-*.json`     |

Reports are stored in `audit-reports/` (git-ignored, auto-created).

## Severity Levels

| Severity     | Action                                |
| ------------ | ------------------------------------- |
| **Critical** | Fix immediately before any deployment |
| **High**     | Fix before production release         |
| **Moderate** | Fix in next update cycle              |
| **Low**      | Fix when convenient                   |

## Recommended Workflow

**Daily:** Run `pnpm audit:quick` before committing.

**Weekly:** Run `pnpm audit` for a full report.

**After dependency updates:**

```bash
pnpm audit
pnpm build
pnpm test
```

**When vulnerabilities are found:**

1. Try `pnpm audit:fix`
2. If auto-fix fails, update specific packages: `pnpm update <package>@latest`
3. Verify: `pnpm audit && pnpm build && pnpm test`
4. If no fix exists, document the accepted risk

## CI/CD Integration

### GitHub Actions

An automated workflow at `.github/workflows/security-audit.yml` runs on pushes to main, all PRs, and weekly (Mondays at 9am UTC). It uploads audit artifacts and fails on high/critical findings.

### Generic CI/CD

```bash
pnpm install --frozen-lockfile
pnpm audit:quick    # Exit code 1 if vulnerabilities found
```

## Post-Fix Checklist

After running `pnpm audit:fix`:

1. `pnpm build` — ensure everything compiles
2. `pnpm test` — verify functionality
3. Review `pnpm-lock.yaml` changes
4. Test critical features manually
5. Commit if all checks pass

---

**Related:**

- [Testing](/contributing/testing) — Test setup and compliance tests
- [Development Guide](/contributing/guide) — Project structure and workflow

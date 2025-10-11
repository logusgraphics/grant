# Security Audit Scripts

This directory contains security audit scripts for the Grant Platform monorepo.

## Available Scripts

### 1. Full Security Audit

```bash
pnpm audit
# or
./scripts/audit-security.sh
```

**What it does:**

- Runs comprehensive security audit across all workspaces
- Checks for outdated packages
- Verifies lock file integrity
- Identifies high-risk packages
- Generates detailed report with timestamp

**When to use:**

- Before releases
- Weekly security reviews
- After updating dependencies
- When setting up CI/CD

**Output:** Generates a timestamped report file: `security-audit-report-YYYYMMDD-HHMMSS.txt`

---

### 2. Quick Security Check

```bash
pnpm audit:quick
# or
./scripts/audit-quick.sh
```

**What it does:**

- Fast check for HIGH and CRITICAL vulnerabilities only
- No detailed reporting
- Quick pass/fail result

**When to use:**

- Pre-commit hooks
- Quick checks during development
- CI/CD pipeline gate checks

**Exit codes:**

- `0` = No critical vulnerabilities
- `1` = Critical vulnerabilities found

---

### 3. Automatic Fix

```bash
pnpm audit:fix
# or
./scripts/audit-fix.sh
```

**What it does:**

- Creates backup of `pnpm-lock.yaml`
- Attempts automatic fixes
- Reinstalls dependencies
- Verifies fixes
- Provides rollback instructions

**When to use:**

- After detecting vulnerabilities
- When automatic fixes are acceptable
- Before manual intervention

**⚠️ Important:**

- Always test after running fixes
- Review changes before committing
- Some fixes may introduce breaking changes

---

### 4. Raw PNPM Audit

```bash
pnpm audit:pnpm
```

**What it does:**

- Runs native `pnpm audit` across all workspaces
- No formatting or additional checks
- Direct output from pnpm

**When to use:**

- When you need raw audit data
- For custom processing
- Debugging audit issues

---

## CI/CD Integration (Optional)

### GitHub Actions

If you're using GitHub, there's an automated workflow available at `.github/workflows/security-audit.yml` that:

- Runs on every push to main/master
- Runs on all pull requests
- Runs weekly (Mondays at 9am UTC)
- Can be triggered manually
- Uploads audit results as artifacts
- Comments on PRs with vulnerability details
- Fails CI if high/critical vulnerabilities found

### GitLab CI

Add to `.gitlab-ci.yml`:

```yaml
security-audit:
  stage: test
  script:
    - pnpm install --frozen-lockfile
    - pnpm audit:quick
  allow_failure: true
  only:
    - merge_requests
    - main
```

### Generic CI/CD

For any CI/CD platform:

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Run quick audit (fails on high/critical)
pnpm audit:quick
```

---

## Pre-commit Hook (Optional)

To run security checks before every commit, add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run quick security audit
pnpm audit:quick || {
    echo "⚠️  Security vulnerabilities detected!"
    echo "Run 'pnpm audit' for details"
    echo "Run 'pnpm audit:fix' to attempt fixes"
    exit 1
}
```

---

## Best Practices

### Daily Development

```bash
# Quick check before committing
pnpm audit:quick
```

### Weekly Maintenance

```bash
# Full audit with report
pnpm audit

# Check for outdated packages
pnpm outdated --recursive
```

### After Updating Dependencies

```bash
# Run full audit
pnpm audit

# Run tests
pnpm test

# Build project
pnpm build
```

### Handling Vulnerabilities

1. **Identify severity:**

   ```bash
   pnpm audit
   ```

2. **Attempt automatic fix:**

   ```bash
   pnpm audit:fix
   ```

3. **If automatic fix fails:**
   - Check `pnpm outdated` for package updates
   - Update specific packages: `pnpm update <package-name>`
   - Check package changelogs for breaking changes
   - Test thoroughly after updates

4. **If no fix available:**
   - Check if vulnerability affects your usage
   - Consider alternative packages
   - Document accepted risk if appropriate
   - Monitor for updates

---

## Troubleshooting

### Scripts not executable

```bash
chmod +x scripts/*.sh
```

### Lock file out of sync

```bash
pnpm install
```

### False positives

Check the specific vulnerability details - some may not affect your implementation.

### Package conflicts

```bash
# Clear cache and reinstall
rm -rf node_modules
pnpm store prune
pnpm install
```

---

## Additional Resources

- [pnpm audit documentation](https://pnpm.io/cli/audit)
- [npm advisory database](https://github.com/advisories)
- [Snyk vulnerability database](https://snyk.io/vuln)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)

---

## Support

For issues or questions about security audits:

1. Check this README
2. Review audit report details
3. Consult package-specific security advisories
4. Contact the development team

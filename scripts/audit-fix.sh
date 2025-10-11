#!/bin/bash

# Security Audit Fix Script - Attempts to automatically fix vulnerabilities

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Automatic Vulnerability Fixes${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. Create backup
echo -e "${BLUE}▶ Creating backup...${NC}"
cp pnpm-lock.yaml pnpm-lock.yaml.backup
echo -e "${GREEN}✓ Backup created: pnpm-lock.yaml.backup${NC}"
echo ""

# 2. Run audit fix
echo -e "${BLUE}▶ Attempting to fix vulnerabilities...${NC}"
if pnpm audit --fix 2>&1; then
    echo -e "${GREEN}✓ Vulnerabilities fixed!${NC}"
else
    echo -e "${YELLOW}⚠ Some vulnerabilities could not be automatically fixed${NC}"
    echo -e "${BLUE}ℹ Manual intervention may be required${NC}"
fi
echo ""

# 3. Reinstall dependencies
echo -e "${BLUE}▶ Reinstalling dependencies...${NC}"
pnpm install
echo -e "${GREEN}✓ Dependencies reinstalled${NC}"
echo ""

# 4. Run audit again to check
echo -e "${BLUE}▶ Verifying fixes...${NC}"
if pnpm audit --json > /tmp/post-fix-audit.json 2>&1; then
    echo -e "${GREEN}✓ All vulnerabilities resolved!${NC}"
    rm -f pnpm-lock.yaml.backup
    echo -e "${GREEN}✓ Backup removed${NC}"
else
    echo -e "${YELLOW}⚠ Some vulnerabilities remain${NC}"
    echo ""
    echo -e "${BLUE}Remaining issues:${NC}"
    pnpm audit || true
    echo ""
    echo -e "${BLUE}Options:${NC}"
    echo -e "  1. Review and update packages manually"
    echo -e "  2. Restore backup: ${YELLOW}cp pnpm-lock.yaml.backup pnpm-lock.yaml${NC}"
    echo -e "  3. Check for breaking changes in updated packages"
fi
echo ""

echo -e "${YELLOW}⚠ Important: Test your application after fixes!${NC}"
echo -e "${BLUE}Recommended steps:${NC}"
echo -e "  1. Run 'pnpm build' to ensure everything compiles"
echo -e "  2. Run 'pnpm test' to verify functionality"
echo -e "  3. Test critical features manually"
echo -e "  4. Commit changes if all tests pass"


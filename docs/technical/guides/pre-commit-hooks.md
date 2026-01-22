# Pre-Commit Hooks Setup

## Overview

RYLA uses Husky to run automated checks before commits and pushes. This ensures code quality, security, and consistency across the team.

## Hooks Installed

| Hook         | When                         | What It Does                                                     |
| ------------ | ---------------------------- | ---------------------------------------------------------------- |
| `pre-commit` | Before commit                | Runs lint-staged (ESLint, Prettier, Secretlint, file size check) |
| `commit-msg` | After writing commit message | Validates conventional commit format                             |
| `pre-push`   | Before push                  | Validates branch naming convention                               |

## Pre-Commit Checks

### 1. ESLint (Code Quality)

Runs on staged `.ts`, `.tsx`, `.js`, `.jsx` files:

- TypeScript errors
- Unused variables
- Browser compatibility warnings
- Console statements
- Code style issues

**Fix**: `pnpm nx run-many --target=lint --all`

### 2. Prettier (Formatting)

Runs on all staged files:

- `.ts`, `.tsx`, `.js`, `.jsx`
- `.json`, `.md`, `.yml`, `.yaml`
- `.css`, `.scss`

**Fix**: `npx prettier --write <file>`

### 3. Secretlint (Security)

Detects accidentally committed secrets:

- API keys
- AWS credentials
- Private keys
- Passwords in config files

**Fix**: Remove secrets and use Infisical instead

### 4. File Size Check

Prevents committing files > 500KB:

- Catches uncompressed images
- Prevents large binary files
- Skips allowed types (`.json`, `.lock`, `.svg`)

**Fix**: Compress images with `pnpm compress:images`

## Commit Message Format

Uses [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
type(scope): description

[optional body]

[optional footer]
```

### Types

| Type       | Use Case           | Example                               |
| ---------- | ------------------ | ------------------------------------- |
| `feat`     | New feature        | `feat(ep-001 st-010): add login form` |
| `fix`      | Bug fix            | `fix(bug-015): handle null user`      |
| `refactor` | Code restructuring | `refactor(ep-002): simplify auth`     |
| `docs`     | Documentation      | `docs(ep-001): update API docs`       |
| `test`     | Tests              | `test(st-010): add login tests`       |
| `chore`    | Maintenance        | `chore: update dependencies`          |
| `style`    | Formatting         | `style: fix linting errors`           |
| `perf`     | Performance        | `perf(ep-005): optimize images`       |
| `ci`       | CI/CD              | `ci: add deploy workflow`             |
| `build`    | Build system       | `build: update webpack config`        |
| `revert`   | Revert commit      | `revert: undo last change`            |

### Scope (Optional)

Reference issue IDs in scope:

- `ep-xxx` - Epic
- `st-xxx` - Story
- `bug-xxx` - Bug
- `tsk-xxx` - Task
- `in-xxx` - Initiative

### Examples

```bash
# ✅ Good
feat(ep-001 st-010): add login form validation
fix(bug-015): handle null user response
chore: update dependencies
docs(ep-001): update requirements

# ❌ Bad
fix stuff
update
WIP
asdf
```

## Branch Naming Convention

Validated on `git push`.

### Format

```
<type>/<id>-<description>
```

### Types

`feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `epic`, `initiative`, `hotfix`

### Examples

```bash
# ✅ Good
feat/st-010-login-form
fix/bug-015-null-check
epic/ep-001-user-auth
chore/update-deps

# ❌ Bad
feature/login
fix/bug
update
my-changes
```

### Exempt Branches

These branches skip validation:

- `main`, `master`
- `develop`, `staging`, `production`

## Troubleshooting

### ESLint Errors

```bash
# See all errors
pnpm nx run-many --target=lint --all

# Fix auto-fixable issues
npx eslint --fix <file>
```

### Prettier Errors

```bash
# Format file
npx prettier --write <file>

# Format all staged files
npx prettier --write $(git diff --cached --name-only)
```

### Secretlint Errors

```bash
# Scan for secrets
pnpm secretlint

# Common fixes:
# 1. Remove the secret from the file
# 2. Add file to .secretlintrc.json ignorePatterns
# 3. Use environment variables instead
```

### Commit Message Errors

```bash
# Test commit message
echo "your commit message" | npx commitlint

# Common fixes:
# 1. Use correct type (feat, fix, etc.)
# 2. Use lowercase type
# 3. Don't end subject with period
# 4. Keep header under 100 chars
```

### Branch Name Errors

```bash
# Rename branch
git branch -m old-name feat/st-010-new-name

# Create branch with correct name
git checkout -b feat/st-010-description
```

### File Size Errors

```bash
# Compress images
pnpm compress:images

# Check file sizes
find . -size +500k -type f | grep -v node_modules | grep -v .git
```

### Skip Hooks (Emergency Only)

```bash
# Skip pre-commit
git commit --no-verify -m "message"

# Skip pre-push
git push --no-verify
```

**⚠️ Use sparingly! Hooks exist to prevent bugs.**

## Configuration Files

| File                           | Purpose                    |
| ------------------------------ | -------------------------- |
| `.husky/pre-commit`            | Pre-commit hook script     |
| `.husky/commit-msg`            | Commit message hook script |
| `.husky/pre-push`              | Pre-push hook script       |
| `commitlint.config.js`         | Commit message rules       |
| `.secretlintrc.json`           | Secret detection rules     |
| `package.json` (`lint-staged`) | Staged file checks         |

## Adding New Checks

### Add to lint-staged

Edit `package.json`:

```json
"lint-staged": {
  "*.ts": ["your-command"],
  "*.specific-extension": ["another-command"]
}
```

### Add to pre-commit hook

Edit `.husky/pre-commit`:

```bash
# Add your check
echo "Running custom check..."
your-custom-command
```

### Add commitlint rule

Edit `commitlint.config.js`:

```javascript
rules: {
  'your-rule': [2, 'always', 'value'],
}
```

## Installation (For New Developers)

Hooks are installed automatically via `prepare` script:

```bash
pnpm install  # Runs 'husky' automatically
```

If hooks aren't working:

```bash
npx husky init
chmod +x .husky/pre-commit .husky/commit-msg .husky/pre-push
```

## Related Documentation

- Git Workflow: `.cursor/rules/git-workflow.mdc`
- Infisical (Secrets): `.cursor/rules/infisical.mdc`
- Image Optimization: `.cursor/rules/image-optimization.mdc`
- Way of Work: `.cursor/rules/way-of-work.mdc`

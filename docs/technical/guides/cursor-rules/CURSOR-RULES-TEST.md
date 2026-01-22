# Cursor Rules Test - Quick Verification

This is a quick test to verify that Cursor rules are being injected into prompts.

## Test 1: Always-Applied Rules

**Question:** "What is the project structure according to the architecture rule?"

**Expected Response:**
- Should mention Nx monorepo structure
- Should describe `apps/` and `libs/` directories
- Should reference layered architecture (Apps → Business → Data)

## Test 2: Pipeline Enforcement

**Question:** "I want to add a new feature"

**Expected Response:**
- Should ask about current phase
- Should reference epic/story IDs (EP-XXX, ST-XXX)
- Should mention the 10-phase pipeline
- Should ask about acceptance criteria

## Test 3: Code Style

**Question:** "Create a new React component called UserProfile"

**Expected Response:**
- Should use PascalCase for component name
- Should follow file organization patterns
- Should use proper TypeScript types
- Should follow RYLA's component patterns

## Test 4: Routing Patterns

**Question:** "Add a new route for /settings"

**Expected Response:**
- Should mention centralized routing (`apps/web/lib/routes.ts`)
- Should NOT hardcode route strings
- Should use `routes` object for navigation

## Test 5: Requestable Rule

**Question:** "Follow the TypeScript rules when creating this file"

**Expected Response:**
- Should reference TypeScript-specific patterns
- Should mention strict typing
- Should avoid `any` types
- Should follow TypeScript best practices

## Test 6: Glob-Based Rule

**Action:** Open/edit a file in `libs/data/src/schema/`

**Expected Behavior:**
- AI should automatically apply Drizzle schema patterns
- Should follow schema style guide
- Should use proper naming conventions

## Verification Checklist

After running these tests, verify:

- [ ] AI mentions project structure without prompting
- [ ] AI asks about pipeline phases when starting tasks
- [ ] AI follows naming conventions from rules
- [ ] AI references centralized routing
- [ ] AI can access requestable rules when asked
- [ ] AI applies glob-based rules automatically

## If Tests Fail

1. Run verification script: `pnpm verify:rules`
2. Check rule frontmatter is valid
3. Restart Cursor
4. Check Cursor settings for rules directory
5. Review [CURSOR-RULES-VERIFICATION.md](./CURSOR-RULES-VERIFICATION.md)

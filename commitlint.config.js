/**
 * Commitlint Configuration
 *
 * Enforces conventional commit format for RYLA project.
 * Format: type(scope): description
 *
 * Examples:
 *   feat(ep-001 st-010): add login form validation
 *   fix(bug-015): handle null user response
 *   chore: update dependencies
 *
 * @see https://commitlint.js.org/
 * @see .cursor/rules/git-workflow.mdc
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of the allowed types
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'refactor', // Code restructuring
        'docs', // Documentation
        'test', // Tests
        'chore', // Maintenance
        'style', // Formatting
        'perf', // Performance
        'ci', // CI/CD changes
        'build', // Build system
        'revert', // Revert previous commit
      ],
    ],
    // Type is required and must be lowercase
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // Subject (description) rules
    'subject-empty': [2, 'never'],
    'subject-case': [0], // Allow any case (we use lowercase)
    'subject-full-stop': [2, 'never', '.'],

    // Scope is optional but must be lowercase if provided
    // Scope can be: ep-xxx, st-xxx, bug-xxx, tsk-xxx, in-xxx, or any kebab-case
    'scope-case': [2, 'always', 'lower-case'],

    // Header max length (type + scope + subject)
    'header-max-length': [2, 'always', 100],

    // Body and footer rules
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
  // Custom parser for RYLA's scope format (ep-001 st-010)
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w+)(?:\(([^)]+)\))?: (.+)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
};

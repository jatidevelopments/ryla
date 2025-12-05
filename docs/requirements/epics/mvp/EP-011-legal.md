# [EPIC] EP-011: Legal & Compliance

## Overview

Legal pages and compliance features required for operating an AI content generation platform, especially with NSFW capabilities.

---

## Business Impact

**Target Metric**: Risk Mitigation

**Hypothesis**: Clear legal terms and compliance measures protect the business and build user trust.

**Success Criteria**:
- Legal page views: All users see ToS before signup
- Age verification: **100%** for NSFW access
- DMCA response time: **<24 hours**
- Zero legal incidents from missing disclosures

---

## Features

### F1: Terms of Service

- Comprehensive terms covering:
  - Account responsibilities
  - Acceptable use policy
  - AI-generated content ownership
  - NSFW content guidelines
  - Payment and refund terms
  - Termination conditions
- Required acceptance during signup
- Version tracking

### F2: Privacy Policy

- GDPR/CCPA compliant
- Data collection disclosure
- Cookie usage
- Third-party services (Stripe, Supabase, etc.)
- User rights (access, deletion)
- Contact information

### F3: Content Guidelines

- Prohibited content types:
  - Minors (strict prohibition)
  - Non-consensual content
  - Real person likeness without consent
  - Illegal activities
  - Hate speech
- NSFW content rules
- Consequences of violations

### F4: Age Verification Gate

- 18+ confirmation before NSFW access
- Linked to EP-002 age verification
- Legal disclaimer text
- Cannot proceed without confirmation

### F5: Cookie Consent

- Cookie banner on first visit
- Accept/Decline options
- Cookie preferences (essential, analytics, marketing)
- Remember preference
- Link to Privacy Policy

### F6: DMCA/Copyright

- DMCA takedown process
- Copyright reporting form
- Response procedure
- Counter-notification process

### F7: Terms Acceptance Tracking

- Record when user accepts ToS
- Track version accepted
- Re-prompt on major ToS updates
- Audit trail for legal

---

## Acceptance Criteria

### AC-1: Terms of Service

- [ ] ToS page accessible at /terms
- [ ] ToS shown during signup flow
- [ ] User must check "I agree" to proceed
- [ ] ToS acceptance is timestamped

### AC-2: Privacy Policy

- [ ] Privacy page accessible at /privacy
- [ ] Linked from signup and footer
- [ ] Covers all data practices
- [ ] Contact method provided

### AC-3: Content Guidelines

- [ ] Guidelines accessible at /guidelines
- [ ] Linked from NSFW toggle
- [ ] Clear prohibited content list
- [ ] Consequences stated

### AC-4: Age Verification

- [ ] 18+ gate before NSFW features
- [ ] Clear legal language
- [ ] Cannot bypass without confirmation
- [ ] State stored in user profile

### AC-5: Cookie Consent

- [ ] Banner shows on first visit
- [ ] User can accept or customize
- [ ] Preference is remembered
- [ ] Links to privacy policy

### AC-6: DMCA

- [ ] DMCA page at /dmca
- [ ] Reporting form/email provided
- [ ] Process is documented

---

## Pages Required

| Page | URL | Purpose |
|------|-----|---------|
| Terms of Service | `/terms` | Legal agreement |
| Privacy Policy | `/privacy` | Data practices |
| Content Guidelines | `/guidelines` | Acceptable use |
| DMCA | `/dmca` | Copyright process |
| Cookie Policy | `/cookies` | Cookie details |

---

## User Stories

### ST-050: Read Terms Before Signup

**As a** new user  
**I want to** read the terms of service  
**So that** I understand what I'm agreeing to

**AC**: AC-1

### ST-051: Understand Privacy Practices

**As a** privacy-conscious user  
**I want to** know how my data is used  
**So that** I can make an informed decision

**AC**: AC-2

### ST-052: Know Content Rules

**As a** user creating NSFW content  
**I want to** understand the guidelines  
**So that** I don't violate terms

**AC**: AC-3

### ST-053: Manage Cookie Preferences

**As a** user concerned about tracking  
**I want to** control which cookies are used  
**So that** I have privacy control

**AC**: AC-5

### ST-054: Report Copyright Violation

**As a** content owner  
**I want to** report unauthorized use of my likeness  
**So that** it can be removed

**AC**: AC-6

---

## Legal Page Templates

### Terms of Service (Key Sections)

```markdown
# Terms of Service

Last updated: [Date]

## 1. Acceptance of Terms
By using RYLA, you agree to these terms...

## 2. Account Registration
- You must be 18+ to create an account
- You are responsible for your account security
- One account per person

## 3. AI-Generated Content
- Content you create is yours to use
- We retain rights to improve our service
- You may not claim AI content as human-created

## 4. Acceptable Use
- No content depicting minors
- No non-consensual content
- No real person likeness without consent
- See Content Guidelines for full list

## 5. NSFW Content
- Must verify 18+ before accessing
- Must comply with platform guidelines
- We may remove violating content

## 6. Payment Terms
- Subscriptions bill monthly
- No refunds for partial months
- We may change prices with notice

## 7. Termination
- You may cancel anytime
- We may terminate for violations
- Data deleted after 30 days

## 8. Limitation of Liability
[Standard limitation clauses]

## 9. Contact
support@ryla.ai
```

### Content Guidelines (Key Points)

```markdown
# Content Guidelines

## Strictly Prohibited
❌ Any content depicting minors
❌ Non-consensual scenarios
❌ Real person likeness without consent
❌ Extreme violence or gore
❌ Content promoting illegal activities

## NSFW Guidelines
✅ Adult content between consenting adults
✅ Fantasy scenarios clearly marked as fiction
✅ Artistic nudity

## Consequences
- First violation: Warning
- Second violation: Account suspension
- Severe violation: Immediate termination

## Reporting
Report violations to: abuse@ryla.ai
```

---

## Technical Notes

### ToS Acceptance Tracking

```typescript
// Track ToS acceptance
interface TosAcceptance {
  user_id: string;
  version: string;
  accepted_at: Date;
  ip_address: string;
}

// Check if user needs to re-accept
const needsReAcceptance = (user: User, currentVersion: string) => {
  return !user.tos_version || user.tos_version !== currentVersion;
};
```

### Cookie Consent

```typescript
// Cookie preference storage
interface CookiePreferences {
  essential: true; // Always true
  analytics: boolean;
  marketing: boolean;
  accepted_at: Date;
}

// Store in localStorage + cookie
const saveCookiePreferences = (prefs: CookiePreferences) => {
  localStorage.setItem('cookie_prefs', JSON.stringify(prefs));
  document.cookie = `cookie_consent=${prefs.analytics ? 'full' : 'essential'}`;
};
```

---

## Non-Goals (Phase 2+)

- Multi-language legal pages
- Automated content moderation
- GDPR data export automation
- Legal chat support

---

## Dependencies

- Legal review of all documents
- Domain email for legal contacts
- Cookie consent library

---

## Phase Checklist

- [x] P1: Requirements (this epic)
- [ ] P2: Legal review
- [ ] P3: Content writing
- [ ] P4: UI implementation
- [ ] P5: Testing
- [ ] P6: Launch


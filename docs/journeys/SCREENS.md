# Screen Inventory

## Overview

All screens in the application with purpose and analytics.

---

## Screen Categories

| Category | Description |
|----------|-------------|
| Public | Accessible without auth |
| Auth | Authentication flows |
| Onboarding | First-time user experience |
| Core | Main application features |
| Settings | User configuration |
| Admin | Administrative functions |

---

## Screen List

### Public Screens

| ID | Screen | Route | Purpose | Key Event |
|----|--------|-------|---------|-----------|
| P-01 | Landing | `/` | Convert visitors | `landing.viewed` |
| P-02 | Pricing | `/pricing` | Show plans | `pricing.viewed` |
| P-03 | Features | `/features` | Explain value | `features.viewed` |
| P-04 | About | `/about` | Build trust | `about.viewed` |

### Auth Screens

| ID | Screen | Route | Purpose | Key Event |
|----|--------|-------|---------|-----------|
| A-01 | Signup | `/signup` | New user registration | `signup.viewed` |
| A-02 | Login | `/login` | Existing user auth | `login.viewed` |
| A-03 | Forgot Password | `/forgot-password` | Password recovery | `forgot_password.viewed` |
| A-04 | Reset Password | `/reset-password` | Set new password | `reset_password.viewed` |

### Onboarding Screens

| ID | Screen | Route | Purpose | Key Event |
|----|--------|-------|---------|-----------|
| O-01 | Welcome | `/onboarding` | Greet new user | `onboarding.started` |
| O-02 | Setup Step 1 | `/onboarding/1` | Initial config | `onboarding.step_1` |
| O-03 | Setup Step 2 | `/onboarding/2` | Preferences | `onboarding.step_2` |
| O-04 | Complete | `/onboarding/complete` | Success state | `onboarding.completed` |

### Core Screens

| ID | Screen | Route | Purpose | Key Event |
|----|--------|-------|---------|-----------|
| C-01 | Dashboard | `/dashboard` | Overview/home | `dashboard.viewed` |
| C-02 | [Feature 1] | `/feature-1` | Core feature | `feature_1.viewed` |
| C-03 | [Feature 2] | `/feature-2` | Core feature | `feature_2.viewed` |
| C-04 | [Feature 3] | `/feature-3` | Core feature | `feature_3.viewed` |

### Settings Screens

| ID | Screen | Route | Purpose | Key Event |
|----|--------|-------|---------|-----------|
| S-01 | Settings | `/settings` | User settings | `settings.viewed` |
| S-02 | Profile | `/settings/profile` | Edit profile | `profile.viewed` |
| S-03 | Billing | `/settings/billing` | Subscription | `billing.viewed` |
| S-04 | Notifications | `/settings/notifications` | Preferences | `notifications.viewed` |

### Admin Screens

| ID | Screen | Route | Purpose | Key Event |
|----|--------|-------|---------|-----------|
| X-01 | Admin Dashboard | `/admin` | Admin overview | `admin.viewed` |
| X-02 | Users | `/admin/users` | User management | `admin_users.viewed` |
| X-03 | Analytics | `/admin/analytics` | View metrics | `admin_analytics.viewed` |

---

## Screen Template

```markdown
## [Screen Name]

**ID**: X-XX
**Route**: `/path`
**Category**: [Public/Auth/Onboarding/Core/Settings/Admin]

### Purpose
[What this screen does]

### User Goals
- Goal 1
- Goal 2

### Entry Points
- From [Screen X] via [action]
- Direct link

### Exit Points
- To [Screen Y] via [action]
- To [Screen Z] via [action]

### Components
- [Component 1]
- [Component 2]

### Events
| Event | Trigger |
|-------|---------|
| `screen.viewed` | Page load |
| `screen.action` | User action |

### States
- Loading
- Empty
- Populated
- Error

### Mobile Considerations
- [Responsive behavior]
```

---

## Navigation Map

```
                    ┌─────────────┐
                    │   Landing   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  Signup  │ │  Login   │ │ Pricing  │
        └────┬─────┘ └────┬─────┘ └──────────┘
             │            │
             ▼            ▼
        ┌─────────────────────────────┐
        │        Onboarding           │
        └──────────────┬──────────────┘
                       │
                       ▼
        ┌─────────────────────────────┐
        │         Dashboard           │
        └──────────────┬──────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │Feature 1│   │Feature 2│   │Settings │
   └─────────┘   └─────────┘   └─────────┘
```

---

## Adding New Screens

1. Add to this inventory with ID
2. Define route and purpose
3. Map events to tracking plan
4. Add to navigation map
5. Create user journey if complex


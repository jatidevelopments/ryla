# User Journey: [Feature Name]

**Epic**: EP-XXX
**Business Metric**: [ ] A [ ] B [ ] C [ ] D [ ] E

---

## Journey Overview

**User Goal**: [What does the user want to achieve?]
**Success Criteria**: [How do we know they succeeded?]
**Time to Value**: [Target time from start to success]

---

## Persona

**Who**: [Target user description]
**Context**: [When/where do they use this?]
**Pain Point**: [What problem are they solving?]

---

## Journey Steps

### Step 1: [Entry Point]

| Attribute | Value |
|-----------|-------|
| Screen | [Screen name] |
| User Action | [What they do] |
| System Response | [What happens] |
| Event | `feature.action` |
| Success | [Criteria] |
| Failure | [What could go wrong] |

### Step 2: [Core Action]

| Attribute | Value |
|-----------|-------|
| Screen | |
| User Action | |
| System Response | |
| Event | |
| Success | |
| Failure | |

### Step 3: [Completion]

| Attribute | Value |
|-----------|-------|
| Screen | |
| User Action | |
| System Response | |
| Event | |
| Success | |
| Failure | |

---

## Screen Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Screen  │ ──→ │ Screen  │ ──→ │ Screen  │
│   1     │     │   2     │     │   3     │
└─────────┘     └─────────┘     └─────────┘
    │               │               │
    ▼               ▼               ▼
 event.1         event.2         event.3
```

---

## Events Fired

| Event | Trigger | Properties |
|-------|---------|------------|
| `feature.started` | User begins | `source` |
| `feature.step_completed` | Step done | `step`, `duration` |
| `feature.completed` | Success | `duration`, `result` |
| `feature.abandoned` | User leaves | `last_step`, `reason` |
| `feature.error` | Error occurs | `type`, `message` |

---

## Funnel

```
Step 1 (100%) → Step 2 (X%) → Step 3 (Y%) → Complete (Z%)
```

**Target Conversion**: [X]%
**Acceptable Drop**: [Y]% per step

---

## Error States

| Error | Cause | Recovery |
|-------|-------|----------|
| [Error 1] | [Why] | [What user sees / can do] |
| [Error 2] | [Why] | [What user sees / can do] |

---

## Edge Cases

- [ ] User abandons mid-flow
- [ ] User returns to previous step
- [ ] Network failure
- [ ] Session timeout
- [ ] Invalid input

---

## Acceptance Criteria

- [ ] User can complete flow in < [X] seconds
- [ ] All events fire correctly
- [ ] Error states handled gracefully
- [ ] Mobile responsive
- [ ] Works on >98% browsers

## Analytics AC

- [ ] Funnel shows all steps
- [ ] Drop-off tracked per step
- [ ] Time-to-complete measured


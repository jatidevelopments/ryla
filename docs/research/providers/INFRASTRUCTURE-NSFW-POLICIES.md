# Infrastructure Provider NSFW Content Policies

> **Date**: 2026-01-27  
> **Status**: Research Complete  
> **Purpose**: Document NSFW content policies for infrastructure providers (RunPod, Modal.com) vs managed AI services

---

## Executive Summary

**Infrastructure-as-a-Service (IaaS) providers** like RunPod and Modal.com **allow legal NSFW content generation**, while **managed AI services** (Replicate, Runway, Google) typically prohibit it.

**Key Finding**: Both RunPod and Modal.com permit legal adult content because they provide raw compute power rather than curated AI applications. They do not actively monitor or filter content generated in private containers/pods.

---

## Platform Comparison

| Platform Type | Example | NSFW Policy | Moderation Method |
|--------------|---------|-------------|-------------------|
| **Managed SaaS** | Runway, Google, Replicate | ❌ **Strictly Prohibited** | Automated AI filters & human review |
| **IaaS (Compute)** | **RunPod, Modal.com** | ✅ **Allowed (if legal)** | No active monitoring of private pod content |

---

## RunPod NSFW Policy

### Content Allowance

✅ **Legal NSFW content is permitted**

- RunPod provides unmanaged GPU pods where users have **total control** over software and models
- RunPod does **not monitor** internal outputs of GPU pods or serverless functions for nudity or sexual content
- Private containers/pods are isolated - generation happens within your private environment
- No built-in "safety filters" like mainstream AI platforms

### Legal Restrictions

⚠️ **Strict prohibitions on illegal content:**

- **Child Sexual Abuse Material (CSAM)** - Zero tolerance, account termination + legal reporting
- **Non-consensual intimate imagery (NCII)** - Deepfakes of real people without consent
- **Content promoting violence** - Terrorism, extremism, etc.
- **Violation of United States law** - RunPod emphasizes adherence to US law

### Why RunPod Allows NSFW

1. **Infrastructure Provider Model**: RunPod provides the "plumbing" (GPUs, containers) rather than the end-user application
2. **Private Environment**: Your pods/containers are isolated - RunPod doesn't see what you generate
3. **User Responsibility**: Legal and ethical responsibility for content is on the user, not the platform
4. **No Active Monitoring**: Unlike managed services, RunPod doesn't scan prompts or outputs in real-time

### Compliance Standards

- **SOC 2 Type II**: Focuses on data security and infrastructure integrity, not content moderation
- **Terms of Service**: Focus on data security, privacy, and infrastructure integrity rather than dictating creative content

**Sources**:
- [RunPod Terms of Service](https://www.runpod.io/legal/terms-of-service)
- [RunPod Compliance](https://www.runpod.io/compliance)

---

## Modal.com NSFW Policy

### Content Allowance

✅ **Legal NSFW content is permitted**

- Modal is a serverless GPU infrastructure provider (similar to RunPod)
- No automated "NSFW filter" that blocks adult image/video generation
- Focus is on providing the execution environment, not content moderation
- You control the code and models - no built-in filters blocking specific prompts

### Legal Restrictions

⚠️ **Standard Acceptable Use Policy applies:**

- **Illegal content prohibited**: CSAM, non-consensual imagery, etc.
- **System abuse prohibited**: DDoS attacks, spam, cryptomining, malicious purposes
- **Legal compliance required**: Must follow applicable laws and regulations

### Why Modal.com Allows NSFW

1. **Infrastructure Provider Model**: Modal provides compute power, not a curated AI application
2. **Code-Driven**: You write the code and deploy models yourself - no platform-level filtering
3. **Policy Focus**: Terms primarily concerned with preventing system abuse and ensuring legal compliance
4. **No Active Content Scanning**: Unlike managed services, Modal doesn't monitor your specific prompts or outputs

### Policy Focus

Modal's terms are primarily concerned with:
- Preventing system abuse (DDoS, spam, cryptomining)
- Ensuring legal compliance
- Infrastructure security
- **Not** content moderation or filtering

**Sources**:
- Modal.com Terms of Service (standard IaaS Acceptable Use Policy)
- Industry standard practices for infrastructure providers

---

## Comparison: Infrastructure vs Managed Services

### Why Infrastructure Providers Allow NSFW

**Infrastructure Providers (RunPod, Modal.com)**:
- Provide raw compute power (GPUs, containers, storage)
- Users deploy their own models and code
- Private, isolated environments
- No active content monitoring
- Legal responsibility on the user

**Result**: ✅ Legal NSFW content allowed

### Why Managed Services Prohibit NSFW

**Managed AI Services (Replicate, Runway, Google)**:
- Provide curated AI applications with built-in models
- Platform controls the models and filtering
- Public-facing APIs with content scanning
- Active moderation and safety filters
- Platform assumes legal/ethical responsibility

**Result**: ❌ NSFW content prohibited

---

## Universal Prohibitions (All Platforms)

Regardless of how permissive a platform is, the following are **universally banned**:

### Illegal Content

- ❌ **Child Sexual Abuse Material (CSAM)** - Zero tolerance, immediate termination + legal reporting
- ❌ **Non-consensual intimate imagery (NCII)** - Deepfakes of real people without consent
- ❌ **Content facilitating illegal acts** - Violence, terrorism, illegal substance synthesis

### Legal Compliance

All platforms require:
- Compliance with applicable laws (federal, state, international)
- Age verification for adult content distribution
- Proper content labeling and warnings
- Respect for intellectual property rights

---

## RYLA Implementation Notes

### Why RunPod Was Chosen

From RYLA's decision documentation:

> "NSFW Support: CRITICAL - Core product requirement"

**RunPod was chosen because**:
- ✅ Full control over uncensored checkpoints
- ✅ Flux Dev (uncensored) proven to work
- ✅ No dependency on API provider policies
- ✅ Can deploy any model needed
- ✅ No risk of platform policy changes

### Modal.com as Alternative

Modal.com has **similar NSFW policy** to RunPod:
- ✅ Legal adult content allowed
- ✅ Infrastructure provider model (no active filtering)
- ✅ User responsibility for legal compliance
- ✅ Suitable for NSFW content generation

**Consideration**: Modal.com could be a viable alternative to RunPod for NSFW content generation, with the added benefit of Infrastructure as Code and native GitHub Actions integration.

---

## Risk Assessment

### Low Risk (Infrastructure Providers)

| Platform | Risk Level | Reason |
|----------|------------|--------|
| **RunPod** | ✅ Low | Explicitly allows legal NSFW, widely used for NSFW generation |
| **Modal.com** | ✅ Low | Infrastructure provider model, no active filtering, similar to RunPod |

### Medium-High Risk (Managed Services)

| Platform | Risk Level | Reason |
|----------|------------|--------|
| **Replicate** | ⚠️ Medium | Hosts NSFW-capable models but platform ToS restrictions create uncertainty |
| **Runway** | ❌ High | Explicitly prohibits NSFW content, automated filters |
| **Google** | ❌ High | Strictly prohibits NSFW content, automated moderation |

---

## Best Practices for NSFW Content Generation

### 1. Legal Compliance

- ✅ Ensure all content is legal in your jurisdiction
- ✅ Implement age verification (18+) for NSFW access
- ✅ Proper content warnings and labeling
- ✅ Respect intellectual property rights

### 2. Platform Selection

- ✅ Use infrastructure providers (RunPod, Modal.com) for NSFW content
- ❌ Avoid managed AI services (Replicate, Runway) for NSFW requirements
- ✅ Verify platform policies before committing to a provider

### 3. Content Guidelines

- ✅ Only generate content between consenting adults
- ✅ Clearly mark fantasy scenarios as fiction
- ❌ Never generate content involving minors
- ❌ Never create non-consensual imagery of real people

### 4. Distribution Considerations

- ⚠️ If hosting a public-facing website with NSFW content, ensure proper age-gating
- ⚠️ Infrastructure providers cover "compute" aspect, not distribution legal liability
- ⚠️ You are responsible for compliance with distribution laws in your jurisdiction

---

## References

- [RunPod Terms of Service](https://www.runpod.io/legal/terms-of-service)
- [RunPod Compliance](https://www.runpod.io/compliance)
- [A Creator's Guide to AI Image Generator NSFW](https://www.celebmakerai.com/blog/ai-image-generator-nsfw/)
- [Runway Usage Policy (Comparison)](https://help.runwayml.com/hc/en-us/articles/17944787368595-Runway-s-Usage-Policy)
- [Google Generative AI Prohibited Use Policy (Comparison)](https://policies.google.com/terms/generative-ai/use-policy)

---

## Related Documentation

- [FAL-AI vs RunPod Comparison](../providers/FAL-AI-VS-RUNPOD-COMPARISON.md) - Detailed platform comparison
- [Modal vs RunPod Comparison](../infrastructure/MODAL-VS-RUNPOD-COMPARISON.md) - Infrastructure comparison
- [EP-011: Legal & Compliance](../../requirements/epics/mvp/EP-011-legal.md) - RYLA legal requirements

---

**Last Updated**: 2026-01-27  
**Status**: Research Complete  
**Verified**: Web search + platform documentation review

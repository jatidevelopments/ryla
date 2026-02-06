# [INITIATIVE] IN-027: Multi-Agent Orchestration System

**Status**: Proposed  
**Created**: 2026-01-27  
**Last Updated**: 2026-01-27  
**Owner**: Engineering Team  
**Stakeholders**: Product Team, Engineering Team

---

## Executive Summary

**One-sentence description**: Build a Cursor-supervised multi-agent system (inspired by Open Code pattern) where multiple specialized AI agents (frontend, backend, testing, architecture, etc.) can be briefed with descriptions and work in parallel, all managed and watched by Cursor as the orchestrator, with full Cursor capabilities (file access, MCP servers, browser tools, terminal) and measurable success criteria.

**Business Impact**: E-CAC, C-Core Value, B-Retention

---

## Why (Business Rationale)

### Problem Statement

Currently, complex development tasks require sequential work or manual coordination between different areas (frontend, backend, testing, architecture). This creates bottlenecks:

- **Sequential Dependencies**: Frontend waits for backend, testing waits for implementation
- **Manual Coordination**: Developers must manually communicate and coordinate work
- **Single Agent Limitation**: One Cursor agent handles everything, leading to context switching and reduced specialization
- **No Parallelization**: Can't leverage multiple agents working simultaneously
- **No Measurable Success**: Tasks complete without clear validation criteria
- **No Feedback Loops**: Agents can't review and improve each other's work

This results in:
- Slower development cycles
- Higher engineering costs (E-CAC)
- Reduced code quality (C-Core Value)
- More bugs and regressions (B-Retention)

### Current State

**Development Workflow:**
- Single Cursor agent handles all tasks sequentially
- Manual task breakdown and coordination
- No systematic approach to parallel work
- Success criteria often implicit or unclear
- No automated validation of task completion

**Agent Capabilities:**
- ✅ Cursor 2.0 has native multi-agent support (Agent Mode, parallel execution)
- ✅ Background Agents API available for programmatic control
- ✅ Each agent has full capabilities (file access, MCP, browser, terminal)
- ⚠️ Not yet leveraging Cursor's multi-agent features
- ❌ No coordination mechanism between agents
- ❌ No shared state or feedback system
- ❌ No success criteria validation framework

**Task Management:**
- Tasks tracked in epics/stories
- No agent-level task assignment
- No success criteria validation
- No feedback loops between agents

### Desired State

**Multi-Agent System:**
- **Specialized Agents**: Frontend, Backend, Testing, Architecture, Data, Integration agents
- **Parallel Execution**: Multiple agents work simultaneously on related tasks
- **Full Capabilities**: Each agent has full Cursor capabilities (files, MCP, browser, terminal)
- **Coordination**: Agents coordinate via shared state files
- **Feedback Loops**: Agents can review and provide feedback to each other
- **Success Criteria**: Measurable, testable success criteria for each task
- **Automated Validation**: Success criteria validated automatically

**Development Workflow:**
- Orchestrator creates task assignments for specialized agents
- Agents work in parallel with full local capabilities
- Agents coordinate via shared state files
- Success criteria validated automatically
- Feedback loops enable iterative improvement

**Business Impact:**
- Faster development cycles (parallel work)
- Higher code quality (specialized agents, feedback loops)
- Lower engineering costs (automation, efficiency)
- Better test coverage (dedicated testing agent)

### Business Drivers

- **CAC (E)**: Faster development cycles reduce engineering costs. Parallel work and automation increase efficiency
- **Core Value (C)**: Higher code quality from specialized agents and feedback loops improves product reliability
- **Retention (B)**: Better code quality and test coverage prevent regressions that cause churn
- **Risk Mitigation**: Automated validation and feedback loops catch issues early
- **Developer Velocity**: Specialized agents enable faster feature development
- **Scalability**: System scales to handle complex multi-epic initiatives

---

## How (Approach & Strategy)

### Strategy

**Cursor-Supervised Multi-Agent Approach (Preferred):**
Based on the Open Code pattern, we'll use multiple specialized agents managed by Cursor as the orchestrator:

1. **Cursor as Supervisor**: Cursor acts as the orchestrator/supervisor, managing and watching multiple specialized agents
2. **Specialized Agents**: Multiple agents (like Open Code pattern) that can be briefed with descriptions and assigned to specific tasks
3. **Agent Briefing System**: Each agent receives a description/brief of their role and responsibilities
4. **Cursor Monitoring**: Cursor monitors agent progress, coordinates work, and validates success criteria
5. **Parallel Execution**: Multiple agents work simultaneously on different code paths/tasks
6. **Shared Context**: Agents share context through Cursor's context system and state files
7. **Success Criteria Validation**: Cursor validates success criteria and coordinates feedback loops

**Key Pattern (Inspired by Open Code):**
- **Multiple specialized agents** that can be briefed/described
- **Cursor manages/watches** all agents from above
- **Agents work independently** but are coordinated by Cursor
- **Context sharing** between Cursor and agents
- **Success criteria** validated by Cursor

**Agent Specialization:**
- **Frontend Agent**: React/Next.js, TailwindCSS, UI components, frontend state
- **Backend Agent**: NestJS, API endpoints, business logic, database operations
- **Testing Agent**: Unit tests, integration tests, E2E tests, test coverage
- **Architecture Agent**: System design, API contracts, data models, documentation
- **Data Agent**: Database schemas, migrations, repositories, data access patterns
- **Integration Agent**: E2E flows, cross-app integration, external service integration

### Key Principles

- **Cursor as Supervisor**: Cursor manages and watches multiple specialized agents (like Open Code pattern)
- **Agent Briefing**: Each agent receives a description/brief of their role, responsibilities, and code paths
- **Full Capabilities**: Each agent has same capabilities as human developer (files, MCP, browser, terminal)
- **Specialization**: Agents focus on their domain expertise (frontend, backend, testing, etc.)
- **Parallelization**: Multiple agents work simultaneously on different tasks/code paths
- **Cursor Coordination**: Cursor orchestrates, monitors, and validates agent work
- **Measurable Success**: All tasks have explicit, testable success criteria validated by Cursor
- **Feedback Loops**: Cursor coordinates feedback between agents via shared context
- **State-Based Coordination**: Agents coordinate via shared state files and Cursor's context system

### Phases

1. **Phase 1: Cursor 2.0 Integration** - 1-2 weeks
   - Research and test Cursor 2.0 multi-agent features (Agent Mode, Background Agents API)
   - Set up Cursor Background Agents API access and authentication
   - Create orchestrator script that uses Cursor API
   - Define agent templates and configurations
   - Implement state management system
   - Create success criteria validation framework

2. **Phase 2: Agent Templates** - 1 week
   - Create specialized agent rule files
   - Define agent capabilities and code paths
   - Document agent workflows and communication protocols
   - Create agent prompt templates

3. **Phase 3: Success Criteria Framework** - 1 week
   - Define success criteria format and validation
   - Implement validators for common criteria (TypeScript, tests, coverage, E2E)
   - Create criteria evaluation system
   - Document criteria patterns

4. **Phase 4: Feedback System** - 1 week
   - Implement feedback protocol between agents
   - Create feedback file format
   - Build feedback review and resolution system
   - Document feedback patterns

5. **Phase 5: Integration & Testing** - 1-2 weeks
   - Test orchestrator with real tasks
   - Validate agent coordination
   - Test success criteria validation
   - Test feedback loops
   - Document usage patterns

6. **Phase 6: Documentation & Training** - 1 week
   - Create user guide for orchestrator
   - Document agent templates and patterns
   - Create examples and tutorials
   - Train team on system usage

### Dependencies

- **Cursor 2.0**: Must have Cursor 2.0 with multi-agent features enabled
- **Cursor Background Agents API**: API access for programmatic agent control
- **Node.js**: Orchestrator script requires Node.js/TypeScript
- **File System**: Requires `.agent-state/` directory for coordination
- **MCP Servers**: Agents need access to configured MCP servers (github, playwright, etc.)
- **Git Worktrees** (Optional): For parallel execution isolation
- **Automation Tools** (Optional): n8n or Make.com for advanced orchestration

### Constraints

- **Cursor 2.0 Required**: Multi-agent features require Cursor 2.0 (not available in older versions)
- **API Access**: Requires Cursor Background Agents API access (may require Pro subscription)
- **Platform Support**: Cursor 2.0 multi-agent features work on Mac, Windows, Linux
- **Git Worktrees**: Parallel execution requires git worktrees (standard git feature)
- **State Files**: Coordination via files + Cursor API (hybrid approach for reliability)

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: 2026-01-27
- **Target Completion**: 2026-03-15 (7 weeks)
- **Key Milestones**:
  - **Week 2**: Orchestrator foundation complete (Phase 1)
  - **Week 3**: Agent templates complete (Phase 2)
  - **Week 4**: Success criteria framework complete (Phase 3)
  - **Week 5**: Feedback system complete (Phase 4)
  - **Week 6**: Integration and testing complete (Phase 5)
  - **Week 7**: Documentation and training complete (Phase 6)

### Priority

**Priority Level**: P1

**Rationale**: 
- Enables faster development cycles (parallel work)
- Reduces engineering costs (automation, efficiency)
- Improves code quality (specialized agents, feedback loops)
- Critical for scaling development velocity

### Resource Requirements

- **Team**: Engineering Team (1-2 developers)
- **Budget**: No additional budget required (uses existing Cursor and tools)
- **External Dependencies**: None (all tools already in place)

---

## Who (Stakeholders & Ownership)

### Initiative Owner

**Name**: Engineering Team Lead  
**Role**: Engineering  
**Responsibilities**: 
- Design and implement orchestrator system
- Create agent templates and configurations
- Coordinate testing and validation
- Document system and train team

### Key Stakeholders

| Name | Role | Involvement | Responsibilities |
|------|------|-------------|------------------|
| Engineering Team | Development | High | Implement orchestrator, create agent templates, test system |
| Product Team | Product | Medium | Define success criteria patterns, validate workflows |
| QA Team | Quality Assurance | Low | Validate testing agent patterns |

### Teams Involved

- **Engineering Team**: Primary implementers
- **Product Team**: Define success criteria and workflows
- **QA Team**: Review testing agent patterns

### Communication Plan

- **Updates Frequency**: Weekly
- **Update Format**: Status update in #mvp-ryla-dev
- **Audience**: Engineering team, product team

---

## Success Criteria

### Primary Success Metrics

| Metric | Target | Measurement Method | Timeline |
|--------|--------|-------------------|----------|
| Orchestrator Functional | 100% | All phases complete, system tested | Week 7 |
| Agent Templates Created | 6+ templates | Frontend, Backend, Testing, Architecture, Data, Integration | Week 3 |
| Success Criteria Framework | 10+ validators | TypeScript, tests, coverage, E2E, lint, build, etc. | Week 4 |
| Feedback System Functional | 100% | Agents can give/receive feedback | Week 5 |
| Real Task Validation | 3+ tasks | System tested with real development tasks | Week 6 |
| Team Adoption | 80%+ | Team using system for complex tasks | Week 7 |

### Business Metrics Impact

**Target Metric**: [x] E-CAC [x] C-Core Value [x] B-Retention

**Expected Impact**:
- **E-CAC**: 20-30% reduction in development time for complex tasks (parallel work)
- **C-Core Value**: 15-20% improvement in code quality (specialized agents, feedback loops)
- **B-Retention**: 10-15% reduction in regressions (better testing, validation)

### Leading Indicators

- Orchestrator script functional and tested
- Agent templates created and documented
- Success criteria validators working
- Feedback system operational
- Team using system for real tasks

### Lagging Indicators

- Development cycle time decreases
- Code quality metrics improve
- Regression rate decreases
- Team satisfaction with system
- System adoption rate increases

---

## Definition of Done

### Initiative Complete When:

- [ ] Orchestrator script complete and tested
- [ ] All agent templates created (6+ templates)
- [ ] Success criteria framework implemented (10+ validators)
- [ ] Feedback system operational
- [ ] System tested with 3+ real development tasks
- [ ] Documentation complete (user guide, templates, examples)
- [ ] Team trained on system usage
- [ ] System integrated into development workflow
- [ ] Metrics validated (development time, code quality, regressions)

### Not Done Criteria

**This initiative is NOT done if:**
- [ ] Orchestrator not functional
- [ ] Agent templates incomplete
- [ ] Success criteria framework not implemented
- [ ] Feedback system not operational
- [ ] System not tested with real tasks
- [ ] Documentation incomplete
- [ ] Team not trained
- [ ] System not integrated into workflow

---

## Related Work

### Epics

| Epic | Name | Status | Link |
|------|------|--------|------|
| EP-XXX | Multi-Agent Orchestrator Implementation | Proposed | [To be created] |
| EP-YYY | Agent Templates & Configurations | Proposed | [To be created] |
| EP-ZZZ | Success Criteria Framework | Proposed | [To be created] |

### Dependencies

- **Blocks**: Enables faster development for future epics
- **Blocked By**: None
- **Related Initiatives**: 
  - IN-026 (Comprehensive Testing) - Testing agent supports this initiative
  - All future epics can leverage multi-agent system

### Documentation

- Agent Instructions: `AGENTS.md`
- Cursor Rules: `.cursor/rules/`
- Process Documentation: `docs/process/`
- Technical Guides: `docs/technical/`

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Cursor 2.0 API limitations | Low | Medium | Use Cursor's native multi-agent features + Background Agents API |
| State file coordination unreliable | Low | Medium | Use atomic file operations, add validation, leverage Cursor's context system |
| Team adoption resistance | Medium | Medium | Provide training, examples, make it easy to use |
| Success criteria too complex | Medium | Low | Start simple, iterate based on feedback |
| Agents conflict or duplicate work | Low | Medium | Clear code path assignments, use git worktrees for isolation |
| Cursor 2.0 not available | Low | High | Fallback to hybrid approach (manual sessions + orchestrator) |

## Alternative Approaches

### Tool Comparison Matrix

| Tool | Multi-Agent | IDE Integration | Rules System | MCP Support | Full Capabilities | Recommendation |
|------|-------------|-----------------|--------------|-------------|-------------------|----------------|
| **Cursor 2.0** | ✅ Native | ✅ Full IDE | ✅ Advanced | ✅ Native | ✅ All | ⭐ **Best for IDE work** |
| **Agno-AGI** | ✅ Native | ❌ Separate | ❌ Custom | ✅ Tools | ✅ Runtime | ⭐ **Best for roles/memory** |
| **OpenHands** | ⚠️ Single | ❌ Web UI | ❌ N/A | ⚠️ Custom | ✅ Full Linux | ⭐ **Best for full OS** |
| **VoltAgent** | ✅ Native | ❌ Framework | ❌ Custom | ✅ MCP | ⚠️ Custom | ⚠️ Framework (not IDE) |
| **Claude Code** | ⚠️ Unknown | ✅ IDE | ⚠️ Basic | ⚠️ Unknown | ✅ Likely | ⚠️ Evaluate if Cursor fails |
| **Anti-Gravity + Open Code** | ✅ Hybrid | ⚠️ IDE (separate) | ❌ Custom | ❌ No | ⚠️ Partial | ⚠️ Free alternative |
| **CrewAI** | ✅ Framework | ❌ CLI/API | ❌ Custom | ⚠️ Custom | ⚠️ Custom | ⚠️ Enterprise option |
| **LangGraph** | ✅ Framework | ❌ CLI/API | ❌ Custom | ⚠️ Custom | ⚠️ Custom | ⚠️ Too low-level |
| **AutoGen** | ✅ Framework | ❌ CLI/API | ❌ Custom | ⚠️ Custom | ⚠️ Custom | ⚠️ Too low-level |
| **Windsurf** | ⚠️ Limited | ✅ IDE | ⚠️ Basic | ✅ Native | ✅ All | ⚠️ Less mature |
| **Roo Code** | ⚠️ Limited | ✅ VS Code | ⚠️ Basic | ✅ Native | ✅ All | ⚠️ Less rules support |

### Detailed Analysis

#### 1. Cursor 2.0 ⭐ **RECOMMENDED**

**Why it's the best fit:**
- ✅ **Native multi-agent support** (Agent Mode, parallel execution, Background Agents API)
- ✅ **Existing Cursor rules integration** (huge advantage - no migration needed)
- ✅ **Full IDE capabilities** per agent (files, MCP, browser, terminal)
- ✅ **Purpose-built** for this exact workflow
- ✅ **Git worktrees** for parallel execution isolation
- ✅ **Mature ecosystem** with large community

**Limitations:**
- ⚠️ Requires Cursor 2.0 (not available in older versions)
- ⚠️ Background Agents API may require Pro subscription

**Recommendation**: **Start here** - it's the most solid approach given your existing investment.

#### 2. Claude Code

**Considerations:**
- ✅ Full IDE integration
- ✅ Likely has full capabilities (files, browser, terminal)
- ⚠️ Would require **rebuilding entire Cursor rules system** (major migration cost)
- ⚠️ Multi-agent orchestration features unknown
- ⚠️ Less mature ecosystem for this use case
- ❓ MCP support unclear

**Recommendation**: Evaluate only if Cursor 2.0 doesn't meet requirements. Migration cost is high.

#### 3. Anti-Gravity + Open Code Hybrid

**Status**: ✅ **Free Open-Source Alternative**

**What This Combination Is:**
- **Anti-Gravity**: Google's free agentic IDE for high-level orchestration and autonomous planning
- **Open Code**: Open-source AI coding agent for precision code edits and repo-level control
- **Integration**: Open Code can be installed as an extension within Anti-Gravity

**Key Features:**
- **Anti-Gravity Strengths**:
  - ✅ High-level agent orchestration and autonomous planning
  - ✅ Multi-step reasoning and workflow coordination
  - ✅ Planning mode with Opus 4.5 thinking mode
  - ✅ Free (Google's tool)
  - ✅ Can create detailed implementation plans
  
- **Open Code Strengths**:
  - ✅ Precision, deterministic code edits
  - ✅ Deep repo-level control
  - ✅ Model flexibility (many providers)
  - ✅ Clean, reviewable diffs
  - ✅ Multiple simultaneous agent sessions
  - ✅ Open-source

**Workflow Pattern:**
1. **Anti-Gravity (Orchestrator)**: Creates implementation plan using Opus 4.5 planning mode
2. **Open Code (Executor)**: Executes plan with multiple agents working simultaneously
3. **Context Sharing**: Anti-Gravity shares context (selections, tabs) with Open Code
4. **Multiple Agents**: Can deploy multiple Open Code sessions simultaneously

**Advantages:**
- ✅ **Completely free** (both tools are free/open-source)
- ✅ **Best of both worlds**: Orchestration + precision execution
- ✅ **Multiple agents**: Can run multiple Open Code sessions simultaneously
- ✅ **Model flexibility**: Open Code supports many providers
- ✅ **Native integration**: Open Code extension within Anti-Gravity
- ✅ **Context awareness**: Automatic context sharing between tools

**Limitations for Your Use Case:**
- ❌ **Not Cursor-based**: Would require migration from Cursor
- ❌ **No Cursor rules**: Would need to rebuild rules system
- ⚠️ **Anti-Gravity rate limits**: Even on pro tier, can hit usage caps
- ⚠️ **Less mature**: Newer tools, less ecosystem than Cursor
- ❌ **No MCP integration**: Would need custom implementation
- ❌ **No browser tools**: Would need custom integration

**Potential Hybrid Approach:**
- Use **Anti-Gravity for orchestration** (planning, coordination)
- Use **Open Code for execution** (code changes, multiple agents)
- **Keep Cursor for IDE capabilities** (files, browser, terminal, MCP)
- **Integration challenge**: Would need to coordinate three tools

**Recommendation**: **Evaluate as free alternative** - If budget is a concern and you're willing to migrate from Cursor, this could be a powerful free solution. However, migration cost (losing Cursor rules) may outweigh benefits.

**Reference**: [YouTube: Combining Anti-Gravity + Open Code](https://www.youtube.com/watch?v=dzDVt3-MTRk)

#### 4. Agno-AGI (agno.dev) ⭐ **NEW - HIGH PRIORITY EVALUATION**

**Status**: ✅ **Real Tool - Recommended for Evaluation**

**What Agno Is:**
- ✅ **Full framework + runtime + control plane** (not just a framework)
- ✅ **Agent Teams with Roles** - Pre-built agent roles (planner, researcher, writer, reviewer, QA, coordinator)
- ✅ **Persistent Memory** - Agents remember user history across sessions
- ✅ **Shared Knowledge Base** - Agents share context and learn from each other
- ✅ **Production-Ready** - Built for scale, performance, and reliability
- ✅ **AgentOS Runtime** - Full agent operating system with tool integrations
- ✅ **Control Plane/UI** - Monitoring and management dashboard
- ✅ **Guardrails & Human-in-the-Loop** - Safety controls built-in

**Key Differentiators from Other Frameworks:**
- **Memory + Knowledge**: Agents accumulate knowledge across interactions and share it
- **Production Focus**: Not just prototypes - designed for real workflows
- **Runtime Included**: AgentOS provides the execution environment
- **Control Plane**: Built-in observability and management

**Architecture Pattern:**
```
[User/Orchestrator]
    ↓
[Agno Control Plane]
    ├─→ Planner Agent (role: planning, breaking down tasks)
    ├─→ Researcher Agent (role: gathering information)
    ├─→ Developer Agent (role: code implementation)
    ├─→ QA Agent (role: testing, validation)
    └─→ Coordinator Agent (role: orchestration)
    ↓
[Shared Knowledge Base] ← All agents contribute and access
    ↓
[Persistent Memory] ← User context preserved
```

**Comparison with Cursor-Supervised Approach:**

| Aspect | Cursor-Supervised | Agno-AGI |
|--------|-------------------|----------|
| **Orchestrator** | Cursor (IDE) | Agno Control Plane |
| **Agent Roles** | Custom rules | Pre-built + customizable |
| **Memory** | State files | Built-in persistent memory |
| **Knowledge Sharing** | Manual via files | Automatic shared knowledge |
| **IDE Integration** | ✅ Native | ❌ Separate system |
| **Production Runtime** | ⚠️ Cursor-dependent | ✅ AgentOS (standalone) |
| **Observability** | ⚠️ Limited | ✅ Control plane dashboard |
| **MCP Support** | ✅ Native | ✅ Tool integrations |
| **Cursor Rules** | ✅ Preserved | ❌ Would need migration |

**Potential Hybrid Approach (Agno + Cursor):**
- Use **Agno for orchestration** (role-based agents, knowledge, memory)
- Use **Cursor for IDE execution** (file access, browser, terminal via MCP)
- **Integration via MCP** - Agno agents call Cursor tools

**Recommendation**: **Evaluate as alternative to pure Cursor approach** - Agno's pre-built roles, persistent memory, and shared knowledge could significantly reduce implementation time for IN-027.

**Reference**: [Agno Platform](https://agno.dev/) | [Agno GitHub](https://github.com/agno-agi/agno)

---

#### 5. OpenHands (formerly OpenDevin) ⭐ **NEW - LINUX WORKSPACE AGENTS**

**Status**: ✅ **Real Tool - Full Linux Workspace**

**What OpenHands Is:**
- ✅ **Spins up real Linux containers** for each agent
- ✅ **Full environment**: bash shell, filesystem, git, package managers
- ✅ **Optional browser** via Playwright
- ✅ **Agent plans → executes → debugs → commits**
- ✅ **Open source** and actively developed
- ✅ **Closest to "AI with its own computer"**

**Agent Capabilities:**
```bash
# What OpenHands agent gets:
- /workspace    # Agent's working directory
- bash          # Full shell access
- git           # Version control
- npm/pip/etc   # Package managers
- network       # Web access
- browser       # Optional Playwright
```

**Use Cases for RYLA:**
- **Dev Agent**: Clone repo, fix tests, implement features, commit
- **Infra Agent**: Deploy, configure, test endpoints
- **Research Agent**: Browse docs, scrape data, analyze

**Comparison:**

| Aspect | OpenHands | Cursor | Agno |
|--------|-----------|--------|------|
| **Full Linux OS** | ✅ Container | ❌ IDE only | ❌ Framework |
| **Bash/Terminal** | ✅ Full shell | ✅ Terminal tool | ⚠️ Custom |
| **Browser** | ✅ Playwright | ✅ MCP browser | ⚠️ Custom |
| **Git Integration** | ✅ Native | ✅ Native | ⚠️ Custom |
| **IDE Features** | ❌ No IDE | ✅ Full IDE | ❌ No IDE |
| **Cursor Rules** | ❌ N/A | ✅ Native | ❌ N/A |
| **Isolation** | ✅ Containers | ⚠️ Worktrees | ✅ Agent isolation |

**How to Run OpenHands:**
```bash
# Clone and start
git clone https://github.com/All-Hands-AI/OpenHands.git
cd OpenHands
export OPENAI_API_KEY=sk-...
docker compose up

# Web UI opens at http://localhost:3000
```

**Recommendation**: **Evaluate for IN-031** (Agentic Workflow Deployment) where agents need full Linux environment. Less suitable for IN-027 which benefits from IDE integration.

**Reference**: [OpenHands GitHub](https://github.com/All-Hands-AI/OpenHands)

---

#### 6. VoltAgent (voltagent.dev)

**Status**: ✅ **Real Tool - Needs Evaluation**

**What VoltAgent Is:**
- ✅ **Open-source TypeScript framework** for building AI agents
- ✅ **End-to-end platform** with observability, deployment, RAG, and enterprise features
- ✅ **Native multi-agent orchestration** with Supervisor Agent pattern
- ✅ **Workflow Chain API** for complex agent workflows
- ✅ **MCP support** (Model Context Protocol)
- ✅ **40+ integrations** (Slack, GitHub, Notion, Supabase, etc.)
- ✅ **Used by major enterprises** (Samsung, Microsoft, Oracle, Wells Fargo, etc.)

**Key Features:**
- **Supervisor Agent Pattern**: Central coordinator managing specialized agents
- **Workflow Chain API**: Declarative API for complex multi-agent workflows
- **TypeScript Framework**: Type-safe agent development
- **VoltOps Console**: Observability, automation, deployment, evals
- **RAG Support**: Vector database integration
- **Memory System**: Persistent memory across agent interactions

**Advantages:**
- ✅ **Mature multi-agent orchestration** (Supervisor pattern, Workflow Chain API)
- ✅ **Enterprise-ready** (observability, deployment, guardrails)
- ✅ **TypeScript** (fits your stack)
- ✅ **Open source** (framework is open source)
- ✅ **MCP support** (can integrate with Cursor's MCP servers)
- ✅ **Production-ready** (used by major companies)

**Limitations for Your Use Case:**
- ❌ **Not an IDE tool** - It's a framework/platform, not integrated into Cursor
- ❌ **No direct file access** - Would need custom implementation
- ❌ **No browser tools** - Would need custom integration
- ❌ **No terminal access** - Would need custom implementation
- ❌ **No Cursor rules integration** - Would need to rebuild rules system
- ⚠️ **Requires custom integration** - Would need to build connectors to Cursor/file system

**Potential Hybrid Approach:**
- Use **VoltAgent for orchestration** (Supervisor Agent, Workflow Chain API)
- Use **Cursor 2.0 for IDE capabilities** (file access, browser, terminal)
- **Integrate via MCP** - VoltAgent agents could use Cursor's MCP servers
- **Custom connectors** - Build file system/browser tools for VoltAgent agents

**Recommendation**: **Evaluate as hybrid solution** - VoltAgent for orchestration + Cursor 2.0 for IDE capabilities. Could be powerful combination:
- VoltAgent handles multi-agent coordination, workflows, observability
- Cursor 2.0 provides IDE capabilities (files, browser, terminal)
- Integration via MCP and custom tools

**Next Steps**:
1. Evaluate VoltAgent's Supervisor Agent pattern vs Cursor 2.0's native multi-agent
2. Assess integration complexity (VoltAgent + Cursor 2.0)
3. Compare VoltAgent's Workflow Chain API vs Cursor's Background Agents API
4. Test VoltAgent's MCP integration with Cursor's MCP servers
5. Build proof-of-concept hybrid solution if promising

**Reference**: [VoltAgent Platform](https://voltagent.dev/)

#### 5. Agentic Orchestration Frameworks

**LangGraph, AutoGen, CrewAI** - These are **low-level frameworks**, not IDE-integrated tools:

**Characteristics:**
- ✅ Powerful multi-agent orchestration
- ✅ Flexible agent communication patterns
- ❌ **No IDE integration** (CLI/API only)
- ❌ **No file access** (would need custom implementation)
- ❌ **No MCP support** (would need custom integration)
- ❌ **No browser tools** (would need custom implementation)
- ❌ **No Cursor rules** (would need to rebuild rules system)

**Use Case**: Better for building **custom agentic applications**, not IDE-based development.

**Recommendation**: **Not suitable** for this initiative - too low-level, would require building everything from scratch.

#### 6. Windsurf

**Characteristics:**
- ⚠️ Limited multi-agent support (less mature than Cursor 2.0)
- ✅ Full IDE integration
- ⚠️ Basic rules system (less advanced than Cursor)
- ✅ Native MCP support
- ✅ Full capabilities

**Recommendation**: **Not recommended** - Cursor 2.0 is more mature and you already have rules investment.

#### 7. Roo Code (VS Code Extension)

**Characteristics:**
- ⚠️ Limited multi-agent support
- ✅ VS Code integration
- ⚠️ Basic rules system (`.clinerules` - less structured than Cursor)
- ✅ Native MCP support
- ✅ Full capabilities

**Recommendation**: **Not recommended** - Would require migration from Cursor, less rules support.

### Final Recommendation

**Primary Approach: Cursor-Supervised Multi-Agent (Open Code Pattern)**

**Preferred Pattern:**
- **Cursor as Supervisor**: Cursor manages and watches multiple specialized agents
- **Multiple Specialized Agents**: Like Open Code pattern - agents that can be briefed with descriptions
- **Agent Briefing System**: Each agent receives role description, responsibilities, and code paths
- **Cursor Coordination**: Cursor orchestrates, monitors progress, validates success criteria
- **Parallel Execution**: Multiple agents work simultaneously on different tasks
- **Shared Context**: Agents share context through Cursor's context system

**Why This Approach:**
- ✅ **Leverages Cursor investment**: Uses existing Cursor rules and IDE capabilities
- ✅ **Multiple agents**: Can spin up multiple specialized agents (like Open Code)
- ✅ **Cursor supervision**: Cursor manages and watches all agents
- ✅ **Agent briefing**: Agents can be briefed with descriptions (like Open Code pattern)
- ✅ **Full capabilities**: Each agent has full Cursor capabilities (files, MCP, browser, terminal)
- ✅ **No migration needed**: Works within Cursor ecosystem

**Comparison: Cursor-Supervised vs VoltAgent**

| Aspect | Cursor-Supervised (Preferred) | VoltAgent |
|--------|------------------------------|-----------|
| **Orchestrator** | Cursor (IDE-integrated) | VoltAgent Supervisor Agent |
| **Agent Briefing** | ✅ Cursor briefs agents with descriptions | ✅ Supervisor Agent coordinates |
| **IDE Integration** | ✅ Native Cursor integration | ❌ Framework (not IDE) |
| **File Access** | ✅ Native Cursor file access | ⚠️ Custom implementation needed |
| **MCP Support** | ✅ Native Cursor MCP | ✅ MCP support |
| **Browser Tools** | ✅ Native Cursor browser tools | ❌ Custom implementation needed |
| **Terminal Access** | ✅ Native Cursor terminal | ❌ Custom implementation needed |
| **Cursor Rules** | ✅ Existing rules work | ❌ Would need to rebuild |
| **Observability** | ⚠️ Cursor's built-in | ✅ VoltOps Console (enterprise) |
| **Workflow API** | ⚠️ Background Agents API | ✅ Workflow Chain API (more advanced) |
| **Deployment** | ⚠️ Manual/Cursor-based | ✅ VoltOps deployment |
| **Cost** | ✅ Cursor subscription | ⚠️ VoltOps (paid) + framework (open source) |
| **Migration** | ✅ No migration needed | ❌ Would need migration |

**Key Differences:**

**Cursor-Supervised Advantages:**
- ✅ **No migration**: Works with existing Cursor setup
- ✅ **IDE-native**: Full IDE capabilities per agent
- ✅ **Cursor rules**: Existing rules investment preserved
- ✅ **Simpler**: Works within Cursor ecosystem

**VoltAgent Advantages:**
- ✅ **Advanced orchestration**: More sophisticated Supervisor Agent pattern
- ✅ **Enterprise features**: VoltOps Console (observability, deployment, evals)
- ✅ **Workflow Chain API**: More advanced workflow orchestration
- ✅ **Production deployment**: Built-in deployment capabilities

**Recommendation (Updated 2026-02-04):**

**Tiered Approach:**
1. **Start with Cursor-Supervised** for IDE-based development work
2. **Add Agno-AGI** for role-based agents with persistent memory and shared knowledge
3. **Use OpenHands** for agents that need full Linux workspace (deployment, infra, complex builds)

**Hybrid Architecture (Best of All Worlds):**
```
[Cursor] ←→ [Agno-AGI] ←→ [OpenHands]
   │            │             │
   └──IDE work──┘──Roles/──────┘──Full OS──
                   Memory
```

- **Cursor**: IDE-based agents for code editing, browser testing, file operations
- **Agno**: Orchestration, role definitions, persistent memory, knowledge sharing
- **OpenHands**: Full Linux containers for deployment, complex builds, system operations

**When to Use What:**
| Task Type | Recommended Tool |
|-----------|-----------------|
| Code editing in IDE | Cursor agents |
| Role-based coordination | Agno-AGI |
| Complex deployments | OpenHands |
| Knowledge accumulation | Agno-AGI |
| Browser testing | Cursor + MCP browser |
| Full system access | OpenHands |

**Research Tasks:**
1. **Cursor-Supervised Pattern**: Implement multiple specialized agents managed by Cursor
2. **Agent Briefing System**: Design system for briefing agents with descriptions
3. **Agno-AGI Evaluation**: Test pre-built roles, memory system, knowledge sharing
4. **OpenHands Integration**: Set up for deployment agents needing full Linux access
3. **VoltAgent Comparison**: Evaluate if VoltAgent's orchestration exceeds Cursor's capabilities
4. **Anti-Gravity + Open Code**: Evaluate as free alternative (if budget is concern)
5. **Claude Code**: Evaluate only if Cursor 2.0 has limitations

---

## Comprehensive Tool Comparison Matrix

### Full Comparison: All Multi-Agent Platforms

| Feature | Cursor 2.0 | Agno-AGI | OpenHands | VoltAgent | CrewAI | AutoGen |
|---------|-----------|----------|-----------|-----------|--------|---------|
| **Multi-Agent Orchestration** | ✅ Native | ✅ Native | ⚠️ Single agent | ✅ Supervisor | ✅ Crew pattern | ✅ Multi-agent |
| **Pre-built Agent Roles** | ❌ Custom | ✅ Built-in | ❌ Custom | ⚠️ Templates | ✅ Role templates | ❌ Custom |
| **Persistent Memory** | ❌ State files | ✅ Built-in | ⚠️ Session | ⚠️ Custom | ⚠️ Custom | ⚠️ Custom |
| **Shared Knowledge Base** | ❌ Manual | ✅ Automatic | ❌ N/A | ⚠️ Custom | ⚠️ Custom | ⚠️ Custom |
| **Full Linux Workspace** | ❌ IDE only | ❌ Framework | ✅ Containers | ❌ Framework | ❌ Framework | ❌ Framework |
| **IDE Integration** | ✅ Native | ❌ Separate | ❌ Web UI | ❌ Framework | ❌ CLI | ❌ CLI |
| **Cursor Rules Support** | ✅ Native | ❌ Migrate | ❌ N/A | ❌ Custom | ❌ Custom | ❌ Custom |
| **MCP Support** | ✅ Native | ✅ Tools | ⚠️ Custom | ✅ MCP | ⚠️ Custom | ⚠️ Custom |
| **Browser Automation** | ✅ MCP browser | ⚠️ Custom | ✅ Playwright | ⚠️ Custom | ⚠️ Custom | ⚠️ Custom |
| **Terminal Access** | ✅ Native | ⚠️ Custom | ✅ Full bash | ⚠️ Custom | ⚠️ Custom | ⚠️ Custom |
| **Observability/Dashboard** | ⚠️ Limited | ✅ Control plane | ⚠️ Logs | ✅ VoltOps | ⚠️ Custom | ⚠️ Custom |
| **Production Deployment** | ⚠️ IDE-bound | ✅ AgentOS | ✅ Docker | ✅ VoltOps | ⚠️ Custom | ⚠️ Custom |
| **Cost Tracking** | ❌ Manual | ⚠️ Custom | ❌ Manual | ✅ Built-in | ⚠️ Custom | ⚠️ Custom |
| **Enterprise Ready** | ⚠️ Pro tier | ✅ Yes | ⚠️ Self-host | ✅ Yes | ✅ AMP | ⚠️ Custom |
| **Open Source** | ❌ Proprietary | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Partial | ✅ Yes |
| **TypeScript Native** | ✅ Yes | ⚠️ Python | ⚠️ Python | ✅ Yes | ❌ Python | ❌ Python |

### Recommendation by Use Case

| Use Case | Best Tool | Reason |
|----------|-----------|--------|
| **RYLA Development (IN-027)** | Cursor 2.0 + Agno hybrid | Preserve Cursor rules + Agno's role system |
| **Workflow Deployment (IN-031)** | OpenHands + VoltAgent | Full Linux for deployment + orchestration |
| **Enterprise Multi-Agent** | CrewAI AMP or Agno | Production-ready, enterprise features |
| **Research/Experimentation** | OpenHands or AutoGen | Full control, open source |
| **Quick Prototyping** | CrewAI or Agno | Pre-built roles, fast setup |

---

## RYLA AI Company Setup

### Vision: AI-Powered RYLA Development Team

A multi-agent system where specialized AI agents handle different aspects of RYLA development, coordinated by a central orchestrator.

### Agent Roles for RYLA

| Agent Role | Primary Responsibilities | Tools Needed | Coordination |
|-----------|-------------------------|--------------|--------------|
| **Product Agent (PM)** | PRDs, requirements, user feedback synthesis, prioritization | Docs, analytics, Notion | Receives requests, delegates to other agents |
| **Architecture Agent** | System design, API contracts, data models, technical decisions | Codebase access, docs | Reviews Dev Agent output |
| **Frontend Agent** | React/Next.js, TailwindCSS, UI components, state management | Cursor, apps/web | Implements PM requirements |
| **Backend Agent** | NestJS, APIs, business logic, database operations | Cursor, apps/api | Implements PM requirements |
| **Dev Agent (Full-Stack)** | Complete feature implementation across stack | OpenHands Linux workspace | Complex cross-cutting features |
| **Testing Agent** | Unit tests, integration tests, E2E tests | Cursor, Playwright, Vitest | Validates all agent output |
| **DevOps Agent** | Deployment, infrastructure, Modal/Fly.io | OpenHands, Modal CLI | Deploys approved changes |
| **Research Agent** | AI models, workflows, competitor analysis | Browser, docs | Feeds Product Agent |
| **Support Agent (Tier 1-2)** | Issue triage, bug summaries, user feedback | CRM, logs (read-only) | Escalates to PM/Dev |

### Architecture: RYLA AI Company

```
                    ┌─────────────────────────────────────┐
                    │        ORCHESTRATOR (Cursor)         │
                    │   - Receives user requests           │
                    │   - Assigns tasks to agents          │
                    │   - Monitors progress                │
                    │   - Validates success criteria       │
                    └──────────────┬──────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Product Agent  │    │  Dev Agents     │    │  Ops Agents     │
│  ─────────────  │    │  ───────────    │    │  ──────────     │
│  • PRD creation │    │  • Frontend     │    │  • DevOps       │
│  • Requirements │    │  • Backend      │    │  • Testing      │
│  • Prioritize   │    │  • Architecture │    │  • Support      │
│                 │    │  • Full-Stack   │    │                 │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   SHARED RESOURCES    │
                    │   ─────────────────   │
                    │   • Knowledge Base    │
                    │   • State Files       │
                    │   • Git Repository    │
                    │   • MCP Servers       │
                    └───────────────────────┘
```

### Agent Definitions

#### 1. Product Agent (PM)

```yaml
name: product-agent
role: Product Manager
brief: |
  You are RYLA's AI Product Manager. You:
  - Analyze user feedback and feature requests
  - Write PRDs with clear acceptance criteria
  - Prioritize tasks based on business metrics (A-E)
  - Delegate implementation to Dev Agents
  - Review completed work against requirements

tools:
  - docs_access (read/write)
  - analytics_access (PostHog, read-only)
  - notification_access (Slack)
  
code_paths:
  - docs/requirements/**
  - docs/initiatives/**
  
success_criteria:
  - PRD has clear acceptance criteria
  - Tasks assigned to correct agents
  - Business metric impact identified
```

#### 2. Frontend Agent

```yaml
name: frontend-agent
role: Frontend Developer
brief: |
  You are RYLA's Frontend Developer. You:
  - Implement React/Next.js components
  - Follow Cursor rules (react-patterns.mdc, styling.mdc)
  - Use TailwindCSS and Radix UI
  - Write Vitest unit tests for components
  - Follow file organization patterns

tools:
  - cursor (file access, terminal)
  - browser_mcp (testing)
  
code_paths:
  - apps/web/**
  - libs/ui/**
  
success_criteria:
  - TypeScript: no errors
  - Linter: no errors
  - Tests: passing
  - Follows react-patterns.mdc
```

#### 3. Backend Agent

```yaml
name: backend-agent
role: Backend Developer
brief: |
  You are RYLA's Backend Developer. You:
  - Implement NestJS services and controllers
  - Follow layered architecture (presentation → business → data)
  - Write tRPC endpoints following api-design.mdc
  - Use Drizzle ORM for database operations
  - Write integration tests

tools:
  - cursor (file access, terminal)
  - database_mcp (optional)
  
code_paths:
  - apps/api/**
  - libs/business/**
  - libs/data/**
  
success_criteria:
  - TypeScript: no errors
  - Tests: passing
  - API contracts match spec
  - Follows architecture.mdc
```

#### 4. Dev Agent (Full-Stack, OpenHands)

```yaml
name: dev-agent-fullstack
role: Full-Stack Developer
brief: |
  You are RYLA's Full-Stack Developer with full Linux access. You:
  - Implement complex features across frontend and backend
  - Have full shell access for any command
  - Can install packages, run builds, execute tests
  - Fix issues iteratively until tests pass
  - Create commits and PRs

environment: openhands
tools:
  - bash (full shell)
  - git
  - npm/pnpm
  - browser (playwright)
  
code_paths:
  - all (within repo)
  
success_criteria:
  - Feature complete per acceptance criteria
  - All tests passing
  - PR created with description
```

#### 5. Testing Agent

```yaml
name: testing-agent
role: QA Engineer
brief: |
  You are RYLA's QA Engineer. You:
  - Write and run unit tests (Vitest)
  - Write and run E2E tests (Playwright)
  - Verify acceptance criteria
  - Report test failures with context
  - Suggest fixes for failing tests

tools:
  - cursor (file access, terminal)
  - browser_mcp (E2E testing)
  
code_paths:
  - **/*.test.ts
  - **/*.spec.ts
  - apps/*/tests/**
  
success_criteria:
  - All tests passing
  - Coverage maintained/improved
  - Edge cases covered
```

#### 6. DevOps Agent

```yaml
name: devops-agent
role: DevOps Engineer
brief: |
  You are RYLA's DevOps Engineer. You:
  - Deploy to Modal.com, Fly.io, Vercel
  - Configure CI/CD pipelines (GitHub Actions)
  - Manage secrets (Infisical)
  - Monitor deployments and costs
  - Handle infrastructure issues

environment: openhands  # Needs full Linux for deployment
tools:
  - bash
  - modal_cli
  - fly_cli
  - gh_cli
  - infisical_cli
  
code_paths:
  - apps/modal/**
  - .github/workflows/**
  - fly.toml
  
success_criteria:
  - Deployment successful
  - Health checks passing
  - No cost overruns
```

### Execution Flow Example

**Scenario**: "Add dark mode to the web app"

```
1. User Request → Orchestrator
   "Add dark mode toggle to settings page"

2. Orchestrator → Product Agent
   "Create requirements for dark mode feature"

3. Product Agent outputs:
   - PRD with acceptance criteria
   - Assigns Frontend Agent + Testing Agent

4. Orchestrator → Frontend Agent
   "Implement dark mode per PRD"

5. Frontend Agent:
   - Implements ThemeProvider
   - Creates DarkModeToggle component
   - Updates TailwindCSS config
   - Writes unit tests

6. Orchestrator → Testing Agent
   "Verify dark mode implementation"

7. Testing Agent:
   - Runs unit tests
   - Runs E2E tests
   - Reports: "All tests passing ✅"

8. Orchestrator → Human
   "Dark mode complete. PR ready for review."
   
9. [ACCEPTANCE CRITERIA STATUS]
   1. Toggle switches theme: ✅
   2. Preference persists: ✅
   3. All components support dark: ✅
   4. Tests passing: ✅
```

### Implementation Phases

| Phase | Focus | Duration | Deliverable |
|-------|-------|----------|-------------|
| **Phase 1** | Cursor orchestrator + 2 agents (Frontend, Backend) | 2 weeks | Basic multi-agent working |
| **Phase 2** | Add Testing Agent + success validation | 1 week | Automated validation |
| **Phase 3** | Add DevOps Agent (OpenHands) | 2 weeks | Deployment automation |
| **Phase 4** | Add Product Agent + knowledge base | 2 weeks | Full planning capability |
| **Phase 5** | Integrate Agno for memory/knowledge | 2 weeks | Persistent learning |
| **Phase 6** | Full RYLA AI Company | 1 week | Documentation + training |

**Total**: 10 weeks

### What Stays Human

Even with AI agents, humans remain essential for:

| Area | Why Human |
|------|-----------|
| **Strategy** | Business direction, product vision |
| **Architecture Decisions** | Major technical choices, tradeoffs |
| **Security Review** | Critical for auth, payments, data |
| **Production Deployment Approval** | Final sign-off on releases |
| **Customer Trust** | High-stakes customer interactions |
| **Financial Decisions** | Budget, spending, contracts |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Dev Time Reduction** | 30-50% | Time to implement features |
| **Code Quality** | +20% | Test coverage, fewer bugs |
| **Deployment Frequency** | 2x | Deployments per week |
| **Agent Task Completion** | 80%+ | Tasks completed without human intervention |
| **Knowledge Reuse** | 50%+ | Patterns applied from previous work |

---

## Progress Tracking

### Current Phase

**Phase**: P1 - Requirements  
**Status**: On Track

### Recent Updates

- **2026-02-04**: Added Agno-AGI and OpenHands evaluation, comprehensive comparison matrix, RYLA AI Company setup
- **2026-01-27**: Initiative created, requirements defined

### Next Steps

1. ⏳ **Evaluate Agno-AGI** - Test pre-built roles, memory, knowledge sharing
2. ⏳ **Evaluate OpenHands** - Set up for deployment agents
3. ⏳ Create EP-XXX (Multi-Agent Orchestrator Implementation)
4. ⏳ Create EP-YYY (Agent Templates & Configurations)
5. ⏳ Create EP-ZZZ (Success Criteria Framework)
6. ⏳ Begin Phase 1: Orchestrator foundation with Cursor + Agno hybrid

---

## Lessons Learned

[To be filled during/after initiative completion]

### What Went Well

- [Learning 1]
- [Learning 2]

### What Could Be Improved

- [Learning 1]
- [Learning 2]

### Recommendations for Future Initiatives

- [Recommendation 1]
- [Recommendation 2]

---

## References

### Multi-Agent Platforms
- **Agno-AGI**: https://agno.dev/ | https://github.com/agno-agi/agno
- **OpenHands**: https://github.com/All-Hands-AI/OpenHands
- **Cursor 2.0**: https://docs.cursor.com/
- **Cursor Background Agents API**: https://docs.cursor.com/background-agent
- **VoltAgent**: https://voltagent.dev/
- **CrewAI**: https://www.crewai.com/
- **OpenWork (different-ai)**: https://github.com/different-ai/openwork

### Tutorials & Guides
- Building Multi-Agent Systems with Cursor 2.0: https://medium.com/@abhishek97.edu/building-autonomous-multi-agent-systems-with-cursor-2-0-from-manual-to-fully-automated-04397c1831af
- Multi-Agents for Full-Stack Projects: https://skywork.ai/blog/vibecoding/multi-agents-full-stack-projects/
- Anti-Gravity + Open Code Tutorial: https://www.youtube.com/watch?v=dzDVt3-MTRk

### RYLA Documentation
- Agent Instructions: `AGENTS.md`
- Cursor Rules: `.cursor/rules/`
- 10-Phase Pipeline: `docs/process/10-PHASE-PIPELINE.md`
- Testing Standards: `.cursor/rules/testing-standards.mdc`
- IN-031 Agentic Deployment: `docs/initiatives/IN-031-agentic-workflow-deployment.md`

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-27

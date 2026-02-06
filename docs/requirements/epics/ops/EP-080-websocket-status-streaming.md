# [EPIC] EP-080: WebSocket Status Streaming to Frontend

**Status**: In Review
**Phase**: P7
**Priority**: P1
**Created**: 2026-02-04
**Last Updated**: 2026-02-04

> **Initiative**: [IN-033: Phoenix/BEAM Patterns Adoption](../../../initiatives/IN-033-phoenix-patterns-adoption.md)
> **Phase**: 1 of 5

## Overview

Replace REST polling for generation status with WebSocket push updates. Includes Redis adapter for multi-server support. This completes the WebSocket loop: Backend already has WebSocket to ComfyUI (EP-039), this epic adds Frontend-to-Backend WebSocket.

---

## Business Impact

**Target Metric**: C - Core Value, B - Retention, E - CAC

**Hypothesis**: When users receive instant status updates via WebSocket instead of polling every 2 seconds, they experience faster feedback, reduced anxiety, and lower infrastructure costs.

**Success Criteria**:
- Polling reduction: **-80%** of API calls for status updates
- Status update latency: **<500ms** from event to UI
- Multi-server support: **100%** events delivered across server instances
- User experience: Instant feedback on generation progress

---

## Features

### F1: Redis Socket.io Adapter

- **Redis Adapter Integration**:
  - Install `@socket.io/redis-adapter` package
  - Create `RedisIoAdapter` class extending NestJS `IoAdapter`
  - Use existing Redis connection from `RedisService`
  - Enable pub/sub for cross-server event broadcast

- **Multi-Server Support**:
  - Events published on any server reach all connected clients
  - User connected to Server A receives events from Server B
  - No single point of failure for WebSocket connections

- **Configuration**:
  - Use existing `REDIS_URL` environment variable
  - Fallback to in-memory adapter if Redis unavailable (dev mode)
  - Log adapter mode on startup

### F2: Frontend Socket.io Client

- **Socket.io Client Setup**:
  - Install `socket.io-client` in `apps/web`
  - Create `SocketProvider` context for app-wide connection
  - Handle connection lifecycle (connect, disconnect, reconnect)
  - Authenticate with user ID from session

- **Connection Management**:
  - Connect on app mount (authenticated users only)
  - Disconnect on logout or unmount
  - Auto-reconnect with exponential backoff
  - Connection status indicator (optional)

### F3: Generation Status Hook

- **`useGenerationSocket` Hook**:
  - Subscribe to generation status events by job ID
  - Return `{ status, progress, result, error }`
  - Automatically unsubscribe on unmount
  - TypeScript types for all events

- **Event Types**:
  - `generation:progress` - Progress update (0-100%)
  - `generation:complete` - Job completed with result
  - `generation:error` - Job failed with error
  - `generation:queued` - Job queued position

### F4: Backend Event Emission

- **NotificationGateway Enhancement**:
  - Add `emitGenerationStatus(userId, jobId, status)` method
  - Emit events when job status changes
  - Include progress percentage, status, and result

- **Service Integration**:
  - Inject `NotificationGateway` into generation services
  - Emit status on: queued, processing, progress, complete, error
  - Replace polling triggers with push events

### F5: Polling Fallback

- **Graceful Degradation**:
  - Keep existing `useGenerationPolling` hook as fallback
  - Auto-switch to polling if WebSocket disconnected
  - Log when fallback is used for monitoring

---

## Acceptance Criteria

### AC1: Redis Adapter
- [ ] `@socket.io/redis-adapter` installed and configured
- [ ] `RedisIoAdapter` class created and used in `main.ts`
- [ ] Events broadcast across multiple server instances
- [ ] Fallback to in-memory adapter if Redis unavailable

### AC2: Frontend Client
- [ ] `socket.io-client` installed in `apps/web`
- [ ] `SocketProvider` context provides connection to app
- [ ] Connection authenticated with user ID
- [ ] Auto-reconnect on connection loss

### AC3: Generation Hook
- [ ] `useGenerationSocket(jobId)` hook returns status
- [ ] Hook subscribes to correct events
- [ ] Automatic unsubscribe on unmount
- [ ] TypeScript types for all events

### AC4: Backend Events
- [ ] `NotificationGateway` emits generation status events
- [ ] Events emitted on status changes (queued, processing, complete, error)
- [ ] Events include progress percentage
- [ ] Events scoped to user room (`user-${userId}`)

### AC5: Integration
- [ ] Studio page uses `useGenerationSocket` for status
- [ ] Profile picture generation uses WebSocket status
- [ ] Polling requests reduced by 80%+
- [ ] No breaking changes to existing flows

### AC6: Multi-Server
- [ ] Test with 2+ API server instances
- [ ] Events from Server A reach clients on Server B
- [ ] No event loss during server restart
- [ ] Redis pub/sub metrics logged

---

## Technical Requirements

### Dependencies

**New Packages**:
- `@socket.io/redis-adapter` - Redis adapter for Socket.io
- `socket.io-client` - Frontend Socket.io client (apps/web)

**Existing**:
- `socket.io` - Already installed
- `@nestjs/platform-socket.io` - Already installed
- Redis - Already configured via `RedisService`

### Files to Create

```
apps/api/src/common/adapters/redis-io.adapter.ts     # Redis Socket.io adapter
apps/web/providers/socket-provider.tsx               # Socket context provider
apps/web/hooks/use-socket.ts                         # Socket connection hook
apps/web/hooks/use-generation-socket.ts              # Generation status hook
libs/shared/src/types/socket-events.ts               # Shared event types
```

### Files to Modify

```
apps/api/src/main.ts                                 # Use RedisIoAdapter
apps/api/src/modules/notification/notification.gateway.ts  # Add generation events
apps/api/src/modules/image/services/*.ts             # Emit status events
apps/web/app/layout.tsx                              # Add SocketProvider
apps/web/app/studio/page.tsx                         # Use useGenerationSocket
```

### Architecture

```
Frontend (apps/web)
  ├── SocketProvider (context)
  │     └── socket.io-client connection
  └── useGenerationSocket(jobId)
        └── subscribes to generation:* events
              ↓ WebSocket
Backend (apps/api)
  ├── RedisIoAdapter
  │     └── Redis pub/sub for multi-server
  └── NotificationGateway
        └── emits generation:* events
              ↑
        Generation Services
              ↑ WebSocket (EP-039)
        ComfyUI / Modal / Replicate
```

---

## Non-Goals

- ❌ WebSocket for other features (notifications, presence) - future epics
- ❌ Connection status UI indicator - nice-to-have
- ❌ Offline queue for missed events - future enhancement
- ❌ WebSocket authentication with JWT - use simpler userId for now

---

## Related Work

### Dependencies
- **EP-039**: WebSocket Real-time Progress (ComfyUI) - Backend complete
- **EP-040**: Redis Job Persistence - Redis already configured

### Blocks
- **EP-081**: Job Supervision Patterns - Can emit supervision events via WebSocket
- **EP-082**: Error Boundary Implementation - Can notify errors via WebSocket

### Related Initiatives
- **IN-033**: Phoenix/BEAM Patterns Adoption (this is Phase 1)

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Polling reduction | -80% | Compare API request counts before/after |
| Status latency | <500ms | Time from backend event to UI update |
| WebSocket adoption | >95% | % of sessions using WebSocket |
| Multi-server events | 100% | Events delivered across instances |
| Connection success | >99% | WebSocket connection success rate |

---

## Stories

### ST-080-01: Redis Socket.io Adapter
Create `RedisIoAdapter` class and integrate with `main.ts`.

### ST-080-02: Frontend Socket Provider
Create `SocketProvider` context and `useSocket` hook.

### ST-080-03: Generation Status Hook
Create `useGenerationSocket` hook for subscribing to job status.

### ST-080-04: Backend Event Emission
Enhance `NotificationGateway` and integrate with generation services.

### ST-080-05: Studio Integration
Replace polling with WebSocket in Studio page.

### ST-080-06: Multi-Server Testing
Test and verify events work across multiple API instances.

---

**Created**: 2026-02-04
**Last Updated**: 2026-02-04

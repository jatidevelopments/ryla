# RYLA MVP - Agent Instructions

## Project Overview
RYLA MVP is a layered architecture application with clear separation of concerns across presentation, business, data, and management layers.

## Architecture Principles

- **Layer Separation**: Never skip layers. Data flows: Presentation → Business → Data → Database
- **Single Responsibility**: Each layer has a specific purpose
- **Dependency Direction**: Outer layers depend on inner layers, never the reverse
- **Management Layer**: Can interact with all layers for administrative operations

## Code Style

- Use descriptive, self-documenting names
- Keep functions small and focused
- Prefer composition over inheritance
- Handle errors explicitly
- Write tests for business logic

## When Adding Features

1. Start with domain models in business layer
2. Implement business services with rules
3. Create data repositories for persistence
4. Add presentation controllers and routes
5. Update management layer if admin features needed

## Common Patterns

- **Services**: Business logic orchestration
- **Repositories**: Data access abstraction
- **DTOs**: API input/output validation
- **Controllers**: HTTP request handling
- **Middleware**: Cross-cutting concerns

## Testing Strategy

- Unit tests for business logic and rules
- Integration tests for layer interactions
- E2E tests for complete workflows
- Mock external dependencies in tests


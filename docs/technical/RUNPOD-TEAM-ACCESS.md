# RunPod Team Access

> **Last Checked**: 2025-12-10

## Your Teams

You have access to the following RunPod teams:

| Team ID | Team Name | Status |
|---------|-----------|--------|
| `cm03tl0ve0002l408rxwspxk7` | **Dream Companion** | Active |

## Account Information

- **User ID**: `user_36ZQzKqNNydabyrpPDlVCV3oHtl`
- **Email**: `janistirtey1@gmail.com`

## Team Context

All RunPod resources (pods, endpoints, network volumes) should be created under the **Dream Companion** team context.

## Verifying Team Access

To check your teams programmatically:

```typescript
// Using RunPod GraphQL API
const query = `
  query {
    myself {
      id
      email
      teams {
        id
        name
      }
    }
  }
`;
```

## Resources Under Dream Companion Team

When creating resources, they will be associated with the Dream Companion team:

- **Network Volume**: `ryla-models-dream-companion` (pending)
- **ComfyUI Pod**: `ryla-comfyui-dream-companion` (pending)
- **Serverless Endpoint**: `ryla-image-generation` (pending)

## Notes

- Resources created via MCP or API will be under your active team (Dream Companion)
- Team context is automatically applied when using the RunPod API
- No additional team selection needed in API calls


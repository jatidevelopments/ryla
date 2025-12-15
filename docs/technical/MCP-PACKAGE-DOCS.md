# MCP Package Docs Integration

## Overview

The **Package Docs MCP Server** (`@jankowtf/mcp-package-docs`) is integrated into the RYLA project to provide AI assistants with real-time access to package documentation. This ensures that when working on apps, integrating packages, or editing code, we always have access to the latest version information and correct usage patterns.

## Configuration

The MCP server is configured in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "package-docs": {
      "command": "npx",
      "args": ["-y", "@jankowtf/mcp-package-docs"]
    }
  }
}
```

## Features

### Multi-Language Support
- **Go packages** via `go doc`
- **Python libraries** via built-in `help()`
- **NPM packages** via registry documentation (including private registries)

### Smart Documentation Parsing
- Structured output with description, usage, and examples
- Focused information to avoid context overload
- Support for specific symbol/function lookups

### Advanced Search
- Search within package documentation
- Fuzzy matching for flexible queries
- Context-aware results with relevance scoring
- Symbol extraction from search results

## Available Tools

### 1. `lookup_npm_doc`
Fetches NPM package documentation from both public and private registries.

**Arguments:**
- `package` (required): Package name (supports scoped packages like `@org/pkg`)
- `version` (optional): Specific version to lookup

**Example:**
```json
{
  "name": "lookup_npm_doc",
  "arguments": {
    "package": "axios",
    "version": "1.6.0"
  }
}
```

**Registry Support:**
- Automatically reads `~/.npmrc` for registry configuration
- Supports scoped registries (e.g., `@mycompany:registry=...`)
- Works with private registries (GitHub Packages, GitLab, Nexus, Artifactory)
- Falls back to default npm registry if no custom registry configured

### 2. `lookup_python_doc`
Fetches Python package documentation.

**Arguments:**
- `package` (required): Package name
- `symbol` (optional): Specific symbol/function to lookup

**Example:**
```json
{
  "name": "lookup_python_doc",
  "arguments": {
    "package": "requests",
    "symbol": "get"
  }
}
```

### 3. `lookup_go_doc`
Fetches Go package documentation.

**Arguments:**
- `package` (required): Package path (e.g., `encoding/json`)
- `symbol` (optional): Specific symbol to lookup

**Example:**
```json
{
  "name": "lookup_go_doc",
  "arguments": {
    "package": "encoding/json",
    "symbol": "Marshal"
  }
}
```

### 4. `search_package_docs`
Search within package documentation.

**Arguments:**
- `package` (required): Package name
- `query` (required): Search query
- `language` (required): `"go"`, `"python"`, or `"npm"`
- `fuzzy` (optional): Enable fuzzy matching (default: `true`)

**Example:**
```json
{
  "name": "search_package_docs",
  "arguments": {
    "package": "requests",
    "query": "authentication headers",
    "language": "python",
    "fuzzy": true
  }
}
```

## Usage in Development

### When to Use

The Package Docs MCP server is automatically available when:
- **Integrating new packages**: Check latest version and usage patterns
- **Updating dependencies**: Verify breaking changes and migration guides
- **Writing code**: Look up correct API usage and examples
- **Debugging**: Find correct function signatures and parameters
- **Code reviews**: Verify best practices and latest patterns

### Workflow Integration

1. **Before adding a package**: Use `lookup_npm_doc` to check latest version and API
2. **While coding**: Use `search_package_docs` to find specific usage examples
3. **When updating**: Use `lookup_npm_doc` with version to check changelog
4. **For private packages**: Ensure `.npmrc` is configured correctly

## Requirements

- Node.js >= 20
- Go (for Go package documentation)
- Python 3 (for Python package documentation)
- Internet connection (for NPM package documentation)

## Private Registry Configuration

For private NPM packages, configure `~/.npmrc`:

```ini
# Default registry
registry=https://nexus.mycompany.com/repository/npm-group/

# Scoped registry
@mycompany:registry=https://nexus.mycompany.com/repository/npm-private/

# GitHub Packages
@mycompany-ct:registry=https://npm.pkg.github.com/
```

The MCP server automatically reads this configuration and uses the appropriate registry for each package.

## Benefits

1. **Always Up-to-Date**: Access latest package versions and documentation
2. **Correct Usage**: Verify API patterns before implementation
3. **Time Savings**: No need to manually search documentation
4. **Consistency**: Ensures all code follows latest best practices
5. **Private Package Support**: Works with internal/private registries

## Related Documentation

- [External Dependencies](../specs/EXTERNAL-DEPENDENCIES.md)
- [Tech Stack](../specs/TECH-STACK.md)
- [Architecture](../architecture/ARCHITECTURE.md)


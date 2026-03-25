# Cadans Context Engineering

This directory houses tools and architectural rules for maintaining context hygiene across the Cadans agent ecosystem.

## Progressive Disclosure Tools
- **`mcp-memory-tool.ts`**: An MCP server that allows agents to selectively read and write state to a persistent `NOTES.md` file, avoiding context window bloat and preventing "context rot."

## Sub-agent Orchestration
To prevent the Personal Assistant (PA) from suffering context rot, it uses a **Lead Agent / Dispatch Pattern**. The PA stays lightweight, triggering the `books` and `collect` agents as independent processes via an MCP dispatch tool. Those sub-agents perform complex tasks (such as parsing API payloads) and return distilled summaries to the PA.

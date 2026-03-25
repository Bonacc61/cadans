#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from 'fs';
import path from 'path';

const server = new Server(
  { name: "cadans-memory-tool", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

const NOTES_PATH = process.env.NANOCLAW_GROUP_FOLDER ? path.join(process.env.NANOCLAW_GROUP_FOLDER, 'NOTES.md') : '/workspace/group/NOTES.md';

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "read_notes",
        description: "Progressive Disclosure Tool: Read specific sections of the persistent NOTES.md. Use this to retrieve memory selectively without polluting the context window.",
        inputSchema: {
          type: "object",
          properties: {
            sectionHeader: {
              type: "string",
              description: "The Markdown header to search for (e.g. 'Contacts', 'Pending Invoices', 'User Preferences'). If omitted, returns the Table of Contents."
            }
          }
        }
      },
      {
        name: "write_note",
        description: "Append or update a note in the persistent NOTES.md file.",
        inputSchema: {
          type: "object",
          properties: {
            sectionHeader: {
              type: "string",
              description: "The header where this note belongs."
            },
            content: {
              type: "string",
              description: "The markdown content to write."
            }
          },
          required: ["sectionHeader", "content"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Ensure the directory exists
  const dir = path.dirname(NOTES_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(NOTES_PATH)) {
    fs.writeFileSync(NOTES_PATH, "# Cadans Persistent Memory\n\n## User Preferences\n\n## Contacts\n\n## Pending Invoices\n");
  }

  const content = fs.readFileSync(NOTES_PATH, 'utf-8');

  if (request.params.name === "read_notes") {
    const { sectionHeader } = request.params.arguments as { sectionHeader?: string };
    
    if (!sectionHeader) {
      // Return TOC
      const lines = content.split('\n');
      const headers = lines.filter(l => l.startsWith('##')).map(l => l.replace(/^#+\s/, ''));
      return {
        content: [{ type: "text", text: `Table of Contents:\n- ${headers.join('\n- ')}\n\n(Call read_notes with sectionHeader to see contents)` }]
      };
    }
    
    // Extract section
    const lines = content.split('\n');
    let inSection = false;
    let sectionContent = [];
    
    for (const line of lines) {
      if (line.startsWith('##')) {
        if (inSection) break;
        if (line.toLowerCase().includes(sectionHeader.toLowerCase())) inSection = true;
      } else if (inSection) {
        sectionContent.push(line);
      }
    }
    
    return {
      content: [{ type: "text", text: sectionContent.length ? sectionContent.join('\n').trim() : `Section '${sectionHeader}' not found or empty.` }]
    };
  }

  if (request.params.name === "write_note") {
     const { sectionHeader, content: newContent } = request.params.arguments as { sectionHeader: string, content: string };
     
     // Naive append for now. A robust version would update the section in-place.
     fs.appendFileSync(NOTES_PATH, `\n\n## ${sectionHeader}\n${newContent}\n`);
     
     return {
       content: [{ type: "text", text: `Successfully wrote to NOTES under ${sectionHeader}.` }]
     };
  }

  throw new Error(`Tool not found: ${request.params.name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);

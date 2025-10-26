// lib/mcp.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

export async function getMCPContext(url: string): Promise<string> {
  const client = new Client({
    name: "chatbot-mcp-client",
    version: "1.0.0",
  });

  try {
    const transport = new SSEClientTransport(new URL(url));
    await client.connect(transport);

    // Listar recursos disponibles
    const { resources } = await client.listResources();

    if (!resources || resources.length === 0) {
      return "";
    }

    // Leer todos los recursos
    const contents: string[] = [];
    for (const resource of resources) {
      try {
        const { contents: resourceContents } = await client.readResource({
          uri: resource.uri,
        });

        for (const content of resourceContents) {
          if (content.text) {
            contents.push(`### ${resource.name || resource.uri}\n${content.text}`);
          }
        }
      } catch (err) {
        console.error(`Error leyendo recurso ${resource.uri}:`, err);
      }
    }

    await client.close();

    if (contents.length === 0) {
      return "";
    }

    return `\n[CONTEXTO MCP]\n${contents.join("\n\n")}\n[/CONTEXTO MCP]\n`;
  } catch (error) {
    console.error("Error en MCP:", error);
    await client.close();
    throw error;
  }
}
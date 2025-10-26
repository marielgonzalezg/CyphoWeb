// lib/claude-client.ts

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MCPTool {
  name: string;
  description: string;
  input_schema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

interface ToolCall {
  name: string;
  input: Record<string, any>;
}

export class ClaudeWithMCP {
  private apiKey: string;
  private mcpServerUrl: string;
  private availableTools: MCPTool[] = [];

  constructor(apiKey: string, mcpServerUrl: string) {
    this.apiKey = apiKey;
    this.mcpServerUrl = mcpServerUrl;
  }

  // Inicializa y obtiene las herramientas disponibles del servidor MCP
  async initialize() {
    try {
      const response = await fetch(`${this.mcpServerUrl}/tools`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('No se pudieron obtener herramientas MCP');
        return;
      }

      const data = await response.json();
      this.availableTools = data.tools || [];
      console.log(`✅ MCP inicializado con ${this.availableTools.length} herramientas`);
    } catch (error) {
      console.error('Error inicializando MCP:', error);
    }
  }

  // Llama al servidor MCP para ejecutar una herramienta
  private async callMCPTool(toolName: string, input: Record<string, any>) {
    try {
      const response = await fetch(`${this.mcpServerUrl}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: toolName,
          arguments: input,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ejecutando herramienta: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error llamando a MCP tool ${toolName}:`, error);
      throw error;
    }
  }

  // Envía un mensaje a Claude con capacidad de usar herramientas MCP
  async chat(messages: Message[]): Promise<string> {
    let conversationMessages = [...messages];
    let maxIterations = 5; // Prevenir loops infinitos
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;

      // Preparar el request para Claude
      const requestBody: any = {
        model: 'anthropic/claude-sonnet-4.5',
        messages: conversationMessages,
        max_tokens: 4096,
      };

      // Si hay herramientas disponibles, incluirlas
      if (this.availableTools.length > 0) {
        requestBody.tools = this.availableTools.map(tool => ({
          name: tool.name,
          description: tool.description,
          input_schema: tool.input_schema,
        }));
      }

      // Llamar a Claude
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || '',
          'X-Title': 'MCP Chatbot',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Error de Claude API: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message;

      // Verificar si Claude quiere usar una herramienta
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        console.log('🔧 Claude solicita usar herramientas...');

        // Agregar el mensaje del asistente a la conversación
        conversationMessages.push({
          role: 'assistant',
          content: assistantMessage.content || '',
        });

        // Ejecutar cada herramienta solicitada
        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function.name;
          const toolInput = JSON.parse(toolCall.function.arguments);

          console.log(`📞 Llamando a herramienta: ${toolName}`);

          try {
            const toolResult = await this.callMCPTool(toolName, toolInput);

            // Agregar el resultado de la herramienta a la conversación
            conversationMessages.push({
              role: 'user',
              content: JSON.stringify({
                tool_call_id: toolCall.id,
                result: toolResult,
              }),
            });
          } catch (error) {
            conversationMessages.push({
              role: 'user',
              content: JSON.stringify({
                tool_call_id: toolCall.id,
                error: `Error ejecutando ${toolName}: ${error}`,
              }),
            });
          }
        }

        // Continuar el loop para que Claude procese los resultados
        continue;
      }

      // Si no hay más tool calls, retornar la respuesta final
      return assistantMessage.content;
    }

    throw new Error('Se alcanzó el límite de iteraciones');
  }
}
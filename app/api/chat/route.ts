// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ClaudeWithMCP } from '../../lib/claude-client';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Se requiere un array de mensajes' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const mcpUrl = process.env.MCP_SERVER_URL;

    if (!apiKey || !mcpUrl) {
      return NextResponse.json(
        { error: 'Configuración incompleta del servidor' },
        { status: 500 }
      );
    }

    // Crear cliente de Claude con MCP
    const claude = new ClaudeWithMCP(apiKey, mcpUrl);
    await claude.initialize();

    // Obtener respuesta
    const response = await claude.chat(messages);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error en chat:', error);
    return NextResponse.json(
      { error: 'Error procesando el mensaje' },
      { status: 500 }
    );
  }
}


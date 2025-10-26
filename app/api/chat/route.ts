// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

const MCP_CHAT_URL = 'https://mcpclient-uafb.onrender.com/chat';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt =
      typeof body?.prompt === 'string' ? body.prompt.trim() : '';
    const userId = '1';

    if (!prompt) {
      return NextResponse.json(
        { error: 'Favor de escribir un mensaje.' },
        { status: 400 }
      );
    }

    const upstreamResponse = await fetch(
      `${MCP_CHAT_URL}?user_id=${encodeURIComponent(userId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
        cache: 'no-store',
      }
    );

    const rawText = await upstreamResponse.text();

    if (!upstreamResponse.ok) {
      let errorMessage = rawText.trim();
      try {
        const parsedError = JSON.parse(rawText);
        if (
          parsedError &&
          typeof parsedError === 'object' &&
          typeof parsedError.error === 'string'
        ) {
          errorMessage = parsedError.error;
        }
      } catch {
        // noop - keep original text
      }

      return NextResponse.json(
        {
          error:
            errorMessage ||
            'Error recibido del servicio de conversación externo.',
        },
        { status: upstreamResponse.status || 502 }
      );
    }

    let assistantReply = rawText.trim();

    try {
      const parsedResponse = JSON.parse(rawText);
      if (
        parsedResponse &&
        typeof parsedResponse === 'object' &&
        typeof parsedResponse.response === 'string'
      ) {
        assistantReply = parsedResponse.response;
      } else if (
        parsedResponse &&
        typeof parsedResponse === 'object' &&
        typeof parsedResponse.message === 'string'
      ) {
        assistantReply = parsedResponse.message;
      } else if (
        parsedResponse &&
        typeof parsedResponse === 'object' &&
        typeof parsedResponse.reply === 'string'
      ) {
        assistantReply = parsedResponse.reply;
      }
    } catch {
      // noop - keep raw text
    }

    return NextResponse.json({ response: assistantReply });
  } catch (error) {
    console.error('Error en chat:', error);
    return NextResponse.json(
      { error: 'Error procesando el mensaje' },
      { status: 500 }
    );
  }
}

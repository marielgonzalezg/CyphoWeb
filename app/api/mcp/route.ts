// app/api/test-config/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const config = {
    hasNvidiaKey: !!process.env.NVIDIA_API_KEY,
    nvidiaKeyPreview: process.env.NVIDIA_API_KEY
      ? `${process.env.NVIDIA_API_KEY.substring(0, 10)}...`
      : "NO CONFIGURADA",
    baseURL: process.env.OPENAI_BASE_URL || "default",
    model: process.env.LLM_MODEL || "default",
    hasMCPUrl: !!process.env.MCP_URL,
    mcpUrl: process.env.MCP_URL || "NO CONFIGURADA",
  };

  return NextResponse.json(config);
}
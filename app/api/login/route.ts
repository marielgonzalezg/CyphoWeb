import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UsersRepo } from "@/app/lib/users";
import { signSession, setSessionCookie } from "@/app/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email y password requeridos" }, { status: 400 });
  }

  const user = await UsersRepo.findByEmail(email);
  if (!user) return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });

  const token = await signSession({ sub: user.id, email: user.email }, 60 * 60); // 1h
  await setSessionCookie(token, 60 * 60);

  return NextResponse.json({ ok: true });
}



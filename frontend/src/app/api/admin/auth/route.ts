import { NextRequest, NextResponse } from "next/server";
import { login, logout } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const user = await login(email, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function DELETE() {
  await logout();
  return NextResponse.json({ ok: true });
}

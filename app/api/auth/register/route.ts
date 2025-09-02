import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { query } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"; // fallback for dev

function generateUUID(): string {
  // RFC 4122 version 4 compliant UUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await query<{ id: string }>(
      `SELECT id FROM "user" WHERE email = $1 LIMIT 1`,
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "User Already Exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const uuid = generateUUID();

    // Insert user
    await query(
      `INSERT INTO "user" (id, email, firstname, lastname, password)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuid, email, firstName, lastName, hashedPassword]
    );

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: uuid, email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      { userId: uuid, email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        accessToken,
        refreshToken,
        user: { id: uuid, firstName, lastName, email },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Internal server error", detail: err.message },
      { status: 500 }
    );
  }
}

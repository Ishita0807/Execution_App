import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  console.log(authHeader);
    
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Fetch user info (excluding password)
    const rows = await query<{
      id: string;
      email: string;
      firstname: string | null;
      lastname: string | null;
    }>(
      `
      SELECT id, email, firstname, lastname
      FROM "user"
      WHERE id = $1
      LIMIT 1
      `,
      [decoded.userId]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = rows[0];

    console.log(user);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstname,
      lastName: user.lastname,
    });
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

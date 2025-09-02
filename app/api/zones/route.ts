import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import jwt from 'jsonwebtoken';

async function getUserFromRequest(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return null;

    const token = authHeader.replace("Bearer ", "");
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const rows = await query<{
      id: string;
      email: string;
      password: string;
    }>(
      `
      SELECT id, email, password
      FROM "user"
      WHERE id = $1
      LIMIT 1
      `,
      [decoded.userId]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const user = rows[0];
    console.log(user)
    return user;
  } catch {
    return null;
  }
}
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } 

    const rows = await query<any>(
      `SELECT id, name, min_c, max_c, humidity_min, humidity_max FROM zones ORDER BY id`
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching zones:", err);
    return NextResponse.json(
      { error: "Failed to fetch zones", detail: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } 

    const body = await req.json();
    const { name, min_c, max_c, humidity_min, humidity_max } = body;

    if (!name || min_c === undefined || max_c === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const row = await query<any>(
      `INSERT INTO zones (name, min_c, max_c, humidity_min, humidity_max)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, min_c, max_c, humidity_min, humidity_max`,
      [name, min_c, max_c, humidity_min, humidity_max]
    );

    return NextResponse.json(row[0], { status: 201 });
  } catch (err: any) {
    console.error("Error creating zone:", err);
    return NextResponse.json(
      { error: "Failed to create zone", detail: err.message },
      { status: 500 }
    );
  }
}

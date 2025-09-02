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
    return user;
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ zoneName: string }> }
) {
    const { zoneName } = await context.params;
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } 

    const rows = await query<any>(
      `SELECT id, sensor_id, zone_name, installed_at
       FROM sensors WHERE zone_name = $1 ORDER BY id`,
      [zoneName]
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching sensors by zone:", err);
    return NextResponse.json(
      { error: "Failed to fetch sensors for zone", detail: err.message },
      { status: 500 }
    );
  }
}

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

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } 

    const rows = await query<any>(
      `SELECT id, sensor_id, zone_name, installed_at, status, sensor_profile 
       FROM sensors ORDER BY id`
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching sensors:", err);
    return NextResponse.json(
      { error: "Failed to fetch sensors", detail: err.message },
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
    const { sensor_id, zone_name, status } = body;

    if (!sensor_id || !zone_name) {
      return NextResponse.json(
        { error: "Missing sensor_id or zone_name" },
        { status: 400 }
      );
    }

    const row = await query<any>(
      `INSERT INTO sensors (sensor_id, zone_name, status)
       VALUES ($1, $2, $3)
       RETURNING id, sensor_id, zone_name, installed_at`,
      [sensor_id, zone_name, status]
    );

    return NextResponse.json(row[0], { status: 201 });
  } catch (err: any) {
    console.error("Error creating sensor:", err);
    return NextResponse.json(
      { error: "Failed to create sensor", detail: err.message },
      { status: 500 }
    );
  }
}

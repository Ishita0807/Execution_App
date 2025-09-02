import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import jwt from 'jsonwebtoken'

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
  context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } 

    const rows = await query<any>(
      `SELECT id, sensor_id, zone_name, installed_at
       FROM sensors WHERE id = $1`,
      [id]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Sensor not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (err: any) {
    console.error("Error fetching sensor:", err);
    return NextResponse.json(
      { error: "Failed to fetch sensor", detail: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { sensor_id, zone_name } = body;
    const { id } = await context.params;
    const row = await query<any>(
      `UPDATE sensors
       SET sensor_id = $1, zone_name = $2
       WHERE id = $3
       RETURNING id, sensor_id, zone_name, installed_at`,
      [sensor_id, zone_name, id]
    );

    if (!row.length) {
      return NextResponse.json({ error: "Sensor not found" }, { status: 404 });
    }

    return NextResponse.json(row[0], { status: 200 });
  } catch (err: any) {
    console.error("Error updating sensor:", err);
    return NextResponse.json(
      { error: "Failed to update sensor", detail: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
  try {
    const row = await query<any>(
      `DELETE FROM sensors WHERE id = $1 RETURNING id`,
      [id]
    );

    if (!row.length) {
      return NextResponse.json({ error: "Sensor not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: row[0].id }, { status: 200 });
  } catch (err: any) {
    console.error("Error deleting sensor:", err);
    return NextResponse.json(
      { error: "Failed to delete sensor", detail: err.message },
      { status: 500 }
    );
  }
}

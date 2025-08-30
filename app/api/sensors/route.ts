import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
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

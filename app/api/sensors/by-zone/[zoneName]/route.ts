import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  req: Request,
  context: { params: Promise<{ zoneName: string }> }
) {
    const { zoneName } = await context.params;
  try {
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

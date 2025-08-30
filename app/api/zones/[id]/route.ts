import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const rows = await query<any>(
      `SELECT id, name, min_c, max_c, humidity_min, humidity_max 
       FROM zones WHERE id = $1`,
      [id]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (err: any) {
    console.error("Error fetching zone:", err);
    return NextResponse.json(
      { error: "Failed to fetch zone", detail: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const { name, min_c, max_c, humidity_min, humidity_max } = body;

    const row = await query<any>(
      `UPDATE zones
       SET name = $1, min_c = $2, max_c = $3, humidity_min = $4, humidity_max = $5
       WHERE id = $6
       RETURNING id, name, min_c, max_c, humidity_min, humidity_max`,
      [name, min_c, max_c, humidity_min, humidity_max, id]
    );

    if (!row.length) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 });
    }

    return NextResponse.json(row[0], { status: 200 });
  } catch (err: any) {
    console.error("Error updating zone:", err);
    return NextResponse.json(
      { error: "Failed to update zone", detail: err.message },
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
      `DELETE FROM zones WHERE id = $1 RETURNING id`,
      [id]
    );

    if (!row.length) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: row[0].id }, { status: 200 });
  } catch (err: any) {
    console.error("Error deleting zone:", err);
    return NextResponse.json(
      { error: "Failed to delete zone", detail: err.message },
      { status: 500 }
    );
  }
}

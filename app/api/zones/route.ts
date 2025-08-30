import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
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

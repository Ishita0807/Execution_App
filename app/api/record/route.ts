import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  ZoneTempHumDataRequest,
  ZoneTempHumDataResponse,
  SensorProfileEnum,
} from "@/types/models";
import { evaluateStatus, computeProfile } from "@/lib/utilities";
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
// ---------- POST /api/record ----------
export async function POST(req: NextRequest) {
  try {
    const body: ZoneTempHumDataRequest = await req.json();
    const { timestamp, zone, sensor_id, temperature_c, humidity_pct } = body;

    // 1. Check if zone exists
    const zoneRes = await query<{
      min_c: number;
      max_c: number;
      humidity_min: number;
      humidity_max: number;
    }>(
      `SELECT min_c, max_c, humidity_min, humidity_max 
       FROM zones WHERE name = $1`,
      [zone]
    );

    if (!zoneRes.length) {
      return NextResponse.json(
        { error: `Zone '${zone}' not found` },
        { status: 404 }
      );
    }

    const { min_c, max_c, humidity_min, humidity_max } = zoneRes[0];

    // 2. Ensure sensor exists (lazy upsert)
    await query(
      `INSERT INTO sensors (sensor_id, zone_name)
       VALUES ($1, $2)
       ON CONFLICT (sensor_id) DO NOTHING`,
      [sensor_id, zone]
    );

    // 3. Evaluate status
    const status = evaluateStatus(
      min_c,
      max_c,
      humidity_min,
      humidity_max,
      temperature_c ?? null,
      humidity_pct
    );

    // 4. Insert reading with placeholder profile
    await query(
      `INSERT INTO readings
       (ts, zone_name, sensor_id, temperature_c, humidity_pct, status, sensor_profile)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        timestamp,
        zone,
        sensor_id,
        temperature_c ?? null,
        humidity_pct,
        status,
        SensorProfileEnum.GOOD, // placeholder
      ]
    );

    // 5. Compute profile based on recent history
    const profile = await computeProfile(sensor_id);

    // Update the just-inserted row’s profile
    await query(
      `UPDATE readings
       SET sensor_profile = $1
       WHERE sensor_id = $2 AND ts = $3`,
      [profile, sensor_id, timestamp]
    );

    // 6. Respond
    const response: ZoneTempHumDataResponse = {
      timestamp,
      zone,
      sensor_id,
      status,
      sensor_profile: profile,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err: any) {
    console.error("Error in /api/readings:", err);
    return NextResponse.json(
      { error: "Internal server error", detail: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } 
    const { searchParams } = new URL(req.url);
    const zone = searchParams.get("zone"); // optional
    const limit = parseInt(searchParams.get("limit") || "1", 10);
    const order = (searchParams.get("order") || "desc").toUpperCase();

    if (!["ASC", "DESC"].includes(order)) {
      return NextResponse.json(
        { error: "Invalid 'order' parameter. Must be 'asc' or 'desc'." },
        { status: 400 }
      );
    }

    // Build WHERE clause dynamically
    const whereClause = zone ? `WHERE zone_name = $1` : ``;
    const params: (string | number)[] = zone ? [zone, limit] : [limit];

    const rows = await query<{
      ts: string;
      zone_name: string;
      status: string;
      avg_temp: number | null;
      avg_hum: number | null;
    }>(
      `
      SELECT ts::timestamptz,
             zone_name,
             status,
             ROUND(AVG(temperature_c)::numeric, 2) AS avg_temp,
             ROUND(AVG(humidity_pct)::numeric, 2) AS avg_hum
      FROM readings
      ${whereClause}
      GROUP BY ts, zone_name, status
      ORDER BY ts ${order}
      LIMIT $${params.length}
      `,
      params
    );

    if (!rows.length) {
      return NextResponse.json(
        { error: zone ? `No readings found for zone '${zone}'` : "No readings found" },
        { status: 404 }
      );
    }

    const response = rows.map((r) => ({
      timestamp: r.ts,
      zone: r.zone_name,
      status: r.status,
      avg_temperature_c: r.avg_temp,
      avg_humidity_pct: r.avg_hum,
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching readings:", err);
    return NextResponse.json(
      { error: "Internal server error", detail: err.message },
      { status: 500 }
    );
  }
}
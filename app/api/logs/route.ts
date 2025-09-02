import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { toLogFormat } from "@/lib/utilities"; // <-- use your helper
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
      [decoded.userId.userId.userId.userId]
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

    const { searchParams } = new URL(req.url);

    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const zone = searchParams.get("zone");
    const download = searchParams.get("download") === "true";

    // Default: today 00:00 to now
    const now = new Date();
    const startDt = start ? new Date(start) : new Date(now.setHours(0, 0, 0, 0));
    const endDt = end ? new Date(end) : new Date();

    // Query readings + zone thresholds
    let sql = `
      SELECT r.ts, r.zone_name, r.temperature_c, r.humidity_pct, r.status
      FROM readings r
      WHERE r.ts BETWEEN $1 AND $2
    `;
    const params: any[] = [startDt.toISOString(), endDt.toISOString()];

    if (zone) {
      sql += " AND r.zone_name = $3";
      params.push(zone);
    }

    sql += " ORDER BY r.ts ASC";

    const rows = await query<any>(sql, params);

    if (!rows.length) {
      return NextResponse.json(["No records in range."], { status: 200 });
    }

    // Use your helper for formatting
    const lines = rows.map((row) =>
      toLogFormat(
        new Date(row.ts),
        row.zone_name,
        row.status,
        row.temperature_c,
        row.humidity_pct
      )
    );

    if (download) {
      const filename = `logs_${startDt.toISOString().replace(/[:.]/g, "-")}_${endDt
        .toISOString()
        .replace(/[:.]/g, "-")}.log`;

      return new NextResponse(lines.join("\n") + "\n", {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json(lines, { status: 200 });
  } catch (err: any) {
    console.error("Error in /api/logs:", err);
    return NextResponse.json(
      { error: "Internal server error", detail: err.message },
      { status: 500 }
    );
  }
}

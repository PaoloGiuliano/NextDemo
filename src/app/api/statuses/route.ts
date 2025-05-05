import pool from "@/app/lib/db";
import { NextResponse, NextRequest } from "next/server";

type Status = {
  id: string;
  name: string;
  updated_at: string;
  project_id: string;
  color: string;
  count: number;
}[];

export async function GET(
  req: NextRequest,
): Promise<NextResponse<Status | { error: string }>> {
  const secret = req.headers.get("x-internal-secret");
  const project_id = req.nextUrl.searchParams.get("project_id");
  const floorplan_id = req.nextUrl.searchParams.get("floorplan_id");
  if (secret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!project_id) {
    return NextResponse.json({ error: "Missing project_id" }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      // "SELECT * FROM statuses WHERE project_id = $1",
      `SELECT s.*, COUNT(t.id) AS count FROM statuses s LEFT JOIN tasks t ON s.id = t.status_id ${floorplan_id ? "AND t.floorplan_id = '" + floorplan_id + "'" : ""} WHERE s.project_id = $1 GROUP BY s.id ORDER BY count DESC`,
      [project_id],
    );

    const data = result.rows as Status;
    client.release();
    return NextResponse.json(data);
  } catch (err) {
    console.error((err as Error).stack);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

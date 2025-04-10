import pool from "@/app/lib/db";
import { NextResponse } from "next/server";

type Tasks = {
  id: string;
  name: string;
  updated_at: string;
  project_id: string;
  status_id: string;
  floorplan_id: string;
  pos_x: number;
  pos_y: number;
}[];
export async function GET(): Promise<NextResponse<Tasks | { error: string }>> {
  console.time("Getting tasks from database");
  const p_id = "d91647fe-0532-4019-9aab-6fd532439b95";
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT t.id, t.name, s.name AS status, s.color, t.project_id, TO_CHAR(t.updated_at AT TIME ZONE 'America/Toronto', 'Mon DD, YYYY HH12:MI:SS AM TZ') AS last_modified FROM tasks t INNER JOIN statuses s ON t.status_id = s.id WHERE t.project_id = $1 ORDER BY t.updated_at DESC LIMIT 10 OFFSET 0",
      [p_id]
    );
    const data = result.rows as Tasks;

    client.release();
    console.timeEnd("Getting tasks from database");
    return NextResponse.json(data);
  } catch (err) {
    console.error((err as Error).stack);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
    console.timeEnd("Gettings tasks from database");
  }
}

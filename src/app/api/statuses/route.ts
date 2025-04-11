import pool from "@/app/lib/db";
import { NextResponse, NextRequest } from "next/server";

type Status = {
  id: string;
  name: string;
  updated_at: string;
  project_id: string;
  color: string;
}[];

export async function GET(
  req: NextRequest
): Promise<NextResponse<Status | { error: string }>> {
  console.time("Getting Statuses from database");
  const secret = req.headers.get("x-internal-secret");
  const project_id = req.nextUrl.searchParams.get("project_id");
  if (secret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!project_id) {
    return NextResponse.json({ error: "Missing project_id" }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM statuses WHERE project_id = $1",
      [project_id]
    );
    const data = result.rows as Status;

    client.release();
    console.timeEnd("Getting Statuses from database");
    return NextResponse.json(data);
  } catch (err) {
    console.error((err as Error).stack);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

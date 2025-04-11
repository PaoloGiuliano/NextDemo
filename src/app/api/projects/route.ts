import pool from "@/app/lib/db";
import { NextResponse, NextRequest } from "next/server";

type Project = {
  id: string;
  name: string;
  updated_at: string;
}[];
export async function GET(
  req: NextRequest
): Promise<NextResponse<Project | { error: string }>> {
  const secret = req.headers.get("x-internal-secret");
  if (secret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM projects");
    const data = result.rows as Project;

    client.release();
    return NextResponse.json(data);
  } catch (err) {
    console.error((err as Error).stack);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

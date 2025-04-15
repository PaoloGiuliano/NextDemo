import pool from "@/app/lib/db";
import { NextResponse, NextRequest } from "next/server";

type Floorplan = {
  id: string;
  name: string;

  project_id: string;
  sheets: Sheet[];
};

type Sheet = {
  id: string;
  name: string;
  updated_at: string;
  project_id: string;
  floorplan_id: string;
  file_name: string;
  file_url: string;
  thumb_url: string;
  original_url: string;
  original_height: number;
  original_width: number;
  file_height: number;
  file_width: number;
};

export async function GET(
  req: NextRequest,
): Promise<NextResponse<Floorplan[] | { error: string }>> {
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

    // Get floorplans
    const floorplansResult = await client.query(
      "SELECT * FROM floorplans WHERE project_id = $1",
      [project_id],
    );
    const floorplans = floorplansResult.rows as Floorplan[];

    // Get all sheets for the project
    const sheetsResult = await client.query(
      "SELECT * FROM sheets WHERE project_id = $1",
      [project_id],
    );
    const sheets = sheetsResult.rows as Sheet[];

    // Map sheets to their corresponding floorplan
    const enrichedFloorplans = floorplans.map((floorplan) => {
      const relatedSheets = sheets.filter(
        (sheet) => sheet.floorplan_id === floorplan.id,
      );
      return { ...floorplan, sheets: relatedSheets };
    });

    client.release();
    return NextResponse.json(enrichedFloorplans);
  } catch (err) {
    console.error((err as Error).stack);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

import pool from "@/app/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { parse } from "path";

type Task = {
  id: string;
  name: string;
  updated_at: string;
  project_id: string;
  status_id: string;
  floorplan_id: string;
  pos_x: number;
  pos_y: number;
  bubbles: Bubble[];
};
type Bubble = {
  id: string;
  updated_at: string;
  kind: number;
  task_id: string;
  project_id: string;
  file_size: number;
  file_url: string;
  thumb_url: string;
  original_url: string;
  flattened_file_url: string;
};
export async function GET(
  req: NextRequest
): Promise<NextResponse<Task[] | { error: string }>> {
  const secret = req.headers.get("x-internal-secret");
  const project_id = req.nextUrl.searchParams.get("project_id");
  const page = parseInt(req.nextUrl.searchParams.get("page") || "0", 10);
  const pageCount = parseInt(
    req.nextUrl.searchParams.get("page_count") || "10",
    10
  );
  console.log(page);

  if (secret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!project_id)
    return NextResponse.json({ error: "Missing project_id" }, { status: 400 });
  try {
    const client = await pool.connect();
    // Get tasks
    const tasksResults = await client.query(
      "SELECT id, name, status_id, project_id, floorplan_id, TO_CHAR(updated_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH24:MI:SS AM'), pos_x, pos_y FROM tasks WHERE project_id = $1 ORDER BY updated_at DESC LIMIT $2 OFFSET $3",
      [project_id, pageCount, page * pageCount]
    );
    const tasks = tasksResults.rows as Task[];

    const bubblesResults = await client.query(
      "SELECT * FROM bubbles WHERE project_id = $1 AND task_id = ANY($2) ORDER BY original_created_at DESC",
      [project_id, tasks.map((task) => task.id)]
    );
    const bubbles = bubblesResults.rows as Bubble[];

    const enrichedTasks = tasks.map((task) => {
      const relatedBubbles = bubbles.filter(
        (bubble) => bubble.task_id === task.id
      );
      return { ...task, bubbles: relatedBubbles };
    });
    client.release();
    return NextResponse.json(enrichedTasks);
  } catch (err) {
    console.error((err as Error).stack);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

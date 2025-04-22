import pool from "@/app/lib/db";
import { NextResponse, NextRequest } from "next/server";

type Task = {
  id: string;
  name: string;
  modified_at: string;
  latest_component_device_updated_at: string;
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
  created_at: string;
  formatted_created_at: string;
  content: string;
  kind: number;
  task_id: string;
  project_id: string;
  file_size: number;
  file_url: string;
  thumb_url: string;
  original_url: string;
  flattened_file_url: string;
};
type Count = {
  count: string;
};
export async function GET(
  req: NextRequest,
): Promise<NextResponse<Task[] | { error: string }>> {
  const secret = req.headers.get("x-internal-secret");
  const project_id = req.nextUrl.searchParams.get("project_id");
  const status_id = req.nextUrl.searchParams.get("status_id");
  const floorplan_id = req.nextUrl.searchParams.get("floorplan_id");
  const page = parseInt(req.nextUrl.searchParams.get("page") || "0", 10);
  const pageCount = parseInt(
    req.nextUrl.searchParams.get("page_count") || "10",
    10,
  );

  if (secret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!project_id)
    return NextResponse.json({ error: "Missing project_id" }, { status: 400 });

  const client = await pool.connect();
  try {
    let query = `SELECT id, name, status_id, project_id, floorplan_id, TO_CHAR(latest_component_device_updated_at AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH12:MI:SS AM') AS modified_at, pos_x, pos_y 
       FROM tasks 
       WHERE project_id = $1`;
    let taskCountQuery = `SELECT count(id) FROM tasks WHERE project_id = $1`;

    const params: any[] = [project_id];
    const countParams: any[] = [project_id];
    let countParamIndex = 2;
    let paramIndex = 2;

    if (status_id) {
      query += ` AND status_id = $${paramIndex++}`;
      taskCountQuery += ` AND status_id = $${countParamIndex++}`;
      params.push(status_id);
      countParams.push(floorplan_id);
    }
    if (floorplan_id) {
      query += ` AND floorplan_id = $${paramIndex++}`;
      taskCountQuery += ` AND floorplan_id = $${countParamIndex++}`;
      params.push(floorplan_id);
      countParams.push(floorplan_id);
    }

    query += ` ORDER BY latest_component_device_updated_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(pageCount, page * pageCount);

    const tasksResults = await client.query(query, params);
    const taskCountResults = await client.query(taskCountQuery, countParams);
    const taskCount = taskCountResults.rows as Count[];
    const tasks = tasksResults.rows as Task[];

    const bubblesResults = await client.query(
      "SELECT *, TO_CHAR(created_at AT TIME ZONE 'America/Toronto', 'YYYY/MM/DD HH12:MI AM') AS formatted_created_at FROM bubbles WHERE project_id = $1 AND task_id = ANY($2) ORDER BY created_at ASC",
      [project_id, tasks.map((task) => task.id)],
    );
    const bubbles = bubblesResults.rows as Bubble[];

    const enrichedTasks = tasks.map((task) => {
      const relatedBubbles = bubbles.filter(
        (bubble) => bubble.task_id === task.id,
      );
      return { ...task, bubbles: relatedBubbles };
    });

    return NextResponse.json(enrichedTasks, {
      status: 200,
      headers: {
        "x-task-count": `${taskCount[0].count}`,
      },
    });
  } catch (err) {
    console.error((err as Error).stack);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    client.release(); // ✅ this always runs
  }
}

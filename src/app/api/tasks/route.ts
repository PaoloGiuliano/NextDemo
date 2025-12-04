import pool from "@/app/lib/db";
import { NextResponse, NextRequest } from "next/server";

type Task = {
  id: string;
  name: string;
  sequence_number: number;
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
  const sortDirection = req.nextUrl.searchParams.get("sort_directions");
  const search = req.nextUrl.searchParams.get("search");

  if (secret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!project_id)
    return NextResponse.json({ error: "Missing project_id" }, { status: 400 });

  const client = await pool.connect();
  try {
    let query = `SELECT 
    tasks.*, 
    TO_CHAR(bubble_updates.latest_bubble_update AT TIME ZONE 'America/Toronto', 'YYYY-MM-DD HH12:MI:SS AM') AS modified_at
FROM tasks
JOIN (
    SELECT task_id, MAX(updated_at) AS latest_bubble_update
    FROM bubbles
    GROUP BY task_id
) AS bubble_updates ON tasks.id = bubble_updates.task_id
INNER JOIN statuses s ON s.id = tasks.status_id
INNER JOIN floorplans f ON f.id = tasks.floorplan_id
WHERE tasks.project_id = $1
AND (
    tasks.name ILIKE $2 
    OR f.name ILIKE $2
    OR s.name ILIKE $2
    OR f.description ILIKE $2
)`;
    let taskCountQuery = `SELECT count(t.id) 
                          FROM tasks t
                          INNER JOIN statuses s ON s.id = t.status_id
                          INNER JOIN floorplans f ON f.id = t.floorplan_id                         
                          WHERE t.project_id = $1
                          AND (
                              t.name ILIKE $2 
                              OR f.name ILIKE $2
                              OR s.name ILIKE $2
                              OR f.description ILIKE $2
                          )
                          `;

    const params: any[] = [project_id, `%${search}%`];
    const countParams: any[] = [project_id, `%${search}%`];
    let countParamIndex = 3;
    let paramIndex = 3;

    if (status_id) {
      query += ` AND status_id = $${paramIndex++}`;
      taskCountQuery += ` AND status_id = $${countParamIndex++}`;
      params.push(status_id);
      countParams.push(status_id);
    }
    if (floorplan_id) {
      query += ` AND floorplan_id = $${paramIndex++}`;
      taskCountQuery += ` AND floorplan_id = $${countParamIndex++}`;
      params.push(floorplan_id);
      countParams.push(floorplan_id);
    }

    query += ` ORDER BY bubble_updates.latest_bubble_update ${sortDirection} LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(pageCount, page * pageCount);
    const tasksResults = await client.query(query, params);
    const taskCountResults = await client.query(taskCountQuery, countParams);
    const taskCount = taskCountResults.rows;
    const tasks = tasksResults.rows as Task[];

    const bubblesResults = await client.query(
      "SELECT *, TO_CHAR(created_at AT TIME ZONE 'America/Toronto', 'YY/MM/DD FMHH12:MI am') AS formatted_created_at FROM bubbles WHERE project_id = $1 AND task_id = ANY($2) ORDER BY created_at ASC",
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

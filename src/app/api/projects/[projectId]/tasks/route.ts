import { register } from "module";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  nrequest: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params; // ✅ Await params
  const { searchParams } = new URL(nrequest.url);
  const access_token = searchParams.get("access_token");
  const floorplanId = searchParams.get("floorplanId");
  const statusId = searchParams.get("statusId");
  const x_last_synced_at = searchParams.get("last_synced_at");
  let filters = "";

  const filterHandler = () => {
    const filters = [];
    if (floorplanId != "") {
      filters.push(`filters[floorplan_id_eq]=${floorplanId}`);
    }
    if (statusId != "") {
      filters.push(`filters[status_id_eq]=${statusId}`);
    }
    if (x_last_synced_at != "") {
      filters.push(`last_synced_at=${x_last_synced_at}`);
    }
    const filterQuery = filters.length > 0 ? `?${filters.join("&")}` : "";
    return filterQuery;
  };

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  try {
    const bearerToken = access_token;
    filters = filterHandler();
    const response = await fetch(
      `https://client-api.us.fieldwire.com/api/v3/projects/${projectId}/tasks${filters}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
          "Fieldwire-Version": "2023-01-25",
          "Fieldwire-Filter": "active",
          "Fieldwire-Per-Page": "5",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch tasks: ${response.status} ${response.statusText}`
      );
    }
    const apiData = await response.json();
    const xLastSync = response.headers.get("X-Last-Synced-At") || "";
    const xHasMore = response.headers.get("X-Has-More") || "";
    return NextResponse.json(
      {
        data: apiData,
      },
      {
        status: 200,
        headers: {
          "last-synced": xLastSync,
          "has-more": xHasMore,
        },
      }
    );
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

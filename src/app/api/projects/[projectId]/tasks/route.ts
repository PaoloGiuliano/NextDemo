import { NextRequest, NextResponse } from "next/server";
import { getBearerToken } from "@/app/lib/auth";

export async function GET(
  nrequest: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params; // ✅ Await params
  const { searchParams } = new URL(nrequest.url);
  const floorplanId = searchParams.get("floorplanId");
  const statusId = searchParams.get("statusId");
  let filters = "";

  const filterHandler = () => {
    let filters = [];
    if (floorplanId != "not_selected") {
      filters.push(`filters[floorplan_id_eq]=${floorplanId}`);
    }
    if (statusId != "not_selected") {
      filters.push(`filters[status_id_eq]=${statusId}`);
    }
    const filterQuery = filters.length > 0 ? `?${filters.join("&")}` : "";
    return filterQuery;
  };

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  try {
    const API_TOKEN = process.env.API_TOKEN as string;
    const bearerToken = await getBearerToken(API_TOKEN);
    filters = filterHandler();
    console.log(filterHandler());
    const response = await fetch(
      `https://client-api.us.fieldwire.com/api/v3/projects/${projectId}/tasks${filters}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
          "Fieldwire-Version": "2023-01-25",
          "Fieldwire-Filter": "active",
          "Fieldwire-Per-Page": "100",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch tasks: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

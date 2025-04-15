"use client";

import CustomDropdown from "@/components/CustomDropdown";
import { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
}

interface Floorplan {
  id: string;
  name: string;
  description: string;
  updated_at: string;
  project_id: string;
  sheets: Sheet[];
}
interface Sheet {
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
}
interface Status {
  id: string;
  name: string;
  color: string;
}
interface Task {
  id: string;
  name: string;
  modified_at: string;
  project_id: string;
  status_id: string;
  floorplan_id: string;
  pos_x: number;
  pos_y: number;
  bubbles: Bubble[];
}
interface Bubble {
  id: string;
  updated_at: string;
  content: string;
  kind: number;
  task_id: string;
  project_id: string;
  file_size: number;
  file_url: string;
  thumb_url: string;
  original_url: string;
  flattened_file_url: string;
}

export default function Tasks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [floorplans, setFloorplans] = useState<Floorplan[]>([]);
  const [selectedFloorplan, setSelectedFloorplan] = useState<Floorplan | null>(
    null,
  );
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [page, setPage] = useState<number>(0);
  const pageCount = [10, 20, 30, 40, 50];
  const [selectedPageCount, setSelectedPageCount] = useState<number | null>(10);
  const [loading, setLoading] = useState(true);
  const fetchProjects = async () => {
    try {
      const url = `/api/projects`;
      const headers: Record<string, string> = {};
      if (process.env.NEXT_PUBLIC_INTERNAL_SECRET) {
        headers["x-internal-secret"] = process.env.NEXT_PUBLIC_INTERNAL_SECRET;
      }
      const response = await fetch(url, { method: "GET", headers });
      if (!response.ok) throw new Error("Failed to fetch projects");

      const projects = await response.json();
      setProjects(projects);

      // Set the first project as the default selected project if available
      if (projects.length > 0) {
        setSelectedProject(projects[0]); // Set the first project as selected by default
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    }
  };
  const fetchFloorplans = async (project: Project | null) => {
    try {
      const url = `/api/floorplans?project_id=${project?.id}`;
      const headers: Record<string, string> = {};
      if (process.env.NEXT_PUBLIC_INTERNAL_SECRET) {
        headers["x-internal-secret"] = process.env.NEXT_PUBLIC_INTERNAL_SECRET;
      }
      const response = await fetch(url, { method: "GET", headers });
      if (!response.ok) throw new Error("Failed to fetch floorplans");

      const floorplans = await response.json();
      setFloorplans(floorplans);
    } catch (error) {
      console.error("Error fetching floorplans:", error);
      setFloorplans([]);
    }
  };
  const fetchStatuses = async (project: Project | null) => {
    try {
      const headers: Record<string, string> = {};
      if (process.env.NEXT_PUBLIC_INTERNAL_SECRET) {
        headers["x-internal-secret"] = process.env.NEXT_PUBLIC_INTERNAL_SECRET;
      }
      const url = `/api/statuses?project_id=${project ? project.id : ""}`;
      const response = await fetch(url, {
        method: "GET",
        headers,
      });
      if (!response.ok) throw new Error("Failed to fetch statuses");
      const status = await response.json();
      setStatuses(status);
    } catch (error) {
      console.error("Error fetching statuses", error);
      setStatuses([]);
    }
  };

  const fetchTasks = async (project: Project | null) => {
    try {
      const headers: Record<string, string> = {};
      if (process.env.NEXT_PUBLIC_INTERNAL_SECRET) {
        headers["x-internal-secret"] = process.env.NEXT_PUBLIC_INTERNAL_SECRET;
      }
      const url = `/api/tasks?project_id=${
        project ? project.id : ""
      }&status_id=${selectedStatus ? selectedStatus.id : ""}&floorplan_id=${
        selectedFloorplan ? selectedFloorplan.id : ""
      }&page=${page ? page : 0}&page_count=${selectedPageCount}`;
      const response = await fetch(url, {
        method: "GET",
        headers,
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const tasks = await response.json();
      setTasks(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };
  const navigatePage = (direction: string) => {
    if (direction == "next") {
      setPage(page + 1);
    } else {
      if (page != 0) setPage(page - 1);
    }
  };
  useEffect(() => {
    fetchProjects(); // Fetch projects when the component mounts
  }, []);

  useEffect(() => {
    if (selectedProject) fetchTasks(selectedProject);
  }, [page, selectedPageCount, selectedStatus, selectedFloorplan]);
  // Waiting for selectedProject to exist before fetching Floorplans
  useEffect(() => {
    if (selectedProject) {
      fetchFloorplans(selectedProject);
      setSelectedFloorplan(null);
      fetchStatuses(selectedProject);
      setSelectedStatus(null);
      fetchTasks(selectedProject);
    }
  }, [selectedProject]);
  return (
    <div className="w-[calc(100vw-17px)] p-5">
      {/* Dropdowns in a row */}
      <div className="xl:item-center xs:grid xs:grid-cols-2 flex-col gap-4 lg:flex lg:flex-row lg:items-center xl:flex xl:flex-row">
        <CustomDropdown
          items={projects}
          selected={selectedProject}
          setSelected={setSelectedProject}
          placeholder="Select a Project"
          title="Project"
        />
        <CustomDropdown
          items={floorplans}
          selected={selectedFloorplan}
          setSelected={setSelectedFloorplan}
          placeholder="Select a Floorplan"
          title="Floorplan"
        />
        <CustomDropdown
          items={statuses}
          selected={selectedStatus}
          setSelected={setSelectedStatus}
          placeholder="Select a Status"
          title="Status"
        />
        <CustomDropdown
          items={pageCount}
          selected={selectedPageCount}
          setSelected={setSelectedPageCount}
          placeholder="Tasks per page..."
          title="Tasks per page"
        />
      </div>

      {/* Pills */}
      <div className="mt-4 mb-4 flex flex-wrap gap-2">
        {/* {selectedProject && (
          <div className="flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
            {selectedProject.name}
            <button
              onClick={() => setSelectedProject(null)}
              className="ml-2 text-gray-500 hover:text-gray-700 font-bold hover:cursor-pointer"
            >
              ×
            </button>
          </div>
        )}
 */}
        {selectedFloorplan && (
          <div className="flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800">
            {selectedFloorplan.name}
            <button
              onClick={() => setSelectedFloorplan(null)}
              className="ml-2 font-bold text-gray-500 hover:cursor-pointer hover:text-gray-700"
            >
              ×
            </button>
          </div>
        )}

        {selectedStatus && (
          <div
            className="flex items-center rounded-full px-3 py-1 text-sm text-gray-800"
            style={{ backgroundColor: `${selectedStatus.color}50` }}
          >
            {selectedStatus.name}
            <button
              onClick={() => setSelectedStatus(null)}
              className="ml-2 font-bold text-gray-500 hover:cursor-pointer hover:text-gray-700"
            >
              ×
            </button>
          </div>
        )}
      </div>
      {/* Tasks Grid */}
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
        {loading ? (
          Array.from({ length: selectedPageCount || 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-40 w-full animate-pulse rounded-xl bg-gray-200"
            />
          ))
        ) : tasks.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-10 text-gray-500">
            No Tasks
          </div>
        ) : (
          tasks.map((task) => {
            const floorplan = floorplans.find(
              (fp) => fp.id === task.floorplan_id,
            );
            const status = statuses.find((st) => st.id === task.status_id);

            return (
              <div
                key={task.id}
                className="flex w-full flex-col justify-between rounded-xl border-2 border-[#15448c80] p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl">{task.name}</h1>
                    <p
                      className="pt-1 pr-2 pb-1 text-sm font-bold"
                      style={{ color: status?.color }}
                    >
                      {status?.name}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">{task.modified_at}</p>
                </div>

                <div className="mt-2 grid grid-cols-6 gap-2">
                  {task.bubbles
                    .filter((b) => b.kind === 10 || b.kind === 11) // only images
                    .slice(-6) // get the last 6
                    .map((bubble) => (
                      <a
                        key={bubble.id}
                        href={
                          bubble.flattened_file_url
                            ? bubble.flattened_file_url
                            : bubble.original_url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={bubble.thumb_url}
                          alt="Bubble"
                          className="w-full rounded object-cover sm:w-10 md:w-18 lg:w-30 xl:w-30 2xl:w-50"
                        />
                      </a>
                    ))}
                  <a
                    className="col-start-4 col-end-7 row-start-1 row-end-3"
                    key={floorplan?.id}
                    href={floorplan?.sheets[0].original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={floorplan?.sheets[0].thumb_url}></img>
                  </a>
                </div>
                {floorplan?.name && (
                  <p className="mt-2 text-sm text-gray-700">{floorplan.name}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div
        hidden={tasks.length === 0}
        className="mt-6 flex w-full items-center justify-center gap-4"
      >
        <button
          className="rounded-xl border-2 border-red-500 px-4 py-2 hover:cursor-pointer"
          onClick={() => navigatePage("back")}
        >
          Previous
        </button>
        <span className="text-sm">Page {page + 1}</span>
        <button
          className="rounded-xl border-2 border-green-700 px-4 py-2 hover:cursor-pointer"
          onClick={() => navigatePage("next")}
        >
          Next
        </button>
      </div>
    </div>
  );
}

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
    null
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
      fetchStatuses(selectedProject);
      fetchTasks(selectedProject);
    }
  }, [selectedProject]);
  return (
    <div className="w-[calc(100vw-17px)] p-5">
      {/* Dropdowns in a row */}
      <div className="flex gap-4 items-center">
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
      <div className="flex gap-2 flex-wrap mt-4 mb-4">
        {selectedProject && (
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

        {selectedFloorplan && (
          <div className="flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
            {selectedFloorplan.name}
            <button
              onClick={() => setSelectedFloorplan(null)}
              className="ml-2 text-gray-500 hover:text-gray-700 font-bold hover:cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {selectedStatus && (
          <div
            className="flex items-center text-gray-800 px-3 py-1 rounded-full text-sm"
            style={{ backgroundColor: `${selectedStatus.color}50` }}
          >
            {selectedStatus.name}
            <button
              onClick={() => setSelectedStatus(null)}
              className="ml-2 text-gray-500 hover:text-gray-700 font-bold hover:cursor-pointer"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-40 w-full bg-gray-200 animate-pulse rounded-xl"
              />
            ))
          : tasks.map((task) => {
              const floorplan = floorplans.find(
                (fp) => fp.id === task.floorplan_id
              );
              const status = statuses.find((st) => st.id === task.status_id);

              return (
                <div
                  key={task.id}
                  className="border-2 border-gray-300 rounded-xl shadow-sm p-4 flex flex-col justify-between w-full"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="underline">{task.name}</h1>
                      <p
                        className="text-sm font-bold pt-1 pb-1 pr-2"
                        style={{ color: status?.color }}
                      >
                        {status?.name}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600">{task.modified_at}</p>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {task.bubbles
                      .filter((b) => b.kind === 11)
                      .map((bubble) => (
                        <a
                          key={bubble.id}
                          href={bubble.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={bubble.thumb_url}
                            alt="Bubble"
                            className="w-full h-20 object-cover rounded"
                          />
                        </a>
                      ))}
                  </div>

                  {floorplan?.name && (
                    <p className="text-sm mt-2 text-gray-700">
                      {floorplan.name}
                    </p>
                  )}
                </div>
              );
            })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 gap-4 w-full">
        <button
          className="border-2 rounded-xl px-4 py-2 border-red-500"
          onClick={() => navigatePage("back")}
        >
          Previous
        </button>
        <span className="text-sm">Page {page}</span>
        <button
          className="border-2 rounded-xl px-4 py-2 border-green-700"
          onClick={() => navigatePage("next")}
        >
          Next
        </button>
      </div>
    </div>
  );
}

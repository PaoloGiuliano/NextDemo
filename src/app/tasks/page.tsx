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
  updated_at: string;
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
  const fetchProjects = async () => {
    console.time("Fetch Projects from Page.tsx");
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

    console.timeEnd("Fetch Projects from Page.tsx");
  };

  const handleFloorplanSelect = (floorplan: Floorplan) => {
    setSelectedFloorplan(floorplan); // Update the selected project ID
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project); // Update the selected floorplan ID
  };
  const handleStatusSelect = (status: Status) => {
    setSelectedStatus(status); // Update the selected status ID
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
      console.time("Fetch Statuses from Page.tsx");
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
    console.timeEnd("Fetch Statuses from Page.tsx");
  };

  const fetchTasks = async (project: Project | null) => {
    try {
      const headers: Record<string, string> = {};
      if (process.env.NEXT_PUBLIC_INTERNAL_SECRET) {
        headers["x-internal-secret"] = process.env.NEXT_PUBLIC_INTERNAL_SECRET;
      }
      const url = `/api/tasks?project_id=${project ? project.id : ""}&page=${
        page ? page : 0
      }&page_count=${selectedPageCount}`;
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
    }
  };
  const navigatePage = (direction: string) => {
    if (direction == "next") {
      setPage(page + 1);
      fetchTasks(selectedProject);
    } else {
      page != 0 && setPage(page - 1);
    }
  };

  useEffect(() => {
    fetchProjects(); // Fetch projects when the component mounts
  }, []);

  useEffect(() => {
    fetchTasks(selectedProject);
  }, [page]);
  // Waiting for selectedProject to exist before fetching Floorplans
  useEffect(() => {
    if (selectedProject) {
      fetchFloorplans(selectedProject);
      fetchStatuses(selectedProject);
      fetchTasks(selectedProject);
      console.log(tasks);
    }
  }, [selectedProject]);
  return (
    <div className="w-full p-5">
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
          placeholder="tasks per page..."
          title="Tasks per page"
        />
      </div>

      {/* Pills below */}
      <div className="flex gap-2 flex-wrap mt-4">
        {selectedProject && (
          <div className="flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
            {selectedProject.name}
            <button
              onClick={() => setSelectedProject(null)}
              className="ml-2 text-gray-500 hover:text-gray-700 font-bold"
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
              className="ml-2 text-gray-500 hover:text-gray-700 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {selectedStatus && (
          <div
            className={`flex items-centertext-gray-800 px-3 py-1 rounded-full text-sm`}
            style={{
              backgroundColor: `${selectedStatus.color}50`,
            }}
          >
            {selectedStatus.name}
            <button
              onClick={() => setSelectedStatus(null)}
              className="ml-2 text-gray-500 hover:text-gray-700 font-bold"
            >
              ×
            </button>
          </div>
        )}
      </div>
      <div>
        {tasks.map((task) => {
          const floorplan = floorplans.find(
            (fp) => fp.id === task.floorplan_id
          );

          return (
            <div key={task.id}>
              <p>{task.name}</p>
              <p>Floorplan: {floorplan?.name || "unknown"}</p>
            </div>
          );
        })}
      </div>
      <button onClick={() => navigatePage("back")}>Previous Page</button>
      <button onClick={() => navigatePage("next")}>Next Page</button>
    </div>
  );
}

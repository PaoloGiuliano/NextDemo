"use client";

import CustomDropdown from "@/components/CustomDropdown";
import { useEffect, useState } from "react";
import { ArrowTurnDownRightIcon, MapPinIcon } from "@heroicons/react/16/solid";
import { BackwardIcon } from "@heroicons/react/24/outline";
import { ForwardIcon } from "@heroicons/react/24/outline";
import TaskModal from "@/components/TaskModal";
import Image from "next/image";
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
}
// function getContrastTextColor(hex: string): "black" | "white" {
//   const color = hex.replace("#", "").padEnd(6, "0");
//   const r = parseInt(color.slice(0, 2), 16);
//   const g = parseInt(color.slice(2, 4), 16);
//   const b = parseInt(color.slice(4, 6), 16);

//   const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
//   return luminance > 0.5 ? "black" : "white";
// }
export default function Tasks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskCount, setTaskCount] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [floorplans, setFloorplans] = useState<Floorplan[]>([]);
  const [selectedFloorplan, setSelectedFloorplan] = useState<Floorplan | null>(
    null,
  );
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [page, setPage] = useState<number>(0);
  const pageCount = [10, 20, 30, 40, 50];
  const [selectedPageCount, setSelectedPageCount] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      const taskCount = response.headers.get("x-task-count");
      setTaskCount(taskCount ? parseInt(taskCount) : 0);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    fetchProjects(); // Fetch projects when the component mounts
  }, []);
  useEffect(() => {
    setPage(0); // Reset page when filters change
  }, [selectedFloorplan, selectedPageCount, selectedStatus, selectedProject]);

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
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-2">
        {loading ? (
          Array.from({ length: selectedPageCount || 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-80 w-full animate-pulse rounded-xl bg-gray-200"
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

            const imageHeight = floorplan ? floorplan.sheets[0].file_height : 0;
            const imageWidth = floorplan ? floorplan.sheets[0].file_width : 0;
            const percentX = floorplan ? (task.pos_x / imageWidth) * 100 : 0;
            const percentY = floorplan ? (task.pos_y / imageHeight) * 100 : 0;

            return (
              <div
                key={task.id}
                className="flex w-full flex-col justify-between rounded-sm bg-gray-100 p-4"
                // style={{
                //   boxShadow: `${status?.color}66 -5px 5px,
                //               ${status?.color}4D -10px 10px,
                //               ${status?.color}33 -15px 15px,
                //               ${status?.color}1A -20px 20px,
                //               ${status?.color}0D -25px 25px`,
                // }}
              >
                <div className="flex items-start justify-between border-b-2 border-gray-200">
                  <div>
                    <h1 className="text-gray-600 md:text-2xl">
                      <button
                        className="underline-offset-5 hover:cursor-pointer hover:text-gray-900 hover:underline"
                        onClick={() => {
                          setIsModalOpen(true);
                          const selectedTask = tasks.find(
                            (t) => t.id === task.id,
                          );
                          setSelectedTask(selectedTask || null);
                          document.documentElement.style.overflow = "hidden";
                        }}
                      >
                        {task.name}
                        <ArrowTurnDownRightIcon className="h-5 w-5" />
                      </button>
                    </h1>
                    <p
                      className="pt-1 pr-2 pb-1 text-sm font-bold"
                      style={{
                        color: status?.color,
                      }}
                    >
                      {status?.name}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">{task.modified_at}</p>
                </div>

                <div className="m-2 grid grid-cols-6">
                  {(() => {
                    const imageBubbles = task.bubbles.filter(
                      (b) => b.kind === 10 || b.kind === 11 || b.kind === 13,
                    );

                    if (imageBubbles.length === 0) {
                      return (
                        <p className="text-sm text-gray-500 italic">
                          No images
                        </p>
                      );
                    }
                    return imageBubbles.slice(-6).map((bubble) => (
                      <a
                        key={bubble.id}
                        href={
                          bubble.flattened_file_url
                            ? bubble.flattened_file_url
                            : bubble.kind === 13
                              ? `https://renderstuff.com/tools/360-panorama-web-viewer/panorama_360_vr?image=${bubble.original_url}`
                              : bubble.original_url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={bubble.thumb_url}
                          alt="Bubble"
                          className="h-full object-cover py-1 pr-1"
                        />
                      </a>
                    ));
                  })()}

                  <div className="relative col-start-4 col-end-7 row-start-1 row-end-3 flex h-full w-full flex-col overflow-hidden rounded-sm ring-1 ring-gray-300">
                    <a
                      className=""
                      href={floorplan?.sheets[0].file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Image
                        className="scale-400"
                        alt="floorplan"
                        src={
                          floorplan?.sheets[0].file_url ||
                          "/Image-not-found.png"
                        }
                        width={2000}
                        height={2000}
                        style={{
                          transformOrigin: `${percentX}% ${percentY}%`,
                          transform: "translate(0, 0)",
                        }}
                      />
                    </a>
                    <div
                      className="absolute z-10 h-4 w-4 translate-x-[-50%] translate-y-[-50%] rounded-2xl sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10"
                      style={{
                        top: `${percentY}%`,
                        left: `${percentX}%`,
                      }}
                    >
                      <MapPinIcon
                        className="h-full w-full translate-y-[-10px]"
                        style={{
                          color: `${status ? status.color : "#000000"}`,
                          fill: `${status ? status.color : "#FFFFFF"}CC`,
                          stroke: "#000000",
                        }}
                      />
                    </div>
                    <p
                      className="absolute top-0 right-0 left-0 bg-black/75 p-2 text-center text-xs text-white md:text-base"
                      style={{}}
                    >
                      {floorplan?.description} - {floorplan?.name}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex w-full items-center justify-center gap-4">
        <button
          disabled={page <= 0}
          className="hover:cursor-pointer disabled:cursor-default disabled:opacity-10"
          onClick={() => navigatePage("back")}
        >
          <BackwardIcon className="h-10 w-10 fill-gray-600 text-gray-900 hover:fill-red-400" />
        </button>
        <span className="text-sm">Page {page + 1}</span>
        <button
          disabled={taskCount - (page + 1) * selectedPageCount <= 0}
          className="hover:cursor-pointer disabled:cursor-default disabled:opacity-10"
          onClick={() => navigatePage("next")}
        >
          <ForwardIcon className="h-10 w-10 fill-gray-600 text-gray-900 hover:fill-green-400" />
        </button>
      </div>
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          document.documentElement.style.overflow = "";
        }}
        task={selectedTask}
        status={statuses.find((s) => s.id == selectedTask?.status_id) || null}
        floorplan={
          floorplans.find((f) => f.id === selectedTask?.floorplan_id) || null
        }
      ></TaskModal>
    </div>
  );
}

"use client";
import { Project, Task, Status, Floorplan } from "../lib/types";
import CustomDropdown from "@/components/CustomDropdown";
import { useEffect, useRef, useState } from "react";
import {
  ArrowTurnDownRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
} from "@heroicons/react/16/solid";
import {
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
} from "@heroicons/react/24/outline";
import TaskModal from "@/components/TaskModal";
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [sortDirection, setSortDirection] = useState("DESC");
  const [scale, setScale] = useState(0.7);

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
      }&page=${page ? page : 0}&page_count=${selectedPageCount}&sort_directions=${sortDirection}`;
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
  }, [
    page,
    selectedPageCount,
    selectedStatus,
    selectedFloorplan,
    sortDirection,
  ]);
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
  useEffect(() => {
    const qcStatus = statuses.find((s) => s.name === "Quality control");
    console.log(qcStatus);
  }, [statuses]);
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    const el = containerRef.current;
    if (el) {
      resizeObserver.observe(el);
    }

    return () => {
      if (el) {
        resizeObserver.unobserve(el);
      }
    };
  }, [tasks]);
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
        <div>
          <p>Sort Order</p>
          <button
            className="rounded border border-gray-300 bg-white px-4 py-2 text-left hover:cursor-pointer"
            onClick={() => {
              setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC");
            }}
          >
            {sortDirection === "DESC" ? "DESC ▼" : "ASC ▲"}
          </button>
        </div>
      </div>

      {/* Pills */}
      <div className="mt-4 mb-4 flex flex-wrap gap-2">
        {selectedFloorplan && (
          <div className="flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800">
            {selectedFloorplan.name}
            <button
              onClick={() => {
                setSelectedFloorplan(null);
              }}
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
              onClick={() => {
                setSelectedStatus(null);
              }}
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

            const imgTargetX = task.pos_x;
            const imgTargetY = task.pos_y;
            const containerTargetX = dimensions.width / 2;
            const containerTargetY = dimensions.height / 2;
            const offsetX = containerTargetX - imgTargetX * scale;
            const offsetY = containerTargetY - imgTargetY * scale;

            return (
              <div
                key={task.id}
                className="relative flex w-full flex-col justify-between rounded-sm bg-gray-100 p-4"
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
                    <h1 className="text-sm text-gray-600 md:text-2xl">
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
                    <div className="flex justify-between pt-1 pr-2 pb-1">
                      <p
                        className="text-xs font-bold sm:text-sm"
                        style={{
                          color: status?.color,
                        }}
                      >
                        {status?.name}
                      </p>
                    </div>
                  </div>
                  <p className="absolute right-6 bottom-2 text-[8px] text-gray-500 italic sm:top-2 sm:text-xs md:text-sm">
                    {task.modified_at}
                  </p>
                </div>

                <div className="m-2 grid grid-cols-6 grid-rows-3 sm:grid-rows-2">
                  {(() => {
                    const imageBubbles = task.bubbles.filter(
                      (b) => b.kind === 10 || b.kind === 11 || b.kind === 13,
                    );

                    if (imageBubbles.length === 0) {
                      return (
                        <div
                          className=""
                          style={{ height: `${dimensions.height / 2}px` }}
                        >
                          <p className="text-sm text-gray-500 italic">
                            No images
                          </p>
                        </div>
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
                          className="h-full w-full object-cover py-1 pr-2"
                        />
                      </a>
                    ));
                  })()}
                  <div className="col-start-3 col-end-7 row-start-1 row-end-4 flex flex-col sm:col-start-4 sm:row-end-3">
                    <div
                      ref={containerRef}
                      className="relative h-full w-full overflow-hidden rounded bg-white ring-gray-300 sm:rounded-sm sm:ring-1"
                    >
                      <a
                        className=""
                        href={floorplan?.sheets[0].original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          className="absolute top-0 left-0 max-h-none max-w-none"
                          alt="floorplan"
                          src={
                            floorplan?.sheets[0].file_url ||
                            "/Image-not-found.png"
                          }
                          style={{
                            transformOrigin: `top left`,
                            transform: `scale(${scale}) translate(${offsetX / scale}px, ${offsetY / scale}px)`,
                            objectFit: "cover",
                          }}
                        />
                      </a>
                      <div
                        className="pointer-events-none absolute z-10 h-4 w-4 translate-x-[-50%] translate-y-[-50%] rounded-2xl sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10"
                        style={{
                          top: `50%`,
                          left: `50%`,
                        }}
                      >
                        <MapPinIcon
                          className="pointer-events-none h-full w-full translate-y-[-10px]"
                          style={{
                            color: `${status ? status.color : "#000000"}`,
                            fill: `${status ? status.color : "#FFFFFF"}CC`,
                            stroke: "#000000",
                          }}
                        />
                      </div>
                      <div className="absolute top-0 right-0 left-0 bg-black/75 p-1 text-left md:p-2">
                        <p
                          className="text-center text-xs text-white md:text-sm xl:text-base 2xl:text-lg"
                          style={{}}
                        >
                          {floorplan?.description} - {floorplan?.name}
                        </p>
                      </div>
                      <div className="absolute right-0 bottom-0 flex justify-end space-x-2 rounded-tl bg-black/60 p-1 md:p-2">
                        <button
                          className="hover:cursor-pointer disabled:cursor-default disabled:opacity-50"
                          onClick={() => setScale(scale - 0.1)}
                          disabled={scale <= 0.3}
                        >
                          <MagnifyingGlassMinusIcon
                            className="h-5 lg:h-6"
                            style={{ color: "white" }}
                          />
                        </button>
                        <button
                          className="hover:cursor-pointer disabled:cursor-default disabled:opacity-50"
                          onClick={() => setScale(scale + 0.1)}
                          disabled={scale >= 5}
                        >
                          <MagnifyingGlassPlusIcon
                            className="h-5 lg:h-6"
                            style={{ color: "white" }}
                          />
                        </button>
                      </div>

                      <div
                        hidden={scale == 0.7}
                        className="absolute bottom-0 left-0 rounded-tr bg-black/60 p-1 md:p-2"
                      >
                        <button
                          className="rounded px-1 text-xs text-white hover:cursor-pointer md:text-sm"
                          onClick={() => setScale(0.7)}
                        >
                          RESET ZOOM
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="mt-5 flex w-full items-center justify-center">
        <div className="flex text-lg hover:cursor-pointer md:text-xl">
          <button
            disabled={page <= 0}
            className="group hover:cursor-pointer disabled:cursor-default"
            onClick={() => {
              setPage(0);
            }}
          >
            <ChevronDoubleLeftIcon className="h-10 w-10 fill-gray-600 text-gray-800 group-disabled:fill-[#15448c] group-disabled:opacity-50 hover:fill-[#15448c] md:h-12 md:w-12" />
          </button>
          <button
            disabled={page <= 0}
            className="group hover:cursor-pointer disabled:cursor-default"
            onClick={() => {
              navigatePage("back");
            }}
          >
            <ChevronLeftIcon className="h-10 w-10 fill-gray-600 text-gray-800 group-disabled:fill-[#15448c] group-disabled:opacity-50 hover:fill-[#15448c] md:h-12 md:w-12" />
          </button>

          <div className="flex">
            {Array.from({ length: 3 }, (_, i) => {
              const setPageIndex = -3 + i;
              const disableIndex = -2 + i;

              return (
                <button
                  key={i}
                  className="p-2 hover:cursor-pointer hover:font-bold hover:underline disabled:cursor-default disabled:opacity-0"
                  hidden={page + disableIndex < 1}
                  onClick={() => setPage(page + setPageIndex)}
                >
                  {page + disableIndex < 1 ? "0" : page + disableIndex}
                </button>
              );
            })}
            <button
              className="p-2 text-xl font-bold text-[#15448c] underline disabled:cursor-default disabled:opacity-0 md:text-2xl"
              disabled={
                taskCount -
                  (page + 1) * selectedPageCount +
                  selectedPageCount <=
                0
              }
              onClick={() => setPage(page)}
            >
              {taskCount - (page + 1) * selectedPageCount + selectedPageCount <=
              0
                ? "0"
                : page + 1}
            </button>
            {Array.from({ length: 3 }, (_, i) => {
              const setPageIndex = 1 + i;
              const disableIndex = 2 + i;
              return (
                <button
                  key={i}
                  className="p-2 hover:cursor-pointer hover:font-bold hover:underline disabled:cursor-default disabled:opacity-0"
                  hidden={
                    taskCount -
                      (page + disableIndex) * selectedPageCount +
                      selectedPageCount <=
                    0
                  }
                  onClick={() => setPage(page + setPageIndex)}
                >
                  {page + disableIndex < 1 ? "0" : page + disableIndex}
                </button>
              );
            })}
          </div>
          <button
            disabled={taskCount - (page + 1) * selectedPageCount <= 0}
            className="group hover:cursor-pointer disabled:cursor-default"
            onClick={() => {
              navigatePage("next");
            }}
          >
            <ChevronRightIcon className="h-10 w-10 fill-gray-600 text-gray-800 group-disabled:fill-gray-400 hover:fill-gray-400 md:h-12 md:w-12" />
          </button>
          <button
            disabled={taskCount - (page + 1) * selectedPageCount <= 0}
            className="group hover:cursor-pointer disabled:cursor-default"
            onClick={() => {
              setPage(Math.floor(taskCount / selectedPageCount));
            }}
          >
            <ChevronDoubleRightIcon className="h-10 w-10 fill-gray-600 text-gray-800 group-disabled:fill-gray-400 hover:fill-gray-400 md:h-12 md:w-12" />
          </button>
        </div>
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
        statuses={statuses}
      ></TaskModal>
    </div>
  );
}

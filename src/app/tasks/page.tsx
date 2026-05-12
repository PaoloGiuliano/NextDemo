"use client";
import dynamic from "next/dynamic";
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
import AppModal from "@/components/AppModal";

// ── Module-level dynamic import — never recreated on re-render ──
const Photo360Viewer = dynamic(() => import("@/components/Photo360Viewer"), {
  ssr: false,
});

const DEFAULT_SCALE = 0.7;

const authHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (process.env.NEXT_PUBLIC_INTERNAL_SECRET) {
    headers["x-internal-secret"] = process.env.NEXT_PUBLIC_INTERNAL_SECRET;
  }
  return headers;
};

export default function Tasks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTasks, setSearchTasks] = useState<Task[]>([]);
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
  const [sortDirection, setSortDirection] = useState("DESC");
  const [search, setSearch] = useState("");
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState("");

  // ── Hydration guard: Photo360Viewer uses browser-only APIs (WebGL/canvas).
  //    Rendering server-side causes a mismatch → hydration error at line ~768.
  //    Only mount it after the client has hydrated. ──
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ── Per-card scale keyed by task.id so each minimap zooms independently ──
  const [scaleMap, setScaleMap] = useState<Record<string, number>>({});
  const getScale = (taskId: string) => scaleMap[taskId] ?? DEFAULT_SCALE;
  const setScale = (taskId: string, value: number) =>
    setScaleMap((prev) => ({ ...prev, [taskId]: value }));
  const resetScale = (taskId: string) =>
    setScaleMap((prev) => ({ ...prev, [taskId]: DEFAULT_SCALE }));

  // ── Per-card container refs so each floorplan minimap tracks its own size ──
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [dimensionsMap, setDimensionsMap] = useState<
    Record<string, { width: number; height: number }>
  >({});

  useEffect(() => {
    const observers: ResizeObserver[] = [];
    tasks.forEach((task) => {
      const el = containerRefs.current[task.id];
      if (!el) return;
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setDimensionsMap((prev) => ({
            ...prev,
            [task.id]: { width, height },
          }));
        }
      });
      ro.observe(el);
      observers.push(ro);
    });
    return () => observers.forEach((ro) => ro.disconnect());
  }, [tasks]);

  // ────────────────────── Fetch helpers ──────────────────────

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects", {
        method: "GET",
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data: Project[] = await response.json();
      setProjects(data);
      if (data.length > 0) setSelectedProject(data[0]);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    }
  };

  const fetchFloorplans = async (
    project: Project | null,
    status: Status | null,
  ) => {
    try {
      const url = `/api/floorplans?project_id=${project?.id ?? ""}&status_id=${status?.id ?? ""}`;
      const response = await fetch(url, {
        method: "GET",
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch floorplans");
      setFloorplans(await response.json());
    } catch (error) {
      console.error("Error fetching floorplans:", error);
      setFloorplans([]);
    }
  };

  const fetchStatuses = async (
    project: Project | null,
    floorplan: Floorplan | null,
  ) => {
    try {
      const url = `/api/statuses?project_id=${project?.id ?? ""}&floorplan_id=${floorplan?.id ?? ""}`;
      const response = await fetch(url, {
        method: "GET",
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch statuses");
      setStatuses(await response.json());
    } catch (error) {
      console.error("Error fetching statuses:", error);
      setStatuses([]);
    }
  };

  const fetchTasks = async (
    project: Project | null,
    opts: {
      isSearch?: boolean;
      status?: Status | null;
      floorplan?: Floorplan | null;
      pageNum?: number;
      pageSize?: number;
      sort?: string;
      searchTerm?: string;
    } = {},
  ) => {
    const {
      isSearch = false,
      status = selectedStatus,
      floorplan = selectedFloorplan,
      pageNum = page,
      pageSize = selectedPageCount,
      sort = sortDirection,
      searchTerm = search,
    } = opts;

    try {
      const url =
        `/api/tasks?project_id=${project?.id ?? ""}` +
        `&status_id=${status?.id ?? ""}` +
        `&floorplan_id=${floorplan?.id ?? ""}` +
        `&page=${pageNum}` +
        `&page_count=${pageSize}` +
        `&sort_directions=${sort}` +
        `&search=${searchTerm}`;

      const response = await fetch(url, {
        method: "GET",
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");

      const data: Task[] = await response.json();

      if (isSearch) {
        setSearchTasks(data);
      } else {
        setTasks(data);
        const count = response.headers.get("x-task-count");
        setTaskCount(count ? parseInt(count) : 0);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      if (!isSearch) setTasks([]);
    } finally {
      if (!isSearch) setLoading(false);
    }
  };

  // ────────────────────── Effects ──────────────────────

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [taskCount]);

  useEffect(() => {
    if (!selectedProject) return;
    fetchTasks(selectedProject);
    fetchStatuses(selectedProject, selectedFloorplan);
    fetchFloorplans(selectedProject, selectedStatus);
  }, [
    page,
    selectedPageCount,
    selectedStatus,
    selectedFloorplan,
    sortDirection,
  ]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (!selectedProject) return;
      if (search === "") {
        setSearchTasks([]);
        fetchTasks(selectedProject);
      } else {
        fetchTasks(selectedProject, { isSearch: true });
      }
    }, 150);
    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    if (!selectedProject) return;
    setSearch("");
    setSelectedFloorplan(null);
    setSelectedStatus(null);
    fetchFloorplans(selectedProject, null);
    fetchStatuses(selectedProject, null);
    fetchTasks(selectedProject, { status: null, floorplan: null });
  }, [selectedProject]);

  // ────────────────────── Helpers ──────────────────────

  const navigatePage = (direction: "next" | "back") => {
    setPage((p) => (direction === "next" ? p + 1 : Math.max(0, p - 1)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const lastPage = Math.max(0, Math.ceil(taskCount / selectedPageCount) - 1);

  type DropdownItem = { id: string; label: string };
  const toDropdownItem = (item: any): DropdownItem => ({
    id: item.id,
    label: item.label ?? item.name,
  });

  // ────────────────────── Render ──────────────────────

  return (
    <div className="w-full max-w-[calc(100vw-17px)] p-5">
      {/* ── Filter bar ──
          Mobile: 2-col grid, search spans full width below.
          lg+: single flex row, all items bottom-aligned.
      ── */}
      <div className="grid grid-cols-2 items-end gap-3 lg:flex lg:flex-row lg:flex-wrap lg:items-end">
        {[
          {
            title: "Project",
            items: projects,
            selected: selectedProject,
            setSelected: (item: any) => {
              const found = projects.find((p) => p.id === item.id);
              if (found) setSelectedProject(found);
            },
          },
          {
            title: "Floorplan",
            items: floorplans,
            selected: selectedFloorplan,
            setSelected: (item: any) => {
              const found = floorplans.find((f) => f.id === item.id);
              if (found) setSelectedFloorplan(found);
            },
          },
          {
            title: "Status",
            items: statuses,
            selected: selectedStatus,
            setSelected: (item: any) => {
              const found = statuses.find((s) => s.id === item.id);
              if (found) setSelectedStatus(found);
            },
          },
          {
            title: "Page size",
            items: pageCount.map((n) => ({ id: String(n), label: String(n) })),
            selected: selectedPageCount
              ? {
                  id: String(selectedPageCount),
                  label: String(selectedPageCount),
                }
              : null,
            setSelected: (item: any) => setSelectedPageCount(Number(item.id)),
          },
        ].map((cfg) => (
          <CustomDropdown
            key={cfg.title}
            items={cfg.items.map(toDropdownItem)}
            selected={cfg.selected ? toDropdownItem(cfg.selected) : null}
            setSelected={cfg.setSelected}
            placeholder={`Select ${cfg.title}`}
            title={cfg.title}
          />
        ))}

        <CustomDropdown
          items={[
            { id: "ASC", label: "ASC ▲" },
            { id: "DESC", label: "DESC ▼" },
          ]}
          selected={{ id: sortDirection, label: sortDirection }}
          setSelected={(item) => setSortDirection(item.id as "ASC" | "DESC")}
          title="Sort Order"
          placeholder="Sort"
        />

        {/* Search — col-span-2 on mobile (full-width row), flex-1 on desktop */}
        <form
          className="relative col-span-2 flex items-center gap-2 lg:col-span-1 lg:flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedProject) fetchTasks(selectedProject);
          }}
        >
          <div className="relative flex-1">
            <input
              className="w-full rounded border border-gray-300 px-3 py-[7px] pr-8 text-sm focus:border-gray-400 focus:outline-none"
              value={search}
              placeholder="Search tasks..."
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>

          <button
            className="shrink-0 rounded border border-gray-300 px-3 py-[7px] text-sm hover:bg-gray-50"
            type="submit"
          >
            Search
          </button>

          {/* Results dropdown */}
          {searchTasks.length > 0 && (
            <ul className="absolute top-full left-0 z-40 mt-1 max-h-64 w-full overflow-y-auto rounded border border-gray-200 bg-white shadow-lg">
              {searchTasks.map((task, index) => (
                <li
                  key={task.id}
                  className={index !== 0 ? "border-t border-gray-100" : ""}
                >
                  {/* onMouseDown fires before onBlur so the list doesn't close before the click registers */}
                  <button
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    type="button"
                    onMouseDown={(e) => {
                      if (e.button === 0) {
                        setSelectedTask(task);
                        setIsModalOpen(true);
                        setSearch("");
                        setSearchTasks([]);
                      }
                    }}
                  >
                    {task.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>
      </div>

      {/* ── Active filter pills ── */}
      <div className="mt-4 mb-4 flex flex-wrap gap-2">
        {selectedFloorplan && (
          <FilterPill
            label={selectedFloorplan.name}
            onRemove={() => setSelectedFloorplan(null)}
          />
        )}
        {selectedStatus && (
          <FilterPill
            label={selectedStatus.name}
            color={selectedStatus.color}
            onRemove={() => setSelectedStatus(null)}
          />
        )}
      </div>

      {/* ── Task grid ── */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
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
            const dims = dimensionsMap[task.id] ?? { width: 0, height: 0 };
            const scale = getScale(task.id);
            const offsetX = dims.width / 2 - task.pos_x * scale;
            const offsetY = dims.height / 2 - task.pos_y * scale;

            const imageBubbles = task.bubbles.filter(
              (b) => b.kind === 10 || b.kind === 11 || b.kind === 13,
            );

            return (
              <div
                key={task.id}
                className="relative flex w-full flex-col justify-between rounded-sm bg-gray-100 p-4"
              >
                {/* Card header */}
                <div className="flex items-start justify-between border-b-2 border-gray-200">
                  <div>
                    <h1 className="text-sm text-gray-600 md:text-2xl">
                      <button
                        className="underline-offset-5 hover:cursor-pointer hover:text-gray-900 hover:underline"
                        onClick={() => {
                          setSelectedTask(task);
                          setIsModalOpen(true);
                        }}
                      >
                        {task.name}{" "}
                        <b className="italic">#{task.sequence_number}</b>
                        <ArrowTurnDownRightIcon className="h-5 w-5" />
                      </button>
                    </h1>
                    <div className="flex justify-between pt-1 pr-2 pb-1">
                      <p
                        className="text-xs font-bold sm:text-sm"
                        style={{ color: status?.color }}
                      >
                        {status?.name}
                      </p>
                    </div>
                  </div>
                  <p className="absolute right-6 bottom-2 text-[8px] text-gray-500 italic sm:top-2 sm:text-xs md:text-sm">
                    {task.modified_at}
                  </p>
                </div>

                {/* Card body */}
                <div className="m-2 grid grid-cols-6 grid-rows-3 sm:grid-rows-2">
                  {imageBubbles.length === 0 ? (
                    <div style={{ height: `${dims.height / 2}px` }}>
                      <p className="text-sm text-gray-500 italic">No images</p>
                    </div>
                  ) : (
                    imageBubbles.slice(-6).map((bubble) => (
                      <div key={bubble.id} className="relative">
                        {bubble.kind === 13 ? (
                          // 360° photo — open viewer modal on click
                          <button
                            type="button"
                            className="relative block h-full w-full"
                            onClick={() => {
                              setSelectedPhoto(bubble.file_url);
                              setIsPhotoModalOpen(true);
                            }}
                          >
                            <img
                              src={bubble.thumb_url}
                              alt="360° photo"
                              className="h-full w-full object-cover py-1 pr-2"
                            />
                            <img
                              className="pointer-events-none absolute top-1/2 left-1/2 w-1/3 -translate-x-1/2 -translate-y-1/2 opacity-70"
                              src="/360-deg.png"
                              alt=""
                            />
                          </button>
                        ) : (
                          <a
                            href={
                              bubble.flattened_file_url ||
                              bubble.original_url ||
                              bubble.file_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={bubble.thumb_url}
                              alt="Attachment"
                              className="h-full w-full object-cover py-1 pr-2 hover:cursor-pointer"
                            />
                          </a>
                        )}
                      </div>
                    ))
                  )}

                  {/* Floorplan minimap */}
                  <div className="col-start-3 col-end-7 row-start-1 row-end-4 flex flex-col sm:col-start-4 sm:row-end-3">
                    <div
                      ref={(el) => {
                        containerRefs.current[task.id] = el;
                      }}
                      className="relative h-full w-full overflow-hidden rounded bg-white ring-gray-300 sm:rounded-sm sm:ring-1"
                    >
                      <a
                        href={floorplan?.sheets[0].original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          className="absolute top-0 left-0 max-h-none max-w-none"
                          alt="Floorplan"
                          src={
                            floorplan?.sheets[0].file_url ||
                            "/Image-not-found.png"
                          }
                          style={{
                            transformOrigin: "top left",
                            transform: `scale(${scale}) translate(${offsetX / scale}px, ${offsetY / scale}px)`,
                            objectFit: "cover",
                          }}
                        />
                      </a>

                      <div
                        className="pointer-events-none absolute z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10"
                        style={{ top: "50%", left: "50%" }}
                      >
                        <MapPinIcon
                          className="pointer-events-none h-full w-full -translate-y-[10px]"
                          style={{
                            color: status?.color ?? "#000000",
                            fill: `${status?.color ?? "#FFFFFF"}CC`,
                            stroke: "#000000",
                          }}
                        />
                      </div>

                      <div className="absolute inset-x-0 top-0 bg-black/75 p-1 text-center md:p-2">
                        <p className="text-xs text-white md:text-sm xl:text-base 2xl:text-lg">
                          {floorplan?.description} - {floorplan?.name}
                        </p>
                      </div>

                      <div className="absolute right-0 bottom-0 flex justify-end space-x-2 rounded-tl bg-black/60 p-1 md:p-2">
                        <button
                          className="hover:cursor-pointer disabled:cursor-default disabled:opacity-50"
                          onClick={() =>
                            setScale(
                              task.id,
                              parseFloat((scale - 0.1).toFixed(1)),
                            )
                          }
                          disabled={scale <= 0.3}
                          aria-label="Zoom out"
                        >
                          <MagnifyingGlassMinusIcon className="h-5 text-white lg:h-6" />
                        </button>
                        <button
                          className="hover:cursor-pointer disabled:cursor-default disabled:opacity-50"
                          onClick={() =>
                            setScale(
                              task.id,
                              parseFloat((scale + 0.1).toFixed(1)),
                            )
                          }
                          disabled={scale >= 5}
                          aria-label="Zoom in"
                        >
                          <MagnifyingGlassPlusIcon className="h-5 text-white lg:h-6" />
                        </button>
                      </div>

                      {scale !== DEFAULT_SCALE && (
                        <div className="absolute bottom-0 left-0 rounded-tr bg-black/60 p-1 md:p-2">
                          <button
                            className="rounded px-1 text-xs text-white hover:cursor-pointer md:text-sm"
                            onClick={() => resetScale(task.id)}
                          >
                            Reset zoom
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ──
          Gated on `mounted` so the server never renders this block.
          `disabled` values depend on `taskCount` which is 0 on the server
          but resolves after the first fetch — rendering it SSR causes a
          disabled={true} vs disabled={null} mismatch (the hydration error).
      ── */}
      {mounted && (
        <div className="mt-5 flex w-full items-center justify-center">
          <div className="flex text-lg md:text-xl">
            <PaginationButton
              onClick={() => setPage(0)}
              disabled={page <= 0}
              aria-label="First page"
            >
              <ChevronDoubleLeftIcon className="h-10 w-10 fill-gray-600 group-disabled:opacity-50 hover:fill-[#15448c] md:h-12 md:w-12" />
            </PaginationButton>
            <PaginationButton
              onClick={() => navigatePage("back")}
              disabled={page <= 0}
              aria-label="Previous page"
            >
              <ChevronLeftIcon className="h-10 w-10 fill-gray-600 group-disabled:opacity-50 hover:fill-[#15448c] md:h-12 md:w-12" />
            </PaginationButton>

            {[-2, -1, 0, 1, 2].map((offset) => {
              const p = page + offset;
              if (p < 0 || p > lastPage) return null;
              const isCurrent = offset === 0;
              return (
                <button
                  key={offset}
                  onClick={() => setPage(p)}
                  className={`p-2 hover:cursor-pointer hover:font-bold hover:underline ${
                    isCurrent
                      ? "text-xl font-bold text-[#15448c] underline md:text-2xl"
                      : "text-gray-700"
                  }`}
                >
                  {p + 1}
                </button>
              );
            })}

            <PaginationButton
              onClick={() => navigatePage("next")}
              disabled={page >= lastPage}
              aria-label="Next page"
            >
              <ChevronRightIcon className="h-10 w-10 fill-gray-600 group-disabled:opacity-50 hover:fill-gray-400 md:h-12 md:w-12" />
            </PaginationButton>
            <PaginationButton
              onClick={() => setPage(lastPage)}
              disabled={page >= lastPage}
              aria-label="Last page"
            >
              <ChevronDoubleRightIcon className="h-10 w-10 fill-gray-600 group-disabled:opacity-50 hover:fill-gray-400 md:h-12 md:w-12" />
            </PaginationButton>
          </div>
        </div>
      )}

      {/* ── Task detail modal ── */}
      <AppModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        className="h-[95vh]"
      >
        <TaskModal
          onClose={() => setIsModalOpen(false)}
          task={selectedTask}
          status={
            statuses.find((s) => s.id === selectedTask?.status_id) || null
          }
          floorplan={
            floorplans.find((f) => f.id === selectedTask?.floorplan_id) || null
          }
          statuses={statuses}
        />
      </AppModal>

      {/* ── 360° photo modal ──
          Three requirements for Photo360Viewer to fill the space:
          1. Modal needs an explicit pixel height — height:100% on the viewer's
             canvas won't resolve against aspect-ratio or max-h alone.
          2. Dialog (inside AppModal) needs h-full via dialogClassName so it
             doesn't collapse to 0 and starve the viewer of height.
          3. `mounted` guard prevents server-side rendering of browser-only
             WebGL/canvas APIs, which was the hydration error source.
      ── */}
      <AppModal
        isOpen={isPhotoModalOpen}
        onOpenChange={(open) => {
          setIsPhotoModalOpen(open);
          if (!open) setSelectedPhoto("");
        }}
        className="h-[56vw] max-h-[90vh] w-full max-w-5xl"
        dialogClassName="h-full"
      >
        {mounted && selectedPhoto && (
          <Photo360Viewer imageUrl={selectedPhoto} />
        )}
      </AppModal>
    </div>
  );
}

// ────────────────────── Reusable components ──────────────────────

function FilterPill({
  label,
  color,
  onRemove,
}: {
  label: string;
  color?: string;
  onRemove: () => void;
}) {
  return (
    <div
      className="flex items-center rounded-full px-3 py-1 text-sm text-gray-800"
      style={{ backgroundColor: color ? `${color}50` : "#f3f4f6" }}
    >
      {label}
      <button
        className="ml-2 font-bold text-gray-500 hover:cursor-pointer hover:text-gray-700"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
      >
        ×
      </button>
    </div>
  );
}

function PaginationButton({
  onClick,
  disabled,
  children,
  "aria-label": ariaLabel,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
  "aria-label": string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="group hover:cursor-pointer disabled:cursor-default disabled:opacity-0"
    >
      {children}
    </button>
  );
}

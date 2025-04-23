"use client";
import { useEffect } from "react";
import Image from "next/image";
import { MapPinIcon } from "@heroicons/react/16/solid";
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
type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  status: Status | null;
  floorplan: Floorplan | null;
};
export default function TaskModal({
  isOpen,
  onClose,
  task,
  status,
  floorplan,
}: TaskModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);
  if (!isOpen) return null;
  const imageHeight = floorplan ? floorplan.sheets[0].file_height : 0;
  const imageWidth = floorplan ? floorplan.sheets[0].file_width : 0;
  const percentX = floorplan ? ((task ? task.pos_x : 0) / imageWidth) * 100 : 0;
  const percentY = floorplan
    ? ((task ? task.pos_y : 0) / imageHeight) * 100
    : 0;
  return (
    <div className="fixed inset-0 z-50 flex h-full flex-col items-center justify-center bg-black/50">
      <div className="relative h-full w-full rounded bg-white p-6 shadow-lg md:h-3/4 md:w-3/4">
        <div
          className="absolute top-0 right-0 left-0 z-50 flex justify-end rounded-tl rounded-tr"
          style={{ backgroundColor: status?.color || "white" }}
        >
          <button
            onClick={onClose}
            className="h-full rounded-tr px-2 py-1 text-2xl text-gray-600 hover:cursor-pointer hover:border-l-1 hover:bg-red-600 hover:text-white md:text-sm"
          >
            ✕
          </button>
        </div>
        <div className="h-full overflow-auto pt-8 md:grid md:grid-cols-8 md:grid-rows-8 md:gap-2">
          <div className="relative col-span-4 row-span-2 bg-gray-100 lg:row-span-1">
            <p className="m-2 p-2 text-center text-xl font-bold underline md:absolute md:top-[50%] md:left-[50%] md:m-0 md:translate-x-[-50%] md:translate-y-[-50%] md:p-0">
              {task?.name}
            </p>
          </div>
          <div className="relative col-span-4 aspect-video h-auto w-full bg-gray-100 sm:row-span-1 md:row-span-2 md:aspect-auto md:h-full md:w-auto lg:row-span-3 xl:row-span-4 2xl:row-span-4">
            <a
              className="hover:cursor-pointer"
              href={floorplan ? floorplan?.sheets[0].original_url : ""}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Image
                src={floorplan ? floorplan?.sheets[0].file_url : ""}
                alt="floorplan"
                fill
                className="absolute rounded hover:ring-2 hover:ring-gray-400"
              />
              <div
                className="absolute z-10 h-4 w-4 translate-x-[-50%] translate-y-[-50%] rounded-2xl sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10"
                style={{
                  top: `${percentY}%`,
                  left: `${percentX}%`,
                }}
              >
                <MapPinIcon
                  className="translate-y-[-15px]"
                  style={{
                    color: `${status ? status.color : "#000000"}`,
                    fill: `${status ? status.color : "#FFFFFF"}CC`,
                    stroke: "#000000",
                  }}
                />
              </div>
            </a>
          </div>
          <div className="col-span-4 row-span-6 overflow-auto bg-gray-100 lg:row-span-7">
            {task?.bubbles.map((bubble) => (
              <div className="relative flex justify-between" key={bubble.id}>
                {[1, 2, 10, 11, 12, 13].includes(bubble.kind) && (
                  <>
                    <div className="mx-2 mt-2 max-w-13/20 rounded px-2 pt-2 text-wrap">
                      {[11, 12, 13].includes(bubble.kind) ? (
                        <a
                          className="group relative hover:cursor-pointer"
                          href={
                            bubble.flattened_file_url
                              ? bubble.flattened_file_url
                              : bubble.original_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div className="h-10 w-10 sm:h-20 sm:w-20 md:h-25 md:w-25 lg:h-50 lg:w-50 xl:h-70 xl:w-70">
                            <Image
                              className="block"
                              src={bubble.thumb_url}
                              alt="fw_image"
                              fill
                            />
                          </div>
                          <p className="absolute top-0 right-0 hidden rounded-bl bg-black/50 p-1 text-white group-hover:block">
                            {bubble.kind}
                          </p>
                        </a>
                      ) : bubble.kind == 1 ? (
                        <p className="rounded border border-blue-300 p-1 px-1">
                          {bubble.content}
                        </p>
                      ) : (
                        <p className="px-2 text-sm text-gray-500">
                          {bubble.content}
                        </p>
                      )}
                    </div>

                    <p className="absolute right-0 bottom-0 mr-4 text-xs text-gray-500">
                      {bubble.formatted_created_at}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="col-span-2 bg-gray-100 md:row-span-6 lg:row-span-5 xl:row-span-4 2xl:row-span-4">
            Information/Statistics
          </div>
          <div className="col-span-2 bg-gray-100 md:row-span-6 lg:row-span-5 xl:row-span-4 2xl:row-span-4">
            Status Changes
          </div>
        </div>
      </div>
    </div>
  );
}

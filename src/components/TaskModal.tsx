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
      <div className="relative h-3/4 w-3/4 rounded bg-white p-6 shadow-lg">
        <div
          className="absolute top-0 right-0 left-0 flex justify-end rounded-tl rounded-tr"
          style={{ backgroundColor: status?.color || "white" }}
        >
          <button
            onClick={onClose}
            className="h-full rounded-tr px-2 py-1 text-gray-600 hover:cursor-pointer hover:border-l-1 hover:bg-red-600 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="grid h-full grid-cols-8 grid-rows-8 gap-2 pt-8">
          <div className="col-span-4 row-span-1 bg-gray-100">
            <p className="mx-4 mt-4 text-xl font-bold underline">
              {task?.name}
            </p>
            <p
              className="text-md mx-4 mt-2 italic"
              style={{ color: status?.color }}
            >
              {status?.name}
            </p>
          </div>
          <div className="relative col-span-4 row-span-3 bg-gray-100">
            <a
              className="hover:cursor-pointer"
              href={floorplan ? floorplan?.sheets[0].original_url : ""}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Image
                src={floorplan ? floorplan?.sheets[0].thumb_url : ""}
                alt="floorplan"
                fill={true}
                className="absolute rounded hover:ring-2 hover:ring-gray-400"
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
                className="translate-y-[-15px]"
                style={{
                  color: `${status ? status.color : "#000000"}`,
                  fill: `${status ? status.color : "#FFFFFF"}CC`,
                  stroke: "#000000",
                }}
              />
            </div>
          </div>
          <div className="col-span-4 row-span-8 overflow-auto bg-gray-100">
            {task?.bubbles.map((bubble) => (
              <div className="relative flex justify-between" key={bubble.id}>
                {[1, 2, 10, 11, 12, 13].includes(bubble.kind) && (
                  <>
                    <div className="mx-2 mt-2 rounded px-2 pt-2">
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
                          <Image
                            className="block"
                            src={bubble.thumb_url}
                            alt="fw_image"
                            width={300}
                            height={300}
                          />
                          <p className="absolute top-0 right-0 mx-1 mt-1 hidden bg-white px-1 pt-1 text-black opacity-40 group-hover:block">
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

          <div className="col-span-2 row-span-5 bg-gray-100">
            Information/Statistics
          </div>
          <div className="col-span-2 row-span-5 bg-gray-100">
            Status Changes
          </div>
        </div>
      </div>
    </div>
  );
}

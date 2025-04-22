"use client";
import { useEffect } from "react";
import Image from "next/image";
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
        <div className="grid h-full grid-cols-4 grid-rows-4 gap-2 pt-8">
          <div className="col-span-2 row-span-1 border border-red-500">
            {task?.name}
          </div>
          <div className="col-span-2 row-span-2 border border-blue-500">
            {floorplan?.name}
          </div>
          <div className="col-span-2 row-span-3 overflow-auto border border-green-500">
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

                    <p className="absolute right-0 bottom-0 text-xs text-gray-500">
                      {bubble.formatted_created_at}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="col-span-1 row-span-2 border border-pink-500">
            Information/Statistics
          </div>
          <div className="col-span-1 row-span-2 border border-gray-600">
            Status Changes
          </div>
        </div>
      </div>
    </div>
  );
}

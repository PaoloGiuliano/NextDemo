"use client";
import { Floorplan, Task, Status } from "../app/lib/types";
import { useEffect, useRef, useState } from "react";
import { MapPinIcon } from "@heroicons/react/16/solid";

type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  status: Status | null;
  floorplan: Floorplan | null;
  statuses: Status[];
};
function getContrastTextColor(hex: string): "black" | "white" {
  const color = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "black" : "white";
}
export default function TaskModal({
  isOpen,
  onClose,
  task,
  status,
  floorplan,
  statuses,
}: TaskModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageDivRef = useRef<HTMLDivElement | null>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [imageDivDimensions, setImageDivDimensions] = useState({
    width: 0,
    height: 0,
  });

  //close modal if mouse click outside of it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });
  useEffect(() => {
    const divObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setImageDivDimensions({ width, height });
      }
    });

    const divEl = imageDivRef.current;
    if (divEl) {
      divObserver.observe(divEl);
    }

    return () => {
      if (divEl) {
        divObserver.unobserve(divEl);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    const imgObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setImageDimensions({ width, height });
      }
    });

    const imgEl = imageRef.current;
    if (imgEl) {
      imgObserver.observe(imgEl);
    }

    return () => {
      if (imgEl) {
        imgObserver.unobserve(imgEl);
      }
    };
  }, [isOpen]);
  //close modal if Escape key pressed
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
  const posX = task?.pos_x || 0;
  const posY = task?.pos_y || 0;
  const a = (posX / imageWidth) * imageDimensions.width; // Height of the coords
  const b = (posY / imageHeight) * imageDimensions.height; // Width of the coords
  const c = (imageDivDimensions.width - imageDimensions.width) / 2; // Offset due to object-contain
  const d = (imageDivDimensions.height - imageDimensions.height) / 2; // Offset due to object-contain

  return (
    <div className="fixed inset-0 z-50 flex h-full flex-col items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="relative h-full w-full rounded bg-white p-6 shadow-lg md:h-3/4 md:w-3/4"
      >
        <div
          className="absolute top-0 right-0 left-0 z-50 flex justify-end rounded-tl rounded-tr"
          style={{ backgroundColor: status?.color || "white" }}
        >
          <p
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm italic"
            style={{ color: getContrastTextColor(status?.color || "#FFFFFF") }}
          >
            {status?.name}
          </p>
          <button
            onClick={onClose}
            className="z-50 h-full rounded-tr px-2 py-1 text-2xl text-gray-600 hover:cursor-pointer hover:border-l-1 hover:bg-red-600 hover:text-white md:text-sm"
          >
            ✕
          </button>
        </div>
        <div className="h-full overflow-x-hidden overflow-y-auto pt-8 md:grid md:grid-cols-8 md:grid-rows-8 md:gap-2">
          <div className="relative col-span-4 row-span-2 min-h-[20px] bg-gray-100 text-wrap lg:row-span-1">
            <p className="m-2 w-full p-2 text-center text-base font-bold underline md:absolute md:top-[50%] md:left-[50%] md:m-0 md:translate-x-[-50%] md:translate-y-[-50%] lg:text-2xl">
              {task?.name}
            </p>
          </div>
          <div
            ref={imageDivRef}
            className="group relative col-span-4 flex aspect-video h-auto w-full justify-center sm:row-span-1 md:row-span-2 md:aspect-auto md:h-full md:w-auto lg:row-span-3 xl:row-span-4 2xl:row-span-4"
          >
            <p className="absolute top-0 right-0 left-0 bg-black/80 p-1 text-center text-xs text-white group-hover:block md:hidden md:text-base">
              {floorplan?.description} - {floorplan?.name}
            </p>
            <a
              className="hover:cursor-pointer"
              href={floorplan ? floorplan?.sheets[0].original_url : undefined}
              rel="noopener noreferrer"
              target="_blank"
            >
              <img
                ref={imageRef}
                src={
                  floorplan
                    ? floorplan?.sheets[0].file_url
                    : "/Image-not-found.png"
                }
                alt="floorplan"
                className="max-h-full object-contain"
                style={{}}
              />
            </a>
            <div
              className="absolute z-10 h-4 w-4 translate-x-[-50%] translate-y-[-50%] rounded-2xl sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10"
              style={{
                transformOrigin: "top left",
                top: `${b + d}px`,
                left: `${a + c}px`,
              }}
            >
              <MapPinIcon
                className="translate-y-[-15px]"
                style={{
                  color: `${status ? status.color : "#000000"}`,
                  fill: `${status ? status.color : "#FFFFFF"}CC`,
                  stroke: "#000000",
                  opacity: !floorplan ? 0 : 100,
                }}
              />
            </div>
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
                          <div className="h-30 w-30 sm:h-40 sm:w-40 md:h-40 md:w-40 lg:h-50 lg:w-50 xl:h-70 xl:w-70">
                            <img
                              className="block"
                              src={bubble.thumb_url}
                              alt="fw_image"
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

          <div className="overflow-y-auto bg-gray-100 md:col-span-2 md:row-span-6 lg:row-span-5 xl:row-span-4 2xl:col-span-3 2xl:row-span-4">
            <h1 className="text-center text-sm underline xl:text-lg">
              Attributes
            </h1>
            {task?.man_power_value !== null && (
              <div className="flex justify-between px-2">
                <p>Man Power</p>
                <p>{task?.man_power_value}</p>
              </div>
            )}

            {task?.start_at !== null && (
              <div className="flex justify-between px-2">
                <p>Start At</p>
                <p>{task?.start_at}</p>
              </div>
            )}

            {task?.end_at !== null && (
              <div className="flex justify-between px-2">
                <p>End At</p>
                <p>{task?.end_at}</p>
              </div>
            )}

            {task?.due_date !== null && (
              <div className="flex justify-between px-2">
                <p>Due Date</p>
                <p>{task?.due_date}</p>
              </div>
            )}

            {task?.due_at !== null && (
              <div className="flex justify-between px-2">
                <p>Due At</p>
                <p>{task?.due_at}</p>
              </div>
            )}

            {task?.fixed_at !== null && (
              <div className="flex justify-between px-2">
                <p>Fixed At</p>
                <p>{task?.fixed_at}</p>
              </div>
            )}

            {task?.verified_at !== null && (
              <div className="flex justify-between px-2">
                <p>Verified At</p>
                <p>{task?.verified_at}</p>
              </div>
            )}
          </div>
          <div className="overflow-y-auto bg-gray-100 md:col-span-2 md:row-span-6 lg:row-span-5 xl:row-span-4 2xl:col-span-1 2xl:row-span-4">
            <h1 className="text-center text-sm underline xl:text-lg">
              Status Changes
            </h1>
            {task?.bubbles
              .filter((bubble) =>
                bubble.content ? bubble.content.includes("Changed status") : "",
              )
              .map((message) => (
                <p
                  className="pl-2 text-sm"
                  key={message.id}
                  style={{
                    color: `${statuses.find((status) => status.name === message.content.replace("Changed status to ", ""))?.color || "black"}`,
                  }}
                >
                  {message.content.replace("Changed status to", "→")}{" "}
                  {message.formatted_created_at.slice(0, 8)}
                </p>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

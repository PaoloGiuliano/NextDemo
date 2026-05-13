"use client";

import { Floorplan, Status, Task } from "../app/lib/types";
import { useEffect, useRef, useState } from "react";
import { MapPinIcon } from "@heroicons/react/16/solid";

type TaskModalProps = {
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
  onClose,
  task,
  status,
  floorplan,
  statuses,
}: TaskModalProps) {
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

  useEffect(() => {
    const divEl = imageDivRef.current;
    if (!divEl) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setImageDivDimensions({ width, height });
      }
    });
    observer.observe(divEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const imgEl = imageRef.current;
    if (!imgEl) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setImageDimensions({ width, height });
      }
    });
    observer.observe(imgEl);
    return () => observer.disconnect();
  }, []);

  const imageHeight = floorplan?.sheets?.[0]?.file_height || 0;
  const imageWidth = floorplan?.sheets?.[0]?.file_width || 0;
  const posX = task?.pos_x || 0;
  const posY = task?.pos_y || 0;

  const markerX =
    imageWidth > 0 ? (posX / imageWidth) * imageDimensions.width : 0;
  const markerY =
    imageHeight > 0 ? (posY / imageHeight) * imageDimensions.height : 0;
  const offsetX = (imageDivDimensions.width - imageDimensions.width) / 2;
  const offsetY = (imageDivDimensions.height - imageDimensions.height) / 2;

  const statusColor = status?.color || "#e5e7eb";
  const textColor = getContrastTextColor(statusColor);

  const statusChangeBubbles =
    task?.bubbles.filter((b) => b.content?.includes("Changed status")) ?? [];

  const hasAttributes =
    task?.man_power_value !== null ||
    task?.start_at ||
    task?.end_at ||
    task?.due_date ||
    task?.due_at ||
    task?.fixed_at ||
    task?.verified_at;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      {/* ── Header ── */}
      <header
        className="relative flex h-14 shrink-0 items-center justify-between px-4"
        style={{ backgroundColor: statusColor }}
      >
        {/* Left spacer keeps title centred */}
        <div className="w-16" />

        <h2
          className="truncate text-sm font-semibold italic sm:text-base"
          style={{ color: textColor }}
        >
          {task?.name || status?.name || "Task"}
        </h2>

        <button
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-md text-lg transition hover:bg-black/20"
          style={{ color: textColor }}
        >
          ✕
        </button>
      </header>

      {/* ── Body ── */}
      {/*
        Layout strategy:
          Mobile  : single column, sections stack vertically, each scrolls internally
          Desktop : two-column — left col holds floorplan + meta rows; right col is the activity feed
      */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 lg:flex-row lg:overflow-hidden lg:p-4">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-3 lg:min-h-0 lg:w-[55%]">
          {/* Floorplan */}
          <div
            ref={imageDivRef}
            className="relative flex min-h-48 flex-1 items-center justify-center overflow-hidden rounded-xl bg-gray-100 sm:min-h-64"
          >
            {/* Label bar */}
            {floorplan && (
              <p className="absolute inset-x-0 top-0 z-10 truncate bg-black/60 px-3 py-1.5 text-center text-xs text-white">
                {floorplan.description} — {floorplan.name}
              </p>
            )}

            <a
              href={floorplan?.sheets?.[0]?.original_url || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-full w-full items-center justify-center"
              tabIndex={floorplan ? 0 : -1}
            >
              <img
                ref={imageRef}
                src={floorplan?.sheets?.[0]?.file_url || "/Image-not-found.png"}
                alt="Floorplan"
                className="max-h-full max-w-full object-contain"
              />
            </a>

            {/* Map pin marker */}
            {floorplan && (
              <div
                className="pointer-events-none absolute z-20 h-8 w-8 -translate-x-1/2 -translate-y-1/2"
                style={{ top: markerY + offsetY, left: markerX + offsetX }}
              >
                <MapPinIcon
                  className="-translate-y-4"
                  style={{
                    color: statusColor,
                    fill: `${statusColor}CC`,
                    stroke: "#000",
                  }}
                />
              </div>
            )}
          </div>

          {/* Attributes + Status Changes side-by-side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Attributes */}
            <Section
              title="Attributes"
              empty={!hasAttributes}
              emptyText="No attributes"
            >
              <dl className="space-y-1.5">
                {task?.man_power_value !== null && (
                  <AttributeRow
                    label="Man Power"
                    value={task?.man_power_value}
                  />
                )}
                {task?.start_at && (
                  <AttributeRow label="Start" value={task.start_at} />
                )}
                {task?.end_at && (
                  <AttributeRow label="End" value={task.end_at} />
                )}
                {task?.due_date && (
                  <AttributeRow label="Due Date" value={task.due_date} />
                )}
                {task?.due_at && (
                  <AttributeRow label="Due At" value={task.due_at} />
                )}
                {task?.fixed_at && (
                  <AttributeRow label="Fixed At" value={task.fixed_at} />
                )}
                {task?.verified_at && (
                  <AttributeRow label="Verified At" value={task.verified_at} />
                )}
              </dl>
            </Section>

            {/* Status history */}
            <Section
              title="Status Changes"
              empty={statusChangeBubbles.length === 0}
              emptyText="No changes yet"
            >
              <ul className="space-y-1.5">
                {statusChangeBubbles.map((message) => {
                  const name = message.content.replace(
                    "Changed status to ",
                    "",
                  );
                  const match = statuses.find((s) => s.name === name);
                  return (
                    <li
                      key={message.id}
                      className="flex items-baseline gap-1 text-sm"
                    >
                      <span
                        className="shrink-0 font-medium"
                        style={{ color: match?.color || "currentColor" }}
                      >
                        → {name}
                      </span>
                      <span className="truncate text-xs text-gray-400">
                        ({message.formatted_created_at.slice(0, 8)})
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Section>
          </div>
        </div>

        {/* ── Right column — Activity feed ── */}
        <Section
          title="Activity"
          className="lg:min-h-0 lg:w-[45%] lg:overflow-y-auto"
          empty={!task?.bubbles.length}
          emptyText="No activity yet"
        >
          <ul className="space-y-4">
            {task?.bubbles.map((bubble) => {
              if (![1, 2, 10, 11, 12, 13].includes(bubble.kind)) return null;

              return (
                <li key={bubble.id} className="flex flex-col gap-1">
                  {[11, 12, 13].includes(bubble.kind) ? (
                    <a
                      href={bubble.flattened_file_url || bubble.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block w-fit"
                    >
                      <img
                        src={bubble.thumb_url}
                        alt="Attachment"
                        className="h-28 w-28 rounded-lg object-cover shadow transition group-hover:brightness-90 sm:h-36 sm:w-36"
                      />
                      <span className="absolute top-0 right-0 rounded-bl bg-black/60 px-1.5 py-0.5 text-xs text-white">
                        {bubble.kind}
                      </span>
                    </a>
                  ) : bubble.kind === 1 ? (
                    <p className="max-w-[85%] rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm shadow-sm">
                      {bubble.content}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 italic">
                      {bubble.content}
                    </p>
                  )}
                  <time className="text-xs text-gray-400">
                    {bubble.formatted_created_at}
                  </time>
                </li>
              );
            })}
          </ul>
        </Section>
      </div>
    </div>
  );
}

/* ── Reusable section card ── */
type SectionProps = {
  title: string;
  children?: React.ReactNode;
  className?: string;
  empty?: boolean;
  emptyText?: string;
};

function Section({
  title,
  children,
  className = "",
  empty,
  emptyText,
}: SectionProps) {
  return (
    <section
      className={`flex flex-col gap-2 rounded-xl bg-gray-50 p-3 ring-1 ring-gray-200 ${className}`}
    >
      <h2 className="shrink-0 border-b border-gray-200 pb-1.5 text-center text-sm font-semibold text-gray-700">
        {title}
      </h2>
      {empty ? (
        <p className="py-2 text-center text-xs text-gray-400">{emptyText}</p>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      )}
    </section>
  );
}

/* ── Attribute row ── */
type AttributeRowProps = {
  label: string;
  value: string | number | null | undefined;
};

function AttributeRow({ label, value }: AttributeRowProps) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-gray-200 pb-1 text-sm last:border-0 last:pb-0">
      <dt className="font-medium text-gray-600">{label}</dt>
      <dd className="text-right text-gray-800">{value}</dd>
    </div>
  );
}

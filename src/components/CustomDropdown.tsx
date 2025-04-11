"use client";
import { useState } from "react";

type DropdownObject = {
  id: string;
  name: string;
  color?: string;
};

type Props<T extends DropdownObject | string | number> = {
  items: T[];
  selected: T | null;
  setSelected: (item: T | null) => void;
  title?: string;
  placeholder?: string;
  className?: string;
};

export default function CustomDropdown<
  T extends DropdownObject | string | number
>({
  items,
  selected,
  setSelected,
  title = "custom dropdown",
  placeholder = "Select an item",
  className = "",
}: Props<T>) {
  const [open, setOpen] = useState(false);

  const getDisplayName = (item: T): string => {
    if (typeof item === "string" || typeof item === "number") {
      return item.toString();
    } else {
      return item.name.toUpperCase();
    }
  };

  const getItemKey = (item: T): string => {
    if (typeof item === "string" || typeof item === "number") {
      return item.toString();
    } else {
      return item.id;
    }
  };

  const getItemColor = (item: T): string | undefined => {
    return typeof item === "object" ? item.color : undefined;
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <p>{title}</p>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="border px-4 py-2 rounded text-left bg-white"
      >
        {selected ? getDisplayName(selected) + " ⤵ " : placeholder + " ⤵ "}
      </button>

      {open && (
        <ul className="absolute mt-1 min-w-full whitespace-nowrap border rounded bg-white shadow z-10 max-h-60 overflow-auto">
          {items.map((item) => (
            <li
              key={getItemKey(item)}
              onClick={() => {
                setSelected(item);
                setOpen(false);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              style={{ color: getItemColor(item) }}
            >
              {getDisplayName(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

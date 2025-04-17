"use client";
import { useState, useRef, useEffect } from "react";

type DropdownObject = {
  id: string;
  name: string;
  color?: string;
  description?: string; // Added optional description field
};

type Props<T extends DropdownObject | string | number> = {
  items: T[];
  selected: T | null;
  setSelected: (item: T) => void;
  title?: string;
  placeholder?: string;
  className?: string;
};

export default function CustomDropdown<
  T extends DropdownObject | string | number,
>({
  items,
  selected,
  setSelected,
  title = "custom dropdown",
  placeholder = "Select an item",
  className = "",
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const getItemDescription = (item: T): string | undefined => {
    if (typeof item === "object" && "description" in item) {
      return item.description;
    }
    return undefined; // No description for strings/numbers by default
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <p>{title}</p>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="rounded border border-gray-300 bg-white px-4 py-2 text-left hover:cursor-pointer"
      >
        {selected ? getDisplayName(selected) + " ⤵ " : placeholder + " ⤵ "}
      </button>

      {open && (
        <ul className="absolute z-10 mt-1 max-h-60 min-w-full overflow-auto rounded border border-gray-300 bg-white whitespace-nowrap shadow">
          {items.map((item) => (
            <li
              key={getItemKey(item)}
              onClick={() => {
                setSelected(item);
                setOpen(false);
              }}
              className="cursor-pointer px-4 py-2 hover:bg-gray-100"
              style={{ color: getItemColor(item) }}
            >
              <div>
                <div>{getDisplayName(item)}</div>
                {getItemDescription(item) && (
                  <div className="text-xs text-gray-500">
                    {getItemDescription(item)}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

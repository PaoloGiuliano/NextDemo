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
        className="border border-gray-300 px-4 py-2 rounded text-left bg-white hover:cursor-pointer"
      >
        {selected ? getDisplayName(selected) + " ⤵ " : placeholder + " ⤵ "}
      </button>

      {open && (
        <ul className="absolute mt-1 min-w-full whitespace-nowrap border border-gray-300 rounded bg-white shadow z-10 max-h-60 overflow-auto">
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

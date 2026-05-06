"use client";

import {
  Select,
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  SelectValue,
  Label,
} from "react-aria-components";

type DropdownItem = {
  id: string;
  label: string;
  description?: string;
  color?: string;
  count?: number;
};

type Props = {
  items: DropdownItem[];
  selected: DropdownItem | null;
  setSelected: (item: DropdownItem) => void;
  title?: string;
  placeholder?: string;
  className?: string;
};

export default function CustomDropdown({
  items,
  selected,
  setSelected,
  title = "custom dropdown",
  placeholder = "Select an item",
  className = "",
}: Props) {
  return (
    <Select
      selectedKey={selected?.id ?? null}
      onSelectionChange={(key) => {
        const found = items.find((i) => i.id === String(key));
        if (found) setSelected(found);
      }}
      className={`inline-flex flex-col gap-1 ${className}`}
    >
      {/* Label */}
      {title && <Label className="text-sm text-gray-700">{title}</Label>}

      {/* Trigger */}
      <Button className="flex items-center justify-between gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-left">
        <SelectValue>{selected ? selected.label : placeholder}</SelectValue>
        <span aria-hidden>⤵</span>
      </Button>

      {/* Dropdown */}
      <Popover className="min-w-[180px]">
        <ListBox className="max-h-60 overflow-auto rounded border border-gray-300 bg-white shadow">
          {items.map((item) => (
            <ListBoxItem
              key={item.id}
              id={item.id}
              textValue={item.label}
              style={{ color: item.color }}
              className={({ isFocused, isSelected }) =>
                [
                  "cursor-pointer px-4 py-2",
                  isFocused ? "bg-gray-100" : "",
                  isSelected ? "font-semibold" : "",
                ].join(" ")
              }
            >
              <div>
                <div>{item.label}</div>

                {(item.description || item.count != null) && (
                  <div className="text-xs text-gray-500">
                    {item.description}
                    {item.description && item.count != null ? " - " : ""}
                    {item.count ?? ""}
                  </div>
                )}
              </div>
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </Select>
  );
}

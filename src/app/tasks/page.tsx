"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
}

interface Floorplan {
  id: string;
  name: string;
  description: string;
}
interface Status {
  id: string;
  name: string;
  color: string;
}

export default function Tasks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [floorplans, setFloorplans] = useState<Floorplan[]>([]);
  const [selectedFloorplan, setSelectedFloorplan] = useState<Floorplan | null>(
    null
  );
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);

  const fetchProjects = async (access_token: string | null) => {
    console.time("Fetch Projects from Page.tsx");
    try {
      const url = `/api/projects?access_token=${access_token}}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch projects");

      const projects = await response.json();
      setProjects(projects);

      // Set the first project as the default selected project if available
      if (projects.length > 0) {
        setSelectedProject(projects[0]); // Set the first project as selected by default
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    }

    console.timeEnd("Fetch Projects from Page.tsx");
  };

  const handleFloorplanSelect = (floorplan: Floorplan) => {
    setSelectedFloorplan(floorplan); // Update the selected project ID
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project); // Update the selected floorplan ID
  };
  const handleStatusSelect = (status: Status) => {
    setSelectedStatus(status); // Update the selected status ID
  };
  const fetchFloorplans = async (
    project: Project | null,
    access_token: string | null
  ) => {
    try {
      console.time("Fetch Floorplans from Page.tsx");
      const url = `/api/projects/${project?.id}/floorplans?access_token=${access_token}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch floorplans");
      const floorplans = await response.json();
      setFloorplans(floorplans);
    } catch (error) {
      console.error("Error fetching floorplans:", error);
      setFloorplans([]);
    }
    console.timeEnd("Fetch Floorplans from Page.tsx");
  };
  const fetchStatuses = async (
    project: Project | null,
    access_token: string | null
  ) => {
    try {
      console.time("Fetch Statuses from Page.tsx");
      const url = `/api/projects/${project?.id}/statuses?access_token=${access_token}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch statuses");
      const statuses = await response.json();
      setStatuses(statuses);
    } catch (error) {
      console.error("Error fetching floorplans:", error);
      setStatuses([]);
    }
    console.timeEnd("Fetch Statuses from Page.tsx");
  };

  useEffect(() => {
    fetchProjects(localStorage.getItem("Fieldwire_Access_Token")); // Fetch projects when the component mounts
  }, []);

  // Waiting for selectedProject to exist before fetching Floorplans
  useEffect(() => {
    if (selectedProject) {
      fetchFloorplans(
        selectedProject,
        localStorage.getItem("Fieldwire_Access_Token")
      );
      fetchStatuses(
        selectedProject,
        localStorage.getItem("Fieldwire_Access_Token")
      );
    }
  }, [selectedProject]);

  return (
    <div className="w-[calc(100vw-18px)]">
      {/* Dropdown Component */}
      <Menu as="div" className="p-5 w-full relative text-left">
        <div>
          <MenuButton className="p-5 hover:cursor-pointer order-blue-500 inline-flex justify-center gap-x-1.5 rounded-md bg-white py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50">
            {selectedProject?.name.toUpperCase()}
            <ChevronDownIcon
              aria-hidden="true"
              className="-mr-1 size-5 text-gray-400"
            />
          </MenuButton>
        </div>

        <MenuItems
          transition
          className="absolute left-0 z-10 mt-2 w-[50%] border min-w-full origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
        >
          <div className="py-1">
            {projects ? (
              projects.map((project) => (
                <MenuItem key={project.id}>
                  <a
                    href="#"
                    onClick={() => handleProjectSelect(project)} // Call the handler on select
                    className={`block py-2 text-sm text-gray-700 ${
                      selectedProject?.id === project.id
                        ? "bg-gray-100 text-gray-900" // Highlight the selected project
                        : "hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {project.name.toUpperCase()}
                  </a>
                </MenuItem>
              ))
            ) : (
              <div>No projects available</div>
            )}
          </div>
        </MenuItems>
      </Menu>
      {/* Dropdown Component for Floorplans */}
      <Menu as="div" className="p-5 w-full relative text-left">
        <div>
          <MenuButton className="hover:cursor-pointer inline-flex justify-center gap-x-1.5 rounded-md bg-white py-2 px-5 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 shadow-xs hover:bg-gray-50">
            {selectedFloorplan?.name ? (
              selectedFloorplan.name // Show selected floorplan name
            ) : (
              <span className="text-gray-400">Select a floorplan</span> // Placeholder text
            )}
            <ChevronDownIcon
              aria-hidden="true"
              className="-mr-1 size-5 text-gray-400"
            />
          </MenuButton>
          {selectedFloorplan && (
            <button
              onClick={() => {
                setSelectedFloorplan(null);
              }}
              className="inline-flex justify-center items-center gap-x-1.5 rounded-md bg-white py-2 px-5 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 shadow-xs hover:bg-gray-50 border border-red-500 cursor-pointer m-2"
            >
              X
            </button>
          )}
        </div>
        <MenuItems
          transition
          className="m-5 absolute left-0 z-10 mt-2 w-[50%] max-h-60 overflow-y-auto origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
        >
          <div className="py-1">
            {floorplans ? (
              floorplans.map((floorplan) => (
                <MenuItem key={floorplan.id}>
                  <a
                    href="#"
                    onClick={() => handleFloorplanSelect(floorplan)}
                    className={`block px-5 py-2 text-sm text-gray-700 ${
                      selectedFloorplan?.id === floorplan.id
                        ? "bg-gray-100 text-gray-900"
                        : "hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {floorplan.name} - {floorplan.description}
                  </a>
                </MenuItem>
              ))
            ) : (
              <div>No floorplans available</div>
            )}
          </div>
        </MenuItems>
        {/* Dropdown Component for Status */}
        <Menu as="div" className="p-5 w-full relative text-left">
          <div>
            <MenuButton className="hover:cursor-pointer inline-flex justify-center gap-x-1.5 rounded-md bg-white py-2 px-5 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 shadow-xs hover:bg-gray-50">
              {selectedStatus?.name ? (
                selectedStatus.name.toUpperCase() // Show selected status name
              ) : (
                <span className="text-gray-400">Select a status</span> // Placeholder text
              )}
              <ChevronDownIcon
                aria-hidden="true"
                className="-mr-1 size-5 text-gray-400"
              />
            </MenuButton>
            {selectedStatus && (
              <button
                onClick={() => {
                  setSelectedStatus(null);
                }}
                className="inline-flex justify-center items-center gap-x-1.5 rounded-md bg-white py-2 px-5 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 shadow-xs hover:bg-gray-50 border border-red-500 cursor-pointer m-2"
              >
                X
              </button>
            )}
          </div>
          <MenuItems
            transition
            className="m-5 absolute left-0 z-10 mt-2 w-[50%] max-h-60 overflow-y-auto origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
          >
            <div className="py-1">
              {statuses ? (
                statuses.map((status) => (
                  <MenuItem key={status.id}>
                    <a
                      style={{ color: status.color }} // set button color same as corresponding status color
                      href="#"
                      onClick={() => handleStatusSelect(status)}
                      className={`block px-5 py-2 text-sm ${
                        selectedStatus?.id === status.id
                          ? "bg-gray-100 text-gray-900"
                          : "hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {status.name.toUpperCase()}
                    </a>
                  </MenuItem>
                ))
              ) : (
                <div>No statuses available</div>
              )}
            </div>
          </MenuItems>
        </Menu>
      </Menu>
    </div>
  );
}

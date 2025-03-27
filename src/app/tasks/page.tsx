"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import TaskInfo from "@/components/TaskInfo";

interface Project {
  id: string;
  name: string;
}

interface Floorplan {
  id: string;
  name: string;
  description: string;
}

export default function Tasks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [floorplans, setFloorplans] = useState<Floorplan[]>([]);
  const [selectedFloorplan, setSelectedFloorplan] = useState<Floorplan | null>(
    null
  );

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
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
  };

  const handleFloorplanSelect = (floorplan: Floorplan) => {
    setSelectedFloorplan(floorplan); // Update the selected project ID
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project); // Update the selected floorplan ID
  };

  const fetchFloorplans = async (project: Project | null) => {
    try {
      console.log(`attempting to fetch floorplans ${project?.id}`);
      const response = await fetch(`/api/projects/${project?.id}/floorplans`);
      if (!response.ok) throw new Error("Failed to fetch floorplans");
      console.log(response);
      const floorplans = await response.json();
      setFloorplans(floorplans);
    } catch (error) {
      console.error("Error fetching floorplans:", error);
      setFloorplans([]);
    }
  };

  useEffect(() => {
    fetchProjects(); // Fetch projects when the component mounts
  }, []);
  // Waiting for selectedProject to exist before fetching Floorplans
  useEffect(() => {
    if (selectedProject) {
      console.log(selectedProject.id);
      fetchFloorplans(selectedProject);
    }
  }, [selectedProject]);

  return (
    <div className="w-[calc(100vw-18px)] border border-red-500">
      {/* Dropdown Component */}
      <Menu as="div" className="p-5 w-full relative text-left">
        <div>
          <MenuButton className="p-5 order-blue-500 inline-flex justify-center gap-x-1.5 rounded-md bg-white py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50">
            {selectedProject?.name}
            <ChevronDownIcon
              aria-hidden="true"
              className="-mr-1 size-5 text-gray-400"
            />
          </MenuButton>
        </div>

        <MenuItems
          transition
          className="absolute left-0 z-10 mt-2 w-[50%] border border-pink-500 min-w-full origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
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
                    {project.name}
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
          <MenuButton className="inline-flex justify-center gap-x-1.5 rounded-md bg-white py-2 px-5 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 shadow-xs hover:bg-gray-50">
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
      </Menu>

      <TaskInfo
        projectId={selectedProject?.id}
        floorplanId={selectedFloorplan?.id}
      />

      {/* Display the selected project ID */}
      <div></div>
    </div>
  );
}

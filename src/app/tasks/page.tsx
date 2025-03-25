"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import TaskInfo from "@/components/TaskInfo";

interface Project {
  id: string;
  name: string;
}

export default function Tasks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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

  useEffect(() => {
    fetchProjects(); // Fetch projects when the component mounts
  }, []);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project); // Update the selected project ID
  };

  return (
    <div>
      <h1>Projects</h1>
      {/* Dropdown Component */}
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50">
            {selectedProject?.name}
            <ChevronDownIcon
              aria-hidden="true"
              className="-mr-1 size-5 text-gray-400"
            />
          </MenuButton>
        </div>

        <MenuItems
          transition
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
        >
          <div className="py-1">
            {projects ? (
              projects.map((project) => (
                <MenuItem key={project.id}>
                  <a
                    href="#"
                    onClick={() => handleProjectSelect(project)} // Call the handler on select
                    className={`block px-4 py-2 text-sm text-gray-700 ${
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
      <TaskInfo projectId={selectedProject?.id} />

      {/* Display the selected project ID */}
      <div></div>
    </div>
  );
}

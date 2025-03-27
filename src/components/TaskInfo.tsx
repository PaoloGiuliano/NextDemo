import { useEffect, useState } from "react";
import Image from "next/image"; // Import Image component from next/image

interface TaskProps {
  projectId: string | undefined;
  floorplanId: string | undefined;
}

interface Bubble {
  id: string;
  content: string;
  thumb_url: string;
  original_url: string;
  flattened_file_url: string;
  kind: number;
  created_at: string;
}

interface Task {
  id: string;
  name: string;
  bubbles?: Bubble[];
}

const TaskInfo: React.FC<TaskProps> = ({ projectId, floorplanId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  const fetchTasks = async () => {
    if (!projectId) return;

    setLoading(true); // Set loading to true when fetching
    setError(null); // Reset error state

    try {
      const response = await fetch(
        `/api/projects/${projectId}/tasks?floorplanId=${
          floorplanId ? floorplanId : "not_selected"
        }&statusId=not_selected`
      );
      if (!response.ok) throw new Error("Failed to fetch tasks");

      const tasks = await response.json();
      setTasks(tasks.map((task: Task) => ({ ...task, bubbles: [] })));
    } catch (error) {
      setError("Error fetching tasks.");
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false); // Set loading to false after fetch
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, floorplanId]);

  const fetchTaskBubble = async (taskId: string) => {
    if (!projectId) return;

    try {
      const response = await fetch(
        `/api/projects/${projectId}/tasks/${taskId}/bubbles`
      );
      if (!response.ok) throw new Error("Failed to fetch bubbles");

      const bubbles = await response.json();

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, bubbles } : task
        )
      );
    } catch (error) {
      console.error("Error fetching task bubbles:", error);
    }
  };

  return (
    <div className="border border-cyan-500 bg-gray-900 rounded-lg shadow-md text-white p-4">
      <h2 className="text-2xl font-semibold mb-4">Tasks</h2>

      {/* Show loading spinner when tasks are being fetched */}
      {loading && <p className="text-gray-400">Loading tasks...</p>}

      {/* Show error message if there was an error fetching tasks */}
      {error && <p className="text-red-500">{error}</p>}

      {tasks.length > 0 ? (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task.id} className="bg-gray-800 rounded-lg shadow p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">{task.name}</span>
                <button
                  onClick={() => fetchTaskBubble(task.id)}
                  className="py-1 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
                >
                  See Bubble
                </button>
              </div>

              {/* ✅ Show only the bubbles for this specific task */}
              {task.bubbles && task.bubbles.length > 0 && (
                <div className="mt-2">
                  {/* Display messages (TEXT & LOG) */}
                  <div className="space-y-2">
                    {task.bubbles
                      .filter(
                        (bubble) => bubble.kind === 1 || bubble.kind === 2
                      ) // TEXT or LOG
                      .map((bubble) => (
                        <p
                          key={bubble.id}
                          className={`rounded p-2 ${
                            bubble.kind === 1
                              ? "bg-gray-700 text-gray-300"
                              : "bg-black text-green-400 font-mono border border-gray-700"
                          }`}
                        >
                          {bubble.content}
                          <br />
                          {bubble.created_at}
                        </p>
                      ))}
                  </div>

                  {/* Display images in a 6-column grid */}
                  <div className="mt-4 grid grid-cols-6 gap-2">
                    {task.bubbles
                      .filter((bubble) => bubble.kind === 11) // PHOTO WITH ANNOTATIONS
                      .map((bubble) => (
                        <a
                          key={bubble.id}
                          href={bubble.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Image
                            src={bubble.thumb_url}
                            alt="Bubble Image"
                            width={48} // Specify width and height for Image component
                            height={48}
                            className="object-cover rounded"
                          />
                        </a>
                      ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No tasks found.</p>
      )}
    </div>
  );
};

export default TaskInfo;

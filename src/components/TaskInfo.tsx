import { useEffect, useState } from "react";
import Image from "next/image"; // Import Image component from next/image

interface TaskProps {
  projectId: string | undefined;
  floorplanId: string | undefined;
  statusId: string | undefined;
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

const TaskInfo: React.FC<TaskProps> = ({
  projectId,
  floorplanId,
  statusId,
}) => {
  // Initalized use state variables
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [pageSync, setPageSync] = useState<string[]>([]);
  const [pageNum, setPageNum] = useState<number>(0); // 0 is technically page 1 due to using arrays
  const [hasMorePages, setHasMorePages] = useState<boolean>(true);

  const fetchTasks = async (access_token: string | null) => {
    if (!projectId) return;

    setLoading(true); // Set loading to true when fetching
    setError(null); // Reset error state

    try {
      if (pageNum < 0) setPageNum(0);
      console.log(pageSync[pageNum - 1]);
      console.log(hasMorePages);
      const response = await fetch(
        `/api/projects/${projectId}/tasks?access_token=${access_token}&floorplanId=${
          floorplanId ? floorplanId : ""
        }&statusId=${statusId ? statusId : ""}&last_synced_at=${
          pageSync && pageNum <= 0 ? "" : pageSync[pageNum - 1]
        }`
      );
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      const tasks = data.data;
      const xLastSync = response.headers.get("last-synced");
      const xHasMore = response.headers.get("has-more");
      if (xHasMore != null) setHasMorePages(xHasMore == "true" ? true : false);
      if (xLastSync && !pageSync.includes(xLastSync))
        setPageSync([...pageSync, xLastSync]);
      setTasks(tasks.map((task: Task) => ({ ...task, bubbles: [] })));
    } catch (error) {
      setError("Error fetching tasks.");
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false); // Set loading to false after fetch
    }
  };
  const fetchTaskBubble = async (
    taskId: string,
    access_token: string | null
  ) => {
    if (!projectId) return;

    try {
      const response = await fetch(
        `/api/projects/${projectId}/tasks/${taskId}/bubbles?access_token=${access_token}`
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

  useEffect(() => {
    accessTokenHandler(); //make sure access token is valid and updated in localstorage
    fetchTasks(localStorage.getItem("Fieldwire_Access_Token"));
  }, [pageNum, projectId, floorplanId, statusId]);

  //handle token existence and validity checking
  const accessTokenHandler = async () => {
    const token = localStorage.getItem("Fieldwire_Access_Token");
    let isExpired = null;
    if (token) isExpired = isTokenExpired(token); //if token exists return if token is valid or not
    if (isExpired === null) {
      console.log("Token is Invalid");
      const { access_token } = await fetchAccessToken();
      localStorage.setItem("Fieldwire_Access_Token", access_token); //token expired settings new one in local storagec
    } else if (isExpired) {
      console.log("Token is Expired");
      const { access_token } = await fetchAccessToken();
      localStorage.setItem("Fieldwire_Access_Token", access_token); //token expired settings new one in local storagec
    } else {
      console.log("Token is Valid.");
    }
  };
  const isTokenExpired = (token: string): boolean | null => {
    try {
      // Split the token and decode the payload
      const [_, payloadBase64] = token.split(".");
      const payloadJson = atob(
        payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
      );
      const payload = JSON.parse(payloadJson);

      // Extract the 'exp' field (Unix timestamp in seconds)
      const expTimestamp = payload.exp;
      if (!expTimestamp || typeof expTimestamp !== "number") {
        throw new Error("Expiration timestamp not found or invalid");
      }

      // Convert to Date object (milliseconds = seconds * 1000)
      const expirationDate = new Date(expTimestamp * 1000);
      const currentDate = new Date(); // Current date and time

      // Compare dates
      return expirationDate < currentDate; // True if expired, false if still valid
    } catch (error) {
      console.error("Failed to decode JWT or check expiration:", error);
      return null; // Return null if token is invalid or decoding fails
    }
  };

  const fetchAccessToken = async () => {
    try {
      const response = await fetch("/api/auth", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to fetch access token");
      }
      const accessToken = await response.json();
      return accessToken;
    } catch (error) {
      console.error("cant fetch token", error);
      throw error; // Or handle differently based on your needs
    }
  };
  const navigatePage = (direction: string) => {
    switch (direction) {
      case "next":
        setPageNum(pageNum + 1);
        break;
      case "back":
        setPageNum(pageNum - 1);
        break;
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
                  onClick={() =>
                    fetchTaskBubble(
                      task.id,
                      localStorage.getItem("Fieldwire_Access_Token")
                    )
                  }
                  className="py-1 bg-blue-600 text-white rounded hover:bg-blue-500 hover:cursor-pointer transition"
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
      <div className="flex justify-center items-center flex-row">
        <button
          disabled={pageNum < 1}
          className="m-6 p-2 border bg-grey-400 rounded-2xl hover:cursor-pointer disabled:opacity-50"
          onClick={() => {
            navigatePage("back");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-12 fill-emerald-600"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-4.28 9.22a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.06-1.06l-1.72-1.72h5.69a.75.75 0 0 0 0-1.5h-5.69l1.72-1.72a.75.75 0 0 0-1.06-1.06l-3 3Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <p className="m-6 p-2">Page {pageNum + 1}</p>
        <p>{pageSync[pageNum]}</p>

        <button
          disabled={!hasMorePages}
          className="m-6 p-2 border bg-grey-400 rounded-2xl hover:cursor-pointer disabled:opacity-50"
          onClick={() => {
            navigatePage("next");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-12 fill-emerald-600"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm4.28 10.28a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 1 0-1.06 1.06l1.72 1.72H8.25a.75.75 0 0 0 0 1.5h5.69l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TaskInfo;

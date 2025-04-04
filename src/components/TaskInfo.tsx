import { pages } from "next/dist/build/templates/app-page";
import { useEffect, useRef, useState } from "react";

interface TaskProps {
  projectId: string | undefined;
  floorplanId: string | undefined;
  statusId: string | undefined;
}

interface Bubble {
  id: string;
  task_id: string;
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

interface Status {
  id: string;
  name: string;
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
  const [pageSync, setPageSync] = useState<string[]>([""]);
  const [pageNum, setPageNum] = useState<number>(0); // 0 is technically page 1 due to using arrays
  const [hasMorePages, setHasMorePages] = useState<boolean>(true);
  const [allBubbles, setAllBubbles] = useState<Bubble[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const testArray = [
    "",
    "2024-06-19T14:51:11.592877Z",
    "2024-07-09T14:20:39.031338Z",
    "2024-08-07T03:09:02.509202Z",
  ];
  const prevState = useRef({ pageNum, projectId, statusId, floorplanId });

  const fetchStatuses = async (
    access_token: string | null,
    projectId: string | undefined
  ) => {
    if (!projectId) return;
    try {
      console.time("Fetch Statuses");
      const response = await fetch(
        `/api/projects/${projectId}/statuses?access_token=${access_token}`
      );
      const statuses = await response.json();
      setStatuses(statuses);
      console.timeEnd("Fetch Statuses");
    } catch (error) {
      console.error("Error fetching statuses", error);
    }
  };
  const fetchAllBubbles = async (access_token: string | null) => {
    if (!projectId) return;
    try {
      console.time("Fetch All Bubbles");
      const response = await fetch(
        `/api/projects/${projectId}/bubbles?access_token=${access_token}`
      );
      const allBubbles = await response.json();
      setAllBubbles(allBubbles);
      console.timeEnd("Fetch All Bubbles");
    } catch (error) {
      console.error("Failed to Fetch All Bubbles", error);
    }
  };
  // FETCH TASKS -----------------------------------------------------------------------
  const fetchTasks = async (access_token: string | null) => {
    if (!projectId) return;

    setLoading(true); // Set loading to true when fetching
    setError(null); // Reset error state

    try {
      console.time("Fetch Tasks All Inclusive from TaskList.tsx");
      if (pageNum < 0) setPageNum(0);
      console.time("Just Task Fetch from TaskList.tsx");
      const response = await fetch(
        `/api/projects/${projectId}/tasks?access_token=${access_token}&floorplanId=${
          floorplanId ? floorplanId : ""
        }&statusId=${statusId ? statusId : ""}&last_synced_at=${
          pageSync[pageNum]
        }`
      );
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      console.timeEnd("Just Task Fetch from TaskList.tsx");
      const tasks = data.data;
      const xLastSync = response.headers.get("last-synced");
      const xHasMore = response.headers.get("has-more");
      if (xHasMore != null) setHasMorePages(xHasMore == "true" ? true : false);
      if (xLastSync && !pageSync.includes(xLastSync)) {
        setPageSync([...pageSync, xLastSync]);
      }

      setTasks(tasks);
    } catch (error) {
      setError("Error fetching tasks.");
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false); // Set loading to false after fetch
    }
    console.timeEnd("Fetch Tasks All Inclusive from TaskList.tsx");
  };
  const attachBubblesToTasks = () => {
    const tasksNoBubbles = tasks;
    const bubbles = allBubbles;
    console.log(bubbles.length);
    console.log(
      bubbles.filter(
        (bubble) => bubble.task_id == "8424b307-260d-4102-a442-6823483a6a20"
      )
    );
    const updatedTasks = tasksNoBubbles.map((task) => ({
      ...task,
      bubbles: bubbles.filter((bubble) => task.id === bubble.task_id),
    }));
    setTasks(updatedTasks);
  };

  const accessTokenHandler = async () => {
    const token = localStorage.getItem("Fieldwire_Access_Token");
    const isExpired = token ? isTokenExpired(token) : null;

    if (isExpired === null || isExpired) {
      console.log(isExpired === null ? "Token is Invalid" : "Token is Expired");
      const { access_token } = await fetchAccessToken();
      localStorage.setItem("Fieldwire_Access_Token", access_token);
      return access_token;
    }
    console.log("Token is Valid.");
    return token;
  };

  const isTokenExpired = (token: string): boolean | null => {
    try {
      const [_, payloadBase64] = token.split(".");
      const payloadJson = atob(
        payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
      );
      const payload = JSON.parse(payloadJson);
      const expTimestamp = payload.exp;
      if (!expTimestamp || typeof expTimestamp !== "number") {
        throw new Error("Expiration timestamp not found or invalid");
      }
      const expirationDate = new Date(expTimestamp * 1000);
      return expirationDate < new Date();
    } catch (error) {
      console.error("Failed to decode JWT or check expiration:", error);
      return null;
    }
  };

  const fetchAccessToken = async () => {
    try {
      const response = await fetch("/api/auth", { method: "POST" });
      if (!response.ok) throw new Error("Failed to fetch access token");
      return await response.json();
    } catch (error) {
      console.error("Cant fetch token:", error);
      throw error;
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
  // useEffect(() => {
  //   attachBubblesToTasks();
  // }, [allBubbles]);

  // useEffect(() => {
  //   setPageNum(0);
  // }, [floorplanId, statusId]);
  useEffect(() => {
    setPageSync([""]);
    console.log(pageNum);
    console.log(pageSync);
  }, [projectId]);
  useEffect(() => {
    const token = localStorage.getItem("Fieldwire_Access_Token");
    if (prevState.current.pageNum !== pageNum) {
      // DO THINGS WHEN PAGENUM CHANGES
    }
    if (prevState.current.projectId !== projectId) {
      // DO THINGS WHEN PROJECTID CHANGES
      // fetchStatuses(token, projectId);
      // setPageSync([""]);
      // setPageNum(0);
      // console.log("---------page sync start---------------");
      // console.log(pageSync);
      // console.log("--------------page sync end--------------");
    }
    if (prevState.current.floorplanId !== floorplanId) {
      // DO THINGS WHEN FLOORPLANID CHANGES
      setPageNum(0);
    }
    if (prevState.current.statusId !== statusId) {
      // DO THINGS WHEN STATUSID CHANGES
      setPageNum(0);
    }
    // DO THINGS FOR ANY OF THESE CHANGES
    fetchTasks(token);
    accessTokenHandler();
    // fetchAllBubbles(token);
    prevState.current = { pageNum, projectId, floorplanId, statusId };
  }, [pageNum, projectId, floorplanId, statusId]);

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
                <span className="text-lg font-medium">
                  {task.name} | {task.id}
                </span>

                {task.bubbles && task.bubbles.length > 0 ? (
                  <ul className="space-y-4">
                    {task.bubbles?.length}
                    {task.bubbles?.map((bubble) => (
                      <li key={bubble.id}>
                        <div>
                          <span>
                            {bubble.kind}
                            {bubble.content}
                            {bubble.original_url}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No bubbles found.</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No tasks found.</p>
      )}
      {tasks && (
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
          <p className="m-6 p-2">
            Page {pageNum + 1} Total Tasks = {tasks.length}
          </p>
          <p>{pageSync[pageNum]}</p>

          <button
            // disabled={!hasMorePages}
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
      )}
    </div>
  );
};

export default TaskInfo;

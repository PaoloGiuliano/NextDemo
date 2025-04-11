import React from "react";

type Task = {
  id: string;
  name: string;
  updated_at: string;
  project_id: string;
  status_id: string;
  floorplan_id: string;
  pos_x: number;
  pos_y: number;
  bubbles: Bubble[];
};
type Bubble = {
  id: string;
  updated_at: string;
  kind: number;
  task_id: string;
  project_id: string;
  file_size: number;
  file_url: string;
  thumb_url: string;
  original_url: string;
  flattened_file_url: string;
};

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, loading }) => {
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="task-list">
      <h1 className="text-2xl font-semibold mb-4">Task List</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="mb-2 p-4 border rounded-md">
            <h3 className="text-xl font-medium">{task.name}</h3>
            <p></p>
            <span className="text-sm text-gray-500">Status: {task.pos_x}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;

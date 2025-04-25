export interface Floorplan {
  id: string;
  name: string;
  description: string;
  updated_at: string;
  project_id: string;
  sheets: Sheet[];
}
export interface Sheet {
  id: string;
  name: string;
  updated_at: string;
  project_id: string;
  floorplan_id: string;
  file_name: string;
  file_url: string;
  thumb_url: string;
  original_url: string;
  original_height: number;
  original_width: number;
  file_height: number;
  file_width: number;
}
export interface Status {
  id: string;
  name: string;
  color: string;
}
export interface Task {
  id: string;
  name: string;
  modified_at: string;
  project_id: string;
  status_id: string;
  floorplan_id: string;
  pos_x: number;
  pos_y: number;
  bubbles: Bubble[];
}
export interface Bubble {
  id: string;
  updated_at: string;
  created_at: string;
  formatted_created_at: string;
  content: string;
  kind: number;
  task_id: string;
  project_id: string;
  file_size: number;
  file_url: string;
  thumb_url: string;
  original_url: string;
  flattened_file_url: string;
}
export interface Project {
  id: string;
  name: string;
}

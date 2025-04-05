import { useState } from "react";
import axios from "axios";

const TaskForm = () => {
  const [task, setTask] = useState({
    name: "",
    deadline: "",
    priority: "Medium",
  });

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/tasks`, task);
      console.log("Task added:", response.data);
      setTask({ name: "", deadline: "", priority: "Medium" }); // Reset form
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add a Task</h2>
      
      <label className="block mb-2">Task Name:</label>
      <input 
        type="text" 
        name="name" 
        value={task.name} 
        onChange={handleChange} 
        className="w-full p-2 border rounded mb-3"
        required 
      />

      <label className="block mb-2">Deadline:</label>
      <input 
        type="date" 
        name="deadline" 
        value={task.deadline} 
        onChange={handleChange} 
        className="w-full p-2 border rounded mb-3"
        required 
      />

      <label className="block mb-2">Priority:</label>
      <select 
        name="priority" 
        value={task.priority} 
        onChange={handleChange} 
        className="w-full p-2 border rounded mb-3"
      >
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
        Add Task
      </button>
    </form>
  );
};

export default TaskForm;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

function TaskForm() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    category: "Study",
    estimatedTime: "", // New field for estimated time
  });

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken(); // Get the JWT token from Clerk
      if (!token) {
        console.error("No token found, user may not be authenticated.");
        return;
      }
      await fetch("https://mindsync-backend.up.railway.app/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass the token here in the headers
        },
        body: JSON.stringify({ ...task, estimatedTime: Number(task.estimatedTime) }), // Ensure estimatedTime is a number
      });
      navigate("/tasks"); // Redirect after task creation
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow-lg rounded-lg mt-6">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-4">Create New Task</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="title" className="block text-lg font-medium text-gray-700">Task Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={task.title}
            onChange={handleChange}
            placeholder="Enter task title"
            className="w-full p-2.5 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="block text-lg font-medium text-gray-700">Task Description</label>
          <textarea
            id="description"
            name="description"
            value={task.description}
            onChange={handleChange}
            placeholder="Enter task description"
            className="w-full p-2.5 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dueDate" className="block text-lg font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={task.dueDate}
            onChange={handleChange}
            className="w-full p-2.5 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority" className="block text-lg font-medium text-gray-700">Priority</label>
          <select
            id="priority"
            name="priority"
            value={task.priority}
            onChange={handleChange}
            className="w-full p-2.5 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="category" className="block text-lg font-medium text-gray-700">Category</label>
          <select
            id="category"
            name="category"
            value={task.category}
            onChange={handleChange}
            className="w-full p-2.5 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option>Study</option>
            <option>Work</option>
            <option>Assignment</option>
            <option>Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="estimatedTime" className="block text-lg font-medium text-gray-700">Estimated Time (minutes)</label>
          <input
            type="number"
            id="estimatedTime"
            name="estimatedTime"
            value={task.estimatedTime}
            onChange={handleChange}
            placeholder="Enter estimated time"
            className="w-full p-2.5 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            min="1"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 mt-4 bg-green-500 text-white text-lg font-semibold rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-500"
        >
          Save Task
        </button>
      </form>
    </div>
  );
}

export default TaskForm;

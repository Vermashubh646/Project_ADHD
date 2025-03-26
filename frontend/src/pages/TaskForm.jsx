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

      await fetch("http://localhost:5000/api/tasks", {
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
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Task</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          value={task.title}
          onChange={handleChange}
          placeholder="Task Title"
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          value={task.description}
          onChange={handleChange}
          placeholder="Task Description"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="date"
          name="dueDate"
          value={task.dueDate}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <select name="priority" value={task.priority} onChange={handleChange} className="w-full p-2 border rounded">
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <select name="category" value={task.category} onChange={handleChange} className="w-full p-2 border rounded">
          <option>Study</option>
          <option>Work</option>
          <option>Assignment</option>
          <option>Other</option>
        </select>
        <input
          type="number"
          name="estimatedTime"
          value={task.estimatedTime}
          onChange={handleChange}
          placeholder="Estimated Time (minutes)"
          className="w-full p-2 border rounded"
          min="1"
          required
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Save Task
        </button>
      </form>
    </div>
  );
}

export default TaskForm;

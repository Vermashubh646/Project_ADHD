import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Import Axios
import { useAuth } from "@clerk/clerk-react";

function EditTask() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();  // Clerk's method to get JWT token
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "",
  });

  // 📚 Fetch task details using Axios
  useEffect(() => {
    console.log("Task ID:", taskId); // ✅ Check if taskId is correct
    if (!taskId) {
      setError("Invalid Task ID");
      setLoading(false);
      return;
    }

    const fetchTask = async () => {
      try {
        const token = await getToken(); // Get the JWT Token from Clerk
        if (!token) {
          console.error("No token found, user may not be authenticated.");
          return;
        }

        const res = await axios.get(`https://mindsync-backend.up.railway.app/api/tasks/${taskId}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token here
            "Content-Type": "application/json",
          },
        });

        const data = res.data;
        setTask(data);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          dueDate: data.dueDate ? data.dueDate.split("T")[0] : "",
          priority: data.priority || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching task:", error);
        setError(error.response?.data?.message || "Failed to fetch task");
        setLoading(false);
      }
    };
    
    fetchTask();
  }, [taskId, getToken]);

  // 🎯 Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 Handle form submission using Axios PUT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await getToken(); // Get JWT Token from Clerk
      if (!token) {
        console.error("No token found, user may not be authenticated.");
        return;
      }

      const res = await axios.put(`https://mindsync-backend.up.railway.app/api/tasks/${taskId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in header
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200) {
        alert("Task updated successfully!");
        navigate("/tasks"); // ✅ Redirect to /tasks after successful update
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update task");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Edit Task</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-group">
          <label htmlFor="title" className="block text-lg font-medium text-gray-700">Task Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="block text-lg font-medium text-gray-700">Task Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="form-group">
          <label htmlFor="dueDate" className="block text-lg font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority" className="block text-lg font-medium text-gray-700">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-3 mt-4 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500"
        >
          Update Task
        </button>
      </form>
    </div>
  );
}

export default EditTask;

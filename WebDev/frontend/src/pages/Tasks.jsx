import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAuth } from "@clerk/clerk-react";
 

function Tasks() {
  const { getToken } = useAuth(); 
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [sortCategory, setSortCategory] = useState("");

  // Fetch tasks with Clerk token
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = await getToken(); // Get JWT Token from Clerk
        if (!token) {
          console.error("No token found, user may not be authenticated.");
          return;
        }
        const res = await fetch("https://mindsync-backend.up.railway.app/api/tasks", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Include token in header
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch tasks. Status: ${res.status}`);
        }
        const data = await res.json();
        setTasks(data);
        setFilteredTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error.message);
      }
    };

    fetchTasks();
  }, []);

  // Handle Sorting (Including Category Sorting)
  useEffect(() => {
    let sortedTasks = [...tasks];

    if (sortBy === "dueDateAsc") {
      sortedTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sortBy === "dueDateDesc") {
      sortedTasks.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    } else if (sortBy === "priorityHigh") {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      sortedTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortBy === "priorityLow") {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      sortedTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    }

    // Sort by Category
    if (sortCategory) {
      sortedTasks = sortedTasks.filter((task) => task.category === sortCategory);
    }

    setFilteredTasks(sortedTasks);
  }, [sortBy, sortCategory, tasks]);

  // Handle Filtering
  useEffect(() => {
    let filtered = [...tasks];

    if (filterStatus) {
      filtered = filtered.filter((task) => task.status === filterStatus);
    }
    if (filterPriority) {
      filtered = filtered.filter((task) => task.priority === filterPriority);
    }

    setFilteredTasks(filtered);
  }, [filterStatus, filterPriority, tasks]);

  // Handle Dragging
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedTasks = [...tasks];
    const [movedTask] = reorderedTasks.splice(result.source.index, 1);
    reorderedTasks.splice(result.destination.index, 0, movedTask);

    const updatedTasks = reorderedTasks.map((task, index) => ({
      ...task,
      position: index,
    }));

    setTasks(updatedTasks);

    try {
      const token = await getToken(); // Get token for reordering
      const response = await fetch("https://mindsync-backend.up.railway.app/api/tasks/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tasks: updatedTasks }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task order");
      }
    } catch (error) {
      console.error("Error updating task order:", error);
    }
  };

  // Format Due Date
  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


  const handleDelete = async (taskId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;
  
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTasks(tasks.filter((task) => task._id !== taskId));
        alert("Task deleted successfully!");
      } else {
        alert("Failed to delete task.");
      }
    } catch (error) {
      alert("Error deleting task: " + error.message);
    }
  };
  //     const response = await fetch(`https://mindsync-backend.up.railway.app/api/tasks/${taskId}/complete`
  const handleMarkComplete = async (taskId) => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${taskId}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Completed" }),
      });

      if (response.ok) {
        setTasks(tasks.map((task) => (task._id === taskId ? { ...task, status: "Completed" } : task)));
      } else {
        console.error("Failed to update task status");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };
  

  return (
    <div className="max-w-3xl mx-auto p-4">
  <h1 className="text-3xl font-bold mb-6">Your Tasks</h1>

  {/* Create New Task Button */}
  <Link to="/tasks/new">
      <button
      className="bg-blue-500 text-white px-4 py-2 mb-4 rounded-md hover:bg-blue-600 transition duration-300"
      >
      + Create New Task
    </button>  
</Link>

  {/* Filters & Sorting */}
  <div className="flex flex-wrap gap-4 mb-4">
    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}   className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      <option value="">All Statuses</option>
      <option value="Pending">Pending</option>
      <option value="In Progress">In Progress</option>
      <option value="Completed">Completed</option>
    </select>

    <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}   className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      <option value="">All Priorities</option>
      <option value="High">High</option>
      <option value="Medium">Medium</option>
      <option value="Low">Low</option>
    </select>

    <select value={sortCategory} onChange={(e) => setSortCategory(e.target.value)}   className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      <option value="">All Categories</option>
      <option value="Study">Study</option>
      <option value="Work">Work</option>
      <option value="Assignment">Assignment</option>
      <option value="Other">Other</option>
    </select>

    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}   className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      <option value="">Sort By</option>
      <option value="dueDateAsc">Due Date (Earliest First)</option>
      <option value="dueDateDesc">Due Date (Latest First)</option>
      <option value="priorityHigh">Priority (High to Low)</option>
      <option value="priorityLow">Priority (Low to High)</option>
    </select>
  </div>

  {/* Task List */}
  {filteredTasks.length === 0 ? (
    <p className="text-gray-600 mt-4">No tasks available.</p>
  ) : (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="tasks-list">
        {(provided) => (
          <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-4 mt-4">
            {filteredTasks.map((task, index) => {
              const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "Completed";
              const priorityClasses =
                task.status === "Completed" ? "bg-white border-gray-300" :
                task.priority === "High" ? "border-red-500 bg-red-50" :
                task.priority === "Medium" ? "border-orange-500 bg-orange-50" :
                "border-yellow-500 bg-yellow-50";

              return (
                <Draggable key={task._id} draggableId={task._id} index={index}>
                  {(provided) => (
                      <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`border-l-8 p-4 shadow-md transition duration-200 rounded-md hover:shadow-lg hover:scale-[1.02] ${priorityClasses}`}
                    >
                      <div className="flex justify-between items-center">
                        <h2 className={`text-xl font-semibold ${isOverdue ? "text-red-600" : ""}`}>{task.title}</h2>
                        <p
                          className={`text-sm font-bold ${
                            task.status === "Completed"
                              ? "text-green-500"
                              : task.status === "Pending"
                              ? "text-red-500"
                              : "text-yellow-500"
                          }`}
                        >
                          {task.status}
                        </p>
                      </div>
                      <p className="text-gray-700">{task.description}</p>
                      <p className="text-sm text-gray-500">Due: {formatDueDate(task.dueDate)}</p>
                      <p className="text-sm font-bold">Priority: {task.priority}</p>
                      <p className="text-sm font-bold">Category: {task.category}</p>

                      {/* Buttons */}
                      <div className="flex items-center mt-3 space-x-2">
                        <Link to={`/tasks/edit/${task._id}`}>
                          <button className="bg-yellow-500 text-white px-3 py-1 cursor-pointer rounded-sm">Edit</button>
                        </Link>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="bg-red-500 text-white px-3 py-1 cursor-pointer rounded-sm hover:bg-red-600 transition duration-300"
                          >
                          Delete
                        </button>
                        {task.status !== "Completed" && (
                          <button
                            onClick={() => handleMarkComplete(task._id)}
                            className="bg-green-500 text-white px-3 py-1 cursor-pointer rounded-sm hover:bg-green-600 transition duration-300"
                            >
                            Mark as Complete
                          </button>
                        )}
                      </div>
                    </li>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  )}
</div>

  );
}

export default Tasks;

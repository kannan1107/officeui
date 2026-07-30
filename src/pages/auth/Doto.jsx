import React, { useState, useEffect } from "react";
import {
  usePostMessageMutation,
  useGetUsersQuery,
} from "../../features/ApplicationApi";

const parseToken = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

function Doto() {
  const [postMessage, { isLoading }] = usePostMessageMutation();
  const {
    data: users,
    isLoading: isUsersLoading,
    isError: usersError,
  } = useGetUsersQuery();

  // 1. Debugging: Check what the API is actually sending
  useEffect(() => {
    if (users) {
      console.log("Users API Response:", users);
    }
  }, [users]);

  // 2. Flexible Data Selection
  // This handles responses like [user1, user2] OR { users: [...] } OR { data: [...] }
  const usersData = Array.isArray(users)
    ? users
    : users?.users || users?.data || users?.items || [];

  const currentToken = localStorage.getItem("token");
  const currentUserId = currentToken ? parseToken(currentToken)?.id : "";
  const defaultDepartment = localStorage.getItem("department") || "";

  const [formData, setFormData] = useState({
    title: "",
    task: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
    assignee: "",
    assigner: currentUserId,
    batch: "",
    department: defaultDepartment,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await postMessage(formData).unwrap();
      alert("Task assigned successfully!");
      setFormData({
        ...formData,
        title: "",
        task: "",
        dueDate: "",
        assignee: "",
      });
    } catch (err) {
      alert("Error: " + (err?.data?.message || "Failed to post"));
    }
  };

  return (
    <div className="pt-16 bg-gray-100 min-h-screen">
      <div className="p-6">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Add New Task</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1">
              <label className="block mb-1 font-medium">Task Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="grid grid-cols-1">
              <label className="block mb-1 font-medium">Task Details</label>
              <textarea
                name="task"
                value={formData.task}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter task details..."
                rows="3"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block mb-1 font-medium">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select Dept</option>
                  <option value="hr">HR</option>
                  <option value="it">IT</option>
                  <option value="finance">Finance</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* ASSIGNEE SELECTOR */}
              <div>
                <label className="block mb-1 font-medium">Assignee</label>
                <select
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">
                    {isUsersLoading ? "Loading users..." : "Select Assignee"}
                  </option>

                  {usersError && (
                    <option value="" disabled>
                      Error fetching users
                    </option>
                  )}

                  {!isUsersLoading && usersData.length === 0 && (
                    <option value="" disabled>
                      No users found
                    </option>
                  )}

                  {usersData.map((user) => (
                    <option
                      key={user._id || user.id}
                      value={user._id || user.id}
                    >
                      {user.name || user.username || user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`bg-blue-600 text-white px-10 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition duration-200 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Saving..." : "Add Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Doto;

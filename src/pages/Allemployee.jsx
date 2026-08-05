import { useState, useEffect } from "react"; // Added useEffect
import {
  useGetEmployeeMutation,
  useDeleteEmployeeMutation,
  useUpdateProfileMutation,
} from "../features/ApplicationApi";

function AllEmployee() {
  const [getEmployee, { data: employees, isLoading, error }] =
    useGetEmployeeMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();
  const [updateProfile] = useUpdateProfileMutation();

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // 1. State for search query
  const [searchTerm, setSearchTerm] = useState("");

  const handleGetEmployees = async () => {
    try {
      await getEmployee().unwrap();
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
  };

  // Automatically fetch employees on component mount
  useEffect(() => {
    handleGetEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;
    try {
      await deleteEmployee(id).unwrap();
      await handleGetEmployees();
    } catch (err) {
      alert("Delete failed: " + (err?.data?.message || "Unknown error"));
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee._id || employee.id);
    setEditData(employee);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Create a copy and remove the ID so the backend doesn't try to overwrite it
    const { _id, id, ...updateData } = editData;

    try {
      await updateProfile({
        id: editingId,
        data: updateData, // Send only the changed fields, not the ID itself
      }).unwrap();
      setEditingId(null);
      handleGetEmployees();
    } catch (err) {
      console.error(err);
    }
  };
  const employeesData = Array.isArray(employees)
    ? employees
    : employees?.employees || employees?.data || [];

  // 2. Filter logic: search by Name, Email, or Mobile
  const filteredEmployees = employeesData.filter((employee) => {
    const searchString = searchTerm.toLowerCase();
    return (
      employee.name?.toLowerCase().includes(searchString) ||
      employee.email?.toLowerCase().includes(searchString) ||
      employee.mobile?.includes(searchString) ||
      employee.position?.toLowerCase().includes(searchString)
    );
  });

  return (
    <div className="pt-16 bg-gray-100 min-h-screen">
      <div className="p-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-3xl font-bold text-gray-800">All Employees</h2>

            {/* 3. Search Input Field */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or mobile..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>

          <button
            onClick={handleGetEmployees}
            className="mb-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Refresh List
          </button>

          {isLoading && <p className="text-gray-600">Loading...</p>}
          {error && <p className="text-red-500">Error: {error.message}</p>}

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">Name</th>
                  <th className="py-2 px-4 border-b text-left">Email</th>
                  <th className="py-2 px-4 border-b text-left">Mobile</th>
                  <th className="py-2 px-4 border-b text-left">Position</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-500">
                      {searchTerm
                        ? "No employees match your search."
                        : "No employees found."}
                    </td>
                  </tr>
                ) : (
                  // Map over filteredEmployees instead of employeesData
                  filteredEmployees.map((employee) => (
                    <tr
                      key={employee._id || employee.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="py-2 px-4 border-b">
                        {editingId === (employee._id || employee.id) ? (
                          <input
                            type="text"
                            value={editData.name || ""}
                            onChange={(e) =>
                              setEditData({ ...editData, name: e.target.value })
                            }
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          employee.name
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {editingId === (employee._id || employee.id) ? (
                          <input
                            type="email"
                            value={editData.email || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                email: e.target.value,
                              })
                            }
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          employee.email
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {editingId === (employee._id || employee.id) ? (
                          <input
                            type="text"
                            value={editData.mobile || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                mobile: e.target.value,
                              })
                            }
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          employee.mobile
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {editingId === (employee._id || employee.id) ? (
                          <input
                            type="text"
                            value={editData.position || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                position: e.target.value,
                              })
                            }
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          employee.position
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {editingId === (employee._id || employee.id) ? (
                          <div className="flex gap-2">
                            <button
                              onClick={handleSave}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(employee)}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(employee._id || employee.id)
                              }
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllEmployee;

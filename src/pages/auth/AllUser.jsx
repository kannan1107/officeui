import { useState } from "react";
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../../features/ApplicationApi";

const userFields = [
  { name: "name", label: "Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone", type: "number" },
  {
    name: "role",
    label: "Role",
    type: "select",
    options: ["admin", "user", "manager", "assManager"],
  },
  {
    name: "deportment",
    label: "Department",
    type: "select",
    options: [
      "admin",
      "quality",
      "technical",
      "GST",
      "security",
      "projecting",
      "developing",
      "hr",
      "driver",
      "store",
    ],
  },
  { name: "branch", label: "Branch" },
  { name: "salary", label: "Salary", type: "number" },
  { name: "kinnumber", label: "Kin Number", type: "number" },
  { name: "address", label: "Address", type: "textarea" },
  { name: "fathername", label: "Father Name" },
  { name: "mothername", label: "Mother Name" },
  { name: "bloodgroup", label: "Blood Group" },
  { name: "dateofbirth", label: "Date of Birth", type: "date" },
  { name: "gender", label: "Gender" },
  { name: "adharnumber", label: "Aadhar Number", type: "number" },
  { name: "currentaddress", label: "Current Address", type: "textarea" },
  { name: "comemail", label: "Company Email", type: "email" },
  { name: "joiningdate", label: "Joining Date", type: "date" },
  { name: "id", label: "ID" },
  { name: "proof", label: "Proof" },
  { name: "officeaddress", label: "Office Address", type: "textarea" },
  { name: "company", label: "Company" },
  { name: "retirement", label: "Retirement Date", type: "date" },
  { name: "avsec", label: "AVSEC" },
  { name: "avsecdate", label: "AVSEC Date", type: "date" },
  { name: "avsecexp", label: "AVSEC Expiry", type: "date" },
  { name: "avsecplace", label: "AVSEC Place" },
  { name: "course", label: "Course" },
  { name: "coursedate", label: "Course Date", type: "date" },
  { name: "courseexp", label: "Course Expiry", type: "date" },
  { name: "passno", label: "Pass Number" },
  { name: "passexp", label: "Pass Expiry", type: "date" },
  { name: "photo", label: "Photo" },
  { name: "courseplace", label: "Course Place" },
  { name: "status", label: "Status" },
];

const dateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value).slice(0, 10)
    : date.toISOString().slice(0, 10);
};

function AllUser() {
  const { data, error, isLoading, refetch } = useGetUsersQuery();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const users = Array.isArray(data) ? data : data?.users || data?.data || [];
  const [editUser, setEditUser] = useState(null);

  const userId = (user) => user._id || user.id;

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name || "this user"}?`)) return;
    try {
      await deleteUser(userId(user)).unwrap();
      await refetch();
    } catch (err) {
      alert(`Delete failed: ${err?.data?.message || "Unknown error"}`);
    }
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const userData = { ...editUser };
    ["_id", "__v", "createdAt", "updatedAt"].forEach((key) => {
      delete userData[key];
    });
    try {
      await updateUser({ id: userId(editUser), data: userData }).unwrap();
      setEditUser(null);
      await refetch();
    } catch (err) {
      alert(`Update failed: ${err?.data?.message || "Unknown error"}`);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="pt-16 bg-gray-100 min-h-screen">
      <div className="p-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-3xl font-bold text-center mb-6">All Users</h2>
          <table className="min-w-full bg-white">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Gender</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Role</th>
                <th className="py-2 px-4">Department</th>
                <th className="py-2 px-4">Employee ID</th>
                <th className="py-2 px-4">Father's Name</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={userId(user)} className="border-b">
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.gender}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">{user.role}</td>
                  <td className="py-2 px-4">{user.department}</td>
                  <td className="py-2 px-4">{user.employeeId}</td>
                  <td className="py-2 px-4">{user.fatherName}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => setEditUser({ ...user })}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={deleting}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-2"
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Edit User Details</h3>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="text-2xl leading-none text-gray-400 hover:text-gray-600"
                aria-label="Close edit user"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={handleSave}
              className="grid grid-cols-1 gap-3 md:grid-cols-2"
            >
              {userFields.map((field) => {
                const value =
                  field.type === "date"
                    ? dateInputValue(editUser[field.name])
                    : (editUser[field.name] ?? "");
                return (
                  <div
                    key={field.name}
                    className={field.type === "textarea" ? "md:col-span-2" : ""}
                  >
                    <label className="mb-1 block text-xs text-gray-500">
                      {field.label}
                    </label>
                    {field.type === "select" ? (
                      <select
                        name={field.name}
                        value={value}
                        onChange={handleEditChange}
                        required={field.required}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={value}
                        onChange={handleEditChange}
                        required={field.required}
                        rows="2"
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                      />
                    ) : (
                      <input
                        name={field.name}
                        type={field.type || "text"}
                        value={value}
                        onChange={handleEditChange}
                        required={field.required}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                      />
                    )}
                  </div>
                );
              })}
              <div className="flex gap-2 md:col-span-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="flex-1 rounded-lg bg-gray-200 py-2 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllUser;

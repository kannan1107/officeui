import { useState } from "react";
import {
  useGetUsersQuery,
  useUpdateUserMutation,
} from "../../features/ApplicationApi";

const STATUS_COLOR = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function Approvel() {
  const loginEmail = localStorage.getItem("email") || "";
  const { data: usersData, refetch: refetchUsers } = useGetUsersQuery();
  const [updateUser, { isLoading: updatingBalance }] = useUpdateUserMutation();

  const users = Array.isArray(usersData)
    ? usersData
    : usersData?.users || usersData?.data || [];
  const currentUser = users.find((u) => u.email === loginEmail) || {};
  const canManage = ["admin", "hr"].includes(currentUser.role);
  const allLeaves = users.flatMap((u) =>
    (u.leaves || []).map((l) => ({
      ...l,
      userName: u.name,
      userEmail: u.email,
      userId: u._id || u.id,
      userObj: u,
    })),
  );

  const [tab, setTab] = useState(canManage ? "balance" : "applications");
  const [editBalance, setEditBalance] = useState(null);
  const [balanceForm, setBalanceForm] = useState({
    el: 0,
    cl: 0,
    sl: 0,
    comfoff: 0,
  });
  const [search, setSearch] = useState("");
  const [updatingLeaveId, setUpdatingLeaveId] = useState(null);

  const filteredUsers = users.filter((u) =>
    [u.name, u.email, u.department].some((v) =>
      String(v ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const filteredLeaves = allLeaves.filter((l) =>
    [l.userName, l.userEmail, l.type, l.status].some((v) =>
      String(v ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const openEditBalance = (user) => {
    setEditBalance(user);
    setBalanceForm({
      el: user.el ?? 0,
      cl: user.cl ?? 0,
      sl: user.sl ?? 0,
      comfoff: user.comfoff ?? 0,
    });
  };

  const handleBalanceSave = async (e) => {
    e.preventDefault();
    const id = editBalance._id || editBalance.id;
    try {
      await updateUser({ id, data: balanceForm }).unwrap();
      setEditBalance(null);
      refetchUsers();
    } catch (err) {
      alert("Update failed: " + (err?.data?.message || "Unknown error"));
    }
  };

  const handleStatusChange = async (leave, status) => {
    setUpdatingLeaveId(leave._id);
    const user = leave.userObj;
    const id = user._id || user.id;
    const updatedLeaves = (user.leaves || []).map((l) =>
      l._id === leave._id ? { ...l, status } : l,
    );
    try {
      await updateUser({ id, data: { leaves: updatedLeaves } }).unwrap();
      refetchUsers();
    } catch (err) {
      alert("Status update failed: " + (err?.data?.message || "Unknown error"));
    }
    setUpdatingLeaveId(null);
  };

  return (
    <div className="pt-16 bg-gray-100 min-h-screen">
      <div className="p-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Leave Management
          </h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {[
              ["applications", "Leave Applications"],
              ...(canManage ? [["balance", "Leave Balance"]] : []),
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
          />

          {/* Leave Balance Tab */}
          {tab === "balance" && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left border-b">
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Email</th>
                    <th className="py-2 px-4">Department</th>
                    <th className="py-2 px-4 text-center">EL (Earned)</th>
                    <th className="py-2 px-4 text-center">CL (Casual)</th>
                    <th className="py-2 px-4 text-center">SL (Sick)</th>
                    <th className="py-2 px-4 text-center">Comp Off</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-6 text-center text-gray-400"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user._id || user.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-2 px-4 font-medium">{user.name}</td>
                        <td className="py-2 px-4 text-gray-500">
                          {user.email}
                        </td>
                        <td className="py-2 px-4">{user.department || "—"}</td>
                        <td className="py-2 px-4 text-center">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">
                            {user.el ?? 0}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-center">
                          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded font-semibold">
                            {user.cl ?? 0}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-center">
                          <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-semibold">
                            {user.sl ?? 0}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-center">
                          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-semibold">
                            {user.comfoff ?? 0}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          {canManage ? (
                            <button
                              onClick={() => openEditBalance(user)}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                            >
                              Edit Balance
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Leave Applications Tab */}
          {tab === "applications" && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left border-b">
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Email</th>
                    <th className="py-2 px-4">Type</th>
                    <th className="py-2 px-4">From</th>
                    <th className="py-2 px-4">To</th>
                    <th className="py-2 px-4">Reason</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-6 text-center text-gray-400"
                      >
                        No leave applications found.
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map((leave, i) => (
                      <tr
                        key={leave._id || i}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-2 px-4 font-medium">
                          {leave.userName}
                        </td>
                        <td className="py-2 px-4 text-gray-500">
                          {leave.userEmail}
                        </td>
                        <td className="py-2 px-4 capitalize">{leave.type}</td>
                        <td className="py-2 px-4">
                          {leave.from
                            ? new Date(leave.from).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="py-2 px-4">
                          {leave.to
                            ? new Date(leave.to).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="py-2 px-4 max-w-[150px] truncate">
                          {leave.reason}
                        </td>
                        <td className="py-2 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[leave.status] || "bg-gray-100 text-gray-600"}`}
                          >
                            {leave.status || "pending"}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          {canManage &&
                          (leave.status === "pending" || !leave.status) ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() =>
                                  handleStatusChange(leave, "approved")
                                }
                                disabled={updatingLeaveId === leave._id}
                                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-xs disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(leave, "rejected")
                                }
                                disabled={updatingLeaveId === leave._id}
                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Balance Modal */}
      {editBalance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                Edit Leave Balance — {editBalance.name}
              </h3>
              <button
                onClick={() => setEditBalance(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={handleBalanceSave}
              className="grid grid-cols-2 gap-4"
            >
              {[
                ["el", "EL (Earned Leave)", "blue"],
                ["cl", "CL (Casual Leave)", "green"],
                ["sl", "SL (Sick Leave)", "orange"],
                ["comfoff", "Comp Off", "purple"],
              ].map(([field, label, color]) => (
                <div key={field}>
                  <label className="block text-xs text-gray-500 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={balanceForm[field]}
                    onChange={(e) =>
                      setBalanceForm((p) => ({
                        ...p,
                        [field]: Number(e.target.value),
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              ))}
              <div className="col-span-2 flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={updatingBalance}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {updatingBalance ? "Saving..." : "Save Balance"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditBalance(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 text-sm"
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

export default Approvel;

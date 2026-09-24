import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetUsersQuery, useGetItemsQuery, useGetMessagesQuery, useUpdateUserMutation } from "../../features/ApplicationApi";

const NAV = [
    { label: "🏠 Dashboard", to: "/" },
    { label: "💬 Chats", to: "/chats" },
    { label: "✅ Create Task", to: "/doto" },
    { label: "📋 List Tasks", to: "/listtask" },
    { label: "💰 Salary Details", to: "/salary-slip" },
    { label: "📦 Stores", to: "/stores" },
    { label: "🔧 Spars", to: "/itemList" },
    { label: "⚙️ Profile Settings", to: "/profile" },
];

const STATUS_COLOR = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
};

function Home() {
    const navigate = useNavigate();
    const loginEmail = localStorage.getItem("email") || "";

    const { data: usersData, refetch: refetchUsers } = useGetUsersQuery();
    const { data: itemsData } = useGetItemsQuery();
    const { data: tasksData } = useGetMessagesQuery();
    const [updateUser, { isLoading: applying }] = useUpdateUserMutation();

    const users = Array.isArray(usersData) ? usersData : usersData?.users || usersData?.data || [];
    const items = Array.isArray(itemsData) ? itemsData : itemsData?.items || itemsData?.data || [];
    const tasks = Array.isArray(tasksData) ? tasksData : tasksData?.data || [];

    const currentUser = users.find((u) => u.email === loginEmail) || {};
    const userId = currentUser._id || currentUser.id;
    const [localLeaves, setLocalLeaves] = useState(null);
    // Sync from server when refetch completes (e.g. status updated by admin)
    useEffect(() => { setLocalLeaves(null); }, [usersData]);
    const myLeaves = localLeaves ?? currentUser.leaves ?? [];
    const [showLeaveForm, setShowLeaveForm] = useState(false);
    const [leaveForm, setLeaveForm] = useState({ type: "casual", from: "", to: "", reason: "" });
    const [leaveSuccess, setLeaveSuccess] = useState(false);

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        if (!userId) return;
        try {
            const newLeave = { ...leaveForm, status: "pending", createdAt: new Date().toISOString() };
            const updatedLeaves = [...myLeaves, newLeave];
            await updateUser({ id: userId, data: { leaves: updatedLeaves } }).unwrap();
            setLocalLeaves(updatedLeaves);
            setLeaveForm({ type: "casual", from: "", to: "", reason: "" });
            setShowLeaveForm(false);
            setLeaveSuccess(true);
            setTimeout(() => setLeaveSuccess(false), 3000);
            refetchUsers();
        } catch (err) {
            alert("Failed to apply leave: " + (err?.data?.message || "Unknown error"));
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || loginEmail || "U")}&background=3b82f6&color=fff&size=128`;

    const infoFields = [
        ["Department", currentUser.department],
        ["Position", currentUser.position],
        ["Employee ID", currentUser.employeeId],
        ["Mobile", currentUser.mobile],
        ["Blood Group", currentUser.bloodGroup],
        ["Company", currentUser.company],
        ["Joining Date", currentUser.joiningDate ? new Date(currentUser.joiningDate).toLocaleDateString() : ""],
        ["Date of Birth", currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toLocaleDateString() : ""],
        ["Address", currentUser.address],
        ["Role", currentUser.role],
    ].filter(([, v]) => v);

    return (
        <div className="flex min-h-screen bg-gray-100 pt-16">
            {/* Sidebar */}
            <aside className="w-56 bg-blue-900 text-white flex flex-col fixed top-16 left-0 h-[calc(100vh-4rem)] z-10">
                <div className="flex flex-col items-center py-6 border-b border-blue-700 px-4">
                    <img src={currentUser.photo || avatar} alt="avatar" className="w-14 h-14 rounded-full object-cover mb-2" />
                    <p className="font-semibold text-sm text-center capitalize">{currentUser.name || loginEmail}</p>
                    <p className="text-xs text-blue-300 truncate w-full text-center">{loginEmail}</p>
                    {currentUser.role && <span className="mt-1 text-xs bg-blue-700 px-2 py-0.5 rounded-full">{currentUser.role}</span>}
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-2">
                        {NAV.map(({ label, to }) => (
                            <li key={to}>
                                <Link to={to} className="block px-3 py-2 rounded-lg hover:bg-blue-700 text-sm transition">
                                    {label}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-600 text-sm transition text-red-300 hover:text-white">
                                🚪 Logout
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="ml-56 flex-1 p-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total Users", value: users.length, color: "bg-blue-500" },
                        { label: "Total Items", value: items.length, color: "bg-green-500" },
                        { label: "Total Tasks", value: tasks.length, color: "bg-purple-500" },
                        { label: "My Leaves", value: myLeaves.length, color: "bg-orange-500" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className={`${color} text-white rounded-xl p-4 shadow`}>
                            <p className="text-2xl font-bold">{value}</p>
                            <p className="text-sm opacity-90">{label}</p>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "EL (Earned)", value: currentUser.el ?? 0, color: "bg-blue-400" },
                        { label: "CL (Casual)", value: currentUser.cl ?? 0, color: "bg-green-400" },
                        { label: "SL (Sick)", value: currentUser.sl ?? 0, color: "bg-orange-400" },
                        { label: "Comp Off", value: currentUser.comfoff ?? 0, color: "bg-purple-400" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className={`${color} text-white rounded-xl p-4 shadow`}>
                            <p className="text-2xl font-bold">{value}</p>
                            <p className="text-sm opacity-90">{label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Info Card */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                            <img src={currentUser.photo || avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                            <div>
                                <h3 className="text-lg font-bold capitalize">{currentUser.name || "—"}</h3>
                                <p className="text-sm text-gray-500">{loginEmail}</p>
                                {currentUser.department && <p className="text-xs text-blue-600 mt-0.5">{currentUser.department}</p>}
                            </div>
                            <Link to="/profile" className="ml-auto text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                                Edit Profile
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {infoFields.map(([label, value]) => (
                                <div key={label} className="bg-gray-50 rounded-lg px-3 py-2">
                                    <p className="text-xs text-gray-400">{label}</p>
                                    <p className="text-sm font-medium truncate">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Leave Section */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Leave Management</h3>
                            <button
                                onClick={() => setShowLeaveForm((p) => !p)}
                                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                            >
                                {showLeaveForm ? "Cancel" : "+ Apply Leave"}
                            </button>
                        </div>

                        {leaveSuccess && (
                            <div className="mb-3 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
                                Leave applied successfully!
                            </div>
                        )}

                        {showLeaveForm && (
                            <form onSubmit={handleLeaveSubmit} className="grid grid-cols-2 gap-3 mb-4 p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Leave Type</label>
                                    <select
                                        value={leaveForm.type}
                                        onChange={(e) => setLeaveForm((p) => ({ ...p, type: e.target.value }))}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="casual">Casual</option>
                                        <option value="sick">Sick</option>
                                        <option value="earned">Earned</option>
                                        <option value="compoff">Comp Off</option>
                                        <option value="unpaid">Unpaid</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">From Date</label>
                                    <input type="date" value={leaveForm.from} onChange={(e) => setLeaveForm((p) => ({ ...p, from: e.target.value }))} required className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">To Date</label>
                                    <input type="date" value={leaveForm.to} onChange={(e) => setLeaveForm((p) => ({ ...p, to: e.target.value }))} required className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Reason</label>
                                    <input type="text" value={leaveForm.reason} onChange={(e) => setLeaveForm((p) => ({ ...p, reason: e.target.value }))} required placeholder="Reason" className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div className="col-span-2">
                                    <button type="submit" disabled={applying} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
                                        {applying ? "Submitting..." : "Submit Leave"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Leave History */}
                        <div className="overflow-x-auto">
                            {myLeaves.length === 0 ? (
                                <p className="text-center text-gray-400 text-sm py-6">No leave records found.</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-left text-xs text-gray-500">
                                            <th className="px-3 py-2">Type</th>
                                            <th className="px-3 py-2">From</th>
                                            <th className="px-3 py-2">To</th>
                                            <th className="px-3 py-2">Reason</th>
                                            <th className="px-3 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {myLeaves.map((leave, i) => (
                                            <tr key={leave._id || i} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 capitalize">{leave.type}</td>
                                                <td className="px-3 py-2">{leave.from ? new Date(leave.from).toLocaleDateString() : "-"}</td>
                                                <td className="px-3 py-2">{leave.to ? new Date(leave.to).toLocaleDateString() : "-"}</td>
                                                <td className="px-3 py-2 max-w-[120px] truncate">{leave.reason}</td>
                                                <td className="px-3 py-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[leave.status] || "bg-gray-100 text-gray-600"}`}>
                                                        {leave.status || "pending"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Home;

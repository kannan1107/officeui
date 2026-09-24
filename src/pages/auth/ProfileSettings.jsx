import { useState, useEffect } from "react";
import { useUpdateUserMutation, useGetUsersQuery } from "../../features/ApplicationApi";

const FIELDS = [
    ["name", "Name"],
    ["email", "Email"],
    ["gender", "Gender"],
    ["mobile", "Mobile"],
    ["role", "Role"],
    ["department", "Department"],
    ["employeeId", "Employee ID"],
    ["position", "Position"],
    ["company", "Company"],
    ["bloodGroup", "Blood Group"],
    ["fatherName", "Father Name"],
    ["motherName", "Mother Name"],
    ["dateOfBirth", "Date of Birth", "date"],
    ["joiningDate", "Joining Date", "date"],
    ["address", "Address"],
    ["tempAddress", "Temp Address"],
    ["offAddress", "Office Address"],
    ["certificateDate", "Certificate Date", "date"],
];

function ProfileSettings() {
    const loginEmail = localStorage.getItem("email") || "";
    const { data, isLoading: loadingUsers } = useGetUsersQuery();
    const users = Array.isArray(data) ? data : data?.users || data?.data || [];
    const matchedUser = users.find((u) => u.email === loginEmail);
    const userId = matchedUser?._id || matchedUser?.id;

    const [form, setForm] = useState({});
    const [updateUser, { isLoading: saving }] = useUpdateUserMutation();
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (matchedUser) setForm(matchedUser);
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) {
            alert("User not found. Please log out and log in again.");
            return;
        }
        try {
            const { _id, id: _id2, __v, createdAt, updatedAt, token, password, ...cleanData } = form;
            const res = await updateUser({ id: userId, data: cleanData }).unwrap();
            const updated = res?.user || res?.data || form;
            localStorage.setItem("user", JSON.stringify({ ...updated, _id: userId }));
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            alert("Update failed: " + (err?.data?.message || err?.error || "Unknown error"));
        }
    };

    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || loginEmail || "U")}&background=3b82f6&color=fff&size=128`;

    if (loadingUsers) return <div className="pt-16 p-6">Loading profile...</div>;

    return (
        <div className="pt-16 bg-gray-100 min-h-screen">
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-white shadow-lg rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                        <img src={form.photo || avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                        <div>
                            <h2 className="text-2xl font-bold">{form.name || "Profile"}</h2>
                            <p className="text-sm text-gray-500">{form.email || loginEmail}</p>
                        </div>
                    </div>

                    {success && (
                        <div className="mb-4 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
                            Profile updated successfully!
                        </div>
                    )}

                    {!userId && (
                        <div className="mb-4 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                            Could not match your account. Please log out and log in again.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {FIELDS.map(([field, label, type = "text"]) => (
                            <div key={field}>
                                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                                <input
                                    type={type}
                                    name={field}
                                    value={type === "date" && form[field] ? String(form[field]).slice(0, 10) : (form[field] ?? "")}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        ))}

                        <div className="md:col-span-3 flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={saving || !userId}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProfileSettings;

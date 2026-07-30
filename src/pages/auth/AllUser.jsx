import { useState, useEffect } from "react";
import { useGetUsersQuery } from "../../features/ApplicationApi";

function AllUser() {
    const { data: users, error, isLoading } = useGetUsersQuery();

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
                                <th className="py-2 px-4">Mother's Name</th>
                                <th className="py-2 px-4">Blood Group</th>
                                <th className="py-2 px-4">Mobile</th>
                                <th className="py-2 px-4">Address</th>
                                <th className="py-2 px-4">Temp Address</th>
                                <th className="py-2 px-4">Company</th>
                                <th className="py-2 px-4">Joining Date</th>
                                <th className="py-2 px-4">Position</th>
                                <th className="py-2 px-4">Date of Birth</th>
                                <th className="py-2 px-4">Off Address</th>
                                <th className="py-2 px-4">Certificate</th>
                                <th className="py-2 px-4">Certificate Date</th>


                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b">
                                    <td className="py-2 px-4">{user.name}</td>
                                    <td className="py-2 px-4">{user.gender}</td>
                                    <td className="py-2 px-4">{user.email}</td>
                                    <td className="py-2 px-4">{user.role}</td>
                                    <td className="py-2 px-4">{user.department}</td>
                                    <td className="py-2 px-4">{user.employeeId}</td>
                                    <td className="py-2 px-4">{user.fatherName}</td>
                                    <td className="py-2 px-4">{user.motherName}</td>
                                    <td className="py-2 px-4">{user.bloodGroup}</td>
                                    <td className="py-2 px-4">{user.mobile}</td>
                                    <td className="py-2 px-4">{user.address}</td>
                                    <td className="py-2 px-4">{user.tempAddress}</td>
                                    <td className="py-2 px-4">{user.company}</td>
                                    <td className="py-2 px-4">{user.joiningDate}</td>
                                    <td className="py-2 px-4">{user.position}</td>
                                    <td className="py-2 px-4">{user.dateOfBirth}</td>
                                    <td className="py-2 px-4">{user.offAddress}</td>
                                    <td className="py-2 px-4">{user.certificate}</td>
                                    <td className="py-2 px-4">{user.certificateDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AllUser;
import React, { useState } from "react";
import { usePostEmployeeMutation } from "../../features/ApplicationApi";

// Define initial state outside to keep code DRY
const initialState = {
  name: "",
  email: "",
  mobile: "",
  position: "",
  department: "",
  salary: "",
  kinnumber: "",
  address: "",
  fathername: "",
  mothername: "",
  dateofbirth: "",
  adharnumber: "",
  bloodgroup: "",
  gender: "",
  joiningdate: "",
  photo: "",
  currentaddress: "",
  role: "",
  comemail: "",
  id: "",
  proof: "",
  officeaddress: "",
  company: "",
  retirement: "",
  avsec: "",
  avsecdate: "",
  avsecexp: "",
  avsecplace: "",
  course: "",
  coursedate: "",
  courseexp: "",
  courseplace: "",
  passno: "",
  passexp: "",
  status: "active",
};

export const Employee = () => {
  const [postEmployee, { isLoading }] = usePostEmployeeMutation();
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setFormData((prev) => ({ ...prev, photo: files[0] })); // Store file object
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formPayload = new FormData();
    // Append all text fields
    Object.keys(formData).forEach((key) => {
      formPayload.append(key, formData[key]);
    });

    try {
      await postEmployee(formPayload).unwrap(); // Send FormData instead of object
      alert("Employee added successfully!");
      setFormData(initialState);
    } catch (err) {
      alert("Error: " + (err?.data?.message || "Failed to add employee"));
    }
  };

  return (
    <div className="pt-16 bg-gray-100 min-h-screen">
      <div className="p-6">
        <div className="max-w-8xl mx-auto bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            Add New Employee
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Name */}
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter name"
                  required
                />
              </div>

              {/* Father Name */}
              <div>
                <label className="block mb-1 font-medium">Father Name</label>
                <input
                  type="text"
                  name="fathername"
                  value={formData.fathername}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Father Name"
                  required
                />
              </div>

              {/* Mother Name */}
              <div>
                <label className="block mb-1 font-medium">Mother Name</label>
                <input
                  type="text"
                  name="mothername"
                  value={formData.mothername}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Mother Name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter email"
                  required
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block mb-1 font-medium">Mobile</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter mobile number"
                />
              </div>

              {/* Your AAdhar Number */}
              <div>
                <label className="block mb-1 font-medium">
                  Your Aadhar Number
                </label>
                <input
                  type="number"
                  name="adharnumber"
                  value={formData.adharnumber}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Your AAdhar Number"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block mb-1 font-medium">Position</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter position"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block mb-1 font-medium">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter department"
                />
              </div>

              {/* Salary */}
              <div>
                <label className="block mb-1 font-medium">Salary</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter salary"
                />
              </div>

              {/* Kin Number */}
              <div>
                <label className="block mb-1 font-medium">Kin Number</label>
                <input
                  type="tel"
                  name="kinnumber"
                  value={formData.kinnumber}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter kin number"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block mb-1 font-medium">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Your Blood Group */}
              <div>
                <label className="block mb-1 font-medium">
                  Your Blood Group
                </label>
                <input
                  type="text"
                  name="bloodgroup"
                  value={formData.bloodgroup}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Your Blood Group"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block mb-1 font-medium">Date of Birth</label>
                <input
                  type="date"
                  name="dateofbirth"
                  value={formData.dateofbirth}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Employee ID */}
              <div>
                <label className="block mb-1 font-medium">Employee ID</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter Employee ID"
                />
              </div>

              {/* Company Email */}
              <div>
                <label className="block mb-1 font-medium">Company Email</label>
                <input
                  type="tel"
                  name="comemail"
                  value={formData.comemail}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Company Email"
                />
              </div>

              {/* address Proof */}
              <div>
                <label className="block mb-1 font-medium">Address Proof</label>
                <input
                  type="text"
                  name="proof"
                  value={formData.proof}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Address Proof"
                />
              </div>

              {/* Date of joinning */}
              <div>
                <label className="block mb-1 font-medium">
                  Date of joinning{" "}
                </label>
                <input
                  type="date"
                  name="joiningdate"
                  value={formData.joiningdate}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Date of joinning "
                />
              </div>

              {/* Office Address */}
              <div>
                <label className="block mb-1 font-medium">
                  {" "}
                  Office Address
                </label>
                <input
                  type="text"
                  name="officeaddress"
                  value={formData.officeaddress}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Office Address"
                />
              </div>

              {/* your Address */}
              <div>
                <label className="block mb-1 font-medium"> your Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Your Address"
                />
              </div>

              {/* Your Current Address */}
              <div>
                <label className="block mb-1 font-medium">
                  {" "}
                  Your Current Address
                </label>
                <input
                  type="text"
                  name="currentaddress"
                  value={formData.currentaddress}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Your Current Address"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="block mb-1 font-medium">Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Company Name"
                />
              </div>
              {/* Retirement Date */}
              <div>
                <label className="block mb-1 font-medium">
                  Retirement Date{" "}
                </label>
                <input
                  type="date"
                  name="retirement"
                  value={formData.retirement}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Retirement Date "
                />
              </div>

              {/* AVSEC Details */}
              <div>
                <label className="block mb-1 font-medium">AVSEC Details </label>
                <input
                  type="text"
                  name="avsec"
                  value={formData.avsec}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="AVSEC Details "
                />
              </div>

              {/* AVSEC Date */}
              <div>
                <label className="block mb-1 font-medium">AVSEC Date </label>
                <input
                  type="date"
                  name="avsecdate"
                  value={formData.avsecdate}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="AVSEC Date "
                />
              </div>

              {/* AVSEC Expire Date */}
              <div>
                <label className="block mb-1 font-medium">
                  AVSEC Expire Date{" "}
                </label>
                <input
                  type="date"
                  name="avsecexp"
                  value={formData.avsecexp}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="AVSEC Expire Date  "
                />
              </div>

              {/* AVSEC Place */}
              <div>
                <label className="block mb-1 font-medium">AVSEC Place </label>
                <input
                  type="text"
                  name="avsecplace"
                  value={formData.avsecplace}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="AVSEC Place  "
                />
              </div>

              {/* Basic Course */}
              <div>
                <label className="block mb-1 font-medium">Basic Course </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Basic Course  "
                />
              </div>

              {/* Basic Course Date */}
              <div>
                <label className="block mb-1 font-medium">
                  Basic Course Date
                </label>
                <input
                  type="date"
                  name="coursedate"
                  value={formData.coursedate}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Basic Course Expire Date */}
              <div>
                <label className="block mb-1 font-medium">
                  Basic Course Expire Date
                </label>
                <input
                  type="date"
                  name="courseexp"
                  value={formData.courseexp}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder=" Basic Course Expire Date  "
                />
              </div>

              {/* Basic Course Place */}
              <div>
                <label className="block mb-1 font-medium">
                  Basic Course Place
                </label>
                <input
                  type="text"
                  name="courseplace"
                  value={formData.courseplace}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder=" Basic Course Place  "
                />
              </div>

              {/* Pass Details */}
              <div>
                <label className="block mb-1 font-medium">Pass Details</label>
                <input
                  type="text"
                  name="passno"
                  value={formData.passno}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder=" Pass Details  "
                />
              </div>

              {/* Pass Expiry Date */}
              <div>
                <label className="block mb-1 font-medium">
                  Pass Expiry Date
                </label>
                <input
                  type="date"
                  name="passexp"
                  value={formData.passexp}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder=" Pass Expiry Date  "
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block mb-1 font-medium">Photo Upload</label>
                <input
                  type="file"
                  name="photo"
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              {/* Add other fields here following the same div structure... */}
            </div>

            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-3 rounded-lg transition duration-200 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Submitting..." : "Add Employee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

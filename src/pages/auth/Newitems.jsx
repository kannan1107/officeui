import { useState } from "react";
import { useSelector } from "react-redux";
import { usePostItemMutation } from "../../features/ApplicationApi";
import * as XLSX from "xlsx";

function Newitems() {
  const [postItem, { isLoading }] = usePostItemMutation();
  const currentUser = useSelector((state) => state.auth?.user);
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const loggedInUser =
    currentUser?.name ||
    storedUser?.name ||
    storedUser?.fullName ||
    "Unknown User";

  const initialFormData = {
    itemname: "",
    batch: "",
    category: "",
    image: [],
    partno: "",
    alternativePart: "",
    condition: "",
    quantity: "",
    status: "",
    location: "",
    locationId: "",
    place: "",
    placeId: "",
    selfLife: "",
    description: "",
    certificate: "",
    addedBy: "",
    addedDate: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [excelRows, setExcelRows] = useState([]);

  // -----------------------------
  // Normal form input
  // -----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -----------------------------
  // Images
  // -----------------------------
  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: Array.from(e.target.files),
    }));
  };

  // -----------------------------
  // Certificate
  // -----------------------------
  const handleCertificateChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      certificate: e.target.files[0],
    }));
  };

  // -----------------------------
  // Excel Import
  // -----------------------------
  const handleExcelChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);

        const workbook = XLSX.read(data, {
          type: "array",
        });

        // Get first sheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convert Excel sheet to JSON
        const rows = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        });

        console.log("Excel Rows:", rows);

        if (!rows.length) {
          alert("Excel file is empty.");
          return;
        }

        setExcelRows(rows);

        // Fill form with first Excel row
        const row = rows[0];

        setFormData((prev) => ({
          ...prev,

          itemname: row.itemname || "",
          batch: row.batch || "",
          category: row.category || "",
          partno: row.partno || "",
          alternativePart: row.alternativePart || "",
          condition: row.condition || "",
          quantity: row.quantity || "",
          status: row.status || "",
          location: row.location || "",
          locationId: row.locationId || "",
          place: row.place || "",
          placeId: row.placeId || "",
          selfLife: row.selfLife || "",
          description: row.description || "",

          addedBy: loggedInUser,

          addedDate: formatExcelDate(row.addedDate),
        }));
      } catch (error) {
        console.error("Excel error:", error);
        alert("Failed to read Excel file.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // -----------------------------
  // Excel date conversion
  // -----------------------------
  const formatExcelDate = (value) => {
    if (!value) return "";

    // If Excel gives a number
    if (typeof value === "number") {
      const date = XLSX.SSF.parse_date_code(value);

      if (date) {
        return `${date.y}-${String(date.m).padStart(2, "0")}-${String(
          date.d,
        ).padStart(2, "0")}`;
      }
    }

    // If Excel gives a normal date string
    if (typeof value === "string") {
      const parsedDate = new Date(value);

      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split("T")[0];
      }

      return value;
    }

    return "";
  };

  // -----------------------------
  // Submit single item
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    if (!loggedInUser) {
      alert("Unable to identify the logged-in user.");
      return;
    }

    const submitData = {
      ...formData,

      addedBy: loggedInUser,

      addedDate: formData.addedDate || new Date().toISOString().split("T")[0],
    };

    Object.entries(submitData).forEach(([key, val]) => {
      if (key === "image") {
        val.forEach((file) => {
          data.append("image", file);
        });
      } else if (key === "certificate") {
        if (val) {
          data.append("certificate", val);
        }
      } else if (val !== undefined && val !== "") {
        data.append(key, val);
      }
    });

    try {
      await postItem(data).unwrap();

      alert("Item added successfully!");

      setFormData(initialFormData);
      setExcelRows([]);
    } catch (err) {
      console.error(err);

      alert("Failed to add item: " + (err?.data?.message || "Unknown error"));
    }
  };

  // -----------------------------
  // Field helper
  // -----------------------------
  const field = (label, name, type = "text", placeholder = "") => (
    <div>
      <label className="block mb-1 font-medium">{label}</label>

      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full border rounded-lg px-3 py-2"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="pt-16 bg-gray-100 min-h-screen">
      <div className="p-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-3xl font-bold text-center mb-6">Add New Item</h2>

          {/* ================================= */}
          {/* EXCEL IMPORT */}
          {/* ================================= */}

          <div className="mb-8 p-5 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50">
            <h3 className="text-xl font-semibold mb-2">Import from Excel</h3>

            <p className="text-sm text-gray-600 mb-3">
              Upload an Excel file to automatically fill the form using the
              first row.
            </p>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelChange}
              className="w-full border rounded-lg px-3 py-2 bg-white"
            />

            {excelRows.length > 0 && (
              <p className="mt-2 text-green-600 font-medium">
                {excelRows.length} row(s) found in Excel.
              </p>
            )}
          </div>

          {/* ================================= */}
          {/* FORM */}
          {/* ================================= */}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {field("Item Name", "itemname", "text", "Enter Item name")}

            {field("Batch", "batch", "text", "Enter Batch")}

            {field("Category", "category", "text", "Enter Item category")}

            {/* Images */}
            <div>
              <label className="block mb-1 font-medium">Images</label>

              <input
                type="file"
                name="image"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* Certificate */}
            <div>
              <label className="block mb-1 font-medium">Certificate</label>

              <input
                type="file"
                name="certificate"
                onChange={handleCertificateChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {field("Part Number", "partno", "text", "Enter Part Number")}

            {field(
              "Alternative Part",
              "alternativePart",
              "text",
              "Enter Alternative Part Number",
            )}

            {field("Condition", "condition", "text", "Enter Item condition")}

            {field("Quantity", "quantity", "number", "Enter quantity")}

            {field("Status", "status", "text", "Enter item status")}

            {field("Location", "location", "text", "Enter item location")}

            {field("Location ID", "locationId", "text", "Enter location ID")}

            {field("Place", "place", "text", "Enter your place")}

            {field("Place ID", "placeId", "text", "Enter place ID")}

            {field("Self Life", "selfLife", "text", "Enter Self Life")}

            <div>
              <label className="block mb-1 font-medium">Added By</label>
              <input
                type="text"
                value={loggedInUser}
                readOnly
                className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>

            {/* Added Date */}
            <div>
              <label className="block mb-1 font-medium">Added Date</label>

              <input
                type="date"
                name="addedDate"
                value={formData.addedDate}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Description</label>

              <textarea
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Write description"
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Newitems;

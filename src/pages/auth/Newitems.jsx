import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  usePostItemMutation,
  useGetItemsQuery,
  useGetUsersQuery,
} from "../../features/ApplicationApi";
import * as XLSX from "xlsx";

function Newitems() {
  const [postItem, { isLoading }] = usePostItemMutation();
  const { data: response, refetch } = useGetItemsQuery();
  const { data: usersResponse } = useGetUsersQuery();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth?.user);
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const loginEmail = localStorage.getItem("email") || "";
  const users = Array.isArray(usersResponse)
    ? usersResponse
    : usersResponse?.users || usersResponse?.data || [];
  const matchingUser = users.find(
    (user) => user.email?.toLowerCase() === loginEmail.toLowerCase(),
  );
  const loggedInUser =
    currentUser?.name ||
    storedUser?.name ||
    storedUser?.fullName ||
    matchingUser?.name ||
    loginEmail.split("@")[0] ||
    "Unknown User";

  const initialFormData = {
    itemname: "",
    batch: "",
    category: "",
    image: [],
    aircraft: "",
    partno: "",
    alternativePart: "",
    sno: "",
    condition: "",
    quantity: "",
    status: "",
    location: "",
    msn: "",
    tagId: "",
    place: "",
    placeId: "",
    selfLife: "",
    description: "",
    certificate: "",
    addedBy: "",
    addedDate: new Date().toISOString().split("T")[0],
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

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        });

        console.log("RAW EXCEL DATA:", rows);

        if (!rows.length) {
          alert("Excel file is empty.");
          return;
        }

        const mappedRows = rows.map((row) => {
          const getCell = (...aliases) => {
            const normalizedAliases = aliases.map((alias) =>
              alias.toLowerCase().replace(/[^a-z0-9]/g, ""),
            );
            const entry = Object.entries(row).find(([header]) =>
              normalizedAliases.includes(
                header.toLowerCase().replace(/[^a-z0-9]/g, ""),
              ),
            );
            return String(entry?.[1] ?? "").trim();
          };

          const description = getCell(
            "DESCRIPTION",
            "ITEM DESCRIPTION",
            "ITEM NAME",
          );

          return {
            itemname: description,

            batch: getCell(
              "BATCH",
              "BATCH NO",
              "BATCH NUMBER",
              "LOT",
              "LOT NO",
            ),

            category: getCell("CATEGORY", "ITEM CATEGORY"),

            aircraft: getCell("AIRCRAFT"),

            partno: getCell("PART NUMBER", "PART NO", "PART NO.", "PART#"),

            alternativePart: getCell(
              "ALT PART NUMBER",
              "ALTERNATIVE PART NUMBER",
            ),

            sno: getCell("SERIAL NUMBER", "SERIAL NO", "SERIAL NO."),

            quantity: getCell("QTY", "QUANTITY"),

            location: getCell("NEW LOCATION", "LOCATION"),

            msn: getCell("MSN"),

            tagId: getCell("TAG NUMBER", "TAG NO", "TAG ID"),

            description,

            // Empty fields not present in Excel
            condition: "",
            status: "",
            place: "",
            placeId: "",
            selfLife: "",

            image: [],
            certificate: "",

            addedBy: loggedInUser,

            addedDate: new Date().toISOString().split("T")[0],

            approvalStatus: "pending",
          };
        });

        console.log("MAPPED DATA:", mappedRows);

        // Skip rows that cannot satisfy the backend's required fields.
        const invalidRows = mappedRows.flatMap((row, index) => {
          const missing = [
            !row.batch && "Batch",
            !row.category && "Category",
            !row.itemname && "Description",
            !row.partno && "Part Number",
          ].filter(Boolean);
          return missing.length ? [{ rowNumber: index + 2, missing }] : [];
        });
        const validRows = mappedRows.filter(
          (row) => row.batch && row.category && row.itemname && row.partno,
        );

        if (!validRows.length) {
          setExcelRows([]);
          const missingFields = [
            ...new Set(invalidRows.flatMap((row) => row.missing)),
          ];
          alert(
            `No rows imported. All ${invalidRows.length} row(s) were skipped because they are missing: ${missingFields.join(", ")}.`,
          );
          return;
        }

        setExcelRows(validRows);

        // Show first row in form
        setFormData((prev) => ({
          ...prev,
          ...validRows[0],
          image: [],
          certificate: null,
        }));

        const skippedMessage = invalidRows.length
          ? ` ${invalidRows.length} incomplete row(s) skipped.`
          : "";
        alert(`${validRows.length} rows loaded successfully.${skippedMessage}`);
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
  // Submit single item (manual form)
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.batch.trim() || !formData.category.trim()) {
      alert("Batch and Category are required.");
      return;
    }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "image") {
          value.forEach((img) => data.append("image", img));
        } else if (value !== undefined && value !== null && value !== "") {
          data.append(key, value);
        }
      });
      data.append("addedBy", loggedInUser);
      data.append("approvalStatus", "pending");
      await postItem(data).unwrap();
      alert("Item submitted successfully.");
      setFormData(initialFormData);
      await refetch();
      navigate("/grn-approval");
    } catch (err) {
      alert(
        "Failed to submit: " +
          (err?.data?.message || err?.message || "Unknown error"),
      );
    }
  };

  // -----------------------------
  // Submit Excel items
  // -----------------------------
  const handleExcelSubmit = async () => {
    if (!excelRows.length) {
      alert("Please upload an Excel file first.");
      return;
    }

    try {
      for (const row of excelRows) {
        const data = new FormData();

        Object.entries(row).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            data.append(key, String(value));
          }
        });

        console.log("Uploading row:", row);

        await postItem(data).unwrap();
      }

      alert(`${excelRows.length} items imported successfully.`);

      setExcelRows([]);
      setFormData(initialFormData);

      await refetch();

      navigate("/grn-approval");
    } catch (err) {
      console.error("Excel upload failed:", err);

      alert(
        "Failed to upload Excel: " +
          (err?.data?.message || err?.message || "Unknown error"),
      );
    }
  };

  const allItems = Array.isArray(response)
    ? response
    : response?.items || response?.data || [];
  const getAddedByValue = (item) => {
    if (typeof item.addedBy === "object" && item.addedBy !== null) {
      return (
        item.addedBy.name || item.addedBy.fullName || item.addedBy.email || ""
      );
    }
    return String(item.addedBy ?? "");
  };
  const mySubmissions = allItems
    .filter(
      (i) =>
        getAddedByValue(i).toLowerCase() === loggedInUser.toLowerCase() &&
        i.approvalStatus,
    )
    .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));

  const STATUS_COLOR = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
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
        required={name === "batch" || name === "category"}
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
              first row. Rows missing required fields are skipped.
            </p>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelChange}
              className="w-full border rounded-lg px-3 py-2 bg-white"
            />

            {excelRows.length > 0 && (
              <div className="mt-4">
                <p className="text-green-600 font-medium mb-3">
                  {excelRows.length} rows ready for import.
                </p>

                <button
                  type="button"
                  onClick={handleExcelSubmit}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading
                    ? "Uploading..."
                    : `Upload ${excelRows.length} Items`}
                </button>
              </div>
            )}
          </div>

          {/* ================================= */}
          {/* FORM */}
          {/* ================================= */}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {field("Item Name", "itemname", "text", "Enter Description")}

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
            {field("Aircraft", "aircraft", "text", "Enter Aircraft")}

            {field("Part Number", "partno", "text", "Enter Part Number")}

            {field(
              "Alternative Part",
              "alternativePart",
              "text",
              "Enter Alternative Part Number",
            )}
            {field("SNO", "sno", "text", "Enter Serial Number")}

            {field("Condition", "condition", "text", "Enter Item condition")}

            {field("Quantity", "quantity", "number", "Enter quantity")}

            {field("Status", "status", "text", "Enter item status")}

            {field("Location", "location", "text", "Enter item location")}

            {field("Tag ID", "tagId", "text", "Enter Tag ID")}

            {field("Place", "place", "text", "Enter your place")}

            {field("Place ID", "placeId", "text", "Enter place ID")}

            {field("Self Life", "selfLife", "text", "Enter Self Life")}
            {field("MSN", "msn", "text", "Enter your place")}

            <div>
              <label className="block mb-1 font-medium">Added By</label>
              <input
                type="text"
                value={loggedInUser}
                readOnly
                className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>

            {/* Description */}
            {/* <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Description</label>

              <textarea
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Write description"
              />
            </div> */}

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

        {/* GRN Submissions */}
        {mySubmissions.length > 0 && (
          <div className="bg-white shadow-lg rounded-xl p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">My GRN Submissions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left border-b">
                    <th className="py-2 px-4">Item Name</th>
                    <th className="py-2 px-4">Part No</th>
                    <th className="py-2 px-4">Quantity</th>
                    <th className="py-2 px-4">Location</th>
                    <th className="py-2 px-4">Place</th>
                    <th className="py-2 px-4">Added Date</th>
                    <th className="py-2 px-4">Approval Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mySubmissions.map((item) => (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 font-medium">{item.itemname}</td>
                      <td className="py-2 px-4">{item.partno || "-"}</td>
                      <td className="py-2 px-4">{item.quantity}</td>
                      <td className="py-2 px-4">{item.location || "-"}</td>
                      <td className="py-2 px-4">{item.place || "-"}</td>
                      <td className="py-2 px-4">
                        {item.addedDate
                          ? new Date(item.addedDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[item.approvalStatus] || "bg-gray-100 text-gray-600"}`}
                        >
                          {item.approvalStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Newitems;

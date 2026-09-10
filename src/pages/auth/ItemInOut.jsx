import { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGetItemsQuery,
  useItemStockOutMutation,
  useUpdateItemMutation,
} from "../../features/ApplicationApi";

function ItemInOut() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: response, isLoading, error, refetch } = useGetItemsQuery();
  const [itemStockOut] = useItemStockOutMutation();
  const [updateItem] = useUpdateItemMutation();
  const currentUser = useSelector((state) => state.auth?.user);
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const loggedInUser =
    currentUser?.name ||
    storedUser?.name ||
    storedUser?.fullName ||
    "Unknown User";

  const items = Array.isArray(response)
    ? response
    : response?.items || response?.data || [];

  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(
    () => location.state?.item || null,
  );
  const [tab, setTab] = useState("in"); // "in" | "out"
  const [form, setForm] = useState({
    person: "",
    quantity: "",
    date: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const isSelectedItemPage = Boolean(location.state?.item);

  const filtered = items.filter((item) =>
    [item.itemname, item.batch, item.category, item.partno].some((v) =>
      String(v ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const openItem = (item) => {
    setSelectedItem(item);
    setTab("in");
    setForm({ person: "", quantity: "", date: "", note: "" });
  };

  const handleStockIn = async (e) => {
    e.preventDefault();
    if (!form.person.trim() || !form.quantity || !form.date) return;
    setSubmitting(true);
    try {
      const inEntry = {
        person: form.person.trim(),
        quantity: Number(form.quantity),
        date: form.date,
        note: form.note,
        addedBy: loggedInUser,
      };
      const updatedInHistory = [...(selectedItem.inHistory || []), inEntry];
      const newQty =
        (Number(selectedItem.quantity) || 0) + Number(form.quantity);
      await updateItem({
        itemId: selectedItem._id,
        updatedData: {
          ...selectedItem,
          inHistory: updatedInHistory,
          quantity: newQty,
        },
      }).unwrap();
      setForm({ person: "", quantity: "", date: "", note: "" });
      await refetch();
      // refresh selectedItem from updated list
      setSelectedItem((prev) => ({
        ...prev,
        inHistory: updatedInHistory,
        quantity: newQty,
      }));
    } catch (err) {
      alert("Stock in failed: " + (err?.data?.message || "Unknown error"));
    }
    setSubmitting(false);
  };

  const handleStockOut = async (e) => {
    e.preventDefault();
    if (!form.person.trim() || !form.quantity || !form.date) return;
    setSubmitting(true);
    try {
      await itemStockOut({
        id: selectedItem._id,
        data: {
          person: form.person.trim(),
          place: selectedItem.place || "-",
          quantity: Number(form.quantity),
          note: form.date,
          addedBy: loggedInUser,
        },
      }).unwrap();
      setForm({ person: "", quantity: "", date: "", note: "" });
      await refetch();
      setSelectedItem((prev) => ({
        ...prev,
        outHistory: [
          ...(prev.outHistory || []),
          {
            person: form.person.trim(),
            quantity: Number(form.quantity),
            date: form.date,
            note: form.note,
            addedBy: loggedInUser,
          },
        ],
        quantity: Math.max(
          0,
          (Number(prev.quantity) || 0) - Number(form.quantity),
        ),
      }));
    } catch (err) {
      alert("Stock out failed: " + (err?.data?.message || "Unknown error"));
    }
    setSubmitting(false);
  };

  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "-");

  if (isLoading) return <div className="pt-16 p-6">Loading...</div>;
  if (error)
    return <div className="pt-16 p-6 text-red-500">Error loading items.</div>;

  return (
    <div className="pt-16 bg-gray-100 min-h-screen">
      {!isSelectedItemPage && (
        <div className="p-6">
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-3xl font-bold text-center mb-4">
              Item In / Out
            </h2>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, batch, category, part no..."
              className="w-full border rounded-lg px-3 py-2 mb-4 text-sm"
            />
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    {[
                      "Item Name",
                      "Batch",
                      "Category",
                      "Part No",
                      "Quantity",
                      "In Count",
                      "Out Count",
                      "Action",
                    ].map((h) => (
                      <th key={h} className="py-2 px-4 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-6 text-center text-gray-400"
                      >
                        No items found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item._id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium">
                          {item.itemname}
                        </td>
                        <td className="py-2 px-4">{item.batch}</td>
                        <td className="py-2 px-4">{item.category}</td>
                        <td className="py-2 px-4">{item.partno}</td>
                        <td className="py-2 px-4 font-semibold">
                          {item.quantity}
                        </td>
                        <td className="py-2 px-4 text-green-600 font-semibold">
                          {(item.inHistory || []).length}
                        </td>
                        <td className="py-2 px-4 text-red-500 font-semibold">
                          {(item.outHistory || []).length}
                        </td>
                        <td className="py-2 px-4">
                          <button
                            onClick={() => openItem(item)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                          >
                            View / Add
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <div
          className={
            isSelectedItemPage
              ? "p-6"
              : "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          }
        >
          <div
            className={
              isSelectedItemPage
                ? "bg-white rounded-xl shadow-xl w-full max-w-3xl mx-auto overflow-y-auto p-6"
                : "bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6"
            }
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedItem.itemname}</h3>
              <button
                onClick={() =>
                  isSelectedItemPage
                    ? navigate("/stores")
                    : setSelectedItem(null)
                }
                type="button"
                aria-label="Close item details"
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Summary */}
            <div className="flex gap-4 text-sm bg-gray-50 rounded-lg px-4 py-3 mb-4">
              <span>
                Total Qty: <strong>{selectedItem.quantity}</strong>
              </span>
              <span className="text-green-600">
                In: <strong>{(selectedItem.inHistory || []).length}</strong>
              </span>
              <span className="text-red-500">
                Out: <strong>{(selectedItem.outHistory || []).length}</strong>
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {["in", "out"].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setForm({ person: "", quantity: "", date: "", note: "" });
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t ? (t === "in" ? "bg-green-500 text-white" : "bg-red-500 text-white") : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {t === "in" ? "Stock In" : "Stock Out"}
                </button>
              ))}
            </div>

            {/* Add Form */}
            <form
              onSubmit={tab === "in" ? handleStockIn : handleStockOut}
              className="grid grid-cols-2 gap-3 mb-5"
            >
              <div>
                <label className="block text-xs mb-1 text-gray-500">
                  Person Name
                </label>
                <input
                  type="text"
                  value={form.person}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, person: e.target.value }))
                  }
                  placeholder="Enter person name"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-500">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, quantity: e.target.value }))
                  }
                  placeholder="Enter quantity"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-500">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-500">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, note: e.target.value }))
                  }
                  placeholder="Optional note"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-2 rounded-lg text-white text-sm disabled:opacity-50 ${tab === "in" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
                >
                  {submitting
                    ? "Saving..."
                    : tab === "in"
                      ? "Add Stock In"
                      : "Add Stock Out"}
                </button>
              </div>
            </form>

            {/* History Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* In History */}
              <div>
                <h4 className="font-semibold text-sm text-green-600 mb-2">
                  In History ({(selectedItem.inHistory || []).length})
                </h4>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-green-50 text-left">
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Person</th>
                        <th className="px-3 py-2">Qty</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(selectedItem.inHistory || []).length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center text-gray-400 py-3"
                          >
                            No in history.
                          </td>
                        </tr>
                      ) : (
                        (selectedItem.inHistory || []).map((entry, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2">{i + 1}</td>
                            <td className="px-3 py-2">{entry.person}</td>
                            <td className="px-3 py-2 text-green-600 font-semibold">
                              +{entry.quantity}
                            </td>
                            <td className="px-3 py-2">{fmt(entry.date)}</td>
                            <td className="px-3 py-2">{entry.note || "-"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Out History */}
              <div>
                <h4 className="font-semibold text-sm text-red-500 mb-2">
                  Out History ({(selectedItem.outHistory || []).length})
                </h4>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-red-50 text-left">
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Person</th>
                        <th className="px-3 py-2">Qty</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(selectedItem.outHistory || []).length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center text-gray-400 py-3"
                          >
                            No out history.
                          </td>
                        </tr>
                      ) : (
                        (selectedItem.outHistory || []).map((entry, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2">{i + 1}</td>
                            <td className="px-3 py-2">{entry.person}</td>
                            <td className="px-3 py-2 text-red-500 font-semibold">
                              -{entry.quantity}
                            </td>
                            <td className="px-3 py-2">
                              {fmt(entry.date || entry.note)}
                            </td>
                            <td className="px-3 py-2">{entry.note || "-"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemInOut;

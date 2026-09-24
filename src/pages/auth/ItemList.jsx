import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { useGetItemsQuery, useUpdateItemMutation, useDeleteItemMutation } from "../../features/ApplicationApi";

function ItemList() {
    const { data: items, error, isLoading, refetch } = useGetItemsQuery();
    const [editItem, setEditItem] = useState(null);
    const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
    const [deleteItem, { isLoading: isDeleting }] = useDeleteItemMutation();

    const currentUser = useSelector((state) => state.auth?.user);
    const itemsData = Array.isArray(items) ? items : items?.items || items?.data || [];

    const [search, setSearch] = useState("");
    const [filterLocation, setFilterLocation] = useState("");
    const [filterLocationId, setFilterLocationId] = useState("");
    const [filterPlace, setFilterPlace] = useState("");
    const [filterPlaceId, setFilterPlaceId] = useState("");

    const unique = (key) => [...new Set(itemsData.map((i) => i[key]).filter(Boolean))];

    const filteredData = useMemo(() => {
        const q = search.toLowerCase();
        return itemsData.filter((item) =>
            (!filterLocation || item.location === filterLocation) &&
            (!filterLocationId || item.locationId === filterLocationId) &&
            (!filterPlace || item.place === filterPlace) &&
            (!filterPlaceId || item.placeId === filterPlaceId) &&
            (!q || [item.itemname, item.batch, item.category, item.partno, item.alternativePart, item.status, item.description]
                .some((v) => String(v ?? "").toLowerCase().includes(q)))
        );
    }, [itemsData, search, filterLocation, filterLocationId, filterPlace, filterPlaceId]);

    const exportToExcel = () => {
        const rows = filteredData.map((item) => ({
            "Item Name": item.itemname,
            "Batch": item.batch,
            "Category": item.category,
            "Part No": item.partno,
            "Alt Part": item.alternativePart,
            "Condition": item.condition,
            "Quantity": item.quantity,
            "Status": item.status,
            "Location": item.location,
            "Location ID": item.locationId,
            "Place": item.place,
            "Place ID": item.placeId,
            "Self Life": item.selfLife,
            "Description": item.description,
            "Added By": typeof item.addedBy === "object" ? item.addedBy?.name || item.addedBy?.email || "" : item.addedBy,
            "Added Date": item.addedDate ? new Date(item.addedDate).toLocaleDateString() : "",
            "Updated By": typeof item.updatedBy === "object" ? item.updatedBy?.name || item.updatedBy?.email || "" : item.updatedBy,
            "Updated Date": item.updatedDate ? new Date(item.updatedDate).toLocaleDateString() : "",
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Items");
        XLSX.writeFile(wb, "item-list.xlsx");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await deleteItem(id).unwrap();
            await refetch();
        } catch (err) {
            alert("Delete failed: " + (err?.data?.message || err?.error || "Unknown error"));
        }
    };

    const strVal = (field, val) => {
        if (field.includes('Date')) return val ? String(val).slice(0, 10) : '';
        if (typeof val === 'object' && val !== null) return val?.name || val?.email || '';
        return val ?? '';
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditItem((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const updatedData = {
                ...editItem,
                updatedBy: currentUser?.name || currentUser?.email || "Unknown",
                updatedDate: new Date().toISOString(),
            };
            await updateItem({ itemId: editItem._id || editItem.id, updatedData }).unwrap();
            setEditItem(null);
            await refetch();
        } catch (err) {
            alert("Update failed: " + (err?.data?.message || err?.error || "Unknown error"));
        }
    };

    if (isLoading) return <div className="pt-16 p-6">Loading...</div>;
    if (error) return <div className="pt-16 p-6 text-red-500">Error: {error.message}</div>;

    return (
        <div className="pt-16 bg-gray-100 min-h-screen">
            <div className="p-6">
                <div className="bg-white shadow-lg rounded-xl p-6 overflow-x-auto">
                    <h2 className="text-3xl font-bold text-center mb-4">Item List</h2>

                    {/* Search */}
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, batch, category, part no, status..."
                        className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
                    />

                    {/* Filters + Export */}
                    <div className="flex flex-wrap gap-3 mb-4 items-end">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Location</label>
                            <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                                <option value="">All</option>
                                {unique("location").map((v) => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Location ID</label>
                            <select value={filterLocationId} onChange={(e) => setFilterLocationId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                                <option value="">All</option>
                                {unique("locationId").map((v) => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Place</label>
                            <select value={filterPlace} onChange={(e) => setFilterPlace(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                                <option value="">All</option>
                                {unique("place").map((v) => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Place ID</label>
                            <select value={filterPlaceId} onChange={(e) => setFilterPlaceId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                                <option value="">All</option>
                                {unique("placeId").map((v) => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={() => { setSearch(""); setFilterLocation(""); setFilterLocationId(""); setFilterPlace(""); setFilterPlaceId(""); }}
                            className="px-3 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                            Clear
                        </button>
                        <button
                            onClick={exportToExcel}
                            className="ml-auto px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            ⬇ Download Excel
                        </button>
                    </div>

                    <table className="min-w-full bg-white text-sm">
                        <thead>
                            <tr className="border-b bg-gray-50 text-left">
                                <th className="py-2 px-4">Name</th>
                                <th className="py-2 px-4">Batch</th>
                                <th className="py-2 px-4">Category</th>
                                <th className="py-2 px-4">Part No</th>
                                <th className="py-2 px-4">Alt Part</th>
                                <th className="py-2 px-4">Condition</th>
                                <th className="py-2 px-4">Quantity</th>
                                <th className="py-2 px-4">Status</th>
                                <th className="py-2 px-4">Location</th>
                                <th className="py-2 px-4">Location ID</th>
                                <th className="py-2 px-4">Place</th>
                                <th className="py-2 px-4">Place ID</th>
                                <th className="py-2 px-4">Self Life</th>
                                <th className="py-2 px-4">Description</th>
                                <th className="py-2 px-4">Added By</th>
                                <th className="py-2 px-4">Added Date</th>
                                <th className="py-2 px-4">Updated By</th>
                                <th className="py-2 px-4">Updated Date</th>
                                <th className="py-2 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={19} className="py-6 text-center text-gray-500">
                                        No items found.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item._id || item.id} className="border-b hover:bg-gray-50">
                                        <td className="py-2 px-4">{item.itemname}</td>
                                        <td className="py-2 px-4">{item.batch}</td>
                                        <td className="py-2 px-4">{item.category}</td>
                                        <td className="py-2 px-4">{item.partno}</td>
                                        <td className="py-2 px-4">{item.alternativePart}</td>
                                        <td className="py-2 px-4">{item.condition}</td>
                                        <td className="py-2 px-4">{item.quantity}</td>
                                        <td className="py-2 px-4">{item.status}</td>
                                        <td className="py-2 px-4">{item.location}</td>
                                        <td className="py-2 px-4">{item.locationId}</td>
                                        <td className="py-2 px-4">{item.place}</td>
                                        <td className="py-2 px-4">{item.placeId}</td>
                                        <td className="py-2 px-4">{item.selfLife}</td>
                                        <td className="py-2 px-4 max-w-xs break-words">{item.description}</td>
                                        <td className="py-2 px-4">{typeof item.addedBy === "object" ? item.addedBy?.name || item.addedBy?.email || "" : item.addedBy}</td>
                                        <td className="py-2 px-4">{item.addedDate ? new Date(item.addedDate).toLocaleDateString() : ""}</td>
                                        <td className="py-2 px-4">{typeof item.updatedBy === "object" ? item.updatedBy?.name || item.updatedBy?.email || "" : item.updatedBy}</td>
                                        <td className="py-2 px-4">{item.updatedDate ? new Date(item.updatedDate).toLocaleDateString() : ""}</td>
                                        <td className="py-2 px-4">
                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                <button
                                                    onClick={() => setEditItem(item)}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id || item.id)}
                                                    disabled={isDeleting}
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {editItem && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-xl font-semibold">Edit Item</h3>
                            <button onClick={() => setEditItem(null)} className="text-gray-500 hover:text-gray-700">Close</button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            {[
                                ['itemname', 'Item Name'],
                                ['batch', 'Batch'],
                                ['category', 'Category'],
                                ['partno', 'Part No'],
                                ['alternativePart', 'Alt Part'],
                                ['condition', 'Condition'],
                                ['quantity', 'Quantity'],
                                ['status', 'Status'],
                                ['location', 'Location'],
                                ['locationId', 'Location ID'],
                                ['place', 'Place'],
                                ['placeId', 'Place ID'],
                                ['selfLife', 'Self Life'],
                                ['addedBy', 'Added By'],
                                ['addedDate', 'Added Date'],
                            ].map(([field, label]) => (
                                <div key={field} className="grid gap-2">
                                    <label className="text-sm font-medium">{label}</label>
                                    <input
                                        name={field}
                                        type={field.includes('Date') ? 'date' : 'text'}
                                        value={strVal(field, editItem[field])}
                                        onChange={handleEditChange}
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>
                            ))}
                            {[
                                ['updatedBy', 'Updated By'],
                                ['updatedDate', 'Updated Date'],
                            ].map(([field, label]) => (
                                <div key={field} className="grid gap-2">
                                    <label className="text-sm font-medium">{label}</label>
                                    <input
                                        name={field}
                                        type={field.includes('Date') ? 'date' : 'text'}
                                        value={strVal(field, editItem[field])}
                                        readOnly
                                        className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                                    />
                                </div>
                            ))}
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    name="description"
                                    value={editItem.description ?? ''}
                                    onChange={handleEditChange}
                                    rows={4}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditItem(null)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isUpdating ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ItemList;

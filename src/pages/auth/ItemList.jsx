import { useState } from "react";
import { useGetItemsQuery, useUpdateItemMutation, useDeleteItemMutation } from "../../features/ApplicationApi";

function ItemList() {
    const { data: items, error, isLoading, refetch } = useGetItemsQuery();
    const [editItem, setEditItem] = useState(null);
    const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
    const [deleteItem, { isLoading: isDeleting }] = useDeleteItemMutation();

    const itemsData = Array.isArray(items) ? items : items?.items || items?.data || [];

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await deleteItem(id).unwrap();
            await refetch();
        } catch (err) {
            alert("Delete failed: " + (err?.data?.message || err?.error || "Unknown error"));
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditItem((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await updateItem({ itemId: editItem._id || editItem.id, updatedData: editItem }).unwrap();
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
                    <h2 className="text-3xl font-bold text-center mb-6">Item List</h2>
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
                                <th className="py-2 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemsData.length === 0 ? (
                                <tr>
                                    <td colSpan={15} className="py-6 text-center text-gray-500">
                                        No items found.
                                    </td>
                                </tr>
                            ) : (
                                itemsData.map((item) => (
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
                            ].map(([field, label]) => (
                                <div key={field} className="grid gap-2">
                                    <label className="text-sm font-medium">{label}</label>
                                    <input
                                        name={field}
                                        value={editItem[field] ?? ''}
                                        onChange={handleEditChange}
                                        className="w-full border rounded-lg px-3 py-2"
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

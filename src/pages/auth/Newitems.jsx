import React, { useState } from 'react';
import { usePostItemMutation } from '../../features/ApplicationApi';

function Newitems() {
    const [postItem, { isLoading }] = usePostItemMutation();
    const [formData, setFormData] = useState({
        itemname: '', batch: '', category: '', image: null,
        partno: '', alternativePart: '', condition: '', quantity: '',
        status: '', location: '', locationId: '',
        place: '', placeId: '', selfLife: '', description: '',

    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, val]) => {
            if (val) data.append(key, val);
        });
        try {
            await postItem(data).unwrap();
            alert('Item added successfully!');
            setFormData({
                itemname: '', batch: '', category: '', image: null,
                partno: '', alternativePart: '', condition: '', quantity: '',
                status: '', location: '', locationId: '',
                place: '', placeId: '', selfLife: '', description: '',
            });
        } catch (err) {
            alert('Failed to add item: ' + (err?.data?.message || 'Unknown error'));
        }
    };

    const field = (label, name, type = 'text', placeholder = '') => (
        <div>
            <label className="block mb-1">{label}</label>
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
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {field('Item Name', 'itemname', 'text', 'Enter Item name')}
                        {field('Batch', 'batch', 'text', 'Enter Batch')}
                        {field('Category', 'category', 'text', 'Enter Item category')}

                        <div>
                            <label className="block mb-1">Image</label>
                            <input type="file" name="image" onChange={handleImageChange}
                                className="w-full border rounded-lg px-3 py-2" />
                        </div>

                        {field('Part Number', 'partno', 'text', 'Enter Part Number')}
                        {field('Alternative Part', 'alternativePart', 'text', 'Enter Alternative Part Number')}
                        {field('Condition', 'condition', 'text', 'Enter Item condition')}
                        {field('Quantity', 'quantity', 'number', 'Enter quantity')}
                        {field('Status', 'status', 'text', 'Enter item status')}
                        {field('Location', 'location', 'text', 'Enter item location')}
                        {field('Location ID', 'locationId', 'text', 'Enter location ID')}
                        {field('Place', 'place', 'text', 'Enter your place')}
                        {field('Place ID', 'placeId', 'text', 'Enter place ID')}
                        {field('Self Life', 'selfLife', 'text', 'Enter Self Life')}

                        <div className="md:col-span-2">
                            <label className="block mb-1">Description</label>
                            <textarea rows="3" name="description" value={formData.description}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                                placeholder="Write description" />
                        </div>

                        <div className="md:col-span-2 flex items-end">
                            <button type="submit" disabled={isLoading}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {isLoading ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Newitems;

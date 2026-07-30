import React, { useState } from 'react';
import { usePostEmployeeMutation } from '../features/ApplicationApi';


function AddEmployee() {
    const [postEmployee, { isLoading }] = usePostEmployeeMutation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        status: 'active',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await postEmployee(formData).unwrap();
            alert('Employee added successfully!');
            setFormData({
                name: '',
                email: '',
                phone: '',
                department: '',
                position: '',
                status: 'active',
            });
        } catch (err) {
            alert('Failed to add employee: ' + (err?.data?.message || 'Unknown error'));
        }
    };

    return (
        <div className=" bg-white p-6 rounded shadow">
            <div className=" bg-white shadow-lg rounded-xl p-8 pt-16 bg-gray-100 min-h-screen  ">
                <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">Add New Employee</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">

                        <div class="relative">
                            <label for="first-name"
                                class="absolute -top-2 left-4 bg-white dark:bg-neutral-900 px-1.5 text-xs font-medium text-slate-900 dark:text-slate-50">
                                First Name
                            </label>
                            <input type="text" id="first-name" name="first-name" placeholder="John Smith" required
                                class="block w-full px-4 py-3 text-sm text-slate-900 dark:text-slate-50 bg-transparent rounded-md outline-1 -outline-offset-1 outline-slate-300 dark:outline-neutral-700 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600" />
                        </div>

                        <div class="relative">
                            <label for="last-name"
                                class="absolute -top-2 left-4 bg-white dark:bg-neutral-900 px-1.5 text-xs font-medium text-slate-900 dark:text-slate-50">
                                Last Name
                            </label>
                            <input type="text" id="last-name" name="last-name" placeholder="Doe" required
                                class="block w-full px-4 py-3 text-sm text-slate-900 dark:text-slate-50 bg-transparent rounded-md outline-1 -outline-offset-1 outline-slate-300 dark:outline-neutral-700 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600" />
                        </div>

                        <div class="relative">
                            <label for="email"
                                class="absolute -top-2 left-4 bg-white dark:bg-neutral-900 px-1.5 text-xs font-medium text-slate-900 dark:text-slate-50">
                                Email address
                            </label>
                            <input type="email" id="email" name="email" placeholder="john@readymadeui.com" required
                                class="block w-full px-4 py-3 text-sm text-slate-900 dark:text-slate-50 bg-transparent rounded-md outline-1 -outline-offset-1 outline-slate-300 dark:outline-neutral-700 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600" />
                        </div>

                        <div class="relative">
                            <label for="phone"
                                class="absolute -top-2 left-4 bg-white dark:bg-neutral-900 px-1.5 text-xs font-medium text-slate-900 dark:text-slate-50">
                                Phone number
                            </label>
                            <input type="number" id="phone" name="phone" placeholder="+11800-259-854" required
                                class="block w-full px-4 py-3 text-sm text-slate-900 dark:text-slate-50 bg-transparent rounded-md outline-1 -outline-offset-1 outline-slate-300 dark:outline-neutral-700 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600" />
                        </div>

                        <div class="relative">
                            <label for="state"
                                class="absolute -top-2 left-4 bg-white dark:bg-neutral-900 px-1.5 text-xs font-medium text-slate-900 dark:text-slate-50">
                                State
                            </label>
                            <input type="text" id="state" name="state" placeholder="New York" required
                                class="block w-full px-4 py-3 text-sm text-slate-900 dark:text-slate-50 bg-transparent rounded-md outline-1 -outline-offset-1 outline-slate-300 dark:outline-neutral-700 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600" />
                        </div>

                        <div class="relative">
                            <label for="city"
                                class="absolute -top-2 left-4 bg-white dark:bg-neutral-900 px-1.5 text-xs font-medium text-slate-900 dark:text-slate-50">
                                City
                            </label>
                            <input type="text" id="city" name="city" placeholder="Manhattan" required
                                class="block w-full px-4 py-3 text-sm text-slate-900 dark:text-slate-50 bg-transparent rounded-md outline-1 -outline-offset-1 outline-slate-300 dark:outline-neutral-700 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600" />
                        </div>

                        <div class="relative col-span-full">
                            <label for="street"
                                class="absolute -top-2 left-4 bg-white dark:bg-neutral-900 px-1.5 text-xs font-medium text-slate-900 dark:text-slate-50">
                                Street address
                            </label>
                            <input type="text" id="street" name="street" placeholder="123 Main Street" required
                                class="block w-full px-4 py-3 text-sm text-slate-900 dark:text-slate-50 bg-transparent rounded-md outline-1 -outline-offset-1 outline-slate-300 dark:outline-neutral-700 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600" />
                        </div>

                        <div class="flex items-start col-span-full">
                            <label class="flex items-center group has-[input:checked]:text-slate-900">
                                <input id="tmc" name="tmc" type="checkbox" required class="sr-only" />
                                <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded outline-1 outline-slate-300 dark:outline-neutral-700
               bg-white dark:bg-neutral-800
               group-has-[input:checked]:bg-blue-600
               group-has-[input:checked]:outline-blue-600
               group-focus-within:outline-2
               group-focus-within:outline-blue-600" aria-hidden="true">
                                    <svg class="size-3 text-white opacity-0 group-has-[input:checked]:opacity-100" viewBox="0 0 12 10"
                                        fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 5l3 3 7-7" />
                                    </svg>
                                </span>
                                <span class="ml-3 text-sm text-slate-600 dark:text-slate-50">
                                    I accept the
                                </span>
                            </label>

                            <a href="#"
                                class="ml-1 text-sm font-medium text-blue-700 dark:text-blue-500 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                                Terms and Conditions
                            </a>
                        </div>
                    </div>

                </form>
            </div >
        </div >
    );
}

export default AddEmployee;

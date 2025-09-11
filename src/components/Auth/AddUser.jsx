import React, { useState, useEffect } from 'react';
import Authservices from '../../services/authServices';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AddUser = () => {
    const [form, setForm] = useState({
        name: '',
        surname: '',
        email: '',
        phoneNumber: '',
        
        password: '',
        depositAmount: '',
        typeIds: '',
        gainPercent: '',
        fin: '',
        passportNumber: '',
        passportSeries: '' // ✅ əlavə etdim
    });
    const [types, setTypes] = useState([]);
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // type listini gətiririk
    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await Authservices.GetTypesLists();
                setTypes(response.data.data || []); // backenddən gələn array
            } catch (error) {
                console.error("Failed to fetch types", error);
                toast.error("Failed to fetch types");
            }
        };
        fetchTypes();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setErrors({});
        try {
            const payload = {
                ...form,
                depositAmount: Number(form.depositAmount),
                typeIds: form.typeIds ? [Number(form.typeIds)] : [],
                gainPercent: Number(form.gainPercent)
            };
            const response = await Authservices.CreateUser(payload);
            console.log('User created successfully:', response.data);
            toast.success('User created successfully!');
            navigate("/all-users");
        } catch (error) {
            console.error('Failed to create user:', error.response?.data || error.message);

            const backendData = error.response?.data;

            if (backendData?.status === 400 && backendData.data) {
                const fieldErrors = {};
                backendData.data.forEach((item) => {
                    fieldErrors[item.field] = item.message;
                });
                setErrors(fieldErrors);
            } else if (backendData?.status >= 500) {
                toast.error(backendData.message);
            } else {
                toast.error(backendData?.message || 'Failed to create user');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-md dark:bg-gray-900">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Add User</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    'name',
                    'surname',
                    'email',
                    'phoneNumber',
                    'password',
                    'depositAmount',
                    'gainPercent',
                    'fin',
                    'passportNumber'
                ].map((field) => (
                    <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                            {field}
                        </label>
                        <input
                            type="text"
                            name={field}
                            value={form[field]}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 
                         dark:border-gray-700 rounded-md shadow-sm focus:outline-none 
                         focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm 
                         dark:bg-gray-800 dark:text-white"
                        />
                        {errors[field] && (
                            <p className="text-sm text-red-500 mt-1">{errors[field]}</p>
                        )}
                    </div>
                ))}

                {/* PASSPORT SERIES SELECT */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Passport Series
                    </label>
                    <select
                        name="passportSeries"
                        value={form.passportSeries}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 
                        dark:border-gray-700 rounded-md shadow-sm focus:outline-none 
                        focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm 
                        dark:bg-gray-800 dark:text-white"
                    >
                        <option value="">Select passport series</option>
                        <option value="AA">AA</option>
                        <option value="AZE">AZE</option>
                    </select>
                    {errors.passportSeries && (
                        <p className="text-sm text-red-500 mt-1">{errors.passportSeries}</p>
                    )}
                </div>

                {/* TYPE SELECT */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type
                    </label>
                    <select
                        name="typeIds"
                        value={form.typeIds}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 
                        dark:border-gray-700 rounded-md shadow-sm focus:outline-none 
                        focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm 
                        dark:bg-gray-800 dark:text-white"
                    >
                        <option value="">Select type</option>
                        {types.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                    {errors.typeIds && (
                        <p className="text-sm text-red-500 mt-1">{errors.typeIds}</p>
                    )}
                </div>
            </div>

            <div className="mt-6">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`px-6 py-2 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {loading ? 'Saving...' : 'Create User'}
                </button>
            </div>
        </div>
    );
};

export default AddUser;

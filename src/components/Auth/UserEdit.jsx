import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Authservices from '../../services/authServices';
import { useUser } from '../../contexts/UserContext';

const UserEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        surname: '',
        fin: '',
        mobile: '',
        depositAmount: '',
        gainPercent: '',
        email: '',
        active: false,
        lastLogin: '',
        createdDate: '',
        userTypes: []
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);
    const [roleLoading, setRoleLoading] = useState(false);
    const { user } = useUser();
    
        useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const response = await Authservices.getUserId(id);
                const userData = response.data;

                setForm({
                    name: userData.name || '',
                    surname: userData.surname || '',
                    fin: userData.fin || '',
                    mobile: userData.mobile || '',
                    depositAmount: userData.depositAmount || '',
                    gainPercent: userData.gainPercent || '',
                    email: userData.email || '',
                    active: userData.active || false,
                    lastLogin: userData.lastLogin ? new Date(userData.lastLogin).toLocaleString() : '',
                    createdDate: userData.createdDate ? new Date(userData.createdDate).toLocaleString() : '',
                    userTypes: userData.userTypes || []
                });

                // Set initial selected roles
                setSelectedRoleIds(userData.userTypes.map(role => role.id));
            } catch (error) {
                toast.error("Failed to fetch user data");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const payload = {
                name: form.name,
                surname: form.surname,
                fin: form.fin,
                mobile: form.mobile,
                depositAmount: Number(form.depositAmount),
                gainPercent: Number(form.gainPercent),
            };
            await Authservices.updateUserById(id, payload);
            toast.success("User updated successfully!");
            navigate('/all-users');
        } catch (error) {

            if (Array.isArray(error.response?.data?.data)) {
                const fieldErrors = {};
                error.response.data.data.forEach(item => {
                    fieldErrors[item.field] = item.message;
                });
                setErrors(fieldErrors);
            } else {
                toast.error("Failed to update user");
            }
        }
        finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = async () => {
        try {
            setLoading(true);
            await Authservices.UpdateUserActivityStatus(id);
            setForm(prev => ({ ...prev, active: !prev.active })); // UI-də toggle
            toast.success(`User status changed to ${!form.active ? 'Active' : 'Inactive'}`);
        } catch (error) {
            toast.error("Failed to change user status");
        } finally {
            setLoading(false);
        }
    };

    const openRoleModal = async () => {
        try {
            setRoleLoading(true);
            const response = await Authservices.GetTypesLists();
            setAvailableRoles(response.data.data);
            setShowRoleModal(true);
        } catch (error) {
            toast.error("Failed to fetch roles");
        } finally {
            setRoleLoading(false);
        }
    };

    const handleRoleSelection = (roleId) => {
        if (selectedRoleIds.includes(roleId)) {
            setSelectedRoleIds(selectedRoleIds.filter(id => id !== roleId));
        } else {
            setSelectedRoleIds([...selectedRoleIds, roleId]);
        }
    };

    const updateUserRoles = async () => {
        try {
            setRoleLoading(true);
            const payload = {
                userTypeIds: selectedRoleIds
            };

            await Authservices.updateUserPermissionsById(id, payload);

            toast.success("User roles updated successfully!");
            setShowRoleModal(false);
            const updatedRoles = availableRoles.filter(role => selectedRoleIds.includes(role.id));
            setForm(prev => ({ ...prev, userTypes: updatedRoles }));
        } catch (error) {
            toast.error("Failed to update user roles");
        } finally {
            setRoleLoading(false);
        }
    };

    const fields = [
        { label: 'Name', name: 'name', disabled: false },
        { label: 'Surname', name: 'surname', disabled: false },
        { label: 'Email', name: 'email', disabled: true },
        { label: 'FIN', name: 'fin', disabled: false },
        { label: 'Mobile', name: 'mobile', disabled: false },
        { label: 'Deposit Amount', name: 'depositAmount', disabled: false },
        { label: 'Gain Percent', name: 'gainPercent', disabled: false },
        { label: 'Last Login', name: 'lastLogin', disabled: true },
        { label: 'Created Date', name: 'createdDate', disabled: true }
    ];

    return (
        <div className='flex flex-col gap-3 w-[100%]'>
            <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-md dark:bg-gray-900 w-[100%]">
                <h2 className="text-2xl font-bold mb-4 dark:text-gray-200">Change User Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map(field => (
                        <div key={field.name}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {field.label}
                            </label>
                            <input
                                type="text"
                                name={field.name}
                                value={form[field.name]}
                                onChange={handleChange}
                                disabled={field.disabled}
                                className={`mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white disabled:bg-gray-200 disabled:text-gray-500`}
                            />
                            {errors[field.name] && (
                                <p className="text-sm text-red-500 mt-1">{errors[field.name]}</p>
                            )}

                        </div>
                    ))}
                </div>
                <div className="mt-6">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`px-6 py-2 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? 'Saving...' : 'Update User'}
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-md dark:bg-gray-900 w-[100%] flex justify-between items-start">
                <h2 className="text-2xl font-bold mb-4 dark:text-gray-200">Change User Active Status</h2>
                <div className="">
                    <button
                        onClick={handleChangeStatus}
                        disabled={loading}
                        className={`px-6 py-2 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : form.active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {loading ? 'Saving...' : form.active ? 'Deactivate et' : 'Activate et'}
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-md dark:bg-gray-900 w-[100%]">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold dark:text-gray-200">Current Roles</h2>
                    <button
                        onClick={openRoleModal}
                        disabled={loading || (user?.userTypes?.some(t => t.name === "customer"))}
                        className={`px-6 py-2 rounded-md text-white ${loading || (user?.userTypes?.some(t => t.name === "customer"))
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                    >
                        Change Roles
                    </button>
                </div>


                <div className="flex flex-wrap gap-2">
                    {form.userTypes && form.userTypes.length > 0 ? (
                        form.userTypes.map(role => (
                            <span key={role.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {role.name}
                            </span>
                        ))
                    ) : (
                        <p className="text-gray-500">No roles assigned</p>
                    )}
                </div>
            </div>

            {/* Role Management Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4 dark:text-gray-200">Manage User Roles</h3>

                        {roleLoading ? (
                            <p className="text-gray-500 dark:text-gray-400">Loading roles...</p>
                        ) : (
                            <>
                                <div className="max-h-60 overflow-y-auto mb-4">
                                    {availableRoles.length > 0 ? (
                                        availableRoles.map(role => (
                                            <div key={role.id} className="flex items-center mb-2">
                                                <input
                                                    type="checkbox"
                                                    id={`role-${role.id}`}
                                                    checked={selectedRoleIds.includes(role.id)}
                                                    onChange={() => handleRoleSelection(role.id)}
                                                    className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                    disabled={user?.userTypes?.some(t => t.name === "partner") && role.name !== "customer"}
                                                />
                                                <label htmlFor={`role-${role.id}`} className="text-gray-700 dark:text-gray-300">
                                                    {role.name}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">No roles available</p>
                                    )}

                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowRoleModal(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={updateUserRoles}
                                        disabled={roleLoading}
                                        className={`px-4 py-2 rounded-md text-white ${roleLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                    >
                                        {roleLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserEdit;
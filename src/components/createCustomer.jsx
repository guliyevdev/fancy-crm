import React, { useState } from "react";

const userTypes = [
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
  { value: "GUEST", label: "Guest" },
];

const CreateCustomer = ({ onCancel, onCreate }) => {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    phoneNumber: "",
    email: "",
    type: "",
    iden: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim())
      newErrors.name = "First name is required";
    else if (form.name.length > 50)
      newErrors.name = "Max 50 characters";

    if (!form.surname.trim())
      newErrors.surname = "Last name is required";
    else if (form.surname.length > 50)
      newErrors.surname = "Max 50 characters";

    if (!form.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";

    if (!form.email.trim())
      newErrors.email = "Email is required";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email))
      newErrors.email = "Email must be valid";

    if (!form.type) newErrors.type = "User type is required";

    if (!form.iden.trim()) newErrors.iden = "Identifier is required";

    if (!form.password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onCreate(form);
    setForm({
      name: "",
      surname: "",
      phoneNumber: "",
      email: "",
      type: "",
      iden: "",
      password: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-900 rounded-md shadow-md p-6 max-w-5xl mx-auto"
    >
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        Create New Customer
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* First Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
          >
            First Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            maxLength={50}
            value={form.name}
            onChange={handleChange}
            placeholder="First Name"
            className={`block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? "border-red-500" : ""
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="surname"
            className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
          >
            Last Name
          </label>
          <input
            type="text"
            id="surname"
            name="surname"
            maxLength={50}
            value={form.surname}
            onChange={handleChange}
            placeholder="Last Name"
            className={`block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.surname ? "border-red-500" : ""
            }`}
          />
          {errors.surname && (
            <p className="text-red-500 text-xs mt-1">{errors.surname}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            className={`block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.phoneNumber ? "border-red-500" : ""
            }`}
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className={`block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* User Type */}
        <div>
          <label
            htmlFor="type"
            className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
          >
            User Type
          </label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            className={`block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.type ? "border-red-500" : ""
            }`}
          >
            <option value="">Select user type</option>
            {userTypes.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="text-red-500 text-xs mt-1">{errors.type}</p>
          )}
        </div>

        {/* Identifier */}
        <div>
          <label
            htmlFor="iden"
            className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
          >
            Identifier
          </label>
          <input
            type="text"
            id="iden"
            name="iden"
            value={form.iden}
            onChange={handleChange}
            placeholder="Identifier"
            className={`block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.iden ? "border-red-500" : ""
            }`}
          />
          {errors.iden && (
            <p className="text-red-500 text-xs mt-1">{errors.iden}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className={`block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent py-2 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.password ? "border-red-500" : ""
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Create
        </button>
      </div>
    </form>
  );
};

export default CreateCustomer;

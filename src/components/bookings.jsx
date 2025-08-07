import React, { useState } from "react";
import { PencilLine, Trash } from "lucide-react";
import Modal from "react-modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

Modal.setAppElement("#root");

// Sample initial data for bookings
const initialBookings = [
  {
    bookingReference: "BR-001",
    room: {
      id: "a1b2c3d4",
      title: "Deluxe Suite",
      roomType: "Suite",
      maxPeople: 4,
      price: 120.0,
      description: "Spacious suite with sea view",
      size: "50m²",
    },
    customer: {
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "+1 123 456 7890",
      email: "john@example.com",
      status: "Active",
    },
    checkIn: "2025-07-01",
    checkOut: "2025-07-05",
    status: "Confirmed",
    created: new Date("2025-06-10T10:00:00"),
  },
  {
    bookingReference: "BR-002",
    room: {
      id: "x9y8z7w6",
      title: "Standard Room",
      roomType: "Standard",
      maxPeople: 2,
      price: 80.0,
      description: "Cozy standard room",
      size: "25m²",
    },
    customer: {
      firstName: "Amal",
      lastName: "Benali",
      phoneNumber: "+212 600 123456",
      email: "amal.benali@gmail.com",
      status: "Inactive",
    },
    checkIn: "2025-07-10",
    checkOut: "2025-07-12",
    status: "Pending",
    created: new Date("2025-06-15T12:30:00"),
  },
  // add more bookings as needed
];

const bookingStatusOptions = ["Pending", "Confirmed", "Cancelled", "Completed"];

const Bookings = () => {
  const [bookings, setBookings] = useState(initialBookings);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Export to Excel handler
  const exportToExcel = () => {
    const data = bookings.map((b) => ({
      BookingReference: b.bookingReference,
      RoomTitle: b.room.title,
      RoomType: b.room.roomType,
      CustomerName: `${b.customer.firstName} ${b.customer.lastName}`,
      CustomerEmail: b.customer.email,
      CustomerPhone: b.customer.phoneNumber,
      CheckIn: b.checkIn,
      CheckOut: b.checkOut,
      Status: b.status,
      Created: b.created.toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "bookings.xlsx");
  };

  // Open modals
  const openEditModal = (booking) => {
    // Create a shallow copy to allow editing
    setSelectedBooking({ ...booking });
    setEditOpen(true);
  };

  const openDeleteModal = (booking) => {
    setSelectedBooking(booking);
    setDeleteOpen(true);
  };

  // Handle edits on form fields
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedBooking((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save edits
  const saveEdit = (e) => {
    e.preventDefault();
    setBookings((prev) =>
      prev.map((b) =>
        b.bookingReference === selectedBooking.bookingReference ? selectedBooking : b
      )
    );
    setEditOpen(false);
  };

  // Confirm delete booking
  const confirmDelete = () => {
    setBookings((prev) =>
      prev.filter((b) => b.bookingReference !== selectedBooking.bookingReference)
    );
    setDeleteOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Bookings Management
        </h2>
        <button
          onClick={exportToExcel}
          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          title="Export bookings to Excel"
        >
          Export Excel
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Booking Ref.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Check-In</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Check-Out</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {bookings.map((booking, index) => (
              <tr key={booking.bookingReference} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{booking.bookingReference}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{booking.room.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {booking.customer.firstName} {booking.customer.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{booking.checkIn}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{booking.checkOut}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                      booking.status === "Confirmed"
                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                        : booking.status === "Cancelled"
                        ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"
                        : booking.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {new Date(booking.created).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-4 justify-end">
                  <button
                    onClick={() => openEditModal(booking)}
                    className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                    aria-label={`Edit booking ${booking.bookingReference}`}
                  >
                    <PencilLine size={20} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(booking)}
                    className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                    aria-label={`Delete booking ${booking.bookingReference}`}
                  >
                    <Trash size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={editOpen}
        onRequestClose={() => setEditOpen(false)}
        contentLabel="Edit Booking"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full p-6 outline-none"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Edit Booking
        </h3>
        {selectedBooking && (
          <form onSubmit={saveEdit} className="space-y-4 text-gray-900 dark:text-gray-100">
            <div>
              <label htmlFor="checkIn" className="block text-sm font-medium mb-1">
                Check-In Date
              </label>
              <input
                id="checkIn"
                name="checkIn"
                type="date"
                value={selectedBooking.checkIn}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="checkOut" className="block text-sm font-medium mb-1">
                Check-Out Date
              </label>
              <input
                id="checkOut"
                name="checkOut"
                type="date"
                value={selectedBooking.checkOut}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={selectedBooking.status}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {bookingStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteOpen}
        onRequestClose={() => setDeleteOpen(false)}
        contentLabel="Delete Booking"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 outline-none"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Confirm Delete
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Are you sure you want to delete booking{" "}
          <span className="font-semibold">{selectedBooking?.bookingReference}</span>?
        </p>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={() => setDeleteOpen(false)}
            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Bookings;

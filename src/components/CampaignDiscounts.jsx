import React, { useState, useEffect } from "react";
import { Plus, X, Trash2, Edit2 } from "lucide-react"; // Edit2 is pencil icon in lucide-react
import { Dialog } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import campaignDiscountService from "../services/campaignDiscountService";

const CampaignDiscounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDiscountId, setSelectedDiscountId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    discountPercent: 0,
    startDate: '',
    endDate: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);

  const navigate = useNavigate();

  const fetchDiscounts = async (keyword = '') => {
    setLoading(true);
    try {
      const result = await campaignDiscountService.search({ keyword }, 0, 10);
      setDiscounts(result.content || []);
    } catch (err) {
      toast.error("Failed to fetch discounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const exportToExcel = (data) => {
    const exportData = data.map(d => ({
      Title: d.title,
      Description: d.description,
      Discount: `${d.discountPercent}%`,
      'Start Date': d.startDate,
      'End Date': d.endDate
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Campaign Discounts');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, `CampaignDiscounts_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "discountPercent" ? parseFloat(value) : value
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await campaignDiscountService.save(form);
      toast.success("Discount created");
      setIsModalOpen(false);
      setForm({ title: '', description: '', discountPercent: 0, startDate: '', endDate: '' });
      fetchDiscounts();
    } catch {
      toast.error("Failed to create discount");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await campaignDiscountService.update(selectedDiscountId, form);
      toast.success("Discount updated");
      setIsModalOpen(false);
      setSelectedDiscountId(null);
      setForm({ title: '', description: '', discountPercent: 0, startDate: '', endDate: '' });
      setIsEditMode(false);
      fetchDiscounts();
    } catch {
      toast.error("Failed to update discount");
    }
  };

  const handleDelete = async () => {
    try {
      await campaignDiscountService.deleteById(selectedDiscountId);
      toast.success("Discount deleted");
      setDeleteModalOpen(false);
      setSelectedDiscountId(null);
      fetchDiscounts();
    } catch {
      toast.error("Failed to delete discount");
    }
  };

  // Open modal in edit mode with pre-filled data
  const openEditModal = (discount) => {
    setSelectedDiscountId(discount.id);
    setForm({
      title: discount.title,
      description: discount.description,
      discountPercent: discount.discountPercent,
      startDate: discount.startDate,
      endDate: discount.endDate,
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchDiscounts(searchTerm);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsEditMode(false);
              setForm({ title: '', description: '', discountPercent: 0, startDate: '', endDate: '' });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Discount
          </button>
          <button 
            onClick={() => exportToExcel(discounts)}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md"
          >
            Export Excel
          </button>
        </div>
      </div>

      <div className="card-header">
        <p className="card-title">Campaign Discounts</p>
      </div>

      <div className="card-body p-0">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="relative h-[500px] w-full overflow-auto rounded-none">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">End Date</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{discount.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{discount.discountPercent}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{discount.startDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{discount.endDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-3 justify-end">
                      <button
                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                        onClick={() => openEditModal(discount)}
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 dark:hover:text-red-400"
                        onClick={() => {
                          setSelectedDiscountId(discount.id);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
                {discounts.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-gray-500 dark:text-gray-300">No discounts found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / UPDATE MODAL */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4 bg-black/30">
          <Dialog.Panel className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X />
            </button>
            <Dialog.Title className="text-lg font-semibold mb-4">
              {isEditMode ? "Update Discount" : "Create Discount"}
            </Dialog.Title>
            <form onSubmit={isEditMode ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input name="title" type="text" value={form.title} onChange={handleChange} required className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} required className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium">Discount %</label>
                <input name="discountPercent" type="number" value={form.discountPercent} onChange={handleChange} required className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium">Start Date</label>
                  <input name="startDate" type="date" value={form.startDate} onChange={handleChange} required className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium">End Date</label>
                  <input name="endDate" type="date" value={form.endDate} onChange={handleChange} required className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{isEditMode ? "Update" : "Save"}</button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4 bg-black/30">
          <Dialog.Panel className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-sm w-full p-6 relative">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X />
            </button>
            <Dialog.Title className="text-lg font-semibold mb-4">Confirm Deletion</Dialog.Title>
            <p className="text-gray-700 dark:text-gray-300 mb-6">Are you sure you want to delete this discount?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default CampaignDiscounts;

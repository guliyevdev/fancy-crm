import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import partnerService from '../services/partnerService';
import { toast } from 'sonner';

const FormInput = ({ label, name, value, onChange, type = 'text' }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
    />
  </div>
);

// New component for select dropdown
const FormSelect = ({ label, name, value, onChange, options }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <select
      name={name}
      value={value || ''}
      onChange={onChange}
      className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const PartnerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const data = await partnerService.getPartnerById(id);
        setPartner(data);
      } catch (error) {
        toast.error('Failed to fetch partner details.');
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPartner((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      await partnerService.updatePartner(id, partner);
      toast.success('Partner updated successfully!');
      navigate('/partners');
    } catch (error) {
      toast.error('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-6">Loading partner details...</div>;
  if (!partner) return <div className="text-center p-6 text-red-500">Partner not found.</div>;

  // Example status options - adjust as needed
  const statusOptions = [
    { value: '', label: 'Select status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'VERIFIED', label: 'Verified' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6 max-w-4xl mx-auto">
      <div className="flex justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft size={16} className="mr-2" /> Back
        </button>
        <button
          onClick={saveChanges}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow disabled:opacity-50"
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Partner Information</h3>
        <h4 className="block text-sm font-medium text-gray-700 dark:text-gray-300">Partner Code : {partner.code}</h4>
        <FormInput label="Name" name="name" value={partner.name} onChange={handleChange} />
        <FormInput label="Email" name="email" value={partner.email} onChange={handleChange} type="email" />
        <FormInput label="Phone" name="phone" value={partner.phone} onChange={handleChange} />
        <FormInput label="Address" name="address" value={partner.address} onChange={handleChange} />
        
        {/* Status as dropdown */}
        <FormSelect label="Status" name="status" value={partner.status} onChange={handleChange} options={statusOptions} />

        <FormInput label="Company Name" name="companyName" value={partner.companyName} onChange={handleChange} />
        <FormInput label="Passport Series" name="passportSeries" value={partner.passportSeries} onChange={handleChange} />
        <FormInput label="Passport Number" name="passportNumber" value={partner.passportNumber} onChange={handleChange} />
        <FormInput label="FIN Code" name="finCode" value={partner.finCode} onChange={handleChange} />
        <FormInput label="Receiving Bank Name" name="receivingBankName" value={partner.receivingBankName} onChange={handleChange} />
        <FormInput label="Receiving Bank Currency" name="receivingBankCurrency" value={partner.receivingBankCurrency} onChange={handleChange} />
        <FormInput label="Bank TIN" name="bankTIN" value={partner.bankTIN} onChange={handleChange} />
        <FormInput label="Bank SWIFT Code" name="bankSwiftCode" value={partner.bankSwiftCode} onChange={handleChange} />
        <FormInput label="Bank Account Number" name="bankAccountNumber" value={partner.bankAccountNumber} onChange={handleChange} />
      </div>
    </div>
  );
};

export default PartnerDetails;

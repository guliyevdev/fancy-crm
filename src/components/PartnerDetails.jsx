import { useEffect, useState } from 'react';
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
        const response = await partnerService.getPartnerById(id);
        // Handle the new response structure
        if (response.data) {
          setPartner(response.data);
        } else {
          setPartner(response);
        }
      } catch (error) {
        toast.error('Failed to fetch partner details.');
        console.error('Error fetching partner:', error);
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

  const handlePhysicalDetailsChange = (e) => {
    const { name, value } = e.target;
    setPartner((prev) => ({
      ...prev,
      physicalDetails: {
        ...prev.physicalDetails,
        [name]: value,
      },
    }));
  };

  const handleCorporateDetailsChange = (e) => {
    const { name, value } = e.target;
    setPartner((prev) => ({
      ...prev,
      corporateDetails: {
        ...prev.corporateDetails,
        [name]: value,
      },
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
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  const partnerTypeOptions = [
    { value: '', label: 'Select partner type' },
    { value: 'PHYSICAL', label: 'Physical Person' },
    { value: 'CORPORATE', label: 'Corporate' },
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

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Partner Information</h3>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="Partner Code" name="customerCode" value={partner.customerCode} onChange={handleChange} />
          <FormSelect label="Partner Type" name="partnerType" value={partner.partnerType} onChange={handleChange} options={partnerTypeOptions} />
          <FormInput label="Name" name="name" value={partner.name} onChange={handleChange} />
          <FormInput label="Phone Number" name="phoneNumber" value={partner.phoneNumber} onChange={handleChange} />
          <FormInput label="Email" name="email" value={partner.email} onChange={handleChange} type="email" />
          <FormSelect label="Status" name="status" value={partner.status} onChange={handleChange} options={statusOptions} />
        </div>

        {/* Physical Details - Only show if partner type is PHYSICAL */}
        {partner.partnerType === 'PHYSICAL' && partner.physicalDetails && (
          <div className="border-t pt-6">
            <h4 className="text-md font-semibold mb-4 text-gray-700 dark:text-gray-200">Physical Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="FIN" name="fin" value={partner.physicalDetails.fin} onChange={handlePhysicalDetailsChange} />
              <FormInput label="Passport Series" name="passportSeries" value={partner.physicalDetails.passportSeries} onChange={handlePhysicalDetailsChange} />
              <FormInput label="Passport Number" name="passportNumber" value={partner.physicalDetails.passportNumber} onChange={handlePhysicalDetailsChange} />
              <FormInput label="Address" name="address" value={partner.physicalDetails.address} onChange={handlePhysicalDetailsChange} />
              <FormInput label="Note" name="note" value={partner.physicalDetails.note || ''} onChange={handlePhysicalDetailsChange} />
            </div>
          </div>
        )}

        {/* Corporate Details - Only show if partner type is CORPORATE */}
        {partner.partnerType === 'CORPORATE' && partner.corporateDetails && (
          <div className="border-t pt-6">
            <h4 className="text-md font-semibold mb-4 text-gray-700 dark:text-gray-200">Corporate Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Company Name" name="companyName" value={partner.corporateDetails.companyName} onChange={handleCorporateDetailsChange} />
              <FormInput label="TIN" name="tin" value={partner.corporateDetails.tin} onChange={handleCorporateDetailsChange} />
              <FormInput label="Address" name="address" value={partner.corporateDetails.address} onChange={handleCorporateDetailsChange} />
              <FormInput label="Bank Name" name="bankName" value={partner.corporateDetails.bankName} onChange={handleCorporateDetailsChange} />
              <FormInput label="Bank Account" name="bankAccount" value={partner.corporateDetails.bankAccount} onChange={handleCorporateDetailsChange} />
              <FormInput label="Bank Currency" name="bankCurrency" value={partner.corporateDetails.bankCurrency} onChange={handleCorporateDetailsChange} />
              <FormInput label="Bank Account Number" name="bankAccountNumber" value={partner.corporateDetails.bankAccountNumber} onChange={handleCorporateDetailsChange} />
              <FormInput label="Bank TIN" name="bankTin" value={partner.corporateDetails.bankTin} onChange={handleCorporateDetailsChange} />
              <FormInput label="Bank SWIFT" name="bankSwift" value={partner.corporateDetails.bankSwift} onChange={handleCorporateDetailsChange} />
              <FormInput label="Branch Code" name="branchCode" value={partner.corporateDetails.branchCode} onChange={handleCorporateDetailsChange} />
              <FormInput label="Note" name="note" value={partner.corporateDetails.note || ''} onChange={handleCorporateDetailsChange} />
            </div>
          </div>
        )}

        {/* Documents Section */}
        {partner.documents && partner.documents.length > 0 && (
          <div className="border-t pt-6">
            <h4 className="text-md font-semibold mb-4 text-gray-700 dark:text-gray-200">Documents</h4>
            <div className="space-y-2">
              {partner.documents.map((doc) => (
                <div key={doc.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{doc.documentType}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View Document
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PartnerDetails;

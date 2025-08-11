import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import partnerService from '../services/partnerService';
import { toast } from 'sonner';
import {
  Document,
  Page,
  Text,
  StyleSheet,
  PDFDownloadLink,
  pdf
} from '@react-pdf/renderer';

// PDF styles
const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 11, padding: 40, backgroundColor: '#ffffff', color: '#333333' },
  // (You can include the rest of your existing PDF styles here...)
});

// PDF Document
const PartnershipAgreementPDF = ({ partner }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
        PARTNERSHIP AGREEMENT № __
      </Text>
      <Text>Baku city ..2025</Text>
      <Text style={{ marginTop: 10 }}>
        On one side, hereinafter referred to as the &quot;Company,&quot; represented by its Executive Director, acting based on its Charter,
        Fancy az LL company, Tax ID (7889645047), and on the other side, hereinafter referred to as the &quot;Owner,&quot; an individual acting on their own behalf,
        {` ${partner?.name || '____'} (Passport number ${partner?.passportNumber || '____'}, FIN: ${partner?.fin || '____'}),`} collectively referred to as the &quot;Parties,&quot; enter into this Partnership Agreement under the following terms:
      </Text>
      {/* ... the rest of your PDF content ... */}
      <Text style={{ marginTop: 10 }}>
        OWNER: {partner?.name || '____'}
        {'\n'}Passport №: {partner?.passportNumber || '____'}
        {'\n'}FIN: {partner?.fin || '____'}
      </Text>
      <Text style={{ marginTop: 20 }}>Signature: ____________________________</Text>
    </Page>
  </Document>
);

// Component
const AddPartner = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('physical'); // 'physical' or 'corporate'

  const [partner, setPartner] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    passportSeries: '',
    passportNumber: '',
    fin: '',
    notes: '',
    userPassword: '',
    // Corporate fields based on Swagger spec
    companyName: '',
    ownerPhone: '',
    tin: '',
    bankName: '',
    bankAccount: '',
    bankCurrency: '',
    bankAccountNumber: '',
    bankTin: '',
    bankSwift: '',
    branchCode: '',
    note: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'passportSeries') {
      newValue = value.toUpperCase().slice(0, 3);
    } else if (name === 'passportNumber') {
      newValue = value.replace(/\D/g, '').slice(0, 9);
    } else if (name === 'fin') {
      newValue = value.toUpperCase().slice(0, 8);
    } else if (name === 'tin') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'bankTin') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setPartner((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const isFormValid = () => {
    if (activeTab === 'physical') {
      const {
        name, lastName, email, phone, address, passportSeries, passportNumber,
        fin, notes, userPassword
      } = partner;

      const allFilled = [
        name, lastName, email, phone, address, passportSeries, passportNumber,
        fin, notes, userPassword
      ].every(field => field.trim() !== '');

      const isPassportSeriesValid = /^[A-Z]{2,3}$/.test(passportSeries);
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const isPhoneValid = /^\+?\d{8,15}$/.test(phone);
      const isPassportNumberValid = /^\d{6,9}$/.test(passportNumber);
      const isFinValid = /^[A-Z0-9]{7,8}$/.test(fin);

      return allFilled && isPassportSeriesValid && isEmailValid && isPhoneValid && isPassportNumberValid && isFinValid;
    } else {
      const {
        companyName, ownerPhone, email, userPassword, tin, address, bankName,
        bankAccount, bankCurrency, bankAccountNumber, bankTin, bankSwift, branchCode, note
      } = partner;

      const allFilled = [
        companyName, ownerPhone, email, userPassword, tin, address, bankName,
        bankAccount, bankCurrency, bankAccountNumber, bankTin, bankSwift, branchCode, note
      ].every(field => field.trim() !== '');

      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const isPhoneValid = /^\+?\d{8,15}$/.test(ownerPhone);
      const isTinValid = /^\d{10}$/.test(tin);
      const isBankTinValid = /^\d{10}$/.test(bankTin);

      return allFilled && isEmailValid && isPhoneValid && isTinValid && isBankTinValid;
    }
  };

  const registerPartner = async () => {
    if (!isFormValid()) {
      toast.error("Please fill out all required fields correctly.");
      return;
    }

    setSaving(true);
    try {
      const partnerData = {
        ...partner,
        partnerType: activeTab
      };
      await partnerService.registerPartner(partnerData);
      toast.success('Partner registered successfully!');
      setTimeout(() => navigate(`/partners/add-document/${partnerData.id}`), 1500);
    } catch (err) {
      console.error(err);
      // Extract error message from backend response
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to register partner.';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const registerCorporatePartner = async () => {
    if (!isFormValid()) {
      toast.error("Please fill out all required fields correctly.");
      return;
    }
    setSaving(true);
    try {
      const partnerData = {
        ...partner,
        partnerType: activeTab
      };
      await partnerService.registerCorporatePartner(partnerData);
      toast.success('Partner registered successfully!');
      setTimeout(() => navigate('/partners'), 1500);
    } catch (err) {
      console.error(err);
      // Extract error message from backend response
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to register partner.';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      toast.loading('Uploading document...');
      const response = await partnerService.uploadDocument(file);
      toast.dismiss();
      toast.success('Document uploaded successfully!');
      console.log('Upload response:', response);
    } catch (error) {
      toast.dismiss();
      // Extract error message from backend response
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to upload document.';
      toast.error(errorMessage);
      console.error('Upload error:', error);
    }
  };

  const physicalFields = [
    'name', 'lastName', 'email', 'phone', 'address', 'passportSeries', 'passportNumber',
    'fin', 'notes', 'userPassword'
  ];

  const corporateFields = [
    'companyName', 'ownerPhone', 'email', 'userPassword', 'tin', 'address', 'bankName',
    'bankAccount', 'bankCurrency', 'bankAccountNumber', 'bankTin', 'bankSwift', 'branchCode', 'note'
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-md dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Add Partner</h2>

      {/* Tab Switches */}
      <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('physical')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'physical'
              ? 'bg-indigo-600 text-white border-b-2 border-indigo-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Physical Person
        </button>
        <button
          onClick={() => setActiveTab('corporate')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'corporate'
              ? 'bg-indigo-600 text-white border-b-2 border-indigo-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Corporate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(activeTab === 'physical' ? physicalFields : corporateFields).map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {field.replace(/([A-Z])/g, ' $1')}
            </label>
            <input
              type="text"
              name={field}
              value={partner[field]}
              onChange={handleChange}
              maxLength={
                field === 'passportSeries' ? 3 :
                field === 'passportNumber' ? 9 :
                field === 'fin' ? 8 :
                field === 'tin' ? 10 :
                field === 'bankTin' ? 10 : undefined
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
            />
            {field === 'email' && partner.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partner.email) && (
              <p className="text-sm text-red-500">Invalid email format</p>
            )}
            {(field === 'phone' || field === 'ownerPhone') && partner[field] && !/^\+?\d{8,15}$/.test(partner[field]) && (
              <p className="text-sm text-red-500">Invalid phone number</p>
            )}
            {field === 'passportSeries' && partner.passportSeries && !/^[A-Z]{2,3}$/.test(partner.passportSeries) && (
              <p className="text-sm text-red-500">Must be 2–3 uppercase letters</p>
            )}
            {field === 'passportNumber' && partner.passportNumber && !/^\d{6,9}$/.test(partner.passportNumber) && (
              <p className="text-sm text-red-500">Must be 6–9 digits</p>
            )}
            {field === 'fin' && partner.fin && !/^[A-Z0-9]{7,8}$/.test(partner.fin) && (
              <p className="text-sm text-red-500">Must be 7–8 alphanumeric characters</p>
            )}
            {(field === 'tin' || field === 'bankTin') && partner[field] && !/^\d{10}$/.test(partner[field]) && (
              <p className="text-sm text-red-500">Must be 10 digits</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {/* Register Partner */}
        <button
          onClick={activeTab === 'physical' ? registerPartner : registerCorporatePartner}
          disabled={saving || !isFormValid()}
          className={`px-6 py-2 rounded-md text-white ${
            saving || !isFormValid()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {saving ? 'Saving...' : 'Register Partner'}
        </button>

        {/* Download Agreement */}
        <PDFDownloadLink
          document={<PartnershipAgreementPDF partner={partner} />}
          fileName={`Partnership_Agreement_${partner.name || partner.companyName || 'partner'}.pdf`}
          className="px-6 py-2 rounded-md bg-white text-indigo-700 border border-indigo-700 hover:bg-indigo-50 focus:outline-none"
        >
          {({ loading }) => (loading ? 'Preparing document...' : 'Download Partnership Agreement')}
        </PDFDownloadLink>

        {/* Upload File */}
        <label
          htmlFor="upload-doc"
          className="cursor-pointer px-6 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Upload Document
        </label>
        <input
          type="file"
          id="upload-doc"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
      </div>
    </div>
  );
};

export default AddPartner;

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
        On one side, hereinafter referred to as the "Company," represented by its Executive Director, acting based on its Charter,
        Fancy az LL company, Tax ID (7889645047), and on the other side, hereinafter referred to as the "Owner," an individual acting on their own behalf,
        {` ${partner?.name || '____'} (Passport number ${partner?.passportNumber || '____'}, FIN: ${partner?.finCode || '____'}),`} collectively referred to as the "Parties," enter into this Partnership Agreement under the following terms:
      </Text>
      {/* ... the rest of your PDF content ... */}
      <Text style={{ marginTop: 10 }}>
        OWNER: {partner?.name || '____'}
        {'\n'}Passport №: {partner?.passportNumber || '____'}
        {'\n'}FIN: {partner?.finCode || '____'}
      </Text>
      <Text style={{ marginTop: 20 }}>Signature: ____________________________</Text>
    </Page>
  </Document>
);

// Component
const AddPartner = () => {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const [partner, setPartner] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    passportSeries: '',
    passportNumber: '',
    finCode: '',
    notes: '',
    receivingBankName: '',
    receivingBankCurrency: '',
    bankTIN: '',
    bankSwiftCode: '',
    bankAccountNumber: '',
    companyName: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'passportSeries') {
      newValue = value.toUpperCase().slice(0, 3);
    } else if (name === 'passportNumber') {
      newValue = value.replace(/\D/g, '').slice(0, 9);
    } else if (name === 'finCode') {
      newValue = value.replace(/\D/g, '').slice(0, 8);
    }

    setPartner((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const isFormValid = () => {
    const {
      name, email, phone, address, passportSeries, passportNumber,
      finCode, receivingBankName, receivingBankCurrency,
      bankTIN, bankSwiftCode, bankAccountNumber, companyName
    } = partner;

    const allFilled = [
      name, email, phone, address, passportSeries, passportNumber,
      finCode, receivingBankName, receivingBankCurrency,
      bankTIN, bankSwiftCode, bankAccountNumber, companyName
    ].every(field => field.trim() !== '');

    const isPassportSeriesValid = /^[A-Z]{2,3}$/.test(passportSeries);
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneValid = /^\+?\d{8,15}$/.test(phone);
    const isPassportNumberValid = /^\d{6,9}$/.test(passportNumber);
    const isFinCodeValid = /^\d{7,8}$/.test(finCode);

    return allFilled && isPassportSeriesValid && isEmailValid && isPhoneValid && isPassportNumberValid && isFinCodeValid;
  };

  const registerPartner = async () => {
    if (!isFormValid()) {
      toast.error("Please fill out all required fields correctly.");
      return;
    }

    setSaving(true);
    try {
      await partnerService.registerPartner(partner);
      toast.success('Partner registered successfully!');
      setTimeout(() => navigate('/partners'), 1500);
    } catch (err) {
      console.error(err);
      toast.error('Failed to register partner.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadAgreement = async () => {
    try {
      const blob = await pdf(<PartnershipAgreementPDF partner={partner} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Contract-Partnership-Agreement.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Error generating contract PDF:', error);
      console.log('Error generating contract PDF:', error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadedFile(file);
      toast.loading('Uploading document...');
      const response = await partnerService.uploadDocument(file);
      toast.dismiss();
      toast.success('Document uploaded successfully!');
      console.log('Upload response:', response);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to upload document.');
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-md dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Add Partner</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          'name', 'email', 'phone', 'address', 'passportSeries', 'passportNumber',
          'finCode', 'notes', 'receivingBankName', 'receivingBankCurrency',
          'bankTIN', 'bankSwiftCode', 'bankAccountNumber', 'companyName',
        ].map((field) => (
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
                field === 'finCode' ? 8 : undefined
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
            />
            {field === 'email' && partner.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partner.email) && (
              <p className="text-sm text-red-500">Invalid email format</p>
            )}
            {field === 'phone' && partner.phone && !/^\+?\d{8,15}$/.test(partner.phone) && (
              <p className="text-sm text-red-500">Invalid phone number</p>
            )}
            {field === 'passportSeries' && partner.passportSeries && !/^[A-Z]{2,3}$/.test(partner.passportSeries) && (
              <p className="text-sm text-red-500">Must be 2–3 uppercase letters</p>
            )}
            {field === 'passportNumber' && partner.passportNumber && !/^\d{6,9}$/.test(partner.passportNumber) && (
              <p className="text-sm text-red-500">Must be 6–9 digits</p>
            )}
            {field === 'finCode' && partner.finCode && !/^\d{7,8}$/.test(partner.finCode) && (
              <p className="text-sm text-red-500">Must be 7–8 digits</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {/* Register Partner */}
        <button
          onClick={registerPartner}
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
          fileName={`Partnership_Agreement_${partner.name || 'partner'}.pdf`}
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

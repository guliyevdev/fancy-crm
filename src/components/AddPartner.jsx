import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import partnerService from '../services/partnerService';
import { toast } from 'sonner';
import {
  Document,
  Page,
  Text,
  StyleSheet,
} from '@react-pdf/renderer';
import Authservices from '../services/authServices';

// PDF styles
const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 11, padding: 40, backgroundColor: '#ffffff', color: '#333333' },
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
        {` ${partner?.name || '____'} (Passport number ${partner?.passportNumber || '____'}, FIN: ${partner?.fin || '____'}),`} collectively referred to as the &quot;Partries,&quot; enter into this Partnership Agreement under the following terms:
      </Text>
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
  const [errors, setErrors] = useState({});
  const [fin, setFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [userFound, setUserFound] = useState(false);
  const [userSearched, setUserSearched] = useState(false);

  const [partner, setPartner] = useState({
    name: '',
    surname: '',
    email: '',
    phoneNumber: '994',
    address: '',
    passportSeries: '',
    passportNumber: '',
    fin: '',
    notes: '',
    userPassword: '',
    // Corporate fields
    companyName: '',
    ownerPhone: '994',
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
        name, surname, email, phoneNumber, address, passportSeries, passportNumber,
        fin, notes, userPassword
      } = partner;

      const allFilled = [
        name, surname, email, phoneNumber, address, passportSeries, passportNumber,
        fin, notes, userPassword
      ].every(field => field.trim() !== '');

      const isPassportSeriesValid = /^(AZE|AA)$/.test(passportSeries);
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const isPhoneValid = /^\+?\d{8,15}$/.test(phoneNumber);
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

  const createUser = async () => {
    try {
      const userData = {
        name: partner.name,
        surname: partner.surname,
        fin: partner.fin,
        email: partner.email,
        phoneNumber: partner.phoneNumber,
        passportSeries: partner.passportSeries,
        passportNumber: partner.passportNumber,
        password: partner.userPassword
      };

      const response = await Authservices.CreateUser(userData);
      return response.data;
    } catch (error) {
      console.error("İstifadəçi yaradılarkən xəta:", error);
      throw error;
    }
  };

  const registerPartner = async () => {
    if (!isFormValid()) {
      toast.error("Zəhmət olmasa bütün tələb olunan sahələri düzgün doldurun.");
      return;
    }

    setSaving(true);
    try {
      // Əgər user tapılmayıbsa, əvvəlcə yeni istifadəçi yarat
      if (!userFound && userSearched) {
        try {
          await createUser();
          toast.success('İstifadəçi uğurla yaradıldı!');
        } catch (error) {
          console.error("İstifadəçi yaradılarkən xəta:", error);
          const errorMessage = error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'İstifadəçi yaradılarkən xəta baş verdi.';
          toast.error(errorMessage);
          setSaving(false);
          return;
        }
      }

      // Partner qeydiyyatı
      const partnerData = {
        ...partner,
        partnerType: activeTab
      };

      const response = await partnerService.registerPartner(partnerData);
      toast.success('Partner uğurla qeydiyyatdan keçdi!');

      if (response.data && response.data.contractFilePath) {
        const pdfUrl = response.data.contractFilePath;
        window.open(pdfUrl, '_blank', 'noopener,noreferrer');
        toast.success('PDF yeni pəncərədə açıldı!');
      }

      setTimeout(() => navigate(`/partners/add-document/${response.data.partnerId}`), 1500);
    } catch (err) {
      console.error(err);

      if (err.response?.data?.data) {
        const backendErrors = {};
        err.response.data.data.forEach((e) => {
          backendErrors[e.field] = e.message;
        });
        setErrors(backendErrors);
      }

      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Partner qeydiyyatında xəta baş verdi.';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const registerCorporatePartner = async () => {
    if (!isFormValid()) {
      toast.error("Zəhmət olmasa bütün tələb olunan sahələri düzgün doldurun.");
      return;
    }

    setSaving(true);
    try {
      const partnerData = {
        ...partner,
        partnerType: activeTab
      };

      await partnerService.registerCorporatePartner(partnerData);
      toast.success('Partner uğurla qeydiyyatdan keçdi!');
      setTimeout(() => navigate('/partners'), 1500);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Partner qeydiyyatında xəta baş verdi.';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleFindUserByFinSubmit = async (e) => {
    e.preventDefault();
    if (!fin.trim()) {
      toast.error("FIN daxil edin");
      return;
    }

    try {
      setLoading(true);
      const response = await Authservices.getUsersByFin(fin);
      console.log(response);

      // Axtarış edildiyini qeyd et
      setUserSearched(true);

      // user tapılandan sonra
      if (response.data.data && response.data.data.length > 0) {
        const user = response.data.data[0];
        setUsers(response.data.data);

        // Formu user məlumatları ilə doldur
        setPartner(prev => ({
          ...prev,
          name: user.name || '',
          surname: user.surname || '',
          email: user.email || '',
          phoneNumber: user.mobile || '994',
          fin: user.fin || '',
          passportSeries: user.passportSeries || '',
          passportNumber: user.passportNumber || ''
        }));

        setUserFound(true);
        toast.success("İstifadəçi məlumatları uğurla yükləndi!");
      } else {
        // Əgər user tapılmasa, inputları aktiv et
        setUserFound(false);
        toast.warning("Heç bir istifadəçi tapılmadı. Məlumatları əl ilə daxil edin.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const physicalFields = [
    'name', 'surname', 'email', 'phoneNumber', 'address', 'passportSeries', 'passportNumber',
    'fin', 'notes'
  ];

  const corporateFields = [
    'companyName', 'ownerPhone', 'email', 'userPassword', 'tin', 'address', 'bankName',
    'bankAccount', 'bankCurrency', 'bankAccountNumber', 'bankTin', 'bankSwift', 'branchCode', 'note'
  ];

  // Fiziki şəxs üçün inputların disabled olub-olmaması
  // İlkin olaraq disabled, axtarışdan sonra həmişə enabled
  const isPhysicalInputDisabled = activeTab === 'physical' && !userSearched;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-md dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Partner Əlavə Et</h2>

      {/* Tab Switches */}
      <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('physical')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === 'physical'
            ? 'bg-indigo-600 text-white border-b-2 border-indigo-600'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
        >
          Fiziki Şəxs
        </button>
        <button
          onClick={() => setActiveTab('corporate')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === 'corporate'
            ? 'bg-indigo-600 text-white border-b-2 border-indigo-600'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
        >
          Hüquqi Şəxs
        </button>
      </div>

      {/* FIN Search Form - Yalnız fiziki şəxs üçün */}
      {activeTab === 'physical' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md dark:bg-gray-800">
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">FIN ilə axtarış</h3>
          <form
            onSubmit={handleFindUserByFinSubmit}
            className="flex gap-2 items-end"
          >
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                FIN
              </label>
              <input
                type="text"
                placeholder="FIN daxil edin..."
                value={fin}
                onChange={(e) => setFin(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:bg-gray-400 h-10"
            >
              {loading ? "Axtarılır..." : "Axtar"}
            </button>
          </form>
        </div>
      )}

      {/* Partner Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(activeTab === 'physical' ? physicalFields : corporateFields).map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {field.replace(/([A-Z])/g, ' $1')}
            </label>

            {/* Passport Series -> select */}
            {field === 'passportSeries' ? (
              <select
                name="passportSeries"
                value={partner.passportSeries}
                onChange={handleChange}
                disabled={isPhysicalInputDisabled}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
              >
                <option value="">Seçin...</option>
                <option value="AZE">AZE</option>
                <option value="AA">AA</option>
              </select>
            ) : (
              <input
                type={field.includes('Password') ? 'password' : 'text'}
                name={field}
                value={partner[field]}
                onChange={handleChange}
                disabled={activeTab === 'physical' ? isPhysicalInputDisabled : false}
                maxLength={
                  field === 'passportNumber' ? 9 :
                    field === 'fin' ? 8 :
                      field === 'tin' ? 10 :
                        field === 'bankTin' ? 10 : undefined
                }
                style={field === 'fin' ? { textTransform: 'uppercase' } : {}}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
              />
            )}
            {errors[field] && (
              <p className="text-sm text-red-500">{errors[field]}</p>
            )}

            {field === 'email' && partner.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partner.email) && (
              <p className="text-sm text-red-500">Email formatı yanlışdır</p>
            )}
            {field === 'passportNumber' && partner.passportNumber && !/^\d{6,9}$/.test(partner.passportNumber) && (
              <p className="text-sm text-red-500">6-9 rəqəm olmalıdır</p>
            )}
            {field === 'fin' && partner.fin && !/^[A-Z0-9]{7,8}$/.test(partner.fin) && (
              <p className="text-sm text-red-500">7-8 hərf/rəqəm olmalıdır</p>
            )}
            {(field === 'tin' || field === 'bankTin') && partner[field] && !/^\d{10}$/.test(partner[field]) && (
              <p className="text-sm text-red-500">10 rəqəm olmalıdır</p>
            )}
          </div>
        ))}

        {/* Şifrə inputu - yalnız Fiziki Şəxs üçün və istifadəçi tapılmayıbsa */}
        {(activeTab === 'corporate' || (activeTab === 'physical' && !userFound && userSearched)) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              User Password
            </label>
            <input
              type="password"
              name="userPassword"
              value={partner.userPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
            />
          </div>
        )}

      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {/* Register Partner */}
        <button
          onClick={activeTab === 'physical' ? registerPartner : registerCorporatePartner}
          disabled={saving || !isFormValid() || (activeTab === 'physical' && !userSearched)}
          className={`px-6 py-2 rounded-md text-white ${saving || !isFormValid() || (activeTab === 'physical' && !userSearched)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
        >
          {saving ? 'Yadda saxlanılır...' : 'Partneri Qeydiyyat Et'}
        </button>
      </div>
    </div>
  );
};

export default AddPartner;
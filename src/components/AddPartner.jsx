import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import partnerService from '../services/partnerService';
import { toast } from 'sonner';
import Authservices from '../services/authServices';

const AddPartner = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('physical');
  const [errors, setErrors] = useState({});
  const [fin, setFin] = useState("");
  const [loading, setLoading] = useState(false);
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
    typeIds: ["4"]
  });

  // FIN dəyişdikdə avtomatik axtarış et
  useEffect(() => {
    if (activeTab === 'physical' && fin.length >= 7) {
      handleFindUserByFin();
    }
  }, [fin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'passportSeries') {
      newValue = value.toUpperCase().slice(0, 3);
    } else if (name === 'passportNumber') {
      newValue = value.replace(/\D/g, '').slice(0, 9);
    } else if (name === 'fin') {
      newValue = value.toUpperCase().slice(0, 8);
    } else if (name === 'tin' || name === 'bankTin') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    } else if ((name === 'phoneNumber' || name === 'ownerPhone') && !value.startsWith('994')) {
      newValue = '994' + value.replace(/\D/g, '').slice(0);
    }

    setPartner((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (activeTab === 'physical') {
      if (!partner.name.trim()) newErrors.name = 'Ad tələb olunur';
      if (!partner.surname.trim()) newErrors.surname = 'Soyad tələb olunur';
      if (!partner.email.trim()) newErrors.email = 'Email tələb olunur';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partner.email)) newErrors.email = 'Email formatı yanlışdır';
      if (!partner.phoneNumber.trim()) newErrors.phoneNumber = 'Telefon nömrəsi tələb olunur';
      else if (!/^994\d{9}$/.test(partner.phoneNumber)) newErrors.phoneNumber = 'Telefon nömrəsi 994 + 7 rəqəm olmalıdır';
      if (!partner.address.trim()) newErrors.address = 'Ünvan tələb olunur';
      if (!partner.passportSeries.trim()) newErrors.passportSeries = 'Passport seriyası tələb olunur';
      else if (!/^(AZE|AA)$/.test(partner.passportSeries)) newErrors.passportSeries = 'Seriya AZE və ya AA olmalıdır';
      if (!partner.passportNumber.trim()) newErrors.passportNumber = 'Passport nömrəsi tələb olunur';
      else if (!/^\d{6,9}$/.test(partner.passportNumber)) newErrors.passportNumber = '6-9 rəqəm olmalıdır';
      if (!partner.fin.trim()) newErrors.fin = 'FIN tələb olunur';
      else if (!/^[A-Z0-9]{7,8}$/.test(partner.fin)) newErrors.fin = '7-8 hərf/rəqəm olmalıdır';
      if (!userFound && !partner.userPassword.trim()) newErrors.userPassword = 'Şifrə tələb olunur';
    } else {
      if (!partner.companyName.trim()) newErrors.companyName = 'Şirkət adı tələb olunur';
      if (!partner.ownerPhone.trim()) newErrors.ownerPhone = 'Telefon nömrəsi tələb olunur';
      else if (!/^994\d{9}$/.test(partner.ownerPhone)) newErrors.ownerPhone = 'Telefon nömrəsi 994 + 7 rəqəm olmalıdır';
      if (!partner.email.trim()) newErrors.email = 'Email tələb olunur';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partner.email)) newErrors.email = 'Email formatı yanlışdır';
      if (!partner.userPassword.trim()) newErrors.userPassword = 'Şifrə tələb olunur';
      if (!partner.tin.trim()) newErrors.tin = 'VÖEN tələb olunur';
      else if (!/^\d{10}$/.test(partner.tin)) newErrors.tin = '10 rəqəm olmalıdır';
      if (!partner.address.trim()) newErrors.address = 'Ünvan tələb olunur';
      if (!partner.bankName.trim()) newErrors.bankName = 'Bank adı tələb olunur';
      if (!partner.bankAccount.trim()) newErrors.bankAccount = 'Bank hesabı tələb olunur';
      if (!partner.bankCurrency.trim()) newErrors.bankCurrency = 'Valyuta tələb olunur';
      if (!partner.bankAccountNumber.trim()) newErrors.bankAccountNumber = 'Hesab nömrəsi tələb olunur';
      if (!partner.bankTin.trim()) newErrors.bankTin = 'Bank VÖEN tələb olunur';
      else if (!/^\d{10}$/.test(partner.bankTin)) newErrors.bankTin = '10 rəqəm olmalıdır';
      if (!partner.bankSwift.trim()) newErrors.bankSwift = 'SWIFT kodu tələb olunur';
      if (!partner.branchCode.trim()) newErrors.branchCode = 'Filial kodu tələb olunur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        password: partner.userPassword,
        typeIds: ["4"]
      };

      const response = await Authservices.CreateUser(userData);
      return response.data;
    } catch (error) {
      console.error("İstifadəçi yaradılarkən xəta:", error.response?.data?.data);

      if (error.response?.data?.data) {
        const backendErrors = {};
        error.response.data.data.forEach((e) => {
          let fieldName = e.field;
          if (fieldName === 'mobile') fieldName = 'phoneNumber';
          if (fieldName === 'password') fieldName = 'userPassword';

          backendErrors[fieldName] = e.message;
        });

        setErrors(prev => ({ ...prev, ...backendErrors }));

        Object.values(backendErrors).forEach(errorMsg => {
          toast.error(errorMsg);
        });
      } else {
        toast.error("İstifadəçi yaradılarkən gözlənilməz xəta baş verdi.");
      }

      throw error;
    }
  };

  const registerPartner = async () => {
    if (!validateForm()) {
      toast.error("Zəhmət olmasa bütün tələb olunan sahələri düzgün doldurun.");
      return;
    }

    setSaving(true);
    try {
      // Əgər istifadəçi tapılmayıbsa, əvvəlcə istifadəçi yarat
      if (!userFound) {
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
          let fieldName = e.field;
          if (fieldName === 'mobile') fieldName = 'phoneNumber';
          if (fieldName === 'password') fieldName = 'userPassword';

          backendErrors[fieldName] = e.message;
        });
        setErrors(backendErrors);

        Object.values(backendErrors).forEach(errorMsg => {
          toast.error(errorMsg);
        });
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
    if (!validateForm()) {
      toast.error("Zəhmət olmasa bütün tələb olunan sahələri düzgün doldurun.");
      return;
    }

    setSaving(true);
    try {
      const partnerData = {
        ...partner,
        partnerType: activeTab
      };

      const response = await partnerService.registerCorporatePartner(partnerData);
      toast.success('Partner uğurla qeydiyyatdan keçdi!');

      if (response.data && response.data.contractFilePath) {
        const pdfUrl = response.data.contractFilePath;
        window.open(pdfUrl, '_blank', 'noopener,noreferrer');
        toast.success('PDF yeni pəncərədə açıldı!');
      }

      setTimeout(() => navigate('/partners'), 1500);
    } catch (err) {
      console.error(err);

      if (err.response?.data?.data) {
        const backendErrors = {};
        err.response.data.data.forEach((e) => {
          let fieldName = e.field;
          if (fieldName === 'mobile') fieldName = 'ownerPhone';
          if (fieldName === 'password') fieldName = 'userPassword';

          backendErrors[fieldName] = e.message;
        });
        setErrors(backendErrors);

        Object.values(backendErrors).forEach(errorMsg => {
          toast.error(errorMsg);
        });
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

  const handleFindUserByFin = async () => {
    if (!fin.trim() || fin.length < 7) {
      return;
    }

    try {
      setLoading(true);
      const response = await Authservices.getUsersByFin(fin);
      console.log(response);

      setUserSearched(true);

      if (response.data.data && response.data.data.length > 0) {
        const user = response.data.data[0];
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
        setUserFound(false);
        // İstifadəçi tapılmayanda inputları aktiv edirik
        setPartner(prev => ({
          ...prev,
          name: '',
          surname: '',
          email: '',
          phoneNumber: '994',
          fin: fin,
          passportSeries: '',
          passportNumber: ''
        }));
        toast.warning("Heç bir istifadəçi tapılmadı. Məlumatları daxil edin.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const handleFindUserByFinSubmit = async (e) => {
    e.preventDefault();
    await handleFindUserByFin();
  };

  const physicalFields = [
    { name: 'name', label: 'Ad', type: 'text', required: true },
    { name: 'surname', label: 'Soyad', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phoneNumber', label: 'Telefon', type: 'text', required: true },
    { name: 'address', label: 'Ünvan', type: 'text', required: true },
    { name: 'passportSeries', label: 'Passport Seriyası', type: 'select', options: ['', 'AZE', 'AA'], required: true },
    { name: 'passportNumber', label: 'Passport Nömrəsi', type: 'text', required: true },
    { name: 'fin', label: 'FIN', type: 'text', required: true },
    { name: 'notes', label: 'Qeydlər', type: 'text', required: false }
  ];

  const corporateFields = [
    { name: 'companyName', label: 'Şirkət Adı', type: 'text', required: true },
    { name: 'ownerPhone', label: 'Telefon', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'tin', label: 'VÖEN', type: 'text', required: true },
    { name: 'address', label: 'Ünvan', type: 'text', required: true },
    { name: 'bankName', label: 'Bank Adı', type: 'text', required: true },
    { name: 'bankAccount', label: 'Bank Hesabı', type: 'text', required: true },
    { name: 'bankCurrency', label: 'Valyuta', type: 'text', required: true },
    { name: 'bankAccountNumber', label: 'Hesab Nömrəsi', type: 'text', required: true },
    { name: 'bankTin', label: 'Bank VÖEN', type: 'text', required: true },
    { name: 'bankSwift', label: 'SWIFT Kodu', type: 'text', required: true },
    { name: 'branchCode', label: 'Filial Kodu', type: 'text', required: true },
    { name: 'note', label: 'Qeydlər', type: 'text', required: false }
  ];

  // Inputların disabled olub olmamasını təyin edirik
  const isPhysicalInputDisabled = activeTab === 'physical' && !userSearched;

  const renderField = (field) => {
    const value = partner[field.name];
    const error = errors[field.name];

    return (
      <div key={field.name} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>

        {field.type === 'select' ? (
          <select
            name={field.name}
            value={value}
            onChange={handleChange}
            disabled={isPhysicalInputDisabled}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
          >
            {field.options.map(option => (
              <option key={option} value={option}>
                {option || 'Seçin...'}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={field.type}
            name={field.name}
            value={value}
            onChange={handleChange}
            disabled={isPhysicalInputDisabled}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            style={field.name === 'fin' ? { textTransform: 'uppercase' } : {}}
          />
        )}

        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-md dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Partner Əlavə Et</h2>

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

      {activeTab === 'physical' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md dark:bg-gray-800">
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">FIN ilə axtarış</h3>
          <form onSubmit={handleFindUserByFinSubmit} className="flex gap-2 items-end">
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
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            FIN daxil etdikdə avtomatik axtarış ediləcək (minimum 7 simvol)
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTab === 'physical'
          ? physicalFields.map(renderField)
          : corporateFields.map(renderField)
        }

        {(activeTab === 'corporate' || (activeTab === 'physical' && !userFound && userSearched)) && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Şifrə <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="userPassword"
              value={partner.userPassword}
              onChange={handleChange}
              disabled={isPhysicalInputDisabled}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 ${errors.userPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
            />
            {errors.userPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.userPassword}</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          onClick={activeTab === 'physical' ? registerPartner : registerCorporatePartner}
          disabled={saving || (activeTab === 'physical' && !userSearched)}
          className={`px-6 py-2 rounded-md text-white ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            } ${activeTab === 'physical' && !userSearched ? 'bg-gray-400 cursor-not-allowed' : ''}`}
        >
          {saving ? 'Yadda saxlanılır...' : 'Partneri Qeydiyyat Et'}
        </button>
        <button
          onClick={() => navigate('/partners')}
          className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
        >
          Ləğv et
        </button>
      </div>
    </div>
  );
};

export default AddPartner;
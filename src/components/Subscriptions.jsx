import React, { useEffect, useState } from "react";
import SubscriptionsServices from "../services/subscriptionsServices";
import { Search, Plus, X, Mail, Calendar, CheckCircle, XCircle } from "lucide-react";
import Modal from "react-modal";
import { toast } from "sonner";

// Ensure modal binds to root
Modal.setAppElement("#root");

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(20);

  // Modal Inputs State
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Unsubscribe Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubscriptions();
    }, 500);
    return () => clearTimeout(timer);
  }, [filterStatus, searchQuery, currentPage]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await SubscriptionsServices.getSubscriptions(
        filterStatus,
        searchQuery,
        currentPage,
        pageSize
      );
      // Accessing data based on user provided structure: response.data -> data -> content
      if (response.data && response.data.data && response.data.data.content) {
        setSubscriptions(response.data.data.content);
        setTotalPages(response.data.data.totalPages || 0);
      } else {
        setSubscriptions([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Abunəlikləri gətirərkən xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Zəhmət olmasa bütün xanaları doldurun");
      return;
    }

    try {
      setIsSending(true);
      const data = {
        subject: subject,
        message: message,
      };

      await SubscriptionsServices.sendNewsletter(data);
      toast.success("Mesaj uğurla göndərildi");
      setIsModalOpen(false);
      // Reset inputs
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Error sending newsletter:", error);
      toast.error("Mesaj göndərilərkən xəta baş verdi");
    } finally {
      setIsSending(false);
    }
  };

  const handleUnsubscribeClick = (email) => {
    setSelectedSubscription(email);
    setIsConfirmModalOpen(true);
  };

  const confirmUnsubscribe = async () => {
    if (!selectedSubscription) return;

    try {
      await SubscriptionsServices.unsubscribe({ email: selectedSubscription });
      toast.success("Abunəlik uğurla ləğv edildi");
      setIsConfirmModalOpen(false);
      fetchSubscriptions(); // Refresh the list
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast.error("Abunəliyi ləğv edərkən xəta baş verdi");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Abunəliklər</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Bütün abunəliklərin siyahısı və idarə edilməsi</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(0);
            }}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="all">Bütün</option>
            <option value="true">Aktiv</option>
            <option value="false">Deaktiv</option>
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Email ilə axtar..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Yeni Mesaj</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Yaradılma Tarixi</th>
                <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ləğv Tarixi</th>
                <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Yüklənir...
                  </td>
                </tr>
              ) : subscriptions.length > 0 ? (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">#{sub.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                          <Mail className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{sub.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sub.active
                        ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                        {sub.active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {sub.active ? "Aktiv" : "Deaktiv"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(sub.createdAt).toLocaleDateString("az-AZ")}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                      {sub.unsubscribedAt ? new Date(sub.unsubscribedAt).toLocaleDateString("az-AZ") : "-"}
                    </td>
                    <td className="p-4">
                      {sub.active && (
                        <button
                          onClick={() => handleUnsubscribeClick(sub.email)}
                          className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/50"
                        >
                          Deaktiv et
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Məlumat tapılmadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Əvvəlki
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Səhifə <span className="font-medium">{currentPage + 1}</span> / <span className="font-medium">{Math.max(1, totalPages)}</span>
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Növbəti
          </button>
        </div>
      </div>

      {/* Modal Section */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl p-6 outline-none shadow-2xl border border-gray-100 dark:border-gray-700"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]"
        contentLabel="Send Newsletter Modal"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Yeni Mesaj Göndər</h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mövzu (Subject)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Mövzunu daxil edin..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mesaj (Message)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-32 resize-none"
              placeholder="Mesajınızı daxil edin..."
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={isSending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Ləğv et
            </button>
            <button
              onClick={handleSendNewsletter}
              disabled={isSending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Göndərilir...
                </>
              ) : (
                "Göndər"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onRequestClose={() => setIsConfirmModalOpen(false)}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl p-6 outline-none shadow-2xl border border-gray-100 dark:border-gray-700"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]"
        contentLabel="Confirm Unsubscribe Modal"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Abunəliyi ləğv et</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            "{selectedSubscription}" abunəliyini ləğv etmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Xeyr, saxla
            </button>
            <button
              onClick={confirmUnsubscribe}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Bəli, ləğv et
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Subscriptions;

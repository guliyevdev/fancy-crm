import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reportservices from "../services/reportServices";
import { toast } from "sonner";

const Reports = () => {
  const [showModal, setShowModal] = useState(true);
  const [reportTypes, setReportTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Report tiplerini getir
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await Reportservices.getReports();
        setReportTypes(res.data?.data || []);
      } catch (err) {
        toast.error("Report tiplerini gətirərkən xəta baş verdi");
      }
    };
    fetchTypes();
  }, []);

  const handleGetReport = async () => {
    if (!selectedType || !fromDate || !toDate)
      return toast.error("Zəhmət olmasa bütün sahələri doldurun!");

    // Tarixləri dd-mm-yyyy formatına çevir
    const formatDate = (dateStr) => {
      const [year, month, day] = dateStr.split("-");
      return `${day}-${month}-${year}`;
    };

    const formattedFrom = formatDate(fromDate);
    const formattedTo = formatDate(toDate);

    setLoading(true);
    try {
      const res = await Reportservices.getReportByType(
        selectedType,
        formattedFrom,
        formattedTo
      );
      setReportData(res.data?.data || []);
      setShowModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">📊 Reports</h1>
        <div className="flex gap-1">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 dark:text-white text-white px-4 py-2 rounded-lg font-medium shadow-sm transition"
          >
            🔍 Filter Reports
          </button>
          <button
            onClick={() => { }}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm"
          >
            Export Excel
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Report Filter</h2>

              <label className="block mb-3">
                <span className="text-gray-600 text-sm">Report Type</span>
                <select
                  className="mt-1 w-full p-2 border border-gray-300 dark:text-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">-- Select Type --</option>
                  {reportTypes.map((r, i) => (
                    <option key={i} value={r.type}>
                      {r.type.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-4 dark:text-gray-600">
                <label>
                  <span className="text-gray-600 text-sm">From</span>
                  <input
                    type="date"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </label>
                <label>
                  <span className="text-gray-600 text-sm">To</span>
                  <input
                    type="date"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </label>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-1/2 bg-gray-200 hover:bg-gray-300 dark:text-gray-600 text-gray-700 py-2 rounded-lg font-medium transition"
                >
                  Ləğv et
                </button>
                <button
                  onClick={handleGetReport}
                  disabled={loading}
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                >
                  {loading ? "Yüklənir..." : "Get Report"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Table */}
      {!showModal && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-md dark:text-white dark:bg-gray-800 mt-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white">
              Nəticələr: {selectedType.replaceAll("_", " ")}
            </h3>
            {/* <button
              onClick={() => setShowModal(true)}
              className="text-sm text-blue-600 hover:underline dark:text-white"
            >
              🔁 Filtri dəyiş
            </button> */}
          </div>

          {reportData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg dark:text-white">
                <thead className="bg-gray-100 text-gray-700 items-start text-sm uppercase dark:text-gray-600 ">
                  <tr className="text-start">
                    {Object.values(reportData[0]).map((key) => (
                      <th key={key} className="py-2 px-3 border-b  text-start">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-white">
                  {reportData.slice(1).map((row, i) => (
                    <tr key={i} className="hover:cursor-pointer hover:text-gray-650 transition dark:text-white">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="py-2 px-3 border-b">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center dark:text-white">Heç bir məlumat tapılmadı.</p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Reports;

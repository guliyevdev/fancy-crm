import React, { useState, useEffect } from "react";
import webContentServices from "../../services/webContentService";
import { FaEdit, FaEye, FaTrash, FaUpload } from "react-icons/fa";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const tabs = [
    "HOME", "HOW_WE_WORK", "ABOUT_US", "PRIVACY_POLICY", "TERM_OF_SERVICE",
    "CONTACT", "FAQ", "BECOME_A_PARTNER", "HEADER_MENU", "HEADER_BUTTON",
    "FOOTER_MENU", "FOOTER_BUTTON", "HEADER_DECORATION", "FOOTER_DECORATION",
    "RENT_SALE", "PRODUCT_DETAIL", "INPUTS", "BUTTONS", "OTHERS"
];

const languages = [
    { code: "AZ", name: "Azərbaycanca" },
    { code: "EN", name: "English" },
    { code: "RU", name: "Русский" }
];

const SiteContent = () => {
    const [activeTab, setActiveTab] = useState("HOME");
    const [selectedLanguage, setSelectedLanguage] = useState("AZ");
    const [nodes, setNodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingNode, setEditingNode] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadModalNodeId, setUploadModalNodeId] = useState(null);
    const [sortOrder, setSortOrder] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        AZ: { id: "", title: "", subtitle: "", body: "" },
        EN: { id: "", title: "", subtitle: "", body: "" },
        RU: { id: "", title: "", subtitle: "", body: "" },
        sortOrder: 0
    });
    const navigate = useNavigate()

    const fetchNodes = async (pageKey, language) => {
        try {
            setLoading(true);
            const response = await webContentServices.getByPageKey(pageKey, language);
            const nodeList = response.data?.data[0]?.nodeList || [];

            // Əgər sıralama seçilibsə, nodeları sırala
            let sortedNodes = [...nodeList];
            if (sortOrder === "asc") {
                sortedNodes.sort((a, b) => a.sortOrder - b.sortOrder);
            } else if (sortOrder === "desc") {
                sortedNodes.sort((a, b) => b.sortOrder - a.sortOrder);
            }

            // Əgər axtarış sorğusu varsa, filtrlə
            if (searchQuery) {
                sortedNodes = sortedNodes.filter(node => {
                    const i18n = node.i18nList.find(item => item.lang === selectedLanguage) || node.i18nList[0] || {};
                    return (
                        (i18n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (i18n.subtitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (i18n.body || '').toLowerCase().includes(searchQuery.toLowerCase())
                    );
                });
            }

            setNodes(sortedNodes);
        } catch (error) {
            console.error("Error fetching nodes:", error);
            setNodes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNodes(activeTab, selectedLanguage);
    }, [activeTab, selectedLanguage, sortOrder, searchQuery]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                pageKey: activeTab,
                sortOrder: parseInt(formData.sortOrder),
                active: true,
                i18nList: languages.map(lang => ({
                    id: formData[lang.code].id,
                    lang: lang.code,
                    title: formData[lang.code].title,
                    subtitle: formData[lang.code].subtitle,
                    body: formData[lang.code].body
                }))
            };

            if (editingNode) {
                await webContentServices.updateContent(editingNode.id, dataToSend);
            } else {
                await webContentServices.create(dataToSend);
            }

            // Formu sıfırla və siyahını yenilə
            setFormData({
                AZ: { title: "", subtitle: "", body: "" },
                EN: { title: "", subtitle: "", body: "" },
                RU: { title: "", subtitle: "", body: "" },
                sortOrder: 0
            });
            setEditingNode(null);
            setShowAddForm(false);
            fetchNodes(activeTab, selectedLanguage);
        } catch (error) {
            console.error("Error saving content:", error);
        }
    };

    const handleEdit = async (node) => {
        try {
            // Əvvəlcə node-un tam məlumatlarını findById ilə yüklə
            const response = await webContentServices.findById(node.id);
            const fullNode = response.data.data; // response.data.data istifadə et

            // Redaktə üçün məlumatları form-a doldur
            const newFormData = {
                AZ: { id: "", title: "", subtitle: "", body: "" },
                EN: { id: "", title: "", subtitle: "", body: "" },
                RU: { id: "", title: "", subtitle: "", body: "" },
                sortOrder: fullNode.sortOrder || 0
            };

            // Hər bir dil üçün məlumatları təmin et
            if (fullNode.i18nList && fullNode.i18nList.length > 0) {
                fullNode.i18nList.forEach(i18n => {
                    if (newFormData[i18n.lang]) {
                        newFormData[i18n.lang] = {
                            id: i18n.id,
                            title: i18n.title || "",
                            subtitle: i18n.subtitle || "",
                            body: i18n.body || ""
                        };
                    }
                });
            }

            setFormData(newFormData);
            setEditingNode(fullNode);
            setShowAddForm(true);
        } catch (error) {
            console.error("Error fetching node details:", error);
        }
    };

    const handleDeleteNode = async (id) => {
        try {
            const response = await webContentServices.deleteContent(id);

            // Table-dan silinmiş node-u state-dən çıxarmaq
            setNodes((prevNodes) => prevNodes.filter((n) => n.id !== id));

            toast.success(response?.data?.message);
        } catch (error) {
            const message = error?.response?.data?.message || "Error deleting";
            toast.error(message);
            console.error("Delete error:", error);
        }
    };


    const handleInputChange = (lang, field, value) => {
        setFormData(prev => ({
            ...prev,
            [lang]: {
                ...prev[lang],
                [field]: value
            }
        }));
    };

    const openUploadModal = (nodeId) => {
        setUploadModalNodeId(nodeId);
        setIsUploadModalOpen(true);
    };

    // Upload modalını bağlamaq
    const closeUploadModal = () => {
        setIsUploadModalOpen(false);
        setUploadModalNodeId(null);
        setSelectedFiles([]);
    };
    const handleUpload = async () => {
        if (!uploadModalNodeId) return;

        try {
            await webContentServices.uploadMedia(uploadModalNodeId, selectedFiles);
            toast.success("Fayllar uğurla yükləndi!");
            closeUploadModal();
            fetchNodes(activeTab, selectedLanguage); // məlumatları yenilə
        } catch (error) {
            toast.error(error?.response?.data?.message || "Yükləmə uğursuz oldu");
        }
    };




    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg">
                <h2 className="text-xl font-bold p-4 border-b border-gray-200 dark:border-gray-700">
                    Content Tabs
                </h2>
                <nav className="flex flex-col p-2 space-y-1 overflow-y-auto max-h-screen">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-left px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${activeTab === tab
                                ? "bg-blue-600 text-white shadow-lg"
                                : "text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-700 hover:text-blue-700 dark:hover:text-white"
                                }`}
                        >
                            {tab.replaceAll("_", " ")}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{activeTab.replaceAll("_", " ")}</h1>

                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                        >
                            {showAddForm ? "Formu Bağla" : "Əlavə Et"}
                        </button>
                    </div>
                </div>

                {/* Axtarış və Sıralama */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Axtarış..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-gray-700 dark:text-gray-300">Sırala:</span>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Standart</option>
                                <option value="asc">Artan Sıra</option>
                                <option value="desc">Azalan Sıra</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Əlavə/Redaktə Formu */}
                {showAddForm && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
                        <h2 className="text-xl font-bold mb-4">
                            {editingNode ? "Məzmunu Redaktə Et" : "Yeni Məzmun Əlavə Et"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                {languages.map(lang => (
                                    <div key={lang.code} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">{lang.name}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Başlıq
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData[lang.code].title}
                                                    onChange={(e) => handleInputChange(lang.code, 'title', e.target.value)}
                                                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Alt Başlıq
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData[lang.code].subtitle}
                                                    onChange={(e) => handleInputChange(lang.code, 'subtitle', e.target.value)}
                                                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Məzmun
                                            </label>
                                            <textarea
                                                value={formData[lang.code].body}
                                                onChange={(e) => handleInputChange(lang.code, 'body', e.target.value)}
                                                rows={3}
                                                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            ></textarea>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Sıra Nömrəsi
                                </label>
                                <input
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditingNode(null);
                                        setFormData({
                                            AZ: { title: "", subtitle: "", body: "" },
                                            EN: { title: "", subtitle: "", body: "" },
                                            RU: { title: "", subtitle: "", body: "" },
                                            sortOrder: 0
                                        });
                                    }}
                                    className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-md transition-colors duration-200"
                                >
                                    Ləğv Et
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                                >
                                    {editingNode ? "Yadda Saxla" : "Əlavə Et"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Məzmun Cədvəli */}
                <div className="overflow-x-auto rounded-lg shadow-md">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Başlıq
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Alt Başlıq
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Məzmun
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Sıra
                                </th>
                                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Status
                                </th> */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Əməliyyatlar
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        Yüklənir...
                                    </td>
                                </tr>
                            ) : nodes.length > 0 ? (
                                nodes.map((node, index) => {
                                    console.log(node.id)
                                    const i18n = node.i18nList.find(item => item.lang === selectedLanguage) || node.i18nList[0] || {};
                                    return (
                                        <>

                                            <tr key={node.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{i18n.title}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{i18n.subtitle || "-"}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                                                    {i18n.body || "-"}
                                                </td>
                                                <td className="px-6 py-4 text-sm flex items-center  ml-2 text-gray-900 dark:text-gray-100">{node.sortOrder || 0}</td>


                                                {/* <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                <button
                                                    onClick={() => handleDeleteNode(node.id)}
                                                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-red-100 dark:hover:bg-red-700 transition"
                                                >
                                                    <FaTrash className="text-red-600" size={20} />
                                                </button>
                                            </td> */}
                                                <td className="px-6 py-4 text-sm font-medium">
                                                    <div className="flex space-x-3">
                                                        <button
                                                            onClick={() => openUploadModal(node.id)} // Düzəldildi
                                                            className="text-green-600 hover:text-green-900 dark:hover:text-green-400 transition-colors duration-200 p-3"
                                                        >
                                                            <FaUpload size={20} />
                                                        </button>

                                                        <button
                                                            onClick={() => handleEdit(node)}
                                                            className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 transition-colors duration-200"
                                                        >
                                                            <FaEdit size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteNode(node.id)}
                                                            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-red-100 dark:hover:bg-red-700 transition"
                                                        >
                                                            <FaTrash className="text-red-600" size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/site-content/${node.id}`)}
                                                            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-blue-100 dark:hover:bg-blue-700 transition"
                                                        >
                                                            <FaEye className="text-blue-600" size={20} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isUploadModalOpen && (
                                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[400px] shadow-lg">
                                                        <h2 className="text-lg font-semibold mb-4">Media Yüklə</h2>

                                                        {/* Fayl seçimi */}
                                                        <input
                                                            type="file"
                                                            multiple
                                                            onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                                                            className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                        />

                                                        {/* Fayl ön baxışı */}
                                                        {selectedFiles.length > 0 && (
                                                            <div className="mb-4 grid grid-cols-2 gap-3">
                                                                {selectedFiles.map((file, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="relative border rounded-lg overflow-hidden shadow-sm"
                                                                    >
                                                                        <img
                                                                            src={URL.createObjectURL(file)}
                                                                            alt={file.name}
                                                                            className="w-full h-32 object-cover"
                                                                        />
                                                                        <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs truncate px-2 py-1">
                                                                            {file.name}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Əməliyyatlar */}
                                                        <div className="flex justify-end gap-3">
                                                            <button
                                                                onClick={closeUploadModal}
                                                                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                                                            >
                                                                Ləğv et
                                                            </button>
                                                            <button
                                                                onClick={handleUpload}
                                                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                                                            >
                                                                Yüklə
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        Məzmun tapılmadı.
                                    </td>


                                </tr>



                            )}
                        </tbody>
                    </table>
                </div>
            </main>





        </div>
    );
};

export default SiteContent;
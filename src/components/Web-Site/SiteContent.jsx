import React, { useState, useEffect } from "react";
import webContentServices from "../../services/webContentService";
import {
    Edit3,
    Eye,
    Trash2,
    UploadCloud,
    Search,
    Plus,
    Layout,
    Globe,
    ArrowUpDown,
    X,
    Save,
    Image as ImageIcon,
    FileText,
    ChevronRight,
    LayoutDashboard
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const tabs = [
    "HOME", "HOW_WE_WORK", "ABOUT_US", "PRIVACY_POLICY", "TERM_OF_SERVICE",
    "CONTACT", "FAQ", "BECOME_A_PARTNER", "RENT_SALE", "HEADER_MENU", "HEADER_BUTTON",
    "FOOTER_MENU", "FOOTER_BUTTON", "HEADER_DECORATION", "FOOTER_DECORATION",
    "PRODUCT_DETAIL", "INPUTS", "BUTTONS", "OTHERS"
];

const languages = [
    { code: "AZ", name: "Azərbaycanca", flag: "🇦🇿" },
    { code: "EN", name: "English", flag: "🇬🇧" },
    { code: "RU", name: "Русский", flag: "🇷🇺" }
];

const tabDisplayNames = {
    RENT_SALE: "Fərdi Sifarişlər",
    HOW_WE_WORK: "İş Prosesimiz",
    ABOUT_US: "Haqqımızda",
    FOOTER_DECORATION: "Mobil Menyu",
    HOME: "Ana Səhifə",
    PRIVACY_POLICY: "Məxfilik Siyasəti",
    TERM_OF_SERVICE: "İstifadə Şərtləri",
    CONTACT: "Əlaqə",
    FAQ: "Tez-tez Verilən Suallar",
    BECOME_A_PARTNER: "Partnyor Ol",
    HEADER_MENU: "Header Menyu",
    HEADER_BUTTON: "Header Düymələr",
    FOOTER_MENU: "Footer Menyu",
    FOOTER_BUTTON: "Footer Düymələr",
    HEADER_DECORATION: "Header Dekorasiya",
    PRODUCT_DETAIL: "Məhsul Detalı",
    INPUTS: "İnputlar",
    BUTTONS: "Düymələr",
    OTHERS: "Digər"
};

const SiteContent = () => {
    const [activeTab, setActiveTab] = useState("HOME");
    const [selectedLanguage, setSelectedLanguage] = useState("AZ");
    const [nodes, setNodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingNode, setEditingNode] = useState(null);
    const [activeLanguageTab, setActiveLanguageTab] = useState("AZ");
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
    const navigate = useNavigate();

    const fetchNodes = async (pageKey, language) => {
        try {
            setLoading(true);
            const response = await webContentServices.getByPageKey(pageKey, language);
            const nodeList = response.data?.data[0]?.nodeList || [];

            let sortedNodes = [...nodeList];
            if (sortOrder === "asc") {
                sortedNodes.sort((a, b) => a.sortOrder - b.sortOrder);
            } else if (sortOrder === "desc") {
                sortedNodes.sort((a, b) => b.sortOrder - a.sortOrder);
            }

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

    const resetForm = () => {
        setFormData({
            AZ: { id: "", title: "", subtitle: "", body: "" },
            EN: { id: "", title: "", subtitle: "", body: "" },
            RU: { id: "", title: "", subtitle: "", body: "" },
            sortOrder: 0
        });
        setEditingNode(null);
        setActiveLanguageTab("AZ");
    };

    const handleCloseAddForm = () => {
        setShowAddForm(false);
        resetForm();
    };

    const handleOpenAddForm = () => {
        resetForm();
        setShowAddForm(true);
    };

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
                toast.success("Məzmun uğurla yeniləndi");
            } else {
                await webContentServices.create(dataToSend);
                toast.success("Yeni məzmun uğurla yaradıldı");
            }

            handleCloseAddForm();
            fetchNodes(activeTab, selectedLanguage);
        } catch (error) {
            console.error("Error saving content:", error);
            toast.error("Xəta baş verdi");
        }
    };

    const handleEdit = async (node) => {
        try {
            const response = await webContentServices.findById(node.id);
            const fullNode = response.data.data;

            const newFormData = {
                AZ: { id: "", title: "", subtitle: "", body: "" },
                EN: { id: "", title: "", subtitle: "", body: "" },
                RU: { id: "", title: "", subtitle: "", body: "" },
                sortOrder: fullNode.sortOrder || 0
            };

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
            toast.error("Məlumatları gətirərkən xəta baş verdi");
        }
    };

    const handleDeleteNode = async (id) => {
        if (!window.confirm("Bu məzmunu silmək istədiyinizə əminsiniz?")) return;
        try {
            await webContentServices.deleteContent(id);
            setNodes((prevNodes) => prevNodes.filter((n) => n.id !== id));
            toast.success("Məzmun uğurla silindi");
        } catch (error) {
            toast.error("Silinmə zamanı xəta baş verdi");
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
            fetchNodes(activeTab, selectedLanguage);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Yükləmə uğursuz oldu");
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-10 shadow-lg">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                        <LayoutDashboard className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        Səhifə Məzmunu
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-between group ${activeTab === tab
                                ? "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 shadow-sm border border-teal-100 dark:border-teal-800"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            <span className="truncate">{tabDisplayNames[tab] || tab.replaceAll("_", " ")}</span>
                            {activeTab === tab && <ChevronRight className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Top Header */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center shadow-sm z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Layout className="w-6 h-6 text-teal-500" />
                            {tabDisplayNames[activeTab] || activeTab.replaceAll("_", " ")}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Bu bölmədəki məzmunları idarə edin
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => setSelectedLanguage(lang.code)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${selectedLanguage === lang.code
                                        ? "bg-white dark:bg-gray-600 text-teal-600 dark:text-teal-300 shadow-sm"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                        }`}
                                >
                                    <span className="mr-1">{lang.flag}</span>
                                    {lang.code}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleOpenAddForm}
                            className="flex items-center px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium shadow-lg shadow-teal-200 dark:shadow-teal-900/30 transition-all hover:scale-[1.02]"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Yeni Məzmun
                        </button>
                    </div>
                </header>

                {/* Filters & Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Search & Sort Bar */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Başlıq, alt başlıq və ya məzmun üzrə axtar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                            />
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 px-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <ArrowUpDown className="w-4 h-4 text-gray-500" />
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="bg-transparent border-none py-2.5 text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer text-sm font-medium"
                            >
                                <option value="">Sıralama: Standart</option>
                                <option value="asc">Sıra nömrəsi (Artan)</option>
                                <option value="desc">Sıra nömrəsi (Azalan)</option>
                            </select>
                        </div>
                    </div>

                    {/* Content Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Başlıq</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Alt Başlıq</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Məzmun</th>
                                        {/* <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sıra</th> */}
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Əməliyyatlar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                Yüklənir...
                                            </td>
                                        </tr>
                                    ) : nodes.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <Layout className="w-12 h-12 mb-3 opacity-20" />
                                                    <p>Məzmun tapılmadı</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        nodes.map((node, index) => {
                                            const i18n = node.i18nList.find(item => item.lang === selectedLanguage) || node.i18nList[0] || {};
                                            return (
                                                <tr
                                                    key={node.id}
                                                    className="group hover:bg-teal-50/30 dark:hover:bg-teal-900/10 transition-colors duration-200"
                                                >
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900 dark:text-white max-w-[200px] truncate" title={i18n.title}>
                                                            {i18n.title || "-"}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-[200px] truncate" title={i18n.subtitle}>
                                                        {i18n.subtitle || "-"}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={i18n.body}>
                                                        {i18n.body || "-"}
                                                    </td>
                                                    {/* <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {node.sortOrder || 0}
                                                        </span>
                                                    </td> */}
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-100">
                                                            <button
                                                                onClick={() => openUploadModal(node.id)}
                                                                className="p-2 text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors"
                                                                title="Media Yüklə"
                                                            >
                                                                <UploadCloud className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(node)}
                                                                className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                                                                title="Redaktə et"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/site-content/${node.id}`)}
                                                                className="p-2 text-teal-600 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 rounded-lg transition-colors"
                                                                title="Bax"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteNode(node.id)}
                                                                className="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                                                title="Sil"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Add/Edit Modal (Centered) */}
                {showAddForm && (
                    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10 rounded-t-2xl">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        {editingNode ? <Edit3 className="w-5 h-5 text-teal-600" /> : <Plus className="w-5 h-5 text-teal-600" />}
                                        {editingNode ? "Məzmunu Redaktə Et" : "Yeni Məzmun Əlavə Et"}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Məlumatları daxil edin və ya düzəliş edin
                                    </p>
                                </div>
                                <button
                                    onClick={handleCloseAddForm}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <form id="contentForm" onSubmit={handleSubmit} className="space-y-6">

                                    {/* Language Tabs */}
                                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                type="button"
                                                onClick={() => setActiveLanguageTab(lang.code)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeLanguageTab === lang.code
                                                    ? "bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-300 shadow-sm"
                                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                                    }`}
                                            >
                                                <span>{lang.flag}</span>
                                                {lang.name}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Form Fields for Active Language */}
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 animate-in fade-in duration-300">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    Başlıq ({languages.find(l => l.code === activeLanguageTab)?.name})
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData[activeLanguageTab].title}
                                                    onChange={(e) => handleInputChange(activeLanguageTab, 'title', e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                                    placeholder={`${activeLanguageTab} Başlıq daxil edin...`}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    Alt Başlıq ({languages.find(l => l.code === activeLanguageTab)?.name})
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData[activeLanguageTab].subtitle}
                                                    onChange={(e) => handleInputChange(activeLanguageTab, 'subtitle', e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                                    placeholder={`${activeLanguageTab} Alt başlıq daxil edin...`}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    Məzmun ({languages.find(l => l.code === activeLanguageTab)?.name})
                                                </label>
                                                <textarea
                                                    value={formData[activeLanguageTab].body}
                                                    onChange={(e) => handleInputChange(activeLanguageTab, 'body', e.target.value)}
                                                    rows={6}
                                                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-y"
                                                    placeholder={`${activeLanguageTab} Ətraflı məzmun...`}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            Sıra Nömrəsi
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.sortOrder}
                                            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Məzmunun görünmə ardıcıllığını təyin edir (kiçikdən böyüyə)
                                        </p>
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 rounded-b-2xl">
                                <button
                                    onClick={handleCloseAddForm}
                                    className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                >
                                    Ləğv Et
                                </button>
                                <button
                                    type="submit"
                                    form="contentForm"
                                    className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 shadow-lg shadow-teal-200 dark:shadow-teal-900/30 transition-all hover:scale-[1.02] flex items-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    {editingNode ? "Yadda Saxla" : "Əlavə Et"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload Modal */}
                {isUploadModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-teal-600" />
                                    Media Yüklə
                                </h2>
                                <button
                                    onClick={closeUploadModal}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center">
                                        <UploadCloud className="w-10 h-10 text-teal-500 mb-3" />
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            Faylları seçmək üçün toxunun
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            və ya sürükləyib buraxın
                                        </p>
                                    </div>
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar">
                                        {selectedFiles.map((file, idx) => (
                                            <div
                                                key={idx}
                                                className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video"
                                            >
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-xs text-white font-medium px-2 text-center truncate w-full">
                                                        {file.name}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        onClick={closeUploadModal}
                                        className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                    >
                                        Ləğv et
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={selectedFiles.length === 0}
                                        className="px-4 py-2 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-200 dark:shadow-teal-900/30 transition-all"
                                    >
                                        Yüklə
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SiteContent;
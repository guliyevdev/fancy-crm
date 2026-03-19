import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
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
    LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const tabs = [
    "HOME",
    "HOW_WE_WORK",
    "ABOUT_US",
    "PRIVACY_POLICY",
    "TERM_OF_SERVICE",
    "CONTACT",
    "FAQ",
    "BECOME_A_PARTNER",
    "RENT_SALE",
    "HEADER_MENU",
    "HEADER_BUTTON",
    "FOOTER_MENU",
    "FOOTER_BUTTON",
    "HEADER_DECORATION",
    "FOOTER_DECORATION",
    "PRODUCT_DETAIL",
    "INPUTS",
    "BUTTONS",
    "OTHERS",
];

const languages = [
    { code: "AZ", name: "Azərbaycanca", flag: "🇦🇿" },
    { code: "EN", name: "English", flag: "🇬🇧" },
    { code: "RU", name: "Русский", flag: "🇷🇺" },
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
    OTHERS: "Digər",
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
        sortOrder: 0,
    });
    const navigate = useNavigate();

    const handleExportToExcel = () => {
        if (!nodes || nodes.length === 0) {
            toast.warning("İxrac üçün heç bir məlumat tapılmadı.");
            return;
        }

        const dataToExport = nodes.map((node) => {
            const i18n = node.i18nList.find((item) => item.lang === selectedLanguage) || node.i18nList[0] || {};
            return {
                Başlıq: i18n.title || "-",
                "Alt Başlıq": i18n.subtitle || "-",
                Məzmun: i18n.body || "-",
                Sıra: node.sortOrder || 0,
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Məzmun");

        // Fəal tab və dilə uyğun fayl adı yaradır
        const fileName = `${activeTab}_${selectedLanguage}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        toast.success("Məlumatlar uğurla Excel-ə ixrac edildi!");
    };

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
                sortedNodes = sortedNodes.filter((node) => {
                    const i18n = node.i18nList.find((item) => item.lang === selectedLanguage) || node.i18nList[0] || {};
                    return (
                        (i18n.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (i18n.subtitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (i18n.body || "").toLowerCase().includes(searchQuery.toLowerCase())
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
            sortOrder: 0,
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
                i18nList: languages.map((lang) => ({
                    id: formData[lang.code].id,
                    lang: lang.code,
                    title: formData[lang.code].title,
                    subtitle: formData[lang.code].subtitle,
                    body: formData[lang.code].body,
                })),
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
                sortOrder: fullNode.sortOrder || 0,
            };

            if (fullNode.i18nList && fullNode.i18nList.length > 0) {
                fullNode.i18nList.forEach((i18n) => {
                    if (newFormData[i18n.lang]) {
                        newFormData[i18n.lang] = {
                            id: i18n.id,
                            title: i18n.title || "",
                            subtitle: i18n.subtitle || "",
                            body: i18n.body || "",
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
        setFormData((prev) => ({
            ...prev,
            [lang]: {
                ...prev[lang],
                [field]: value,
            },
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
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="z-10 flex w-72 flex-col border-r border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-3 border-b border-gray-100 p-6 dark:border-gray-700">
                    <div className="rounded-lg bg-teal-100 p-2 dark:bg-teal-900/30">
                        <LayoutDashboard className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Səhifə Məzmunu</h2>
                </div>
                <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto p-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-medium transition-all duration-200 ${
                                activeTab === tab
                                    ? "border border-teal-100 bg-teal-50 text-teal-700 shadow-sm dark:border-teal-800 dark:bg-teal-900/20 dark:text-teal-300"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white"
                            }`}
                        >
                            <span className="truncate">{tabDisplayNames[tab] || tab.replaceAll("_", " ")}</span>
                            {activeTab === tab && <ChevronRight className="h-4 w-4" />}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main content */}
            <main className="relative flex h-screen flex-1 flex-col overflow-hidden">
                {/* Top Header */}
                <header className="z-10 flex items-center justify-between border-b border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                            <Layout className="h-6 w-6 text-teal-500" />
                            {tabDisplayNames[activeTab] || activeTab.replaceAll("_", " ")}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Bu bölmədəki məzmunları idarə edin</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-gray-600 dark:bg-gray-700">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => setSelectedLanguage(lang.code)}
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                                        selectedLanguage === lang.code
                                            ? "bg-white text-teal-600 shadow-sm dark:bg-gray-600 dark:text-teal-300"
                                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    }`}
                                >
                                    <span className="mr-1">{lang.flag}</span>
                                    {lang.code}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleOpenAddForm}
                            className="flex items-center rounded-xl bg-teal-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-teal-200 transition-all hover:scale-[1.02] hover:bg-teal-700 dark:shadow-teal-900/30"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Yeni Məzmun
                        </button>

                        <button
                            onClick={handleExportToExcel}
                            className="flex items-center rounded-xl bg-green-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-green-200 transition-all hover:scale-[1.02] hover:bg-green-700 dark:shadow-green-900/30"
                        >
                            <FileText className="mr-2 h-5 w-5" />
                            Excel'ə İxrac
                        </button>
                    </div>
                </header>

                {/* Filters & Content Area */}
                <div className="flex-1 space-y-6 overflow-y-auto p-6">
                    {/* Search & Sort Bar */}
                    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Başlıq, alt başlıq və ya məzmun üzrə axtar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 dark:border-gray-700 dark:bg-gray-900">
                            <ArrowUpDown className="h-4 w-4 text-gray-500" />
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="cursor-pointer border-none bg-transparent py-2.5 text-sm font-medium text-gray-700 focus:ring-0 dark:text-gray-300"
                            >
                                <option value="">Sıralama: Standart</option>
                                <option value="asc">Sıra nömrəsi (Artan)</option>
                                <option value="desc">Sıra nömrəsi (Azalan)</option>
                            </select>
                        </div>
                    </div>

                    {/* Content Table */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-100 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            #
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Başlıq
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Alt Başlıq
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Məzmun
                                        </th>
                                        {/* <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sıra</th> */}
                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Əməliyyatlar
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                                            >
                                                Yüklənir...
                                            </td>
                                        </tr>
                                    ) : nodes.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <Layout className="mb-3 h-12 w-12 opacity-20" />
                                                    <p>Məzmun tapılmadı</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        nodes.map((node, index) => {
                                            const i18n = node.i18nList.find((item) => item.lang === selectedLanguage) || node.i18nList[0] || {};
                                            return (
                                                <tr
                                                    key={node.id}
                                                    className="group transition-colors duration-200 hover:bg-teal-50/30 dark:hover:bg-teal-900/10"
                                                >
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                                                    <td className="px-6 py-4">
                                                        <div
                                                            className="max-w-[200px] truncate font-medium text-gray-900 dark:text-white"
                                                            title={i18n.title}
                                                        >
                                                            {i18n.title || "-"}
                                                        </div>
                                                    </td>
                                                    <td
                                                        className="max-w-[200px] truncate px-6 py-4 text-sm text-gray-600 dark:text-gray-300"
                                                        title={i18n.subtitle}
                                                    >
                                                        {i18n.subtitle || "-"}
                                                    </td>
                                                    <td
                                                        className="max-w-xs truncate px-6 py-4 text-sm text-gray-500 dark:text-gray-400"
                                                        title={i18n.body}
                                                    >
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
                                                                className="rounded-lg bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40"
                                                                title="Media Yüklə"
                                                            >
                                                                <UploadCloud className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(node)}
                                                                className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
                                                                title="Redaktə et"
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/site-content/${node.id}`)}
                                                                className="rounded-lg bg-teal-50 p-2 text-teal-600 transition-colors hover:bg-teal-100 dark:bg-teal-900/20 dark:hover:bg-teal-900/40"
                                                                title="Bax"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteNode(node.id)}
                                                                className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40"
                                                                title="Sil"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/60 p-4 backdrop-blur-sm">
                        <div className="animate-in zoom-in-95 flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl duration-200 dark:bg-gray-900">
                            <div className="z-10 flex items-center justify-between rounded-t-2xl border-b border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                                <div>
                                    <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                                        {editingNode ? <Edit3 className="h-5 w-5 text-teal-600" /> : <Plus className="h-5 w-5 text-teal-600" />}
                                        {editingNode ? "Məzmunu Redaktə Et" : "Yeni Məzmun Əlavə Et"}
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Məlumatları daxil edin və ya düzəliş edin</p>
                                </div>
                                <button
                                    onClick={handleCloseAddForm}
                                    className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <X className="h-6 w-6 text-gray-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <form
                                    id="contentForm"
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    {/* Language Tabs */}
                                    <div className="flex w-fit items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                type="button"
                                                onClick={() => setActiveLanguageTab(lang.code)}
                                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                                    activeLanguageTab === lang.code
                                                        ? "bg-white text-teal-600 shadow-sm dark:bg-gray-700 dark:text-teal-300"
                                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                }`}
                                            >
                                                <span>{lang.flag}</span>
                                                {lang.name}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Form Fields for Active Language */}
                                    <div className="animate-in fade-in rounded-2xl border border-gray-100 bg-gray-50 p-6 duration-300 dark:border-gray-700 dark:bg-gray-800/50">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Başlıq ({languages.find((l) => l.code === activeLanguageTab)?.name})
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData[activeLanguageTab].title}
                                                    onChange={(e) => handleInputChange(activeLanguageTab, "title", e.target.value)}
                                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-800"
                                                    placeholder={`${activeLanguageTab} Başlıq daxil edin...`}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Alt Başlıq ({languages.find((l) => l.code === activeLanguageTab)?.name})
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData[activeLanguageTab].subtitle}
                                                    onChange={(e) => handleInputChange(activeLanguageTab, "subtitle", e.target.value)}
                                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-800"
                                                    placeholder={`${activeLanguageTab} Alt başlıq daxil edin...`}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Məzmun ({languages.find((l) => l.code === activeLanguageTab)?.name})
                                                </label>
                                                <textarea
                                                    value={formData[activeLanguageTab].body}
                                                    onChange={(e) => handleInputChange(activeLanguageTab, "body", e.target.value)}
                                                    rows={6}
                                                    className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-2.5 transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-800"
                                                    placeholder={`${activeLanguageTab} Ətraflı məzmun...`}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Sıra Nömrəsi</label>
                                        <input
                                            type="number"
                                            value={formData.sortOrder}
                                            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-900"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Məzmunun görünmə ardıcıllığını təyin edir (kiçikdən böyüyə)</p>
                                    </div>
                                </form>
                            </div>

                            <div className="flex justify-end gap-3 rounded-b-2xl border-t border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/50">
                                <button
                                    onClick={handleCloseAddForm}
                                    className="rounded-xl border border-gray-200 px-6 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Ləğv Et
                                </button>
                                <button
                                    type="submit"
                                    form="contentForm"
                                    className="flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 font-medium text-white shadow-lg shadow-teal-200 transition-all hover:scale-[1.02] hover:bg-teal-700 dark:shadow-teal-900/30"
                                >
                                    <Save className="h-5 w-5" />
                                    {editingNode ? "Yadda Saxla" : "Əlavə Et"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload Modal */}
                {isUploadModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="animate-in zoom-in-95 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl duration-200 dark:bg-gray-900">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                                    <ImageIcon className="h-5 w-5 text-teal-600" />
                                    Media Yüklə
                                </h2>
                                <button
                                    onClick={closeUploadModal}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="relative rounded-xl border-2 border-dashed border-gray-200 p-8 text-center transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    />
                                    <div className="flex flex-col items-center">
                                        <UploadCloud className="mb-3 h-10 w-10 text-teal-500" />
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Faylları seçmək üçün toxunun</p>
                                        <p className="mt-1 text-xs text-gray-500">və ya sürükləyib buraxın</p>
                                    </div>
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="custom-scrollbar grid max-h-48 grid-cols-2 gap-3 overflow-y-auto">
                                        {selectedFiles.map((file, idx) => (
                                            <div
                                                key={idx}
                                                className="group relative aspect-video overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                                            >
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={file.name}
                                                    className="h-full w-full object-cover"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <span className="w-full truncate px-2 text-center text-xs font-medium text-white">
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
                                        className="rounded-xl border border-gray-200 px-4 py-2 font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                    >
                                        Ləğv et
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={selectedFiles.length === 0}
                                        className="rounded-xl bg-teal-600 px-4 py-2 font-medium text-white shadow-lg shadow-teal-200 transition-all hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-teal-900/30"
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

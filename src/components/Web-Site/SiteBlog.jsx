import React, { useEffect, useState } from 'react'
import BlogServices from '../../services/blogServices';
import {
    ChevronLeft,
    ChevronRight,
    PencilLine,
    Trash,
    Plus,
    Eye,
    Search,
    Newspaper,
    Calendar,
    User,
    Tag,
    FileSpreadsheet
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from 'react-router-dom';
import EditBlogModal from './EditBlogModal';

const SiteBlog = () => {
    const [blogs, setBlogs] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0 });
    const navigate = useNavigate();
    const [editOpen, setEditOpen] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchBlogs = async (page = 0, size = 10, search = "") => {
        setLoading(true);
        try {
            // Note: API might not support search param based on original code, 
            // but we keep the structure ready or client-side filter if needed.
            const res = await BlogServices.getAllBlogs(page, size, "az");
            setBlogs(res.data.content || []);
            setPageInfo({
                page: res.data.number || 0,
                size: res.data.size || 10,
                totalElements: res.data.totalElements || 0
            });
        } catch (error) {
            console.error("Error fetching blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs(0, 10);
    }, []);

    const handleSearchChange = (e) => {
        setSearchName(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchBlogs(0, pageInfo.size, searchName);
    };

    const openEditModal = (blog) => {
        setSelectedBlog(blog);
        setEditOpen(true);
    };

    const closeEditModal = () => {
        setEditOpen(false);
        setSelectedBlog(null);
    };

    const handleUpdate = async () => {
        fetchBlogs(pageInfo.page, pageInfo.size);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < Math.ceil(pageInfo.totalElements / pageInfo.size)) {
            fetchBlogs(newPage, pageInfo.size);
        }
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(blogs.map(blog => ({
            Title: blog.blogI18n?.[0]?.title || "",
            Author: `${blog.authorName} ${blog.authorSurname}`,
            Slogan: blog.blogSlogan,
            Status: blog.active ? "Active" : "Inactive",
            CreatedDate: blog.createdAt
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Blogs");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
        saveAs(data, "blogs_export.xlsx");
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg shadow-rose-200 dark:shadow-rose-900/30">
                        <Newspaper className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Blog İdarəetməsi
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Məqalələri yaradın, redaktə edin və idarə edin
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleExportExcel}
                        className="inline-flex items-center px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all duration-200 hover:shadow-md"
                    >
                        <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                        Excel
                    </button>
                    <button
                        onClick={() => navigate('/site-blog/add')}
                        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg shadow-rose-200 dark:shadow-rose-900/30 transition-all duration-200 hover:scale-[1.02]"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Yeni Blog
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Blog adı ilə axtar..."
                            value={searchName}
                            onChange={handleSearchChange}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-all shadow-lg shadow-gray-200 dark:shadow-gray-900/30"
                    >
                        Axtar
                    </button>
                </form>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Media</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Başlıq</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Müəllif</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Teqlər</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Əməliyyatlar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        Yüklənir...
                                    </td>
                                </tr>
                            ) : blogs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        Məlumat tapılmadı
                                    </td>
                                </tr>
                            ) : (
                                blogs.map((blog, index) => (
                                    <tr
                                        key={blog.id || index}
                                        className="group hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-colors duration-200"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="h-16 w-24 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm relative group-hover:scale-105 transition-transform duration-200">
                                                {blog.mediaUrl ? (
                                                    <img
                                                        src={blog.mediaUrl}
                                                        alt="media"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                                        <Newspaper className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col max-w-xs">
                                                <span className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-rose-600 transition-colors">
                                                    {blog.blogI18n?.[0]?.title || "Başlıqsız"}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {blog.blogI18n?.[0]?.subtitle || "Alt başlıq yoxdur"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-rose-600 font-bold text-xs">
                                                    {(blog.authorName?.[0] || "A").toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {blog.authorName} {blog.authorSurname}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Müəllif
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {blog.blogI18n?.[0]?.tags?.length > 0 ? (
                                                    blog.blogI18n[0].tags.slice(0, 2).map((tag, i) => (
                                                        <span key={i} className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300">
                                                            <Tag className="w-3 h-3 mr-1" />
                                                            {tag}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                                {blog.blogI18n?.[0]?.tags?.length > 2 && (
                                                    <span className="text-xs text-gray-400">+{blog.blogI18n[0].tags.length - 2}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={blog.active}
                                                    onChange={async () => {
                                                        try {
                                                            await BlogServices.updateActivateBlog(blog.id);
                                                            handleUpdate();
                                                        } catch (err) {
                                                            console.error("Toggle error:", err);
                                                        }
                                                    }}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 dark:peer-focus:ring-rose-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-rose-600"></div>
                                            </label>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(blog)}
                                                    className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                                                    title="Redaktə et"
                                                >
                                                    <PencilLine className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/site-blog/${blog.id}`)}
                                                    className="p-2 text-rose-600 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg transition-colors"
                                                    title="Bax"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-900/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Cəmi <span className="font-medium text-gray-900 dark:text-white">{pageInfo.totalElements}</span> məqalədən <span className="font-medium text-gray-900 dark:text-white">{pageInfo.page * pageInfo.size + 1}</span> - <span className="font-medium text-gray-900 dark:text-white">{Math.min((pageInfo.page + 1) * pageInfo.size, pageInfo.totalElements)}</span> arası göstərilir
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(pageInfo.page - 1)}
                            disabled={pageInfo.page === 0}
                            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, Math.ceil(pageInfo.totalElements / pageInfo.size)) }, (_, i) => {
                                const totalPages = Math.ceil(pageInfo.totalElements / pageInfo.size);
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i;
                                } else if (pageInfo.page < 3) {
                                    pageNum = i;
                                } else if (pageInfo.page >= totalPages - 3) {
                                    pageNum = totalPages - 5 + i;
                                } else {
                                    pageNum = pageInfo.page - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${pageInfo.page === pageNum
                                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/30'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                            }`}
                                    >
                                        {pageNum + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => handlePageChange(pageInfo.page + 1)}
                            disabled={(pageInfo.page + 1) * pageInfo.size >= pageInfo.totalElements}
                            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <EditBlogModal
                isOpen={editOpen}
                onClose={closeEditModal}
                blogData={selectedBlog}
                onUpdate={handleUpdate}
            />
        </div>
    )
}

export default SiteBlog

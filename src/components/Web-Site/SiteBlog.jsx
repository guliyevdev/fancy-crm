import React, { useEffect, useState } from 'react'
import BlogServices from '../../services/blogServices';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { PencilLine, Trash, Plus, Eye } from "lucide-react";
import Modal from "react-modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from 'react-router-dom';
import EditBlogModal from './EditBlogModal';
import AddBlogModal from './AddBlogModal';
Modal.setAppElement("#root");
const SiteBlog = () => {
    const [blogs, setBlogs] = useState([]);
    const [colors, setColors] = useState([]);
    const [addOpen, setAddOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState(null);
    const [searchName, setSearchName] = useState("");
    const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0 });
    const navigate = useNavigate();
    const [editBlog, setEditBlog] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await BlogServices.getAllBlogs(0, 20, "az");
                setBlogs(res.data.content || []);
                console.log(res.data.content)
            } catch (error) {
                console.error("Error fetching blogs:", error);
            }
        };
        fetchBlogs();
    }, []);



    const openAddModal = () => {
        setAddOpen(true);
    };

    const closeAddModal = () => {
        setAddOpen(false);
    };
    const handleSearchChange = (e) => {
        setSearchName(e.target.value);
    };

    const openEditModal = (blog) => {
        setSelectedBlog(blog); // seçilən blog-u state-ə qoyuruq
        setEditOpen(true);      // modal açılır
    };

    const closeEditModal = () => {
        setEditOpen(false);
        setSelectedBlog(null);
    };

    const handleUpdate = async () => {
        // blog siyahısını yenilə (fetch və ya state update)
        const res = await BlogServices.getAllBlogs(0, 20, "az");
        setBlogs(res.data.content || []);
    };
    return (
        <div className="p-6 max-w-7xl  mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Blog Management
                </h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            navigate('/site-blog/add')
                        }}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Blog Əlavə Et
                    </button>
                    <button
                        onClick={() => { }}
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm"
                    >
                        Export Excel
                    </button>
                </div>
            </div>
            <form onSubmit={() => { }} className="mb-4 flex gap-2">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchName}
                    onChange={handleSearchChange}
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                >
                    Search
                </button>
            </form>

            <div className='overflow-x-auto'>
                <table>

                    <thead className="bg-gray-50 dark:bg-gray-800 dark:text-white">
                        <tr>
                            <th className="px-6 py-3">#</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Media</th>
                            <th className="px-6 py-3">Author</th>
                            <th className="px-6 py-3">Slogan</th>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Subtitle</th>
                            <th className="px-6 py-3">Content</th>
                            <th className="px-6 py-3">Tags</th>
                            <th className="px-6 py-3">Updated By</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blogs.map((blog, index) => {
                            return (
                                <tr key={index}>
                                    <td className="px-6 py-4 break-words max-w-[200px]">{index + 1 + pageInfo.page * pageInfo.size}</td>
                                    <td className="px-6 py-4 break-words max-w-[200px]">
                                        {blog.blogI18n?.[0]?.title || "No title"}
                                    </td>
                                    <td className="px-6 py-4">
                                        {blog.mediaUrl && (
                                            <img
                                                src={blog.mediaUrl}
                                                alt="media"
                                                className="w-20 h-20 object-cover rounded"
                                            />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 break-words max-w-[200px]">
                                        {blog.authorName} {blog.authorSurname}
                                    </td>
                                    <td className="px-6 py-4 break-words max-w-[200px]">
                                        {blog.blogSlogan}
                                    </td>
                                    <td className="px-6 py-4 break-words max-w-[200px]">
                                        {blog.blogI18n?.[0]?.title}
                                    </td>
                                    <td className="px-6 py-4 break-words max-w-[200px]">
                                        {blog.blogI18n?.[0]?.subtitle}
                                    </td>
                                    <td className="px-6 py-4 break-words max-w-[200px]">
                                        {blog.blogI18n?.[0]?.content}
                                    </td>
                                    <td className="px-6 py-4 break-words max-w-[200px]">
                                        {blog.blogI18n?.[0]?.tags?.join(", ")}
                                    </td>
                                    <td className="px-6 py-4 break-words max-w-[200px]">
                                        {blog.updatedByName || ""} {blog.updatedBySurname || ""}
                                    </td>

                                    <td className="px-6 py-4">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="peer hidden"
                                                checked={blog.active} // ⚡️ burada sənin field adın "active"dirsə, onu qoy
                                                onChange={async () => {
                                                    try {
                                                        await BlogServices.updateActivateBlog(blog.id); // headerdə blogId gedir
                                                        // ✅ Sonra datanı yenilə
                                                        const res = await BlogServices.getAllBlogs(0, 20, "az");
                                                        setBlogs(res.data.content || []);
                                                    } catch (err) {
                                                        console.error("Toggle popularity error:", err);
                                                    }
                                                }}


                                            />
                                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-400 rounded-full peer dark:bg-gray-700 
        peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
        peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
        after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
        after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
                                            </div>
                                        </label>
                                    </td>

                                    <td className="px-6 py-4 text-right flex gap-4 justify-end">
                                        <button
                                            className="text-blue-600 hover:text-blue-900"
                                            onClick={() => openEditModal(blog)}
                                        >
                                            <PencilLine size={20} />
                                        </button>
                                        <button
                                            className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                                            onClick={() => navigate(`/site-blog/${blog.id}`)}
                                        >
                                            <Eye size={20} />
                                        </button>
                                    </td>





                                </tr>
                            )
                        })}
                    </tbody>

                </table>
            </div>




            <div className="flex justify-center items-center mt-6 space-x-4">
                <button
                    onClick={() => fetch(pageInfo.page - 1, pageInfo.size, searchName)}
                    disabled={pageInfo.page === 0}
                    className={`p-2 rounded-full ${pageInfo.page === 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                >
                    <FaChevronLeft size={20} />
                </button>
                <span className="text-gray-800 dark:text-gray-200 text-sm">
                    Page {pageInfo.page + 1} of {Math.ceil(pageInfo.totalElements / pageInfo.size)}
                </span>
                <button
                    onClick={() => fetch(pageInfo.page + 1, pageInfo.size, searchName)}
                    disabled={(pageInfo.page + 1) * pageInfo.size >= pageInfo.totalElements}
                    className={`p-2 rounded-full ${(pageInfo.page + 1) * pageInfo.size >= pageInfo.totalElements
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                >
                    <FaChevronRight size={20} />
                </button>
            </div>



            <Modal
                isOpen={addOpen}
                onRequestClose={() => setAddOpen(false)}
                contentLabel="Add Color"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full p-6 outline-none"
            >
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Add Color</h3>
                {selectedColor && (
                    <form onSubmit={saveAdd} className="space-y-4">

                        <div>
                            <label htmlFor="nameAz" className="block text-sm font-medium mb-1">
                                Name (Az)
                            </label>
                            <input
                                id="nameAz"
                                name="nameAz"
                                type="text"
                                value={selectedColor.nameAz || ""}
                                onChange={handleAddChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="nameEn" className="block text-sm font-medium mb-1">
                                Name (En)
                            </label>
                            <input
                                id="nameEn"
                                name="nameEn"
                                type="text"
                                value={selectedColor.nameEn || ""}
                                onChange={handleAddChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="nameRu" className="block text-sm font-medium mb-1">
                                Name (Ru)
                            </label>
                            <input
                                id="nameRu"
                                name="nameRu"
                                type="text"
                                value={selectedColor.nameRu || ""}
                                onChange={handleAddChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium mb-1">
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={selectedColor.status}
                                onChange={handleAddChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded border">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                                Add
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
            <AddBlogModal
                isOpen={addOpen}
                onClose={closeAddModal}
                onUpdate={handleUpdate}
            />


            <EditBlogModal
                isOpen={editOpen}
                onClose={closeEditModal}
                blogData={selectedBlog}   // burada seçilmiş blog-u göndəririk
                onUpdate={handleUpdate}    // update sonra siyahını yeniləmək üçün
            />



        </div>
    )
}

export default SiteBlog

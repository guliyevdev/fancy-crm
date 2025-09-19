import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import BlogServices from "../../services/blogServices";

const EditBlogModal = ({ isOpen, onClose, blogData, onUpdate }) => {
    const [blogSlogan, setBlogSlogan] = useState("");
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");

    useEffect(() => {
        if (!blogData) return;

        setBlogSlogan(blogData.blogSlogan || "");
        const i18n = blogData.blogI18n?.[0];
        setTitle(i18n?.title || "");
        setSubtitle(i18n?.subtitle || "");
        setContent(i18n?.content || "");
        setTags(i18n?.tags?.join(", ") || "");
    }, [blogData]);

    const handleSave = async (e) => {
        e.preventDefault();

        const payload = {
            blogId: blogData.id,
            blogSlogan,
            productIds: blogData.products?.map(p => p.id) || [],
            blogI18n: [
                {
                    id: blogData.blogI18n?.[0]?.id,
                    lang: "AZ",
                    title,
                    subtitle,
                    content,
                    tags: tags.split(",").map(t => t.trim()),
                },
            ],
        };

        try {
            await BlogServices.updateBlog(payload); // update service yazılmalıdır
            onUpdate(); // siyahını yenilə
            onClose(); // modalı bağla
        } catch (err) {
            console.error("Update error:", err);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Edit Blog"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full p-6 outline-none"
        >
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Edit Blog</h3>
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Blog Slogan</label>
                    <input
                        type="text"
                        value={blogSlogan}
                        onChange={(e) => setBlogSlogan(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-gray-100"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-gray-100"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                    <input
                        type="text"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-gray-100"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-gray-100"
                        rows={4}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-gray-100"
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                </div>
            </form>
        </Modal>
    );
};

export default EditBlogModal;

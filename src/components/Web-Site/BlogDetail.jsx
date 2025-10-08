'use client'
import React, { useEffect, useState } from "react";
import BlogServices from "../../services/blogServices";
import { useParams } from "react-router-dom";

const BlogDetail = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);

    useEffect(() => {
        if (!id) return;
        const fetchBlog = async () => {
            try {
                const res = await BlogServices.getBlogById(id, "az");
                setBlog(res.data);
            } catch (err) {
                console.error("Blog fetch error:", err);
            }
        };
        fetchBlog();
    }, [id]);

    const toggleActive = () => {
        setBlog(prev => ({ ...prev, active: !prev.active }));
        // gələcəkdə PATCH request ilə backend-ə göndərilə bilər
    };

    if (!blog) return <div>Loading...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
            {/* Header: Title + Active Toggle */}
            <div className=" dark:text-white flex justify-between items-center">
                <h1 className="text-3xl font-bold">{blog.blogI18n?.[0]?.title}</h1>
                <label className="inline-flex items-center cursor-pointer">
                    <span className="mr-2 font-medium text-gray-700">
                        {blog.active ? "Active" : "Inactive"}
                    </span>
                    <input
                        type="checkbox"
                        checked={blog.active}
                        className="sr-only peer"
                        onChange={toggleActive}
                    />
                    <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-600 transition-all"></div>
                </label>
            </div>

            {/* Media */}
            {blog.mediaUrl && (
                <img
                    src={blog.mediaUrl}
                    alt="Blog Media"
                    className="w-full max-h-96 object-cover rounded-lg shadow-md"
                />
            )}

            {/* Core Info */}
            <div className="bg-gray-50 dark:bg-gray-800 dark:text-white  p-4 rounded-lg shadow-inner grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p><strong>ID:</strong> {blog.id}</p>
                    <p><strong>Author:</strong> {blog.authorName} {blog.authorSurname} ({blog.authorCode || "N/A"})</p>
                    <p><strong>Created At:</strong> {blog.createdAt}</p>
                    <p><strong>Updated At:</strong> {blog.updatedAt}</p>
                    <p><strong>Updated By:</strong> {blog.updatedByName} {blog.updatedBySurname} ({blog.updatedByCode || "N/A"})</p>
                </div>
                <div>
                    <p><strong>Blog Slogan:</strong> {blog.blogSlogan}</p>
                    <p><strong>View Count:</strong> {blog.viewCount}</p>
                    <p><strong>Status:</strong> {blog.active ? "Active" : "Inactive"}</p>
                </div>
            </div>

            {/* Translations / I18n */}
            <div className="bg-white dark:text-white dark:bg-gray-900 p-6 rounded-lg shadow-md space-y-4">
                {blog.blogI18n?.map((i18n, idx) => (
                    <div key={i18n.id} className="border-b pb-4 mb-4 last:border-b-0 last:mb-0">
                        <h2 className="text-xl font-semibold">{i18n.lang}</h2>
                        <p><strong>Title:</strong> {i18n.title}</p>
                        <p><strong>Subtitle:</strong> {i18n.subtitle}</p>
                        <p><strong>Content:</strong> {i18n.content}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {i18n.tags?.map((tag, tIdx) => (
                                <span key={tIdx} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Products */}
            {blog.products?.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                    <h3 className="text-lg font-semibold mb-2">Products</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {blog.products.map((product) => (
                            <div key={product.id} className="border p-3 rounded-lg shadow hover:shadow-lg transition">
                                {product.photoUrl ? (
                                    <img src={product.photoUrl} alt={product.name} className="w-full h-32 object-cover rounded mb-2" />
                                ) : (
                                    <div className="w-full h-32 flex items-center justify-center bg-gray-200 rounded mb-2 text-gray-500">No Image</div>
                                )}
                                <h4 className="font-semibold">{product.name}</h4>
                                <p className="text-sm text-gray-500">{product.productCode}</p>
                                <p className="text-sm">
                                    Rent: {product.forRent ? `$${product.rentPrice}` : "No"} | Sale: {product.forSale ? `$${product.salePrice}` : "No"}
                                </p>
                                <p className="text-sm">In Basket: {product.inBasket ? "Yes" : "No"} | In Favourite: {product.inFavourite ? "Yes" : "No"}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogDetail;

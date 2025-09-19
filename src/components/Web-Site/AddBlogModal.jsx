import React, { useState } from "react";
import Modal from "react-modal";
import BlogServices from "../../services/blogServices";

Modal.setAppElement("#root");

const AddBlogModal = ({ isOpen, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        blogSlogan: "",
        productIds: [],
        blogI18n: [
            {
                lang: "AZ",
                title: "",
                subtitle: "",
                content: "",
                tags: []
            }
        ]
    });
    const [tagsInput, setTagsInput] = useState("");
    const [productIdsInput, setProductIdsInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleI18nChange = (index, field, value) => {
        const updatedBlogI18n = [...formData.blogI18n];
        updatedBlogI18n[index][field] = value;
        setFormData(prev => ({
            ...prev,
            blogI18n: updatedBlogI18n
        }));
    };

    const handleTagsChange = (e) => {
        setTagsInput(e.target.value);
        const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        const updatedBlogI18n = [...formData.blogI18n];
        updatedBlogI18n[0].tags = tagsArray;
        setFormData(prev => ({
            ...prev,
            blogI18n: updatedBlogI18n
        }));
    };

    const handleProductIdsChange = (e) => {
        setProductIdsInput(e.target.value);
        const idsArray = e.target.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        setFormData(prev => ({
            ...prev,
            productIds: idsArray
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setUploadedImage(file);
        }
    };
    const isFormValid = formData.blogSlogan &&
        formData.blogI18n[0].title &&
        formData.blogI18n[0].subtitle &&
        formData.blogI18n[0].content &&
        uploadedImage;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            // 1. Blog yarat
            console.log("Blog yaradılır:", formData);
            const response = await BlogServices.createBlog(formData);
            console.log("Blog yaradıldı:", response.data);

            // DÜZƏLTMƏ: API sadəcə ID rəqəm olaraq qaytarır (məsələn: 6)
            const createdBlogId = response.data;

            if (!createdBlogId) {
                throw new Error("Blog ID-si alına bilmədi. Cavab: " + JSON.stringify(response.data));
            }

            // 2. Əgər şəkil seçilibsə, media upload et
            if (uploadedImage) {
                console.log("Şəkil yüklənir...");
                try {
                    const uploadResponse = await BlogServices.uploadMedia(createdBlogId, uploadedImage);
                    console.log("Şəkil uğurla yükləndi", uploadResponse.data);
                } catch (uploadError) {
                    console.error("Şəkil yükləmə xətası:", uploadError);
                    // Şəkil yüklənməsə belə, blog yaradıldığı üçün xəta atma
                }
            }

            // 3. Əməliyyat uğurla başa çatdı
            onUpdate();
            onClose();
            resetForm();

        } catch (error) {
            console.error("Xəta:", error);
            alert("Xəta baş verdi: " + (error.response?.data?.message || error.message));
        } finally {
            setIsUploading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            blogSlogan: "",
            productIds: [],
            blogI18n: [
                {
                    lang: "AZ",
                    title: "",
                    subtitle: "",
                    content: "",
                    tags: []
                }
            ]
        });
        setTagsInput("");
        setProductIdsInput("");
        setUploadedImage(null);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => !isUploading && onClose()}
            contentLabel="Add Blog"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full p-6 outline-none max-h-[90vh] overflow-y-auto"
        >
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Yeni Blog Əlavə Et</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Blog Slogan */}
                <div>
                    <label htmlFor="blogSlogan" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Blog Slogan
                    </label>
                    <input
                        id="blogSlogan"
                        name="blogSlogan"
                        type="text"
                        value={formData.blogSlogan}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    />
                </div>

                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Başlıq (AZ)
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={formData.blogI18n[0].title}
                        onChange={(e) => handleI18nChange(0, 'title', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    />
                </div>

                {/* Subtitle */}
                <div>
                    <label htmlFor="subtitle" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Alt Başlıq (AZ)
                    </label>
                    <input
                        id="subtitle"
                        type="text"
                        value={formData.blogI18n[0].subtitle}
                        onChange={(e) => handleI18nChange(0, 'subtitle', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    />
                </div>

                {/* Content */}
                <div>
                    <label htmlFor="content" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Məzmun (AZ)
                    </label>
                    <textarea
                        id="content"
                        value={formData.blogI18n[0].content}
                        onChange={(e) => handleI18nChange(0, 'content', e.target.value)}
                        required
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    />
                </div>

                {/* Tags */}
                <div>
                    <label htmlFor="tags" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Teqlər (vergüllə ayırın)
                    </label>
                    <input
                        id="tags"
                        type="text"
                        value={tagsInput}
                        onChange={handleTagsChange}
                        placeholder="teq1, teq2, teq3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    />
                </div>

                {/* Product IDs */}
                <div>
                    <label htmlFor="productIds" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Məhsul ID-ləri (vergüllə ayırın)
                    </label>
                    <input
                        id="productIds"
                        type="text"
                        value={productIdsInput}
                        onChange={handleProductIdsChange}
                        placeholder="1, 2, 3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    />
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Şəkil Yüklə
                    </label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <span className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                    {uploadedImage ? uploadedImage.name : "Şəkil seçin və ya buraya sürüşdürün"}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, JPEG</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                disabled={isUploading}
                            />
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600"
                        disabled={isUploading}
                    >
                        Ləğv Et
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={isUploading || !isFormValid}
                    >
                        {isUploading ? 'Yüklənir...' : 'Əlavə Et'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddBlogModal;
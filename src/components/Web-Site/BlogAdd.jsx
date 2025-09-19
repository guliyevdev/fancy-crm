import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BlogServices from "../../services/blogServices";
import { toast } from "sonner";

const BlogAdd = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        blogSlogan: "",
        productIds: [],
        blogI18n: [
            { lang: "AZ", title: "", subtitle: "", content: "", tags: [] },
            { lang: "EN", title: "", subtitle: "", content: "", tags: [] },
            { lang: "RU", title: "", subtitle: "", content: "", tags: [] }
        ]
    });

    const [tagsInput, setTagsInput] = useState(["", "", ""]); // hər dil üçün ayrıca
    const [productIdsInput, setProductIdsInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleI18nChange = (index, field, value) => {
        const updatedBlogI18n = [...formData.blogI18n];
        updatedBlogI18n[index][field] = value;
        setFormData((prev) => ({
            ...prev,
            blogI18n: updatedBlogI18n
        }));
    };

    const handleTagsChange = (index, value) => {
        const tagsArray = value
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "");

        const updatedBlogI18n = [...formData.blogI18n];
        updatedBlogI18n[index].tags = tagsArray;

        setFormData((prev) => ({
            ...prev,
            blogI18n: updatedBlogI18n
        }));

        const updatedTagsInput = [...tagsInput];
        updatedTagsInput[index] = value;
        setTagsInput(updatedTagsInput);
    };

    const handleProductIdsChange = (e) => {
        setProductIdsInput(e.target.value);
        const idsArray = e.target.value
            .split(",")
            .map((id) => parseInt(id.trim()))
            .filter((id) => !isNaN(id));
        setFormData((prev) => ({
            ...prev,
            productIds: idsArray
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            setUploadedImage(file);
            setPreviewUrl(URL.createObjectURL(file)); // preview üçün
        }
    };

    const isFormValid =
        formData.blogSlogan &&
        formData.blogI18n.every(
            (lang) => lang.title && lang.subtitle && lang.content
        ) &&
        uploadedImage;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            console.log("Blog yaradılır:", formData);
            const response = await BlogServices.createBlog(formData);
            console.log("Blog yaradıldı:", response.data);

            const createdBlogId = response.data;
            if (!createdBlogId) {
                throw new Error(
                    "Blog ID-si alına bilmədi. Cavab: " + JSON.stringify(response.data)
                );
            }

            if (uploadedImage) {
                console.log("Şəkil yüklənir...");
                try {
                    await BlogServices.uploadMedia(createdBlogId, uploadedImage);
                    console.log("Şəkil uğurla yükləndi");
                } catch (uploadError) {
                    console.error("Şəkil yükləmə xətası:", uploadError);
                }
            }

            resetForm();
            toast.success("Blog uğurla əlavə olundu ✅");
            navigate("/site-blog"); 
        } catch (error) {
            console.error("Xəta:", error);
            toast.error("Xəta baş verdi: " + (error.response?.data?.message || error.message));
        } finally {
            setIsUploading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            blogSlogan: "",
            productIds: [],
            blogI18n: [
                { lang: "AZ", title: "", subtitle: "", content: "", tags: [] },
                { lang: "EN", title: "", subtitle: "", content: "", tags: [] },
                { lang: "RU", title: "", subtitle: "", content: "", tags: [] }
            ]
        });
        setTagsInput(["", "", ""]);
        setProductIdsInput("");
        setUploadedImage(null);
        setPreviewUrl(null);
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                Yeni Blog Əlavə Et
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Blog Slogan */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Blog Slogan
                    </label>
                    <input
                        name="blogSlogan"
                        type="text"
                        value={formData.blogSlogan}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    />
                </div>

                {/* Blog I18n */}
                {formData.blogI18n.map((item, index) => (
                    <div key={item.lang} className="border rounded-lg p-4">
                        <h2 className="font-semibold mb-2">{item.lang}</h2>

                        <div className="mb-2">
                            <label className="block text-sm font-medium mb-1">Başlıq</label>
                            <input
                                type="text"
                                value={item.title}
                                onChange={(e) =>
                                    handleI18nChange(index, "title", e.target.value)
                                }
                                required
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            />
                        </div>

                        <div className="mb-2">
                            <label className="block text-sm font-medium mb-1">Alt Başlıq</label>
                            <input
                                type="text"
                                value={item.subtitle}
                                onChange={(e) =>
                                    handleI18nChange(index, "subtitle", e.target.value)
                                }
                                required
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            />
                        </div>

                        <div className="mb-2">
                            <label className="block text-sm font-medium mb-1">Məzmun</label>
                            <textarea
                                value={item.content}
                                onChange={(e) =>
                                    handleI18nChange(index, "content", e.target.value)
                                }
                                required
                                rows={4}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Teqlər</label>
                            <input
                                type="text"
                                value={tagsInput[index]}
                                onChange={(e) => handleTagsChange(index, e.target.value)}
                                placeholder="teq1, teq2, teq3"
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            />
                        </div>
                    </div>
                ))}

                {/* Product IDs */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Məhsul ID-ləri (vergüllə ayırın)
                    </label>
                    <input
                        type="text"
                        value={productIdsInput}
                        onChange={handleProductIdsChange}
                        placeholder="1, 2, 3"
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    />
                </div>

                {/* Image Upload with Preview */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Şəkil Yüklə
                    </label>
                    <div className="flex flex-col items-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 relative overflow-hidden">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="preview"
                                    className="absolute inset-0 object-cover w-full h-full rounded-lg"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <span className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                        Şəkil seçin və ya buraya sürüşdürün
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        PNG, JPG, JPEG
                                    </span>
                                </div>
                            )}
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

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600"
                        disabled={isUploading}
                    >
                        Təmizlə
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={isUploading || !isFormValid}
                    >
                        {isUploading ? "Yüklənir..." : "Əlavə Et"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BlogAdd;

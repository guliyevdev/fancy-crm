import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import webContentServices from "../../services/webContentService";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

export default function SiteContent() {
    const { id } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        webContentServices
            .findById(id)
            .then((res) => setData(res.data.data))
            .catch((err) => console.error(err));
    }, [id]);

    if (!data) return <p className="text-center text-gray-500">Yüklənir...</p>;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">{data.pageKey}</h1>
                <p className="text-gray-500">
                    Sort Order: <span className="font-medium">{data.sortOrder}</span> |{" "}
                    Active:{" "}
                    <span
                        className={`px-2 py-1 rounded-full text-sm ${data.active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                    >
                        {data.active ? "Yes" : "No"}
                    </span>
                </p>
            </div>

            {/* Tabs for i18n */}
            <div>
                <Tabs>
                    <TabList className="flex justify-center space-x-4 border-b">
                        {data.i18nList.map((item) => (
                            <Tab
                                key={item.id}
                                className="px-4 py-2 cursor-pointer text-gray-600 hover:text-blue-600 focus:outline-none"
                                selectedClassName="border-b-2 border-blue-600 text-blue-600 font-semibold"
                            >
                                {item.lang}
                            </Tab>
                        ))}
                    </TabList>

                    {data.i18nList.map((item) => (
                        <TabPanel key={item.id}>
                            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-4">
                                <h2 className="text-2xl font-semibold">{item.title}</h2>
                                {item.subtitle && (
                                    <p className="text-gray-500 italic">{item.subtitle}</p>
                                )}
                                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                    {item.body}
                                </p>
                            </div>
                        </TabPanel>
                    ))}
                </Tabs>
            </div>

            {/* Media Gallery */}
            <div>
                <h2 className="text-xl font-bold mb-4">Qalereya</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {data.mediaUrls.map((url, index) => (
                        <div
                            key={index}
                            className="overflow-hidden rounded-2xl shadow-lg group"
                        >
                            <img
                                src={url}
                                alt={`media-${index}`}
                                className="w-full h-48 object-cover transform group-hover:scale-105 transition duration-300"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

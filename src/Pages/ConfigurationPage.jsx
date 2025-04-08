import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import MappingTable from "../Components/MappingTableComponent";

const ConfigurationPage = () => {
    const [fields, setFields] = useState([]);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [csvFields,setcsvFields] = useState([])
    
    const handleUpload = async (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        setMessage("");

        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            setLoading(true);
            const response = await axiosInstance.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            
            setcsvFields(response.data.fields);
            if (response.data.fields) {
                setFields(response.data.fields.map((field) => ({ newName: field, oldName: "" })));
            } else {
                setMessage("No valid fields found in the CSV.");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            setMessage("Failed to process the file. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const updateConfiguration = (updatedFields) => {
        setFields(updatedFields);
    };

    const handleSaveMapping = async () => {
        if (!file) {
            setMessage("Please upload a CSV file before saving.");
            return;
        }

        if (fields.some(field => !field.oldName)) {
            setMessage("Please complete the mapping before saving.");
            return;
        }

        const mapping = fields.reduce((acc, field) => {
            acc[field.newName] = field.oldName;
            return acc;
        }, {});

        const formData = new FormData();
        formData.append("file", file);
        formData.append("mapping", JSON.stringify(mapping));

        try {
            setLoading(true);
            await axiosInstance.post("/save-mapped", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setMessage("Mapping saved successfully!");
        } catch (error) {
            console.error("Error saving mapping:", error);
            setMessage("Error saving mapping. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">CSV Mapping Configuration</h2>

            <div className="flex flex-col items-center space-y-4">
                <label className="w-full px-6 py-3 bg-blue-600 text-white text-center rounded-lg cursor-pointer hover:bg-blue-700 transition">
                    <input type="file" className="hidden" onChange={handleUpload} />
                    {file ? file.name : "Choose a CSV file"}
                </label>
            </div>

            {message && <p className="mt-4 text-center text-red-500">{message}</p>}
            {loading && <p className="text-center text-gray-600 mt-2">Processing...</p>}

            {fields.length > 0 && (
                <div className="mt-6">
                    <MappingTable fields={fields} setFields={setFields} updateConfiguration={updateConfiguration} csvFields ={csvFields}/>

                    <button
                        onClick={handleSaveMapping}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg mt-4 transition"
                    >
                        Save Mapping
                    </button>
                </div>
            )}
        </div>
    );
};

export default ConfigurationPage;

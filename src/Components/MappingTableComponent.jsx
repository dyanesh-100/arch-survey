import React, { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { useGlobalContext } from "../Context/GlobalContext";

const MappingTable = ({ fields, setFields, updateConfiguration, csvFields }) => {
    const { cmdbresponses, setcmdbresponses } = useGlobalContext();
    const [hoverIndex, setHoverIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [dropdownIndex, setDropdownIndex] = useState(null);
    const inputRef = useRef(null);

    const responseFields = cmdbresponses.length > 0
        ? Object.keys(cmdbresponses[0]).filter(key => key !== "_id" && key !== "__v")
        : [];

    useEffect(() => {
        const updatedFields = responseFields.map((fieldName) => {
            const existingField = fields.find(f => f.newName === fieldName);
            return existingField || { newName: fieldName, oldName: "" };
        });
        setFields(updatedFields);
    }, [cmdbresponses]);

    const handleChange = (index, value) => {
        const newFields = [...fields];
        newFields[index].oldName = value;
        setFields(newFields);
        updateConfiguration(newFields);
        setDropdownIndex(null);
    };

    const handleDelete = (index) => {
        const newFields = fields.filter((_, i) => i !== index);
        setFields(newFields);
        updateConfiguration(newFields);

        setcmdbresponses(prevcmdbresponses => {
            if (prevcmdbresponses.length > 0) {
                const updatedResponse = { ...prevcmdbresponses[0] };
                delete updatedResponse[responseFields[index]];
                return [updatedResponse];
            }
            return prevcmdbresponses;
        });
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead>
                    <tr className="bg-blue-600 text-white">
                        <th className="py-4 px-6 text-left font-semibold">New Response Field Name</th>
                        <th className="py-4 px-6 text-left font-semibold">Old Response Field Name</th>
                        <th className="py-4 px-6 text-center font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {responseFields.length > 0 ? (
                        fields.map((field, index) => (
                            <tr
                                key={index}
                                className="border-b hover:bg-gray-50 transition-colors duration-200"
                                onMouseEnter={() => setHoverIndex(index)}
                                onMouseLeave={() => setHoverIndex(null)}
                            >
                                <td className="py-3 px-6 text-gray-800 font-medium">{field.newName}</td>
                                <td className="py-3 px-6 relative">
                                    <div
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer"
                                        onClick={() => setDropdownIndex(index)}
                                    >
                                        {field.oldName || "Select a field"}
                                    </div>
                                    
                                    {dropdownIndex === index && (
                                        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-lg rounded-lg mt-1 z-10">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none"
                                                placeholder="Search field..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                autoFocus
                                            />
                                            <ul className="max-h-40 overflow-y-auto">
                                                {csvFields
                                                    .filter(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
                                                    .map((option, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                            onClick={() => handleChange(index, option)}
                                                        >
                                                            {option}
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    )}
                                </td>
                                <td className="py-3 px-6 text-center">
                                    <button
                                        className={`text-red-500 hover:text-red-700 transition-transform transform ${
                                            hoverIndex === index ? "scale-100 opacity-100" : "scale-0 opacity-0"
                                        }`}
                                        onClick={() => handleDelete(index)}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="py-6 px-6 text-center text-gray-500">
                                No response fields available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MappingTable;

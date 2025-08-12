import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const CustomSelect = ({
    options = [],
    value,
    onChange,
    placeholder = "Seçim edin",
    disabled = false,
    className = "",
    optionClassName = "",
    isSearchable = true
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    // Klik edildikdə dropdown-u bağlamaq
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filtrlənmiş seçimlər
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Seçilmiş elementin adı
    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div
            ref={dropdownRef}
            className={`relative ${className}`}
        >
            {/* Select trigger */}
            <div
                className={`flex items-center justify-between p-2  rounded cursor-pointer ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={!value ? 'text-gray-400' : ''}>
                    {selectedOption?.label || placeholder}
                </span>
                <svg
                    className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Dropdown menyu */}
            {isOpen && (
                <div className="absolute z-50 w-[96%] mt-1 bg-white dark:bg-gray-800 border  rounded-md shadow-lg">
                    {/* Axtarış inputu (əgər aktivdirsə) */}
                    {isSearchable && (
                        <div className="p-2 border-b">
                            <input
                                type="text"
                                placeholder="Axtar..."
                                className="w-full p-1 text-black dark:text-white dark:bg-gray-800 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Seçimlər */}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`p-2 cursor-pointer hover:bg-blue-50 ${optionClassName} ${value === option.value ? 'bg-blue-100 font-medium' : ''
                                        }`}
                                    onClick={() => {
                                        onChange({ target: { name: option.name || '', value: option.value } });
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : (
                            <div className="p-2 text-sm text-gray-500 dark:text-white">Heç bir nəticə tapılmadı</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// PropTypes validation
CustomSelect.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.any.isRequired,
            label: PropTypes.string.isRequired,
            name: PropTypes.string
        })
    ).isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    optionClassName: PropTypes.string,
    isSearchable: PropTypes.bool
};

export default CustomSelect;
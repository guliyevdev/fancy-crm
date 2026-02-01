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
    isSearchable = true,
    isMulti = false,
    onSearchChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    const normalizedValue = isMulti
        ? Array.isArray(value) ? value : (value ? [value] : [])
        : value;

    const selectedOptions = options.filter(opt =>
        isMulti
            ? normalizedValue.includes(opt.value)
            : opt.value === normalizedValue
    );

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

    // const filteredOptions = options.filter(option =>
    //     option.label.toLowerCase().includes(searchTerm.toLowerCase())
    // );
    const filteredOptions = options.filter(option =>
        option.label && option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const handleSelect = (optionValue) => {
        if (isMulti) {
            const newValue = normalizedValue.includes(optionValue)
                ? normalizedValue.filter(v => v !== optionValue)
                : [...normalizedValue, optionValue];
            onChange({
                target: {
                    name: options.find(opt => opt.value === optionValue)?.name || '',
                    value: newValue
                }
            });
        } else {
            onChange({
                target: {
                    name: options.find(opt => opt.value === optionValue)?.name || '',
                    value: optionValue
                }
            });
            setIsOpen(false);
            setSearchTerm("");
        }
    };

    const removeItem = (itemValue, e) => {
        e.stopPropagation();
        const newValue = normalizedValue.filter(v => v !== itemValue);
        onChange({
            target: {
                name: options.find(opt => opt.value === itemValue)?.name || '',
                value: isMulti ? newValue : null
            }
        });
    };
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (onSearchChange) onSearchChange(e.target.value);
    };

    return (
        <div
            ref={dropdownRef}
            className={`relative ${className} dark:bg-gray-700`}
        >

            <div
                className={`flex items-center justify-between p-2.5 bg-white dark:bg-gray-700 dark:text-white rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className="flex flex-wrap gap-1 overflow-hidden">
                    {isMulti ? (
                        normalizedValue.length > 0 ? (
                            normalizedValue.map(val => {
                                const option = options.find(opt => opt.value === val);
                                return (
                                    <span
                                        key={val}
                                        className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 text-xs px-2 py-0.5 rounded-lg"
                                    >
                                        {option?.label}
                                        <button
                                            type="button"
                                            onClick={(e) => removeItem(val, e)}
                                            className="text-blue-400 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-100 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                );
                            })
                        ) : (
                            <span className="text-gray-400 dark:text-gray-400 text-sm">{placeholder}</span>
                        )
                    ) : (
                        <span className={`text-sm ${selectedOptions.length === 0 ? 'text-gray-400 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                            {selectedOptions.length > 0 ? selectedOptions[0].label : placeholder}
                        </span>
                    )}
                </div>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>


            {isOpen && (
                <div className="w-full absolute z-50 left-0 mt-2 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {isSearchable && (
                        <div className="p-2 border-b border-gray-100 dark:border-gray-600">
                            <input
                                type="text"
                                placeholder="Axtar..."
                                className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${optionClassName} 
                                        ${(isMulti
                                            ? normalizedValue.includes(option.value)
                                            : option.value === normalizedValue)
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 font-medium'
                                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                                        }`}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    <div className="flex items-center">
                                        {isMulti && (
                                            <input
                                                type="checkbox"
                                                checked={normalizedValue.includes(option.value)}
                                                readOnly
                                                className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        )}
                                        {option.label}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-sm text-center text-gray-500 dark:text-gray-400">Heç bir nəticə tapılmadı</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

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
    isSearchable: PropTypes.bool,
    isMulti: PropTypes.bool
};

CustomSelect.defaultProps = {
    isMulti: false
};

export default CustomSelect;
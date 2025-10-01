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
                className={`flex items-center justify-between p-2 dark:bg-gray-700 dark:text-white rounded cursor-pointer ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                                        className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                    >
                                        {option?.label}
                                        <button
                                            type="button"
                                            onClick={(e) => removeItem(val, e)}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            ×
                                        </button>
                                    </span>
                                );
                            })
                        ) : (
                            <span className="text-gray-400">{placeholder}</span>
                        )
                    ) : (
                        <span className={selectedOptions.length === 0 ? 'text-gray-400' : ''}>
                            {selectedOptions.length > 0 ? selectedOptions[0].label : placeholder}
                        </span>
                    )}
                </div>
                <svg
                    className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>


            {isOpen && (
                <div className=" w-[95%] absolute z-50 right-1 mt-1 bg-white border dark:bg-gray-700 rounded-md shadow-lg">
                    {isSearchable && (
                        <div className="p-2 border-b">
                            <input
                                type="text"
                                placeholder="Axtar..."
                                className="w-full p-1 text-sm  rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`p-2 cursor-pointer hover:bg-blue-50 hover:text-black ${optionClassName} ${(isMulti
                                        ? normalizedValue.includes(option.value)
                                        : option.value === normalizedValue)
                                        ? 'bg-blue-100 font-medium' : ''
                                        }`}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    <div className="flex items-center">
                                        {isMulti && (
                                            <input
                                                type="checkbox"
                                                checked={normalizedValue.includes(option.value)}
                                                readOnly
                                                className="mr-2"
                                            />
                                        )}
                                        {option.label}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-2 text-sm text-gray-500">Heç bir nəticə tapılmadı</div>
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
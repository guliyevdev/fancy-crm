import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const DatePicker = ({ value, onChange, disabled = false, placeholder = "Tarix seçin", disabledDates = [] }) => {
    const [showCalendar, setShowCalendar] = useState(false);

    const handleDateSelect = (date) => {
        onChange(date);
        setShowCalendar(false);
    };

    return (
        <div className="relative">
            <div className="flex">
                <input
                    type="text"
                    value={value}
                    onChange={() => { }}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    onFocus={() => setShowCalendar(true)}
                    readOnly
                />
                <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    disabled={disabled}
                    className="ml-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                    <Calendar size={16} />
                </button>
            </div>

            {showCalendar && (
                <div className="absolute z-10 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-4 w-64">
                    <CalendarComponent
                        selectedDate={value}
                        onSelectDate={handleDateSelect}
                        onClose={() => setShowCalendar(false)}
                        disabledDates={disabledDates}
                    />
                </div>
            )}
        </div>
    );
};

// Təqvim komponenti
const CalendarComponent = ({ selectedDate, onSelectDate, onClose, disabledDates = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Əlil edilmiş tarixləri formatlayırıq
    const formatDisabledDates = () => {
        const dates = [];

        // Bugünün tarixini alıb 26 gün əvvəlini hesablayırıq
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 26 gün əvvəlki tarixi hesablayırıq
        const cutoffDate = new Date(today);
        cutoffDate.setDate(today.getDate() - 26);

        // Əgər xüsusi disabledDates verilibsə, onları da əlavə et
        disabledDates.forEach(dateRange => {
            const start = new Date(dateRange.startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(dateRange.endDate);
            end.setHours(0, 0, 0, 0);

            // Tarix aralığındaki bütün tarixləri əlavə edirik
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                dates.push(dateStr);
            }
        });

        // 26 gün əvvəlki tarixdən bugünə qədər olan bütün tarixləri disable et
        for (let d = new Date(cutoffDate); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (!dates.includes(dateStr)) {
                dates.push(dateStr);
            }
        }

        return dates;
    };

    const disabledDateList = formatDisabledDates();

    const isDateDisabled = (date) => {
        return disabledDateList.includes(date);
    };

    const daysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const handleDateClick = (day) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        newDate.setHours(0, 0, 0, 0); // Saatı sıfırla

        // toISOString() əvəzinə yerli formatda tarix yaradın
        const formattedDate = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;

        // Əgər tarix bloklanmışdırsa, seçim etmirik
        if (isDateDisabled(formattedDate)) return;

        onSelectDate(formattedDate);
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonthCount = daysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];

        // Boş günlər
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8"></div>);
        }

        // Günləri əlavə et
        for (let day = 1; day <= daysInMonthCount; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;
            const isDisabled = isDateDisabled(dateStr);

            days.push(
                <div
                    key={day}
                    className={`h-8 flex items-center justify-center rounded-full ${isDisabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                        : isSelected
                            ? 'bg-blue-500 text-white cursor-pointer'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                        }`}
                    onClick={() => !isDisabled && handleDateClick(day)}
                >
                    {day}
                </div>
            );
        }

        return days;
    };

    // Bugünün tarixini və 26 gün əvvəlini hesablayırıq
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoffDate = new Date(today);
    cutoffDate.setDate(today.getDate() - 26);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    ←
                </button>
                <h4 className="text-lg font-medium">
                    {currentDate.toLocaleString('az-AZ', { month: 'long', year: 'numeric' })}
                </h4>
                <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    →
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['B', 'Be', 'Ça', 'Ç', 'Ca', 'C', 'Ş'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
            </div>

            {disabledDateList.length > 0 && (
                <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                    <p className="text-xs text-orange-700 dark:text-orange-300">
                        * Boz rəngli tarixlər ({cutoffDate.toLocaleDateString('az-AZ')} - {today.toLocaleDateString('az-AZ')} arası) seçilə bilməz
                    </p>
                </div>
            )}

            <div className="mt-4 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Bağla
                </button>
            </div>
        </div>
    );
};

export default DatePicker;
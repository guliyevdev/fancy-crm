import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/crm-core/api/v1";

const CalendarService = {
    getCalendarEvents: () => axiosInstance.get(`${BASE_URL}/calendar`),

};

export default CalendarService;
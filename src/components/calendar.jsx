import { useEffect, useState } from "react";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewMonthGrid,
  createViewWeek,
  createViewDay,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import "@schedule-x/theme-default/dist/index.css";
import CalendarService from "../services/calendarServices";

const calendars = [{ id: "default", name: "Default Calendar" }];

const CalendarComponent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await CalendarService.getCalendarEvents();
        const apiData = response.data.data || [];
        console.log("object", apiData)
        const formattedEvents = apiData
          .map((item, index) => ({
            id: String(index + 1),
            calendarId: "default",
            title: `${item.customerName} (${item.orderType})`,
            // start: item.eventDate,
            // end: item.eventDate,
            eventDate: (item.eventDate),
            meta: {
              phone: item.customerPhone,
              status: item.status,
              orderType: item.orderType,
            },
          }));

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const eventsServicePlugin = createEventsServicePlugin({
    calendars,
    initialEvents: events,
  });

  const calendarApp = useCalendarApp({
    views: [createViewMonthGrid(), createViewWeek(), createViewDay()],
    plugins: [eventsServicePlugin],
    defaultView: "month",
    currentDate: new Date().toISOString().slice(0, 10),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 text-lg animate-pulse">
          Loading calendar...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg min-h-[80vh] flex flex-col space-y-8">
      <header>
        <h1 className="text-3xl font-semibold text-gray-800">
          Customer Bookings Calendar
        </h1>
        <p className="text-gray-500 mt-1">
          Plan and organize your events effortlessly.
        </p>
      </header>

      <div className="border rounded-lg overflow-hidden shadow-sm">
        <ScheduleXCalendar calendarApp={calendarApp} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Event List
        </h2>
        <div className="overflow-x-auto rounded-lg shadow-sm border">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Order Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Event Date</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-400">
                    No events found
                  </td>
                </tr>
              ) : (
                events.map((ev, i) => (
                  <tr
                    key={ev.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2">{ev.title.split(" (")[0]}</td>
                    <td className="px-4 py-2">{ev.meta.phone}</td>
                    <td className="px-4 py-2">{ev.meta.orderType}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${ev.meta.status === "AT_CLIENT"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {ev.meta.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {/* {new Date(ev.start).toLocaleString()} */}
                      <td className="px-4 py-2">
                        {ev.eventDate
                          ? new Date(ev.eventDate).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "tarix qeyd olunmayıb"}
                      </td>

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="text-center text-sm text-gray-400">
        © 2025 Your Company. All rights reserved.
      </footer>
    </div>
  );
};

export default CalendarComponent;

import { useEffect, useState } from "react";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import { createViewMonthGrid, createViewWeek, createViewDay } from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import "@schedule-x/theme-default/dist/index.css";
import CalendarService from "../services/calendarServices";

const calendars = [{ id: "default", name: "Default Calendar", color: "#ffffff" }];

const CalendarComponent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Event-ləri yüklə
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await CalendarService.getCalendarEvents();
        const apiData = response.data.data || [];

        const formattedEvents = apiData
          .filter(item => item.eventDate !== null)
          .map((item, index) => {
            const eventDate = new Date(item.eventDate);
            const start = eventDate.toISOString().split('T')[0];
            const end = eventDate.toISOString().split('T')[0];

            return {
              id: `event-${index + 1}-${item.eventDate}`,
              calendarId: "default",
              title: `${item.customerName} (${item.orderType})`,
              start: start,
              end: end,
              meta: {
                phone: item.customerPhone,
                status: item.status,
                orderType: item.orderType,
                eventDate: item.eventDate,
              },
              color: "#3b82f6",
            };
          });

        if (calendarApp) {
          calendarApp.events.set(formattedEvents);
        }

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [calendarApp]);

  // ScheduleX event text-lərinin background rəngini qırmızı et
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
     .sx__month-grid-cell {
        max-height: 20px !important;
        min-height: 20px !important;
        height: 20px !important;
      }
      
      /* Tarix xanaları */
      .sx__month-grid-day {
        max-height: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
        padding: 2px !important;
      }
      
      /* Event container */
      .sx__month-grid-day__events {
        max-height: 20px !important;
        overflow: hidden !important;
        height: 20px !important;
      }
      .sx__event {
        background-color: blue !important; 
        color: white !important; 
        border-radius: 4px !important;
        padding: 2px 4px !important;
        margin: 1px 0 !important;
        font-size: 12px !important;
        font-weight: 500 !important;
       display: none !important;
       max-height: 0px !important;
       min-height: 0px !important;
       overflow: hidden !important;
       
      }
       
      
      /* Event text içindəki span və digər elementlər */
      .sx__event span,
      .sx__event div,
      .sx__event p {
        background-color: transparent !important;
        color: white !important;
      }
      
      /* Hover effekti */
      .sx__event:hover {
        background-color: #dc2626 !important;
        transform: scale(1.05) !important;
      }
      
      /* Tarix cell-lərinin özünü rəngləmə (əlavə) */
      [data-date] {
        position: relative;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Tarixləri rənglə və click əlavə et
  useEffect(() => {
    if (events.length === 0) return;

    const setupCalendar = () => {
      const dateCells = document.querySelectorAll('[data-date]');

      dateCells.forEach(cell => {
        const date = cell.getAttribute('data-date');
        const eventsOnThisDate = events.filter(event =>
          event.start.split('T')[0] === date
        );

        if (eventsOnThisDate.length > 0) {
          cell.style.cursor = 'pointer';
          cell.style.transition = 'all 0.3s ease';
          cell.style.position = 'relative';
          cell.style.backgroundColor = '#bfdbfe';

          // Event sayını göstər
          const eventCount = eventsOnThisDate.length;
          if (eventCount > 1) {
            const badge = document.createElement('div');
            badge.style.position = 'absolute';
            badge.style.top = '2px';
            badge.style.right = '2px';
            badge.style.backgroundColor = '#2563eb';
            badge.style.color = 'white';
            badge.style.borderRadius = '50%';
            badge.style.width = '18px';
            badge.style.height = '18px';
            badge.style.fontSize = '10px';
            badge.style.display = 'flex';
            badge.style.alignItems = 'center';
            badge.style.justifyContent = 'center';
            badge.style.fontWeight = 'bold';
            badge.style.zIndex = '10';
            badge.textContent = eventCount;
            cell.appendChild(badge);
          }

          // Click handler - Modal aç
          cell.addEventListener('click', (e) => {
            setSelectedDateEvents(eventsOnThisDate);
            setIsModalOpen(true);
            e.stopPropagation();
          });
        }
      });
    };

    setTimeout(setupCalendar, 1000);
    setTimeout(setupCalendar, 2000);

    const interval = setInterval(setupCalendar, 5000);
    return () => clearInterval(interval);
  }, [events]);

  // Modalda event seç
  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(false);
  };

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

      {/* Calendar */}
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <ScheduleXCalendar calendarApp={calendarApp} />
      </div>

      {/* Date Events Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Events on {selectedDateEvents[0]?.start && new Date(selectedDateEvents[0].start).toLocaleDateString()}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              {selectedDateEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleEventSelect(event)}
                >
                  <div className="font-semibold text-gray-800">
                    {event.title.split(" (")[0]}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">
                      {event.meta.orderType}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${event.meta.status === "AT_CLIENT"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                      }`}>
                      {event.meta.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(event.meta.eventDate).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Event Details */}
      {selectedEvent && (
        <div className="mt-6 p-6 border rounded-lg bg-blue-50 border-blue-200">
          <h3 className="text-xl font-semibold mb-4 text-blue-800">Event Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <strong className="text-blue-700">Customer:</strong>
                <p className="mt-1 text-gray-800">{selectedEvent.title.split(" (")[0]}</p>
              </div>
              <div>
                <strong className="text-blue-700">Phone:</strong>
                <p className="mt-1 text-gray-800">{selectedEvent.meta.phone}</p>
              </div>
              <div>
                <strong className="text-blue-700">Order Type:</strong>
                <p className="mt-1 text-gray-800">{selectedEvent.meta.orderType}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <strong className="text-blue-700">Status:</strong>
                <span className={`ml-2 px-3 py-1 rounded text-sm font-medium ${selectedEvent.meta.status === "AT_CLIENT"
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                  }`}>
                  {selectedEvent.meta.status}
                </span>
              </div>
              <div>
                <strong className="text-blue-700">Event Date:</strong>
                <p className="mt-1 text-gray-800">
                  {new Date(selectedEvent.meta.eventDate).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
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
                    className={`border-b hover:bg-gray-50 transition cursor-pointer ${selectedEvent && selectedEvent.id === ev.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    onClick={() => setSelectedEvent(ev)}
                  >
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{ev.title.split(" (")[0]}</td>
                    <td className="px-4 py-3">{ev.meta.phone}</td>
                    <td className="px-4 py-3">{ev.meta.orderType}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded text-xs font-medium ${ev.meta.status === "AT_CLIENT"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                        }`}>
                        {ev.meta.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(ev.meta.eventDate).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
import React from "react";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewMonthGrid,
  createViewWeek,
  createViewDay,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import "@schedule-x/theme-default/dist/index.css";

const calendars = [{ id: "default", name: "Default Calendar" }];

const today = new Date().toISOString().slice(0, 10);

const initialEvents = [
  {
    id: "1",
    calendarId: "default",
    title: "Test Event Today",
    start: today,
    end: today,
  },
  {
    id: "2",
    calendarId: "default",
    title: "Team Meeting",
    start: "2025-06-20T10:00:00",
    end: "2025-06-20T11:00:00",
  },
];

console.log("Initial Events:", initialEvents);

const eventsServicePlugin = createEventsServicePlugin({
  calendars,
  initialEvents,
});

const CalendarComponent = () => {
  const calendarApp = useCalendarApp({
    views: [createViewMonthGrid(), createViewWeek(), createViewDay()],
    plugins: [eventsServicePlugin],
    defaultView: "month",
    currentDate: today,
  });

  if (!calendarApp) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 text-lg animate-pulse">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg min-h-[80vh] flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Customer Bookings Calendar</h1>
        <p className="text-gray-500 mt-1">Plan and organize your events effortlessly.</p>
      </header>

      <main className="flex-1">
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <ScheduleXCalendar calendarApp={calendarApp} />
        </div>
      </main>

      <footer className="mt-6 text-center text-sm text-gray-400">© 2025 Your Company. All rights reserved.</footer>
    </div>
  );
};

export default CalendarComponent;

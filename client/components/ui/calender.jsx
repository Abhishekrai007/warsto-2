// components/ui/calendar.jsx
import React, { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
} from "date-fns";

export function Calendar({ selected, onSelect, disabled }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows = [];

  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      days.push(
        <div
          className={`col cell ${
            !isSameMonth(day, monthStart)
              ? "disabled"
              : isSameDay(day, selected)
              ? "selected"
              : ""
          }`}
          key={day}
          onClick={() => !disabled(cloneDay) && onSelect(cloneDay)}
        >
          <span className={disabled(cloneDay) ? "text-gray-400" : ""}>
            {formattedDate}
          </span>
        </div>
      );
      day = eachDayOfInterval({ start: day, end: day, step: 1 })[0];
    }
    rows.push(
      <div className="row" key={day}>
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="calendar">
      <header className="header">
        <div className="current">{format(currentMonth, "MMMM yyyy")}</div>
      </header>
      <div className="days">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div className="col col-center" key={d}>
            {d}
          </div>
        ))}
      </div>
      <div className="body">{rows}</div>
    </div>
  );
}

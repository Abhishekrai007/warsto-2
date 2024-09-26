import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  format,
  addDays,
  isBefore,
  startOfDay,
  isToday,
  parseISO,
} from "date-fns";
import api from "@/utils/api";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";

export default function MeasurementSlotSelector({ onSlotSelect }) {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders/available-slots");
      setAvailableSlots(response.data);
      if (response.data.length > 0) {
        setSelectedDate(parseISO(response.data[0].startTime));
      }
      setError(null);
    } catch (err) {
      setError("Failed to fetch available slots. Please try again later.");
      console.error("Error fetching available slots:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    onSlotSelect(slot);
  };

  const convertTo12HourFormat = (timeRange) => {
    const [start, end] = timeRange.split(" - ");
    const convertTime = (time) => {
      const [hours, minutes] = time.split(":");
      const ampm = hours >= 12 ? "PM" : "AM";
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes} ${ampm}`;
    };
    return `${convertTime(start)} - ${convertTime(end)}`;
  };

  const availableDates = [
    ...new Set(
      availableSlots.map((slot) =>
        format(parseISO(slot.startTime), "yyyy-MM-dd")
      )
    ),
  ];

  const slotsForSelectedDate = availableSlots.filter(
    (slot) =>
      format(parseISO(slot.startTime), "yyyy-MM-dd") ===
      format(selectedDate, "yyyy-MM-dd")
  );

  const handlePrevDate = () => {
    const currentIndex = availableDates.indexOf(
      format(selectedDate, "yyyy-MM-dd")
    );
    if (currentIndex > 0) {
      setSelectedDate(parseISO(availableDates[currentIndex - 1]));
    }
  };

  const handleNextDate = () => {
    const currentIndex = availableDates.indexOf(
      format(selectedDate, "yyyy-MM-dd")
    );
    if (currentIndex < availableDates.length - 1) {
      setSelectedDate(parseISO(availableDates[currentIndex + 1]));
    }
  };

  if (loading)
    return <div className="text-center py-8">Loading available slots...</div>;
  if (error)
    return <div className="text-red-500 text-center py-8">{error}</div>;

  if (availableDates.length === 0)
    return (
      <div className="text-center py-8">No available slots at the moment.</div>
    );

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Calendar className="mr-2" /> Select Measurement Slot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Button
            onClick={handlePrevDate}
            disabled={format(selectedDate, "yyyy-MM-dd") === availableDates[0]}
            variant="outline"
            size="icon"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {format(selectedDate, "MMMM d, yyyy")}
          </h3>
          <Button
            onClick={handleNextDate}
            disabled={
              format(selectedDate, "yyyy-MM-dd") ===
              availableDates[availableDates.length - 1]
            }
            variant="outline"
            size="icon"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {slotsForSelectedDate.map((slot, index) => (
            <Button
              key={index}
              onClick={() => handleSlotSelect(slot)}
              variant={selectedSlot === slot ? "secondary" : "outline"}
              className={`text-left p-4 h-auto ${
                selectedSlot === slot ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4" />
                {convertTo12HourFormat(slot.timeRange)}
              </div>
            </Button>
          ))}
        </div>
        {selectedSlot && (
          <div className="mt-6 p-4 bg-secondary rounded-lg">
            <h4 className="font-semibold mb-2">Selected Slot:</h4>
            <p>{format(parseISO(selectedSlot.startTime), "MMMM d, yyyy")}</p>
            <p>{convertTo12HourFormat(selectedSlot.timeRange)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

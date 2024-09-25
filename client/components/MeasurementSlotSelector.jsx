import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import api from "@/utils/api";
import { Calendar, Clock } from "lucide-react";

const MeasurementSlotSelector = ({ onSlotSelect }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
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

  if (loading)
    return <div className="text-center py-8">Loading available slots...</div>;
  if (error)
    return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Calendar className="mr-2" /> Select Measurement Slot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {availableSlots.map((slot, index) => (
            <Button
              key={index}
              onClick={() => handleSlotSelect(slot)}
              variant={selectedSlot === slot ? "secondary" : "outline"}
              className={`text-left p-4 h-auto ${
                selectedSlot === slot ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="flex flex-col space-y-2">
                <div className="flex items-center text-sm font-semibold">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(new Date(slot.startTime), "MMM d, yyyy")}
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4" />
                  {convertTo12HourFormat(slot.timeRange)}
                </div>
              </div>
            </Button>
          ))}
        </div>
        {selectedSlot && (
          <div className="mt-6 p-4 bg-secondary rounded-lg">
            <h4 className="font-semibold mb-2">Selected Slot:</h4>
            <p>{format(new Date(selectedSlot.startTime), "MMMM d, yyyy")}</p>
            <p>{convertTo12HourFormat(selectedSlot.timeRange)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MeasurementSlotSelector;

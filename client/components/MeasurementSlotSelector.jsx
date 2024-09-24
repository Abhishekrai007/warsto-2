import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  addDays,
  setHours,
  setMinutes,
  isSunday,
  isAfter,
  startOfDay,
  format,
} from "date-fns";

import "react-datepicker/dist/react-datepicker.css";

const MeasurementSlotSelector = ({ onSlotSelect }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState("");

  const timeRanges = [
    { label: "Morning (10 AM - 1 PM)", value: "morning" },
    { label: "Afternoon (1 PM - 4 PM)", value: "afternoon" },
    { label: "Evening (4 PM - 7 PM)", value: "evening" },
  ];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTimeRange("");
  };

  const handleTimeRangeSelect = (range) => {
    setSelectedTimeRange(range);
  };

  const handleConfirmSlot = () => {
    if (selectedDate && selectedTimeRange) {
      onSlotSelect({
        date: format(selectedDate, "yyyy-MM-dd"),
        timeRange: selectedTimeRange,
      });
    }
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    const minDate = addDays(today, 1);
    return isSunday(date) || !isAfter(startOfDay(date), startOfDay(minDate));
  };

  const filterTime = (time) => {
    const selectedTime = new Date(time);
    return selectedTime.getHours() >= 10 && selectedTime.getHours() < 19;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Measurement Slot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Select Date</Label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateSelect}
            filterDate={(date) => !isDateDisabled(date)}
            filterTime={filterTime}
            minDate={addDays(new Date(), 1)}
            dateFormat="MMMM d, yyyy"
            className="w-full p-2 border rounded-md"
          />
        </div>
        {selectedDate && (
          <div>
            <Label>Select Time Range</Label>
            <Select onChange={handleTimeRangeSelect} value={selectedTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Button
          onClick={handleConfirmSlot}
          disabled={!selectedDate || !selectedTimeRange}
        >
          Confirm Slot
        </Button>
      </CardContent>
    </Card>
  );
};

export default MeasurementSlotSelector;

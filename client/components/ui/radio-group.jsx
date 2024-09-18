import React from "react";

const RadioGroupContext = React.createContext();

export function RadioGroup({ value, onValueChange, children }) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className="space-y-2">{children}</div>
    </RadioGroupContext.Provider>
  );
}

export function RadioGroupItem({ value, id }) {
  const { value: groupValue, onValueChange } =
    React.useContext(RadioGroupContext);

  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={value === groupValue}
      onChange={() => onValueChange(value)}
      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
    />
  );
}

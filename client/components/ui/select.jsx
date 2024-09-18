import { ChevronDown } from "lucide-react";
import React, { useCallback, useState } from "react";

const Select = ({ children, onChange, value }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = useCallback(
    (newValue) => {
      onChange(newValue);
      setIsOpen(false);
    },
    [onChange]
  );

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
            value,
          });
        }
        if (child.type === SelectContent) {
          return (
            isOpen &&
            React.cloneElement(child, { onChange: handleChange, setIsOpen })
          );
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = ({ onClick, value, children }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
  >
    {value || children}
    <ChevronDown className="w-4 h-4 ml-2" />
  </button>
);

const SelectContent = ({ children, onChange, setIsOpen }) => (
  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
    <ul className="py-1 overflow-auto text-base rounded-md max-h-60 focus:outline-none sm:text-sm">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { onChange, setIsOpen })
      )}
    </ul>
  </div>
);

const SelectItem = ({ children, value, onChange, setIsOpen }) => (
  <li
    className="relative py-2 pl-3 pr-9 text-gray-900 cursor-default select-none hover:bg-gray-100 transition duration-150 ease-in-out"
    onClick={() => {
      onChange(value);
      setIsOpen(false);
    }}
  >
    {children}
  </li>
);

const SelectValue = ({ children }) => children;

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };

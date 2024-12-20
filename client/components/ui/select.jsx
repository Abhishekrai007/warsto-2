import { ChevronDown } from "lucide-react";
import React, { useCallback, useState, useRef, useEffect } from "react";

const Select = ({ children, onChange, value, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const handleChange = useCallback(
    (newValue, e) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      onChange(newValue);
      setIsOpen(false);
    },
    [onChange]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
        if (onOpenChange) {
          onOpenChange(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, onOpenChange]);

  const toggleOpen = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      setIsOpen(!isOpen);
      if (onOpenChange) {
        onOpenChange(!isOpen);
      }
    },
    [isOpen, onOpenChange]
  );

  return (
    <div className="relative" ref={ref}>
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: toggleOpen,
            value,
          });
        }
        if (child.type === SelectContent) {
          return isOpen
            ? React.cloneElement(child, { onChange: handleChange })
            : null;
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

const SelectContent = ({ children, onChange }) => (
  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
    <ul className="py-1 overflow-auto text-base rounded-md max-h-60 focus:outline-none sm:text-sm">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { onChange })
      )}
    </ul>
  </div>
);

const SelectItem = ({ children, value, onChange }) => (
  <li
    className="relative py-2 pl-3 pr-9 text-gray-900 cursor-default select-none hover:bg-gray-100 transition duration-150 ease-in-out"
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
      onChange(value, e);
    }}
  >
    {children}
  </li>
);

const SelectValue = ({ children }) => children;

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };

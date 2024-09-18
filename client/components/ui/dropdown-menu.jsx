import React, { createContext, useState, useContext } from "react";

const DropdownContext = createContext();

export function DropdownMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative">{children}</div>
    </DropdownContext.Provider>
  );
}

// Then in child components:
export function DropdownMenuTrigger({ children }) {
  const { isOpen, setIsOpen } = useContext(DropdownContext);
  return <div onClick={() => setIsOpen(!isOpen)}>{children}</div>;
}

export function DropdownMenuContent({ children }) {
  const { isOpen } = useContext(DropdownContext);
  if (!isOpen) return null;
  return <div>{children}</div>;
}

export function DropdownMenuLabel({ children }) {
  return <div className="px-4 py-2 text-sm text-gray-700">{children}</div>;
}

export function DropdownMenuSeparator() {
  return <hr className="border-gray-200" />;
}

export function DropdownMenuItem({ children }) {
  return (
    <a
      href="#"
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      {children}
    </a>
  );
}

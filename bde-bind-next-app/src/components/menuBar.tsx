import React, { useState } from "react";

const CollapsibleMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button onClick={toggleMenu} className="menu-toggle">
        {isOpen ? "Close Menu" : "Open Menu"}
      </button>
      {isOpen && (
        <ul className="menu">
          <li>Home</li>
          <li>About</li>
          <li>Services</li>
          <li>Contact</li>
        </ul>
      )}
    </div>
  );
};

export default CollapsibleMenu;

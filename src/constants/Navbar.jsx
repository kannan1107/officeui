import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// logo  import
import logo from "../assets/logo.jpg";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const optionsRef = useRef(null);
  const navigate = useNavigate();

  const email = localStorage.getItem("email") || "user@example.com";
  const name = email.split("@")[0];
  const avatar = `https://ui-avatars.com/api/?name=${name}&background=3b82f6&color=fff`;

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpen(false);
      if (optionsRef.current && !optionsRef.current.contains(e.target))
        setOptionsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="bg-white fixed w-full z-20 top-0 start-0 border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto px-4 py-3">
        <a href="/" className="text-xl font-bold text-blue-700">
          {/* logo image */}
          <img src={logo} alt="Logo" className="h-8 w-auto inline-block mr-2" />
          kannan Aviation
        </a>

        <ul className="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
          <li>
            <a href="/" className="hover:text-blue-600">
              Home
            </a>
          </li>
          <li>
            <a href="/about" className="hover:text-blue-600">
              About
            </a>
          </li>
          <li>
            <a href="/services" className="hover:text-blue-600">
              Services
            </a>
          </li>
          <li>
            <a href="/contact" className="hover:text-blue-600">
              Contact
            </a>
          </li>
        </ul>

        {/* Options dropdown */}
        <div className="relative" ref={optionsRef}>
          <button
            onClick={() => setOptionsOpen((prev) => !prev)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {optionsOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black/5 z-50">
              <div className="py-1 text-sm text-gray-700">
                <a href="/stores" className="block px-4 py-2 hover:bg-gray-100">
                  Stores
                </a>
                <a
                  href="/new-items"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  New Items
                </a>
                <a
                  href="/itemList"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Spars
                </a>
                <a
                  href="/item-inout"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Item In / Out
                </a>
                <a
                  href="/leave-list"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Leave List
                </a>
                <a href="/leave" className="block px-4 py-2 hover:bg-gray-100">
                  Leave Approvel
                </a>
                <a href="/user" className="block px-4 py-2 hover:bg-gray-100">
                  Add User
                </a>
                <Link
                  to="/all-users"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  All User
                </Link>
                <a
                  href="/employee"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Add Employee
                </a>
                <a
                  href="/employee-list"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Employee List
                </a>
                <a
                  href="/salary-slip"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Salary Slip
                </a>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Icon — top right */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-500 focus:outline-none"
          >
            <img
              src={avatar}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
              {/* User Details */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
                <img
                  src={avatar}
                  alt="profile"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800 capitalize">
                    {name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{email}</p>
                </div>
              </div>

              <ul className="py-2 text-sm text-gray-700">
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
                  >
                    🏠 Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
                  >
                    ⚙️ Settings
                  </a>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-red-500 hover:bg-red-50"
                  >
                    🚪 Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

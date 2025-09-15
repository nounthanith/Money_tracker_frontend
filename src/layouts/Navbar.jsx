import { useState } from "react";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Income", path: "/income" },
  { name: "Expense", path: "/expense" }, // Make sure to add this route in App.jsx
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path ? "text-rose-600" : "text-gray-700 hover:text-rose-600";
  };

  return (
    <div className="bg-gray-50">
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-rose-600 tracking-tight">
              Expenex
            </h1>

            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`font-medium transition-colors ${isActive(item.path)}`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-600 hover:shadow-lg hover:shadow-red-600 hover:scale-110 hover:rotate-1 hidden md:block"
            >
              <FiLogOut className="" />
            </button>

            <button
              className="md:hidden text-gray-700"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block font-medium transition-colors ${isActive(item.path)}`}
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white p-2 rounded-full"
              >
                <FiLogOut className="" />
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 mt-16">
        <Outlet />
      </main>
    </div>
  );
}
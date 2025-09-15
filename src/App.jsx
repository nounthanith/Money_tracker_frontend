import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Navbar from "./layouts/Navbar";
import Income from "./pages/income/Income";
import Expense from "./pages/expense/Expense";
import CreateIncome from "./pages/income/CreateIncome";
import CreateExpense from "./pages/expense/CreateExpense";
import EditIncome from "./pages/income/EditIncome";
import EditExpense from "./pages/expense/EditExpense";
import NotFound from "./pages/NotFound";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <Navbar />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/income" element={<Income />} />
          <Route path="/create-income" element={<CreateIncome />} />
          <Route path="/edit-income/:id" element={<EditIncome />} />



          <Route path="/expense" element={<Expense />} />
          <Route path="/create-expense" element={<CreateExpense />} />
          <Route path="/edit-expense/:id" element={<EditExpense />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

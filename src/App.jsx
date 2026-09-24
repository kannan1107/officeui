import Login from "./components/Login.jsx";
import Home from "./pages/auth/Home.jsx";
import Chat from "./pages/auth/Chat.jsx";
import Navbar from "./constants/Navbar.jsx";
import Stores from "./pages/auth/Stores.jsx";
import Newitems from "./pages/auth/Newitems.jsx";
import ItemList from "./pages/auth/ItemList.jsx";
import ItemInOut from "./pages/auth/ItemInOut.jsx";
import ProfileSettings from "./pages/auth/ProfileSettings.jsx";
import LeaveList from "./pages/auth/LeaveList.jsx";
import AllUsers from "./pages/auth/AllUser.jsx";
import User from "./pages/auth/User.jsx";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Doto from "./pages/auth/Doto.jsx";
import ListTask from "./pages/auth/ListTask.jsx";
import { Employee } from "./pages/auth/Employee.jsx";
import AllEmployee from "./pages/Allemployee.jsx";
import SalarySlip from "./pages/salarySlip.jsx";
import AllUser from "./pages/auth/AllUser.jsx";
import Approvel from "./pages/auth/Approvel.jsx";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function Layout() {
  const { pathname } = useLocation();
  return (
    <>
      {pathname !== "/login" && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doto"
          element={
            <ProtectedRoute>
              <Doto />
              Create Task
            </ProtectedRoute>
          }
        />
        <Route
          path="/listtask"
          element={
            <ProtectedRoute>
              <ListTask />
              List Tasks
            </ProtectedRoute>
          }
        />
        <Route
          path="/salary-slip"
          element={
            <ProtectedRoute>
              <SalarySlip />
              Salary Details
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <div>About Page</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stores"
          element={
            <ProtectedRoute>
              <Stores />
              Stores
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-list"
          element={
            <ProtectedRoute>
              <AllEmployee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee"
          element={
            <ProtectedRoute>
              <Employee />
              Add Employee
            </ProtectedRoute>
          }
        />

        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <div>Contact Page</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <div>Services Page</div>
            </ProtectedRoute>
          }
        />
        {/* user registration */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <User />
              Add User
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-users"
          element={
            <ProtectedRoute>
              <AllUser />
              All Users
            </ProtectedRoute>
          }
        />
        {/* user registration */}
        <Route
          path="/itemList"
          element={
            <ProtectedRoute>
              <ItemList />
              Stores
            </ProtectedRoute>
          }
        />

        <Route
          path="/new-items"
          element={
            <ProtectedRoute>
              <Newitems />
              Add New Items
            </ProtectedRoute>
          }
        />
        <Route
          path="/item-inout"
          element={
            <ProtectedRoute>
              <ItemInOut />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-list"
          element={
            <ProtectedRoute>
              <LeaveList />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route
          path="/leave"
          element={
            <ProtectedRoute>
              <Approvel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;

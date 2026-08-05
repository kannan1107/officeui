import Login from "./components/Login.jsx";
import Home from "./pages/auth/Home.jsx";
import Chat from "./pages/auth/Chat.jsx";
import Navbar from "./constants/Navbar.jsx";
import Stores from "./pages/auth/Stores.jsx";
import Newitems from "./pages/auth/Newitems.jsx";
import ItemList from "./pages/auth/ItemList.jsx";
import AllUsers from "./pages/auth/AllUser.jsx";

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
        <Route path="*" element={<Navigate to="/" replace />} />
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

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PostDetails from "./pages/PostDetails";
import ProtectedRoute from "./components/ProtectedRoutes"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/posts/:postId"
          element={
            <ProtectedRoute>
              <PostDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <h2 className="text-xl font-bold">Page not found</h2>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

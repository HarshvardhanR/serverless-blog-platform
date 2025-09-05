import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"; // combined Login + Signup page

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route shows Home page */}
        <Route path="/" element={<Home />} />

        {/* Catch-all for unmatched paths */}
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

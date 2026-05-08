import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import Typing from "./pages/Typing";
import Models from "./pages/Models";
import ModelDetail from "./pages/ModelDetail";
import MechGame from "./pages/MechGame";
import Leaderboard from "./pages/Leaderboard";
import { ToastProvider } from "./components/Toaster";
import "./App.css";

function App() {
  return (
    <ToastProvider>
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Typing />} />
            <Route path="/typing" element={<Navigate to="/" replace />} />
            <Route path="/models" element={<Models />} />
            <Route path="/model/detail" element={<ModelDetail />} />
            <Route path="/mech-game" element={<MechGame />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>
      </div>
    </Router>
    </ToastProvider>
  );
}

export default App;

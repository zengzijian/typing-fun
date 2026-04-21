import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import Typing from "./pages/Typing";
import Models from "./pages/Models";
import ModelDetail from "./pages/ModelDetail";
import MechGame from "./pages/MechGame";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/typing" replace />} />
            <Route path="/typing" element={<Typing />} />
            <Route path="/models" element={<Models />} />
            <Route path="/model/detail" element={<ModelDetail />} />
            <Route path="/mech-game" element={<MechGame />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

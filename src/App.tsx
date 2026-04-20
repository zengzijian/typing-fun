import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import About from "./pages/About";
import Typing from "./pages/Typing";
import Models from "./pages/Models";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/home" element={<Home />} />
            <Route path="/models" element={<Models />} />
            <Route path="/about" element={<About />} />
            <Route path="/typing" element={<Typing />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

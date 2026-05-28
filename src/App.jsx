import React from "react";
import { HashRouter, Routes, Route, NavLink } from "react-router-dom";
import Timer from "./pages/Timer";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <HashRouter>
      <div className="app">
        <header className="topbar">
          <div className="brand">
            <span className="dot" />
            Focus
          </div>
          <nav className="nav">
            <NavLink to="/" end>
              타이머
            </NavLink>
            <NavLink to="/history">기록</NavLink>
            <NavLink to="/dashboard">대시보드</NavLink>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Timer />} />
            <Route path="/history" element={<History />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

import React, { useState } from "react";
import RepairSection from "./components/RepairSection";
import SalesSection from "./components/SalesSection";
import { Wrench, ShoppingBag } from "lucide-react";

export default function App() {
  const [section, setSection] = useState("repair");

  return (
    <div className="shell">
      <header className="header">
        <div className="brand">
          <div className="brand-mark">
            <Wrench size={18} />
          </div>
          <div>
            <h1>MobiDesk</h1>
            <small>mobile shop management</small>
          </div>
        </div>
      </header>

      <nav className="main-nav">
        <button
          className={`nav-btn ${section === "repair" ? "active" : ""}`}
          onClick={() => setSection("repair")}
        >
          <Wrench size={16} />
          Repair
        </button>
        <button
          className={`nav-btn ${section === "sales" ? "active" : ""}`}
          onClick={() => setSection("sales")}
        >
          <ShoppingBag size={16} />
          Sales
        </button>
      </nav>

      {section === "repair" ? <RepairSection /> : <SalesSection />}
    </div>
  );
}

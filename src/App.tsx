import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoginComponent } from "./pages/Login";
import { RegisterComponent } from "./pages/Register";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta raíz redirige al login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Rutas principales */}
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/register" element={<RegisterComponent />} />
        
        {/* Página por defecto si no coincide ninguna ruta */}
        <Route path="*" element={<h2 className="text-center text-white mt-10">404 - Página no encontrada</h2>} />
      </Routes>
    </Router>
  );
}

export default App;

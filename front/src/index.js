import React, { useContext } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Compte from "./pages/Compte";
import Layout from "./pages/Layout";
import Inscription from "./pages/inscription";
import Connection from "./pages/connection";
import Photos from "./pages/Photos";
import "./index.css";
import { authContext, AuthProvider } from "./Context/authContext";
import Image from "./pages/Image";
function App() {
  const { auth } = useContext(authContext);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/compte" element={ auth ? <Compte /> : <Navigate to="/connection" />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/connection" element={<Connection />} />
          <Route
            path="/photos"
            element={auth ? <Photos /> : <Navigate to="/connection" />}
          />
          <Route path="/image/:image" element={<Image />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<AppWrapper />);

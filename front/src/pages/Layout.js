import { useContext } from "react";
import { Outlet, Link } from "react-router-dom";
import { authContext } from "../Context/authContext";
import './style/Layout.css'

const Layout = () => {
  const { auth, setAuth } = useContext(authContext);
  return (
    <>
      <nav>
        <ul className="menu">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/compte">Compte</Link>
          </li>
          <li>
            <Link to="/connection">Connection</Link>
          </li>
          <li>
            <Link to="/inscription">Inscription</Link>
          </li>
          {auth && (
            <li>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  setAuth(null);
                }}
              >
                Déconnection
              </button>
            </li>
          )}
        </ul>
      </nav>

      <Outlet />
    </>
  );
};

export default Layout;

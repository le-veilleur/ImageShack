import React, { useEffect, useState, useContext } from "react";
import { authContext } from "../Context/authContext";
import { useNavigate } from "react-router-dom";
import Photos from "./Photos";
import "./style/compte.css"
import ImageCompte from "../Component/ImageCompte"

const DeleteAccount = ({ userId }) => {
  const { auth, setAuth } = useContext(authContext);
  const [isDeleting, setIsDeleting] = useState(false);
  const Navigate = useNavigate();

  const handleDelete = () => {
    setIsDeleting(true);
    const token = localStorage.getItem('token');

    // Effectuer la requête de suppression sans axios
    fetch('http://127.0.0.1:3002/account', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(data => {
      const response = data.json()
      
      setIsDeleting(false);
      
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      setAuth(null);
      Navigate("/inscription");
      
    })
    .catch(error => {
      console.error(error);
      setIsDeleting(false);
    });
  };

  return (<>
    <Photos/>
    
    <div className="DeleteAccount">
      {isDeleting ? (
        <p>Deleting account...</p>
      ) : (
        <>
          <p>Are you sure you want to delete your account?</p>
          <button onClick={handleDelete}>Supprimer le compte</button>
        </>
      )}

      {auth && (
        <li>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              setAuth(null);
            }}
          >
            Déconnexion
          </button>
        </li>
      )}
    </div>
    
    <ImageCompte/>
    </>
  );
};

export default DeleteAccount;

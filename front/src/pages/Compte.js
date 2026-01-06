import React, { useState, useContext } from "react";
import { authContext } from "../Context/authContext";
import { useNavigate } from "react-router-dom";
import Photos from "./Photos";
import "./style/compte.css"
import ImageCompte from "../Component/ImageCompte"

const DeleteAccount = ({ userId }) => {
  const { setAuth } = useContext(authContext);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const Navigate = useNavigate();

  const handleDelete = () => {
    setIsDeleting(true);
    const token = localStorage.getItem('token');

    // Effectuer la requête de suppression sans axios
    fetch('http://127.0.0.1:8473/account', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(data => {
      data.json();
      
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuth(null);
    Navigate("/");
  };

  return (
    <div className="compte-container">
      <div className="compte-header">
        <h1>Mon Compte</h1>
        <p className="compte-subtitle">Gérez vos images et vos paramètres</p>
      </div>

      <div className="compte-content">
        {/* Section Upload */}
        <section className="compte-section">
          <div className="section-header">
            <h2>📤 Upload d'images</h2>
            <p>Téléchargez de nouvelles images sur votre compte</p>
          </div>
          <div className="section-content">
            <Photos />
          </div>
        </section>

        {/* Section Mes Images */}
        <section className="compte-section">
          <div className="section-header">
            <h2>🖼️ Mes Images</h2>
            <p>Gérez toutes vos images uploadées</p>
          </div>
          <div className="section-content">
            <ImageCompte />
          </div>
        </section>

        {/* Section Paramètres */}
        <section className="compte-section compte-settings">
          <div className="section-header">
            <h2>⚙️ Paramètres du compte</h2>
            <p>Gérez vos préférences et votre compte</p>
          </div>
          <div className="section-content settings-content">
            <div className="settings-card">
              <h3>Déconnexion</h3>
              <p>Déconnectez-vous de votre compte</p>
              <button 
                className="btn-logout"
                onClick={handleLogout}
              >
                Se déconnecter
              </button>
            </div>

            <div className="settings-card settings-card-danger">
              <h3>Zone de danger</h3>
              <p>La suppression de votre compte est définitive et irréversible</p>
              {!showDeleteConfirm ? (
                <button 
                  className="btn-delete"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Supprimer mon compte
                </button>
              ) : (
                <div className="delete-confirm">
                  {isDeleting ? (
                    <div className="deleting-message">
                      <div className="spinner"></div>
                      <p>Suppression en cours...</p>
                    </div>
                  ) : (
                    <>
                      <p className="confirm-text">Êtes-vous sûr de vouloir supprimer votre compte ?</p>
                      <p className="confirm-warning">Cette action est irréversible !</p>
                      <div className="confirm-buttons">
                        <button 
                          className="btn-delete-confirm"
                          onClick={handleDelete}
                        >
                          Oui, supprimer
                        </button>
                        <button 
                          className="btn-cancel"
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          Annuler
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DeleteAccount;

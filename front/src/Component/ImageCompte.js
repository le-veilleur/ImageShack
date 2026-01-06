import React, { useEffect, useState } from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Button from "@mui/material/Button";
import "../pages/style/Gallery.css";
import { useNavigate } from "react-router-dom";

export default function ImageCompte() {
  const [ImageData, setImageData] = useState([]);
  const token = localStorage.getItem("token");
  const Navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8473/imagesUser", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur lors de la requête");
        }
        return response.json();
      })
      .then(data => {
        console.log("la liste des fichiers", data);
        data.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });

        const updatedData = data.map(image => ({
          ...image,
          private: !image.isPublic
        }));
        setImageData(updatedData);
      })
      .catch(error => {
        console.error("Erreur:", error);
      });
  }, [token]);

  const toggleImagePrivacy = id => {
    const imageToUpdate = ImageData.find(image => image.id === id);
    const isPrivate = imageToUpdate.private;

    const updatedImage = {
      ...imageToUpdate,
      private: !isPrivate
    };

    fetch("http://127.0.0.1:8473/images/" + id, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ private: !isPrivate })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur lors de la requête");
        }
        return response.json();
      })
      .then(data => {
        const updatedImageData = ImageData.map(
          image => (image.id === id ? updatedImage : image)
        );
        setImageData(updatedImageData);
      })
      .catch(error => {
        console.error("Erreur:", error);
      });
  };

  const deleteImage = id => {
    fetch("http://127.0.0.1:8473/deleteImage/" + id, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(() => {
        setImageData(prevData => prevData.filter(image => image.id !== id));
      })
      .catch(error => {
        console.error("Erreur:", error);
      });
  };

  return (
    <div className="image-compte-container">
      <ImageList className="ImageList ImageList-compte" sx={{ width: "100%", height: "auto" }} cols={1}>
        {ImageData && ImageData.map((image, index) => {
          
          let monthactive; 
        let previousdate;
        let previousmonth;
        const imagedate = new Date(image.date)
        const imagemonth = imagedate.toLocaleString("default", {month: 'long'})
        if(ImageData[index - 1]){
          previousdate = new Date(ImageData[index - 1].date)
          previousmonth = previousdate.toLocaleString("default", {month: 'long'})
        }
        if(previousdate && imagedate && previousmonth === imagemonth){
          monthactive = false
        } else {
          
          monthactive = true
        }
          return (
            <div key={image.id} className={`image-item-wrapper ${monthactive ? 'with-month-header' : ''}`}>
              {monthactive && (
                <h2 className="month-header">{new Date(image.date).toLocaleString("default", {
                  month: "long",
                })}</h2>
              )}
              <ImageListItem onClick={() => Navigate(`/image/${image.url}`, { state: image })}>
                {/* Affiche un indicateur "Privé" si l'image est privée */}
                {image.private ? (
                  <span className="private-indicator">Privée</span>
                ) : 
                <span className="private-indicator public-indicator">Public</span>}
                <p className="image-date">
                  {new Date(image.date).toLocaleString("default", {
                    day: "numeric",
                    month: "long",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </p>
                <img
                  className="imagehome"
                  src={"http://127.0.0.1:8473/" + image.name}
                  alt={"http://127.0.0.1:8473/" + image.url}
                />
              </ImageListItem>
              {/* Affiche un bouton pour changer la confidentialité de l'image */}
              <div className="image-actions">
                <Button
                  variant="contained"
                  onClick={() => toggleImagePrivacy(image.id)}
                  className="privacy-button"
                >
                  Changer la confidentialité
                </Button>
                <button
                  onClick={() => deleteImage(image.id)}
                  className="delete-image-buttonCompte"
                >
                  Supprimer une image
                </button>
              </div>
            </div>
        )})}
      </ImageList>
    </div>
  );
}

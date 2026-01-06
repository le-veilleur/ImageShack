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
    fetch("http://127.0.0.1:3002/imagesUser", {
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
  }, []);

  const toggleImagePrivacy = id => {
    const imageToUpdate = ImageData.find(image => image.id === id);
    const isPrivate = imageToUpdate.private;

    const updatedImage = {
      ...imageToUpdate,
      private: !isPrivate
    };

    fetch("http://127.0.0.1:3002/images/" + id, {
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
    fetch("http://127.0.0.1:3002/deleteImage/" + id, {
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
    <div>
      <ImageList className="ImageList" sx={{ width: "450px", height: "auto" }} cols={1}>
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
        if(previousdate && imagedate && previousmonth == imagemonth){
          monthactive = false
        } else {
          
          monthactive = true
        }
          return (
            <div>
          <ImageListItem key={index} onClick={() => Navigate(`/image/${image.url}`, { state: image })}>
            {monthactive && (
              <h2>{new Date(image.date).toLocaleString("default", {
                month: "long",
              })}</h2>
            )}
            {/* Affiche un indicateur "Privé" si l'image est privée */}
            {image.private ? (
              <span className="private-indicator">Privée</span>
            ) : 
            <span className="private-indicator">Public</span>}
            <p>
                        
                        {new Date(image.date).toLocaleString("default", {
                          day: "numeric",
                          month: "long",
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </p>
            <img
              className="imagehome"
              src={"http://127.0.0.1:3002/" + image.name}
              alt={"http://127.0.0.1:3002/" + image.url}
            />
 
          </ImageListItem>
           {/* Affiche un bouton pour changer la confidentialité de l'image */}
          <Button
              variant="contained"
              onClick={() => toggleImagePrivacy(image.id)}
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
        )})}
      </ImageList>
    </div>
  );
}

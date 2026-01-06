import React, { useEffect, useState } from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import "../pages/style/Gallery.css";
import { useNavigate } from "react-router-dom";

export default function Gallery() {
  const [ImageData, setImageData] = useState([]);
  const token = localStorage.getItem("token");
  const Navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8473/images", {
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
        setImageData(data);
      })
      .catch(error => {
        console.error("Erreur:", error);
      });
  }, [token]);

  return (
    
    <div>
      <ImageList className="ImageList" sx={{ width: "auto", height: "auto" }} cols={3}>

        {ImageData.map((image, index) => (

          
          <ImageListItem key={index} onClick={() => Navigate(`/image/${image.url}`, { state: image })}>
            {/* Affiche un indicateur "Privé" si l'image est privée */}
            {image.private ? (
              <span className="private-indicator">Privé</span>
            ) : null}
            <img
              className="imagehome"
              src={"http://127.0.0.1:8473/" + image.name}
              alt={"http://127.0.0.1:8473/" + image.url}
            />
            {/* Affiche un bouton pour changer la confidentialité de l'image */}
           
          </ImageListItem>

        ))}
      </ImageList>
    </div>
  );
  
}
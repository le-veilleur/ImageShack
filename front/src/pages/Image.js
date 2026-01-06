import React, { useEffect, useState } from 'react'
import './style/Image.css';

function Image() {
    const [image, setImage] = useState(null)
    const path = window.location.pathname;
    const ImageSlug = path.split("/")[2];
    const token = localStorage.getItem("token")
    
    useEffect(() => {
      fetch(`http://127.0.0.1:8473/image/${ImageSlug}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Error: " + response.status);
        }
      })
      .then((data) => {
        setImage(data)
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    }, [ImageSlug, token])
    
     
    return ( <>
    <div className="image-container">
        {image && (
            <img className="image" src={"http://127.0.0.1:8473/" + image.name} alt={image.url || "Image"} />
        )}
    </div>
    
    </> );
}

export default Image;
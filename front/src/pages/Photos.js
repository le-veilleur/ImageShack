import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import "../pages/style/photo.css";

const Photos = () => {
  const [files, setFiles] = useState([]);
  const [slug, setSlug] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false)
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => {
      setFiles(
        acceptedFiles.map(file =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
      );
      console.log(acceptedFiles);
    }
  });

  const thumbs = files.map(file =>
    <div key={file.name}>
      <div>
        <img src={file.preview} alt="Preview" />
      </div>
    </div>
  );

  // Nettoyer les URLs d'objets lors du démontage
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const handleFile = e => {
    // Handler pour le changement de fichier
  };
  
  const uploadFiles = () => {
    const formData = new FormData();
    console.log(files[0]);
    formData.append("image", files[0]);
    const token = localStorage.getItem("token");
    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    };
    
    fetch("http://127.0.0.1:8473/images", requestOptions)
      .then(response => {
        if (response.ok) {
          console.log("Image uploaded successfully");
          setIsUploaded(true)
        } else {
          throw new Error("Failed to upload image");
        }
      })
      .catch(error => {
        console.error(error);
      });
  };
  useEffect(() => {
    if(isUploaded){
      const token = localStorage.getItem("token");
      fetch("http://127.0.0.1:8473/images", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      if (!response.ok) {
        throw new Error("Erreur lors de la requête");
      }
      return response.json();
    })
    .then(data => {
      console.log('la liste des fichier', data)
      data.sort((a,b) => {
        return new Date(b.date) - new Date(a.date);
      })
      setSlug(data[0].url)
    })
    .catch(error => {
      console.error("Erreur:", error);
    });
    }

  }, [isUploaded])
  return (
    <div className="Photo">
      {!isUploaded && (<>
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps({ onChange: handleFile })} name="image" />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <aside>
        {thumbs}
      </aside>

      <button className="upload-btn" onClick={() => uploadFiles()}>
        Upload Images
      </button>
      </>)}
      {isUploaded && (<>
      <p>Upload successfully</p>
      {slug && (<p>your image is available at /image/{slug}</p>)}
      
        <button className="upload-btn" onClick={() => {setIsUploaded(false); setSlug(null)}}>
        Upload another image
      </button>
      </>)}
    </div>
  );
}

export default Photos;

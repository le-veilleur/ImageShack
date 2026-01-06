export const uploadImage = formData => {
  // Envoyer une requête POST à l'API backend avec les données du fichier
  fetch("http://127.0.0.1:8473/images", {
    method: "POST",
    body: formData // Inclure l'objet FormData dans le corps de la requête
  })
    .then(response => {
      console.log(response); // Afficher la réponse de l'API dans la console
    })
    .catch(error => {
      console.error(error); // Afficher une erreur si la requête échoue
    });
};

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./style/inscription.css"

const Inscription = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const Navigate = useNavigate();

  const schema = Yup.object().shape({
    email: Yup.string().email("email non valide").required("L'email est requis"),
    password: Yup.string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères")
      .required("Le mot de passe est requis"),
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmitHandler = async (values) => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: values.email, 
          password: values.password 
        }),
      };

      const response = await fetch("http://127.0.0.1:3002/account", requestOptions);
      
      let result;
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const textResponse = await response.text();
        result = { error: textResponse || "Erreur inconnue" };
      }
      
      if (response.ok) {
        setSuccessMessage(result.message || "Compte créé avec succès ! Redirection...");
        reset();
        setTimeout(() => {
          Navigate("/connection");
        }, 2000);
      } else {
        if (response.status === 403) {
          setErrorMessage(result.error || "Ce compte existe déjà. Veuillez vous connecter.");
        } else if (response.status === 400) {
          setErrorMessage(result.error || "Données invalides");
        } else {
          setErrorMessage(result.error || "Une erreur est survenue lors de la création du compte");
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        setErrorMessage("Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur le port 3002.");
      } else {
        setErrorMessage("Erreur de connexion au serveur. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="Inscription">
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <h2>Lets sign you up.</h2>
        <br />

        {errorMessage && (
          <div className="error-message" style={{ color: '#f5576c', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(245, 87, 108, 0.1)', borderRadius: '8px' }}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="success-message" style={{ color: '#4caf50', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px' }}>
            {successMessage}
          </div>
        )}

        <input
          {...register("email")}
          placeholder="email"
          type="email"
          required
        />
        {errors.email && (
          <span style={{ color: '#f5576c', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
            {errors.email.message}
          </span>
        )}
        <br />

        <input
          {...register("password")}
          placeholder="password"
          type="password"
          required
        />
        {errors.password && (
          <span style={{ color: '#f5576c', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
            {errors.password.message}
          </span>
        )}
        <br />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Création en cours..." : "Sign up"}
        </button>
      </form>
    </div>
  );
};

export default Inscription;

import { yupResolver } from "@hookform/resolvers/yup";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import "./style/connection.css"

import { authContext } from "../Context/authContext";

const Connection = () => {
  const Navigate = useNavigate();

  const { auth, setAuth } = useContext(authContext);
  const schema = Yup.object().shape({
    email: Yup.string().email("email non valide").required(),
    password: Yup.string().required(),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });
  const onSubmitHandler = (data) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, password: data.password }),
    };
    fetch("http://127.0.0.1:3002/login", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        localStorage.setItem("token", data.token);
        setAuth(data.token);
        Navigate("/");
      })
      .catch((e) => console.error("Erreur de connexion:", e));
    reset();
  };
  return (
    <div className="Connection">
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <h2>Lets sign you in.</h2>
        <br />

        <input
          {...register("email")}
          placeholder="email"
          type="email"
          required
        />
        <br />

        <input
          {...register("password")}
          placeholder="password"
          type="password"
          required
        />
        <br />

        <button type="submit">Sign in</button>
      </form>
    </div>
  );
};

export default Connection;

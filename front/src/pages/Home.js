import React from "react";
import HomeImage from "../Component/HomeImage";
import "./style/Home.css";

const Home = () => {
  return (
    <div className="Home">
      <div className="Home-hero">
        <h1 className="Home-title">Bienvenue sur ImageShack</h1>
        <p className="Home-subtitle">Partagez et découvrez de magnifiques images</p>
      </div>
      <HomeImage />
    </div>
  );
};

export default Home;

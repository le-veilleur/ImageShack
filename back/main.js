import express from "express";
import bodyParser from "body-parser";
import { genSalt, hash, compare } from "bcrypt";
import mongoose from "mongoose";
import { AccountDto } from "./models/accountDto.js";
import { connect, Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import { imageDto } from "./models/imageDto.js";
import { generateRandomString } from "./functions/url.js";
import { imgUpload } from "./functions/images.js";
import fs from "fs";
import cors from 'cors';
import { readFileSync } from 'fs';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: true, // Autorise toutes les origines en développement
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Requested-With"],
  })
);

// Definir le modele
const Account = model("Account", AccountDto);
const ImageUser = model("imageUser", imageDto);

// Connect to the MongoDB database
// Pour WSL : utiliser l'IP de l'hôte Windows ou localhost si MongoDB est dans WSL
// Option 1: MongoDB sur Windows - utiliser l'IP de l'hôte Windows
//   - Trouvez l'IP avec: cat /etc/resolv.conf | grep nameserver
//   - Ou utilisez: ip route show | grep default
// Option 2: MongoDB dans WSL - utiliser 127.0.0.1
// Option 3: MongoDB Atlas (cloud) - utiliser la chaîne de connexion complète

// Détection automatique de l'IP Windows depuis WSL
function getWindowsHostIP() {
  try {
    // Méthode 1: Via /etc/resolv.conf (généralement fiable)
    const resolv = readFileSync('/etc/resolv.conf', 'utf8');
    const match = resolv.match(/nameserver\s+(\S+)/);
    if (match && match[1]) {
      return match[1];
    }
  } catch (e) {
    // Ignorer les erreurs si le fichier n'existe pas
  }
  return null;
}

const WINDOWS_HOST_IP = getWindowsHostIP();
// Par défaut, utiliser l'IP de Windows si détectée, sinon 127.0.0.1
// Depuis WSL, 127.0.0.1 ne fonctionne pas pour accéder à MongoDB sur Windows
const MONGODB_HOST = process.env.MONGODB_HOST || WINDOWS_HOST_IP || "127.0.0.1";
const MONGODB_URI = process.env.MONGODB_URI || `mongodb://${MONGODB_HOST}:27017/account-projet4-express`;

console.log(`Tentative de connexion à MongoDB: ${MONGODB_URI}`);
if (WINDOWS_HOST_IP) {
  console.log(`IP de l'hôte Windows détectée: ${WINDOWS_HOST_IP}`);
  console.log(`MongoDB Compass utilise: mongodb://127.0.0.1:27017/account-projet4-express`);
  console.log(`Depuis WSL, nous utilisons: mongodb://${WINDOWS_HOST_IP}:27017/account-projet4-express`);
  console.log(`Si la connexion échoue, MongoDB sur Windows doit accepter les connexions depuis WSL`);
}

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000, // Timeout après 10 secondes
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("Connected to MongoDB database");
    console.log("MongoDB connection state:", mongoose.connection.readyState);
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB database:", error);
    console.error("Vérifiez que MongoDB est démarré:");
    console.error("   - sudo systemctl start mongod");
    console.error("   - ou: mongod --dbpath /path/to/data");
    process.exit(1); // Arrêter le serveur si MongoDB n'est pas disponible
  });

// Gérer les événements de connexion
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Create a new account
app.post("/account", async (request, response) => {
  try {
    // Vérifier la connexion MongoDB
    if (mongoose.connection.readyState !== 1) {
      console.error("MongoDB n'est pas connecté. État:", mongoose.connection.readyState);
      return response.status(503).json({ 
        error: "Service temporairement indisponible. Base de données non connectée." 
      });
    }

    const { email, password } = request.body;

    // Validation des données
    if (!email || !password) {
      return response.status(400).json({ 
        error: "L'email et le mot de passe sont requis" 
      });
    }

    if (password.length < 6) {
      return response.status(400).json({ 
        error: "Le mot de passe doit contenir au moins 6 caractères" 
      });
    }

    const existAccount = await Account.find({ email: email });

    if (existAccount.length > 0) {
      return response.status(403).json({ 
        error: "Compte déjà créé" 
      });
    } else {
      const salt = await genSalt(10);
      const hashedPassword = await hash(password, salt);

      const account = new Account({ email, password: hashedPassword });
      await account.save();

      return response.status(201).json({ 
        message: "Compte créé avec succès" 
      });
    }
  } catch (error) {
    console.error("Erreur lors de la création du compte:", error);
    console.error("Stack trace:", error.stack);
    return response.status(500).json({ 
      error: "Une erreur est survenue lors de la création du compte",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

//Connexion avec token
app.post("/login", async (request, reply) => {
  const { email, password } = request.body;
  try {
    // Vérification de l'email et du mot de passe

    const user = await Account.findOne({ email });

    if (!user) {
      throw new Error("Email ou mot de passe incorrect");
    }

    const validPassword = await compare(password, user.password);

    if (!validPassword) {
      throw new Error("Email ou mot de passe incorrect");
    }

    // Si les informations d'identification sont valides, créer le jeton JWT

    const token = jwt.sign(
      { userId: user._id },

      "16UQLq1HZ3CNwhvgrarV6pMoA2CDjb4tyF",

      {
        expiresIn: "1h",
      }
    );
    reply.status(200).send({ token });
  } catch (error) {
    console.log(error);
    reply.status(401).send("Identifiants invalides");
  }
});

//delete account
app.delete("/account", async (request, reply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(403).send("Authentification invalide");
  }

  const token = authHeader.slice(7);

  const decodedToken = jwt.verify(token, "16UQLq1HZ3CNwhvgrarV6pMoA2CDjb4tyF");

  const userId = decodedToken.userId;

  try {
    const userAccount = await Account.findById(userId);

    if (!userAccount) {
      return reply.status(404).send("Compte non trouvé");
    }

    await Account.findByIdAndDelete(userId);

    const imagesAccount = await ImageUser.find({ userId: userId });
    imagesAccount.forEach(async (element) => {
      fs.unlink(element.name, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Le fichier a été supprimé avec succès");
      });

      await ImageUser.findByIdAndDelete(element.id);
    });
    reply.status(200).send("Compte supprimé avec succès !");
  } catch (error) {
    console.log(error);

    reply.status(401).send("Authentification invalide");
  }
});

//send image
// url image http://localhost:3000/uploads/1683917463744-ff.JPG
app.post("/images", imgUpload, async (request, reply) => {
  const authHeader = request.headers.authorization;
  const token = authHeader.slice(7);
  const decodedToken = jwt.verify(token, "16UQLq1HZ3CNwhvgrarV6pMoA2CDjb4tyF");
  const userId = decodedToken.userId;
  const userAccount = await Account.findById(userId);
  if (!userAccount) {
    return reply.status(404).send("Compte non trouvé");
  }

  const name = `uploads/${request.file.filename}`;
  const date = Date();
  const isPublic = true;
  let url = generateRandomString();
  let isUrlExist = true;
  let urlExist = await ImageUser.find({ url: url });

  if (urlExist.length == 0) {
    isUrlExist = false;
  } else {
    while (isUrlExist) {
      url = generateRandomString();
      urlExist = await ImageUser.find({ url: url });
      if (urlExist.length == 0) {
        isUrlExist = false;
      }
    }
  }
  const newImage = new ImageUser({ date, name, isPublic, url, userId });
 const image =  await newImage.save();
  reply.status(201).send({
    date: image.date,
    isPublic: image.isPublic,
    name: image.name,
    url: image.url,
    userId: image.userId,
    id: image.id,
  });
});

// delete image
app.delete("/deleteImage/:imageId", async (request, reply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(403).send("Authentification invalide");
  }

  const token = authHeader.slice(7);

  const decodedToken = jwt.verify(token, "16UQLq1HZ3CNwhvgrarV6pMoA2CDjb4tyF");

  const userId = decodedToken.userId;

  try {
    const imageId = request.params.imageId;
    const searchimageUser = await ImageUser.findById(imageId);

    if (userId != searchimageUser.userId) {
      return reply.status(403).send("interdit de supprimer image");
    }
    fs.unlink(searchimageUser.name, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Le fichier a été supprimé avec succès");
    });
    const image = await ImageUser.findByIdAndDelete(imageId);

    if (!image) {
      return reply.status(404).send("Image non trouvée");
    }

    reply.status(200).send("Image supprimée avec succès !");
  } catch (error) {
    console.log(error);

    reply.status(401).send("Authentification invalide");
  }
});

// Get all no connecte soit isPublic true
app.get("/images", async (request, reply) => {
  try {
    const images = await ImageUser.find({ isPublic: true });
    const imageData = await Promise.all(
      images.map(async (image) => {
        return {
          id: image._id,
          name: image.name,
          date: image.date,
          isPublic: image.isPublic,
          url: image.url,
        };
      })
    );
    reply.send(imageData);
  } catch (error) {
    console.log(error);
    reply.status(500).send("Erreur serveur");
  }
});

// get all image for user
app.get("/imagesUser", async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(403).send({ response: "Authentification invalide" });
    }
    // Vérifier que l'utilisateur est connecté et que son token JWT correspond bien à l'utilisateur en question
    const token = authHeader.slice(7);

    const decodedToken = jwt.verify(
      token,
      "16UQLq1HZ3CNwhvgrarV6pMoA2CDjb4tyF"
    );

    const userId = decodedToken.userId;
    // Récupérer toutes les images, qu'elles soient publiques ou privées
    const images = await ImageUser.find({ userId: userId });

    // Construire le tableau de données à renvoyer
    const imageData = await Promise.all(
      images.map(async (image) => {
        return {
          id: image._id,
          name: image.name,
          date: image.date,
          isPublic: image.isPublic,
          url: image.url,
        };
      })
    );

    // Renvoyer les données
    reply.send(imageData);
  } catch (error) {
    console.log(error);
    reply.status(500).send({ response: "Erreur serveur" });
  }
});

// Update bool image
app.put("/images/:id", async (request, reply) => {
  try {
    // Récupérer l'identifiant de l'image à mettre à jour depuis les paramètres de l'URL
    const imageId = request.params.id;

    // Vérifier que l'utilisateur est connecté et que son token JWT correspond bien à l'utilisateur en question
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(403).send("Authentification invalide");
    }

    const token = authHeader.slice(7);

    const decodedToken = jwt.verify(
      token,
      "16UQLq1HZ3CNwhvgrarV6pMoA2CDjb4tyF"
    );

    const userId = decodedToken.userId;

    // Récupérer l'image correspondant à l'identifiant et vérifier que l'utilisateur est autorisé à la modifier
    const image = await ImageUser.findById(imageId);

    if (!image) {
      return reply.status(404).send("Image non trouvée");
    }

    if (image.userId !== userId) {
      return reply.status(403).send("Non autorisé à modifier cette image");
    }

    image.isPublic = !image.isPublic;

    await image.save();

    // Renvoyer la nouvelle version de l'image

    reply.send({
      id: image._id,
      name: image.name,
      date: image.date,
      isPublic: image.isPublic,
      url: image.url,
    });
  } catch (error) {
    console.log(error);
    reply.status(500).send("Erreur serveur");
  }
});

//Verify token
app.get("/verify-token", async (request, reply) => {
  try {
     // Vérifier que l'utilisateur est connecté et que son token JWT correspond bien à l'utilisateur en question
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(403).send({ response: "connexion refusée" });
    }

    const token = authHeader.slice(7);

    const decodedToken = jwt.verify(
      token,
      "16UQLq1HZ3CNwhvgrarV6pMoA2CDjb4tyF"
    );

    const userId = decodedToken.userId;
    if (!userId) {
      reply.status(403).send({ response: "connexion refusée" });
    } else {
      reply.status(200).send({ response: "connexion autorisée" });
    }
  }
  catch (e) {
     reply.status(403).send({ response: "connexion refusée" });
  }
})

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// get slug
app.get("/image/:slug", async (request, reply) => {
  try {
    const slug = request.params.slug;
    const image = await ImageUser.findOne({ url: slug });

    if (!image) {
      return reply.status(404).json({ error: "Image non trouvée" });
    }

    // Si l'image est publique, on peut la retourner sans authentification
    if (image.isPublic) {
      return reply.status(200).json({
        date: image.date,
        isPublic: image.isPublic,
        name: image.name,
        url: image.url,
        userId: image.userId,
        id: image.id,
      });
    }

    // Si l'image est privée, on vérifie l'authentification
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(403).json({ error: "Authentification requise pour cette image privée" });
    }

    try {
      const token = authHeader.slice(7);
      const decodedToken = jwt.verify(
        token,
        "16UQLq1HZ3CNwhvgrarV6pMoA2CDjb4tyF"
      );
      const userId = decodedToken.userId;

      // Vérifier que l'utilisateur est le propriétaire de l'image
      if (userId && userId.toString() === image.userId.toString()) {
        return reply.status(200).json({
          date: image.date,
          isPublic: image.isPublic,
          name: image.name,
          url: image.url,
          userId: image.userId,
          id: image.id,
        });
      } else {
        return reply.status(403).json({ error: "Vous n'êtes pas autorisé à accéder à cette image" });
      }
    } catch (tokenError) {
      return reply.status(401).json({ error: "Token invalide" });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'image:", error);
    return reply.status(500).json({ error: "Erreur serveur" });
  }
});
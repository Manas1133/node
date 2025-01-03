const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const http = require("http");
const { Server } = require("socket.io");

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Set up the port from the environment or fallback to 3000 for local development
const port = process.env.PORT || 3000;

// Use CORS middleware
app.use(
  cors({
    origin: "*", // Allow all origins (adjust if needed for security)
    methods: ["GET", "POST"],
  })
);

// Middleware to parse JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Explicit route for the root path
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/user.html");
});

// Default weather data
let latestWeatherData = {
  temp: 25,
  humidity: 50,
  pressure: 1013,
  solar: 0,
  uv: 0,
  soilMoisture: 0,
  leafWetness: 0,
  evaporation: 0,
  windSpeed: 0,
  precipitation: 0,
};

// Route to handle form submission from input webpage
app.post("/set-weather-data", (req, res) => {
  const {
    day,
    temp,
    humidity,
    pressure,
    solar,
    uv,
    soilMoisture,
    leafWetness,
    evaporation,
    windSpeed,
    precipitation,
  } = req.body;

  latestWeatherData = {
    day: day || latestWeatherData.day,
    temp: temp || latestWeatherData.temp,
    humidity: humidity || latestWeatherData.humidity,
    pressure: pressure || latestWeatherData.pressure,
    solar: solar || latestWeatherData.solar,
    uv: uv || latestWeatherData.uv,
    soilMoisture: soilMoisture || latestWeatherData.soilMoisture,
    leafWetness: leafWetness || latestWeatherData.leafWetness,
    evaporation: evaporation || latestWeatherData.evaporation,
    windSpeed: windSpeed || latestWeatherData.windSpeed,
    precipitation: precipitation || latestWeatherData.precipitation,
  };

  console.log("Updated weather data:", latestWeatherData);

  io.emit("updateWeatherData", latestWeatherData);

  res.json({ status: "success", message: "Weather data updated." });
});

// Route to get the latest weather data
app.get("/get-weather-data", (req, res) => {
  res.json(latestWeatherData);
});

// Real-Time WebSocket Communication
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.emit("updateWeatherData", latestWeatherData);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start the server and bind to `localhost`
server.listen(port, "localhost", () => {
  console.log(`Server is running at http://localhost:${port}`);
});

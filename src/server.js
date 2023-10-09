import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GenerateSDK, OnfidoConfiguration } from "./routes/OnfidoSetup.js";

// Convert the current module's URL to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware to serve static files. This line serves the frontend HTML, CSS, JS, etc.
app.use(express.static(path.join(__dirname, 'public')));

// GenerateSDKToken functionality

app.use(GenerateSDK);
app.use(OnfidoConfiguration);


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

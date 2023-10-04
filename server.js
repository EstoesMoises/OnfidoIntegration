import express from "express";
import bodyParser from "body-parser";
import { Onfido, Region } from "@onfido/api";
import path from "path";
import { fileURLToPath } from "url";

// Convert the current module's URL to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const onfido = new Onfido({
  apiToken: "***REMOVED***",
  region: Region.EU,
});

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Middleware to serve static files. This line serves the frontend HTML, CSS, JS, etc.
app.use(express.static(path.join(__dirname, 'public')));

// Onfido applicant creation + basic validation

app.post("/createApplicant", async (req, res) => {
    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
        return res.status(400).send("First Name and Last Name are required");
    }

    try {
        const applicant = await onfido.applicant.create(req.body);
        const sdkToken = await onfido.sdkToken.generate({
            applicantId: applicant.id,
        });
 
        res.json({ sdkToken });
    } catch (error) {
        console.error("Error creating applicant or generating SDK token:", error);
        res.status(500).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

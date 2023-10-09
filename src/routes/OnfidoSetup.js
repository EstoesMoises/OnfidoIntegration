import onfido from './OnfidoConnect.js'
import { Router, json } from 'express';

const router = Router();

router.use(json());

// Onfido applicant creation + basic validation
const GenerateSDK = router.post("/createApplicant", async (req, res) => {
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

// Sending via API the onfido configuration
const OnfidoConfiguration = router.get('/getOnfidoConfig', (req, res) => {
    const config = {
       steps: [
          {
             type: 'welcome',
             options: {
                title: 'KYC Verification',
             },
          },
          {
             type: 'document',
             options: {
                forceCrossDevice: true
             }
          },
          {
             type: 'face',
             options: {
                requestedVariant: 'motion'
             }
          },
          'complete'
       ],
    };
    
    res.json(config);
 });

export { GenerateSDK, OnfidoConfiguration };

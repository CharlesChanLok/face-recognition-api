import * as dotenv from "dotenv";
dotenv.config();

import * as express from "express";
import { Request, Response } from "express";

/* Face detection API */
const Clarifai = require("clarifai");

const { CLARIFAI_API_KEY } = process.env;

class ApiClarifaiRouter {
  constructor() {}

  private app = new Clarifai.App({
    apiKey: CLARIFAI_API_KEY
  });

  getRouter = () => {
    const router = express.Router();
    router.post("/facedetection", this.handleFaceDetectionCall);
    return router;
  };

  handleFaceDetectionCall = async (req: Request, res: Response) => {
    const { input } = req.body;
    try {
      const clarifaiResponse = await this.app.models.predict(
        Clarifai.FACE_DETECT_MODEL,
        input
      );
      return res.json(clarifaiResponse);
    } catch (err) {
      return res.status(400).json("Failed to connect clarifai api");
    }
  };
}

export default ApiClarifaiRouter;

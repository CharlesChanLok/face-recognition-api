import * as express from "express";
import { Request, Response } from "express";

import ProfileService from "../services/ProfileService";
import Authorization from "middlewares/Authorization";

class ProfileRouter {
  constructor(private profileService: ProfileService, private authorization: Authorization) {
    this.profileService = profileService;
    this.authorization = authorization;
  }

  getRouter = () => {
    const router = express.Router();
    router.get("/:id", this.authorization.isAuthorized, this.handleProfile);
    router.put("/:id", this.authorization.isAuthorized, this.handleProfileUpdate
    );
    return router;
  };

  handleProfile = async (req: Request, res: Response) => {
    try {
      const user = await this.profileService.getProfile(req.params.id);
      if (user.length === 1) {
        return res.json(user[0]);
      } else {
        return res.status(404).json("not found");
      }
    } catch (err) {
      return res.status(404).json(err);
    }
  };

  handleProfileUpdate = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, age, pet } = req.body.formInput;
      if (name  && age && pet != undefined) {
        const user = await this.profileService.updateProfile(id, name, age, pet);
        if (user) {
          return res.json("success");
        } else {
          return res.status(400).json("Unable to update");
        }
      } else {
        return res.status(400).json("Invalid data");
      }
    } catch (err) {
      return res.status(400).json(err);
    }
  };
}

export default ProfileRouter;

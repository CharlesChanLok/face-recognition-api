import ProfileService from "../services/ProfileService";
import * as express from "express";
import { Request, Response } from "express";

class ProfileRouter {
  constructor(private profileService: ProfileService) {
    this.profileService = profileService;
  }

  getRouter = () => {
    const router = express.Router();
    router.get("/:id", this.handleProfile);
    router.put("/:id", this.handleProfileUpdate);
    return router;
  };

  handleProfile = async (req: Request, res: Response) => {
    try {
      const user = await this.profileService.getProfile(req.params.id);
      if (user.length === 1) {
        return res.json(user);
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
      const user = await this.profileService.updateProfile(id, name);
      if (user) {
        return res.json("success");
      } else {
        return res.status(400).json("Unable to update");
      }
    } catch (err) {
      return res.status(400).json(err);
    }
  };
}

export default ProfileRouter;

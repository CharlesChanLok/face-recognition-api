import * as express from "express";

import { Request, Response } from "express";

import UserService from "../services/UserService";
import { RedisClient } from "redis";
import Authorization from "middlewares/authorization";

class UserRouter {
  constructor(private userService: UserService, private authorization: Authorization, private redis: RedisClient) {
    this.userService = userService;
    this.authorization = authorization;
    this.redis = redis;
  }

  private isValidPassword = (pass: string) => {
    return pass.length >= 8 && pass.length <= 64;
  };

  private isValidEmail = (email: string) => {
    return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    );
  };

  getRouter = () => {
    const router = express.Router();
    // router.post("/signin", this.handleSignIn);
    router.post("/signin", this.signInAuthentication);
    router.post("/signup", this.handleSignUp);
    router.put("/image", this.authorization.isAuthorized, this.handleImage);
    return router;
  };

  handleSignUp = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    if (name && this.isValidEmail(email) && this.isValidPassword(password)) {
      try {
        const user = await this.userService.userSignUp(name, email, password);
        return res.json(user);
      } catch (err) {
        return res.status(404).json(err);
      }
    } else {
      return res.status(400).json("Please provide a valid credentials");
    }
  };

  handleSignIn = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (email && password) {
      try {
        const user = await this.userService.userSignIn(email, password);
        return user;
      } catch (err) {
        return Promise.reject(err);
      }
    } else {
      return Promise.reject("Please provide a valid credentials");
    }
  };

  handleImage = async (req: Request, res: Response) => {
    const { id } = req.body;
    try {
      const entries = await this.userService.AddEntries(id);
      return res.json(entries);
    } catch (err) {
      return res.status(404).json(err);
    }
  };

  getAuthTokenId = (req: Request, res: Response) => {
    const { authorization } = req.headers;
    return this.redis.get(<string>authorization, (err, reply) => {
      if (err || !reply) {
        return res.status(401).json("Unauthorized");
      } else {
        return res.json({ id: reply });
      }
    });
  };

  signInAuthentication = (req: Request, res: Response) => {
    const { authorization } = req.headers;
    return authorization
      ? this.getAuthTokenId(req, res)
      : this.handleSignIn(req, res)
        .then((data) => {
          return data.id && data.email
            ? this.userService.createSession(data)
            : Promise.reject("err");
        })
        .then((session) => res.json(session))
        .catch((err) => res.status(400).json(err));
  };
}

export default UserRouter;

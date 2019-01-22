import * as express from "express";

import { Request, Response } from "express";

import UserService from "../services/UserService";
import { RedisClient } from "redis";
import Authorization from "middlewares/Authorization";

class UserRouter {
  constructor(private userService: UserService, private authorization: Authorization, private redis: RedisClient) {
    this.userService = userService;
    this.authorization = authorization;
    this.redis = redis;
  }


  getRouter = () => {
    const router = express.Router();
    router.get("/signout", this.handleSignOut);
    router.post("/signin", this.signInAuthentication);
    router.post("/signup", this.handleSignUp);
    router.put("/image", this.authorization.isAuthorized, this.handleImage);
    return router;
  };

  handleSignUp = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    try {
      const user = await this.userService.userSignUp(name, email, password);
      if (user.id && user.email) {
        const session = await this.userService.createSession(user);
        return res.json(session);
      } else {
        return Promise.reject("error occured when creating a token on sign up")
      }
    } catch (err) {
      return res.status(400).json(err);
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

  handleSignOut = async (req: Request, res: Response) => {
    try {
      const { authorization } = req.headers;
      const reply = await this.userService.removeToken(<string>authorization);
      if (reply) {
        res.json("success");
      } else {
        res.json("error occured when signing out");
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  }

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

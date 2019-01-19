import { RedisClient } from "redis";
import { Request, Response, NextFunction } from "express";

class Authorization {
  constructor(private redis: RedisClient) {
    this.redis = redis;
  }

  isAuthorized = (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json("Unauthorized");
    }
    return this.redis.get(authorization, (err, reply) => {
      if (err || !reply) {
        return res.status(401).json("Unauthorized");
      }
      console.log("you should pass");
      return next();
    });
  };
}

export default Authorization;

import * as Knex from "knex";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

import { RedisClient } from "redis";

class UserService {
  constructor(private db: Knex, private redis: RedisClient) {
    this.db = db;
    this.redis = redis;
  }

  private saltRounds = 10;

  private isValidPassword = (pass: string) => {
    return pass.length >= 8 && pass.length <= 64;
  };

  private isValidEmail = (email: string) => {
    return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    );
  };

  findUserById = (id: string) => {
    return this.db("users")
      .select("*")
      .where("id", "=", id);
  };

  userSignUp = (name: string, email: string, password: string) => {
    if (name && this.isValidEmail(email) && this.isValidPassword(password)) {
      return this.db
        .transaction(async (trx) => {
          try {
            const hash = await bcrypt.hash(password, this.saltRounds);
            const user = await trx
              .insert({
                name: name,
                email: email
              })
              .into("users")
              .returning("*");
            const login = await trx("logins").insert({
              hash: hash,
              user_id: user[0].id
            });
            return user[0];
          } catch (err) {
            return Promise.reject(err)
          }
        })
        .catch((err) => {
          return err;
        });
    } else {
      return Promise.reject("Error occured when signing up");
    }

  };

  userSignIn = async (email: string, password: string) => {
    try {
      const userHash = await this.db("users")
        .join("logins", "users.id", "=", "logins.user_id")
        .select("users.id", "hash")
        .where("users.email", "=", email);
      const isValidPassword = await bcrypt.compare(password, userHash[0].hash);
      if (isValidPassword) {
        try {
          const user = await this.findUserById(userHash[0].id);
          return user[0];
        } catch (err) {
          return Promise.reject("Error occured when getting an user");
        }
      } else {
        return Promise.reject(
          "Failed to sign in, please provide a valid email or password"
        );
      }
    } catch (err) {
      return Promise.reject(err);
    }
  };

  AddEntries = async (id: number) => {
    try {
      const entries = await this.db("users")
        .where("id", "=", id)
        .increment("entries", 1)
        .returning("entries");
      if (entries.length) {
        return entries[0];
      } else {
        return new Error("User not found");
      }
    } catch (err) {
      return new Error("Encounter an err when getting an entries");
    }
  };

  signToken = (email: string) => {
    const jwtPayload = { email };
    return jwt.sign(jwtPayload, <string>process.env.JWT_SECRET, {
      expiresIn: "2 days"
    });
  };

  createSession = (user: { id: string, email: string }) => {
    const { id, email } = user;
    const token = this.signToken(email);

    return this.setToken(token, id)
      .then(() => {
        return { success: "true", userId: id, token: token };
      })
      .catch(console.log);
  };

  setToken = (token: string, id: string) => {
    return Promise.resolve(this.redis.set(token, id));
  };

  removeToken = (token: string) => {
    return Promise.resolve(this.redis.del(token));
  }
}

export default UserService;

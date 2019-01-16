import * as Knex from "knex";

class ProfileService {
  constructor(private db: Knex) {
    this.db = db;
  }

  getProfile = (id: string) => {
    return this.db("users")
      .select("*")
      .where({ id });
  };

  updateProfile = (id: string, name: string) => {
    return this.db("users")
      .where({ id })
      .update({ name });
  };
}

export default ProfileService;

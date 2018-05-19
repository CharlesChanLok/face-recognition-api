import * as Knex from 'knex';
import * as bcrypt from 'bcrypt';

/**
*   User Service
*   Database queries 
*   Tables : users | logins
*/

class UserService {
    constructor(private db: Knex) {
        this.db = db;
    }

    private saltRounds = 10;

    findUserById = (id: string) => {
        return this.db('users')
            .select('*')
            .where('id', '=', id);


    }

    userSignUp = (name: string, email: string, password: string) => {
        return this.db.transaction(async (trx) => {
            try {
                const hash = await bcrypt.hash(password, this.saltRounds);
                const user = await trx.insert({
                    name: name,
                    email: email
                })
                    .into('users')
                    .returning('*');
                const login = await trx('logins').insert({
                    hash: hash,
                    user_id: user[0].id
                });
                return user[0];
            }
            catch (err) {
                return new Error(err);
            }
        })
            .catch((err) => {
                return err;
            });
    }

    userSignIn = async (email: string, password: string) => {
        try {
            const userHash = await this.db('users').join('logins', 'users.id', '=', 'logins.user_id')
                .select('users.id', 'hash')
                .where('users.email', '=', email);
            const isValidPassword = await bcrypt.compare(password, userHash[0].hash);
            if (isValidPassword) {
                try {
                    const user = await this.db('users')
                        .select('*')
                        .where('id', '=', userHash[0].id);
                    return user[0];
                }
                catch (err) {
                    return new Error('Error occured when getting an user');
                }
            } else {
                return new Error('Failed to sign in, please provide a valid email or password');
            }
        }
        catch (err) {
            return err;
        }
    }

    AddEntries = async (id: number) => {
        try {
            const entries = await this.db('users')
                .where('id', '=', id)
                .increment('entries', 1)
                .returning('entries');
            if (entries.length) {
                return entries[0];
            } else {
                return new Error('User not found');
            }

        }
        catch (err) {
            return new Error('Encounter an err when getting an entries')
        }
    }








}

export default UserService;
BEGIN TRANSACTION;

CREATE TABLE logins (
    id serial PRIMARY KEY,
    hash VARCHAR(100) NOT NULL,
    user_id integer UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

COMMIT;
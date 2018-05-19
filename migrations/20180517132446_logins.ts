import * as Knex from "knex";

exports.up = (knex: Knex) => {
    return knex.schema.createTable('logins', (table) => {
        table.increments();
        table.string("hash").notNullable();
        table.integer("user_id").notNullable().unsigned().unique();
        table.foreign('user_id').references('users.id');
    });
};

exports.down = (knex: Knex) => {
    return knex.schema.dropTableIfExists('logins');
};

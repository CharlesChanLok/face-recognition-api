import * as Knex from "knex";

exports.up = (knex: Knex) => {
    return knex.schema.createTable('users', (table) => {
        table.increments();
        table.string("name").notNullable();
        table.string("email").notNullable().unique();
        table.bigInteger("entries").defaultTo(0);
        table.timestamp('created_at').defaultTo(knex.fn.now());;
    });
};

exports.down = (knex: Knex) => {
    return knex.schema.dropTableIfExists('users');
};

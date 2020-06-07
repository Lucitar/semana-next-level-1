import Knex from 'knex';

export async function up(knex: Knex){
    return knex.schema.createTable('points', table => {
        //CRIA A TABELA POINTS
        table.increments('id').primary();
        table.string('image').notNullable();
        table.string('name').notNullable();
        table.string('email').notNullable();
        table.string('whatsapp').notNullable();
        table.decimal('latitude').notNullable();
        table.decimal('longitude').notNullable();
        table.string('city').notNullable();
        table.string('uf').notNullable();
    })
}

export async function down(knex: Knex){
    //DELETA A TABELA POINTS
    return knex.schema.dropTable('points')
}
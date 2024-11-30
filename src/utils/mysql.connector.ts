import {knex} from "knex";

// assign knex to mysqlDB just for default value btw it's overwritten in initConnection
let mysqlDB = knex;

async function initConnection() {
    // @ts-ignore
    mysqlDB = knex({
        client: 'mysql',
        connection: {
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        }
    });
}

export default {initConnection, mysqlDB};
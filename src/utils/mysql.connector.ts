import {knex} from "knex";

let mysqlDB;

async function initConnection() {
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
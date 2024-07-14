import { APIGatewayProxyHandler } from "aws-lambda";
import axios from "axios";
import * as dotenv from "dotenv";
import mysql, { Connection } from "mysql2/promise";

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};

export const getAllUsers: APIGatewayProxyHandler = async (event) => {
    let connection: Connection | null = null;

    try {
        connection = await mysql.createConnection(dbConfig);
        const statement = connection.format('' +
            'SELECT * FROM users' +
            'ORDERED BY score DESC');
        const [rows] = await connection.query(statement);

        return {
            statusCode: 200,
            body: JSON.stringify(rows),
        };
    } catch (error) {
        console.error(error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error',
            }),
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
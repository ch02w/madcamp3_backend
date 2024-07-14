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
        console.log(dbConfig);
        connection = await mysql.createConnection(dbConfig);
        const sql = `
            SELECT * FROM users
            ORDER BY total_score DESC`;
        const [rows] = await connection.query(sql);

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

export const getUserById: APIGatewayProxyHandler = async (event) => {
    let connection: Connection | null = null;
    try {
        connection = await mysql.createConnection(dbConfig);
        const userId = event.pathParameters?.userId;
        if (!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Id is required',
                }),
            };
        }
        const sql = `
            SELECT * FROM users
            WHERE user_id = ?`;
        const [rows]: [any[], any] = await connection.query(sql, [userId]);
        if (rows.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'User not found',
                }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify(rows[0]),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error',
            }),
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

export const changeUserInfo: APIGatewayProxyHandler = async (event) => {
    let connection: Connection | null = null;
    try {
        connection = await mysql.createConnection(dbConfig);
        const userId = event.pathParameters?.userId;
        if (!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Id is required',
                }),
            };
        }

        const body = JSON.parse(event.body || '{}');

        // 허용된 필드 목록
        const allowedFields = ['user_gender', 'bio', 'total_score'];
        const fieldsToUpdate: string[] = [];
        const values: any[] = [];

        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                fieldsToUpdate.push(`${field} = ?`);
                values.push(body[field]);
            }
        });

        if (fieldsToUpdate.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'No valid fields to update',
                }),
            };
        }

        const sql = `
          UPDATE users
          SET ${fieldsToUpdate.join(', ')}
          WHERE user_id = ?`;
        values.push(userId);

        await connection.query(sql, values);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'User updated successfully',
            }),
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
};
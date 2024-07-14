import { APIGatewayProxyHandler } from "aws-lambda";
import * as dotenv from "dotenv";
import mysql, { Connection, ResultSetHeader } from "mysql2/promise";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export const getAllOpenRooms: APIGatewayProxyHandler = async (event) => {
  let connection: Connection | null = null;

  try {
    connection = await mysql.createConnection(dbConfig);
    const sql = `
      SELECT * FROM room
      WHERE open = true
      ORDER BY created_at DESC`;
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
        message: "Internal server error",
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

export const createRoom: APIGatewayProxyHandler = async (event) => {
  let connection: Connection | null = null;

  try {
    connection = await mysql.createConnection(dbConfig);

    const body = JSON.parse(event.body || "{}");
    const { title, sub_title } = body;

    if (!title) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Title is required",
        }),
      };
    }

    const sql = `
        INSERT INTO room (title, sub_title)
        VALUES (?, ?)`;

    await connection.query(sql, [title, sub_title]);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Room created successfully",
      }),
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

export const deleteRoom: APIGatewayProxyHandler = async (event) => {
  let connection: Connection | null = null;

  try {
    connection = await mysql.createConnection(dbConfig);

    const roomId = event.pathParameters?.roomId;
    if (!roomId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Room ID is required",
        }),
      };
    }

    const sql = `
        DELETE FROM room
        WHERE room_id = ?`;

    const [result]: [ResultSetHeader, any] = await connection.query(sql, [
      roomId,
    ]);

    // DELETE 쿼리가 실행되었지만, 실제로 삭제된 방이 없음
    if (result.affectedRows === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Room not found",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Room deleted successfully",
      }),
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

export const closeRoom: APIGatewayProxyHandler = async (event) => {
  let connection: Connection | null = null;

  try {
    connection = await mysql.createConnection(dbConfig);

    const roomId = event.pathParameters?.roomId;
    if (!roomId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Room ID is required",
        }),
      };
    }

    const sql = `
        UPDATE room
        SET open = false
        WHERE room_id = ?`;

    const [result]: [ResultSetHeader, any] = await connection.query(sql, [
      roomId,
    ]);

    // UPDATE 쿼리가 실행되었지만, 실제로 변경된 방이 없음
    if (result.affectedRows === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Room not found",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Room closed successfully",
      }),
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

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
    const { title, subTitle, ownerId, rankMode, category } = body;

    if (!title || !ownerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Title and owner_id both required",
        }),
      };
    }

    const sql = `
        INSERT INTO room (title, sub_title, rank_mode, owner_id, category)
        VALUES (?, ?, ?, ?, ?)`;

    const [result]: any = await connection?.execute(sql, [title, subTitle, rankMode, ownerId, category]);

    const roomId = result.insertId;

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Room created successfully",
        room_id: roomId,
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

export const enterRoom: APIGatewayProxyHandler = async (event) => {
  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection(dbConfig);

    const { roomId } = event.pathParameters || {};
    const { userId } = JSON.parse(event.body || "{}");

    if (!roomId || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing roomId or userId",
        }),
      };
    }

    // Check if the room exists
    const checkRoomSql = `
      SELECT * FROM room
      WHERE room_id = ?`;
    const [roomRows] = await connection.query(checkRoomSql, [roomId]);

    if (!roomRows) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Room not found",
        }),
      };
    }

    // Check if the user exists
    const checkUserSql = `
      SELECT * FROM users
      WHERE user_id = ?`;
    const [userRows] = await connection.query(checkUserSql, [userId]);

    if (!userRows) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "User not found",
        }),
      };
    }

    // Insert user into room_user
    const insertSql = `
      INSERT INTO room_user (user_id, room_id)
      VALUES (?, ?)`;
    const [result] = (await connection.query(insertSql, [
      userId,
      roomId,
    ])) as any;

    if (result.affectedRows === 1) {
      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "User entered the room successfully",
        }),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Failed to enter room",
        }),
      };
    }
  } catch (error) {
    console.error("Error entering room:", error);

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

export const getAllUsersInRoom: APIGatewayProxyHandler = async (event) => {
  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection(dbConfig);

    const { roomId } = event.pathParameters || {};

    if (!roomId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing roomId",
        }),
      };
    }

    const sql = `
      SELECT u.* 
      FROM users u
      JOIN room_user ru ON u.user_id = ru.user_id
      WHERE ru.room_id = ? AND ru.online = true
      ORDER BY ru.roomUser_id ASC`; // roomUser_id 오름차순으로 정렬

    const [rows] = await connection.query(sql, [roomId]);

    return {
      statusCode: 200,
      body: JSON.stringify(rows),
    };
  } catch (error) {
    console.error("Error fetching users in room:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to fetch users in room",
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

export const updateScore: APIGatewayProxyHandler = async (event) => {
  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection(dbConfig);

    const { roomId, userId } = event.pathParameters || {};
    const { score } = JSON.parse(event.body || "{}");

    if (!roomId || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing roomId or userId",
        }),
      };
    }

    // Check if the room exists and get its rank_mode
    const checkRoomSql = `
      SELECT rank_mode FROM room
      WHERE room_id = ?`;
    const [roomRows] = (await connection.query(checkRoomSql, [roomId])) as any;

    if (!roomRows) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Room not found",
        }),
      };
    }

    const rankMode = roomRows[0].rank_mode;

    if (!score && rankMode) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "rankMode requires score",
        }),
      };
    }

    const newScore = rankMode ? score : 101;

    // Update user score in room_user
    const updateSql = `
      UPDATE room_user
      SET score = ?
      WHERE room_id = ? AND user_id = ?`;
    const [result] = (await connection.query(updateSql, [
      newScore,
      roomId,
      userId,
    ])) as any;

    if (result.affectedRows === 1) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "User score updated successfully",
        }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Failed to update user score",
        }),
      };
    }
  } catch (error) {
    console.error("Error updating user score in room:", error);

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

export const deleteUserInRoom: APIGatewayProxyHandler = async (event) => {
  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection(dbConfig);

    const { roomId, userId } = event.pathParameters || {};

    if (!roomId || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing roomId or userId",
        }),
      };
    }

    const checkSql = `
      SELECT * FROM room_user
      WHERE room_id = ? AND user_id = ? AND score = -1`;
    const [checkRows] = await connection.query(checkSql, [roomId, userId]);

// Check if checkRows is an array and if its length is zero
    if (Array.isArray(checkRows) && checkRows.length === 0) {
      const updateSql = `
        UPDATE room_user
        SET online = false
        WHERE room_id = ? AND user_id = ?`;
      const [result] = (await connection.query(updateSql, [roomId, userId])) as any;

      if (result.affectedRows === 1) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "User updated successfully",
          }),
        };
      }
    }

    const sql = `
      DELETE FROM room_user
      WHERE room_id = ? AND user_id = ? AND score = -1`;

    const [result] = (await connection.query(sql, [roomId, userId])) as any;

    if (result.affectedRows === 1) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "User deleted successfully",
        }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "User not found or not eligible for deletion",
        }),
      };
    }
  } catch (error) {
    console.error("Error deleting user from room:", error);

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

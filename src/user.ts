import { APIGatewayProxyHandler } from "aws-lambda";
import * as dotenv from "dotenv";
import mysql, { Connection } from "mysql2/promise";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export const getAllUsers: APIGatewayProxyHandler = async (event) => {
  let connection: Connection | null = null;

  try {
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
        message: "Internal server error",
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

export const getUserById: APIGatewayProxyHandler = async (event) => {
  let connection: Connection | null = null;
  try {
    connection = await mysql.createConnection(dbConfig);
    const userId = event.pathParameters?.userId;
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Id is required",
        }),
      };
    }

    // 사용자 정보 가져오기
    const userSql = `
      SELECT * FROM users
      WHERE user_id = ?`;
    const [userRows]: [any[], any] = await connection.query(userSql, [userId]);
    if (userRows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "User not found",
        }),
      };
    }
    const user = userRows[0];

    // 팔로잉 목록 가져오기
    const followingSql = `
      SELECT u.user_id, u.user_name, u.user_image
      FROM friends f
      INNER JOIN users u ON f.following_id = u.user_id
      WHERE f.follower_id = ?`;
    const [followingRows]: [any[], any] = await connection.query(followingSql, [
      userId,
    ]);
    user.following = followingRows;

    // 팔로워 목록 가져오기
    const followerSql = `
      SELECT u.user_id, u.user_name, u.user_image
      FROM friends f
      INNER JOIN users u ON f.follower_id = u.user_id
      WHERE f.following_id = ?`;
    const [followerRows]: [any[], any] = await connection.query(followerSql, [
      userId,
    ]);
    user.followers = followerRows;

    // 역대 점수 가져오기
    const scoreSql = `
      SELECT ru.room_id, ru.score, r.created_at AS date, r.category
      FROM room_user ru
      INNER JOIN room r ON ru.room_id = r.room_id
      WHERE ru.user_id = ?`;
    const [scoreRows]: [any[], any] = await connection.query(scoreSql, [
      userId,
    ]);
    user.scores = scoreRows;

    return {
      statusCode: 200,
      body: JSON.stringify(user),
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

export const changeUserInfo: APIGatewayProxyHandler = async (event) => {
  let connection: Connection | null = null;
  try {
    connection = await mysql.createConnection(dbConfig);
    const userId = event.pathParameters?.userId;
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Id is required",
        }),
      };
    }

    const body = JSON.parse(event.body || "{}");

    // 허용된 필드 목록
    const allowedFields = ["user_gender", "bio", "total_score"];
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        fieldsToUpdate.push(`${field} = ?`);
        values.push(body[field]);
      }
    });

    if (fieldsToUpdate.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "No valid fields to update",
        }),
      };
    }

    const sql = `
          UPDATE users
          SET ${fieldsToUpdate.join(", ")}
          WHERE user_id = ?`;
    values.push(userId);

    await connection.query(sql, values);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User updated successfully",
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

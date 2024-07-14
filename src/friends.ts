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

export const getFollowers: APIGatewayProxyHandler = async (event) => {
  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection(dbConfig);

    const { userid } = event.pathParameters || {};

    if (!userid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing userid",
        }),
      };
    }

    const sql = `
            SELECT u.* 
            FROM users u
            JOIN friends f ON u.user_id = f.follower_id
            WHERE f.following_id = ?`;

    const [rows] = await connection.query(sql, [userid]);

    return {
      statusCode: 200,
      body: JSON.stringify(rows),
    };
  } catch (error) {
    console.error("Error fetching followers:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to fetch followers",
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

export const getFollowings: APIGatewayProxyHandler = async (event) => {
  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection(dbConfig);

    const { userid } = event.pathParameters || {};

    if (!userid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing userid",
        }),
      };
    }

    const sql = `
            SELECT u.*
            FROM users u
            JOIN friends f ON u.user_id = f.following_id
            WHERE f.follower_id = ?`;

    const [rows] = await connection.query(sql, [userid]);

    return {
      statusCode: 200,
      body: JSON.stringify(rows),
    };
  } catch (error) {
    console.error("Error fetching followings:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to fetch followings",
      }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

export const followUser: APIGatewayProxyHandler = async (event) => {
  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection(dbConfig);

    const { userid } = event.pathParameters || {};
    const { following_id } = JSON.parse(event.body || "{}");

    if (!userid || !following_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing required parameters",
        }),
      };
    }

    // Check if the follower_id and following_id exist in the users table
    const checkUsersSql = `
          SELECT user_id FROM users
          WHERE user_id IN (?, ?)
        `;
    const [userRows] = await connection.query(checkUsersSql, [
      userid,
      following_id,
    ]);
    if (!userRows) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "One or both users do not exist",
        }),
      };
    }

    // Check if the follow relationship already exists
    const checkFollowSql = `
          SELECT * FROM friends
          WHERE follower_id = ? AND following_id = ?
        `;
    const [followRows] = await connection.query(checkFollowSql, [
      userid,
      following_id,
    ]);
    // if (followRows) {
    //   return {
    //     statusCode: 400,
    //     body: JSON.stringify({
    //       message: "Already following this user",
    //     }),
    //   };
    // }

    // Insert new follow relationship
    const insertSql = `
          INSERT INTO friends (follower_id, following_id)
          VALUES (?, ?)
        `;
    const [result] = (await connection.query(insertSql, [
      userid,
      following_id,
    ])) as any;

    if (result.affectedRows === 1) {
      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Successfully followed user",
        }),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Failed to follow user",
        }),
      };
    }
  } catch (error) {
    console.error("Error following user:", error);

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

export const unfollowUser: APIGatewayProxyHandler = async (event) => {
  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection(dbConfig);

    const { userid, following_id } = event.pathParameters || {};

    if (!userid || !following_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing userid or following_id",
        }),
      };
    }

    const sql = `
        DELETE FROM friends
        WHERE follower_id = ? AND following_id = ?`;

    const [result] = (await connection.query(sql, [
      userid,
      following_id,
    ])) as any;

    if (result.affectedRows === 1) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Unfollowed successfully",
        }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Failed to unfollow",
        }),
      };
    }
  } catch (error) {
    console.error("Error unfollowing user:", error);

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

export const blockFollower: APIGatewayProxyHandler = async (event) => {
  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection(dbConfig);

    const { userid, followerId } = event.pathParameters || {};

    if (!userid || !followerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing userId or followerId",
        }),
      };
    }

    const sql = `
          DELETE FROM friends
          WHERE following_id = ? AND follower_id = ?`;

    const [result] = (await connection.query(sql, [userid, followerId])) as any;

    if (result.affectedRows === 1) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Follower blocked successfully",
        }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Failed to block follower",
        }),
      };
    }
  } catch (error) {
    console.error("Error blocking follower:", error);

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

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

    const { userId } = event.pathParameters || {};

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing userId",
        }),
      };
    }

    const sql = `
      SELECT u.*
      FROM users u
             JOIN friends f ON u.user_id = f.follower_id
      WHERE f.following_id = ?`;

    const [rows] = await connection.query(sql, [userId]);

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

    const { userId } = event.pathParameters || {};

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing userId",
        }),
      };
    }

    const sql = `
      SELECT u.*
      FROM users u
             JOIN friends f ON u.user_id = f.following_id
      WHERE f.follower_id = ?`;

    const [rows] = await connection.query(sql, [userId]);

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

export const checkFollowing: APIGatewayProxyHandler = async (event) => {
  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection(dbConfig);

    const { userId, targetUserId } = event.pathParameters || {};

    if (!userId || !targetUserId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing userId or targetUserId",
        }),
      };
    }

    // Check if userId is following targetUserId
    const sql = `
      SELECT * 
      FROM friends 
      WHERE follower_id = ? AND following_id = ?
    `;

    const [rows] = (await connection.query(sql, [userId, targetUserId])) as any;

    if (rows.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          following: true,
        }),
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({
          following: false,
        }),
      };
    }
  } catch (error) {
    console.error("Error checking following:", error);
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

export const followUser: APIGatewayProxyHandler = async (event) => {
  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection(dbConfig);

    const { userId } = event.pathParameters || {};
    const { followingId } = JSON.parse(event.body || "{}");

    if (!userId || !followingId) {
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
      userId,
      followingId,
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
      userId,
      followingId,
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
      userId,
      followingId,
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

    const { userId, followingId } = event.pathParameters || {};

    if (!userId || !followingId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing userId or followingId",
        }),
      };
    }

    const sql = `
      DELETE FROM friends
      WHERE follower_id = ? AND following_id = ?`;

    const [result] = (await connection.query(sql, [
      userId,
      followingId,
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

    const { userId, followerId } = event.pathParameters || {};

    if (!userId || !followerId) {
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

    const [result] = (await connection.query(sql, [userId, followerId])) as any;

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

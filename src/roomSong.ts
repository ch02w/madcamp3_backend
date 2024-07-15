// import { APIGatewayProxyHandler } from "aws-lambda";
// import * as dotenv from "dotenv";
// import mysql, { Connection, ResultSetHeader } from "mysql2/promise";

// dotenv.config();

// const dbConfig = {
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// };

// export const getReservedSongs: APIGatewayProxyHandler = async (event) => {
//   let connection: Connection | null = null;

//   try {
//     connection = await mysql.createConnection(dbConfig);

//     const { roomId } = event.pathParameters || {};

//     if (!roomId) {
//       return {
//         statusCode: 400,
//         body: JSON.stringify({
//           message: "Missing roomId",
//         }),
//       };
//     }

//     const sql = `
//         SELECT rs.*, u.user_name as reserved_by
//         FROM room_song rs
//         JOIN users u ON rs.user_id = u.user_id
//         WHERE rs.room_id = ? AND rs.sung = false`;

//     const [rows] = await connection.query(sql, [roomId]);

//     return {
//       statusCode: 200,
//       body: JSON.stringify(rows),
//     };
//   } catch (error) {
//     console.error("Error fetching reserved songs:", error);

//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         message: "Failed to fetch reserved songs",
//       }),
//     };
//   } finally {
//     if (connection) {
//       await connection.end();
//     }
//   }
// };

// export const addSongToRoom: APIGatewayProxyHandler = async (event) => {
//   let connection: mysql.Connection | null = null;

//   try {
//     connection = await mysql.createConnection(dbConfig);

//     const { roomId } = event.pathParameters || {};
//     const body = JSON.parse(event.body || "{}");
//     const { user_id, singer, song_name, genre } = body;

//     if (!roomId || !user_id || !singer || !song_name) {
//       return {
//         statusCode: 400,
//         body: JSON.stringify({
//           message: "Missing required parameters",
//         }),
//       };
//     }

//     const sql = `
//         INSERT INTO room_song (user_id, singer, song_name, room_id, genre)
//         VALUES (?, ?, ?, ?, ?)`;

//     console.log(user_id, singer, song_name, roomId, genre || null);
//     const [result]: [mysql.ResultSetHeader, any] = await connection.query(sql, [
//       user_id,
//       singer,
//       song_name,
//       roomId,
//       genre || null,
//     ]);

//     if (result.affectedRows === 1) {
//       return {
//         statusCode: 201,
//         body: JSON.stringify({
//           message: "Song added to room successfully",
//         }),
//       };
//     } else {
//       return {
//         statusCode: 500,
//         body: JSON.stringify({
//           message: "Failed to add song to room",
//         }),
//       };
//     }
//   } catch (error) {
//     console.error("Error adding song to room:", error);

//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         message: "Internal server error",
//       }),
//     };
//   } finally {
//     if (connection) {
//       await connection.end();
//     }
//   }
// };

// export const updateSongStatus: APIGatewayProxyHandler = async (event) => {
//   let connection: mysql.Connection | null = null;

//   try {
//     connection = await mysql.createConnection(dbConfig);

//     const { roomId, songId } = event.pathParameters || {};
//     const body = JSON.parse(event.body || "{}");
//     const { score, sung } = body;

//     if (!roomId || !songId) {
//       return {
//         statusCode: 400,
//         body: JSON.stringify({
//           message: "Missing songId parameter",
//         }),
//       };
//     }

//     let sql = "";
//     let values = [];

//     if (sung !== undefined) {
//       // 클라이언트에서 sung = true만 보낸 경우
//       sql = `
//           UPDATE room_song
//           SET score = ?, sung = ?
//           WHERE song_id = ?`;
//       values = [score, sung, songId];
//     } else if (score !== undefined) {
//       // 클라이언트에서 score만 보낸 경우
//       sql = `
//           UPDATE room_song
//           SET score = ?
//           WHERE song_id = ?`;
//       values = [score, songId];
//     } else {
//       return {
//         statusCode: 400,
//         body: JSON.stringify({
//           message: "Invalid request body",
//         }),
//       };
//     }

//     const [result]: [mysql.ResultSetHeader, any] = await connection.query(
//       sql,
//       values
//     );

//     if (result.affectedRows === 1) {
//       return {
//         statusCode: 200,
//         body: JSON.stringify({
//           message: "Song status updated successfully",
//         }),
//       };
//     } else {
//       return {
//         statusCode: 500,
//         body: JSON.stringify({
//           message: "Failed to update song status",
//         }),
//       };
//     }
//   } catch (error) {
//     console.error("Error updating song status:", error);

//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         message: "Internal server error",
//       }),
//     };
//   } finally {
//     if (connection) {
//       await connection.end();
//     }
//   }
// };

// export const cancelReservation: APIGatewayProxyHandler = async (event) => {
//   let connection: mysql.Connection | null = null;

//   try {
//     connection = await mysql.createConnection(dbConfig);

//     const { roomId, songId } = event.pathParameters || {};

//     if (!roomId || !songId) {
//       return {
//         statusCode: 400,
//         body: JSON.stringify({
//           message: "Missing songId parameter",
//         }),
//       };
//     }

//     // 예약 취소 쿼리
//     const sql = `
//     DELETE FROM room_song
//     WHERE room_id = ? AND song_id = ?`;

//     const [result]: [mysql.ResultSetHeader, any] = await connection.query(sql, [
//       roomId,
//       songId,
//     ]);

//     if (result.affectedRows === 1) {
//       return {
//         statusCode: 200,
//         body: JSON.stringify({
//           message: "Reservation canceled successfully",
//         }),
//       };
//     } else {
//       return {
//         statusCode: 404,
//         body: JSON.stringify({
//           message: "Song reservation not found",
//         }),
//       };
//     }
//   } catch (error) {
//     console.error("Error canceling reservation:", error);

//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         message: "Internal server error",
//       }),
//     };
//   } finally {
//     if (connection) {
//       await connection.end();
//     }
//   }
// };

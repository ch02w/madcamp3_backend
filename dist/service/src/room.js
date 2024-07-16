/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 757:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deleteUserInRoom = exports.updateScore = exports.getAllUsersInRoom = exports.enterRoom = exports.closeRoom = exports.deleteRoom = exports.createRoom = exports.getAllOpenRooms = void 0;
const dotenv = __importStar(__webpack_require__(818));
const promise_1 = __importDefault(__webpack_require__(498));
dotenv.config();
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};
const getAllOpenRooms = async (event) => {
    let connection = null;
    try {
        connection = await promise_1.default.createConnection(dbConfig);
        const sql = `
      SELECT * FROM room
      WHERE open = true
      ORDER BY created_at DESC`;
        const [rows] = await connection.query(sql);
        return {
            statusCode: 200,
            body: JSON.stringify(rows),
        };
    }
    catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal server error",
            }),
        };
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
};
exports.getAllOpenRooms = getAllOpenRooms;
const createRoom = async (event) => {
    let connection = null;
    try {
        connection = await promise_1.default.createConnection(dbConfig);
        const body = JSON.parse(event.body || "{}");
        const { title, subTitle, ownerId, category } = body;
        if (!title || !ownerId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Title and owner_id both required",
                }),
            };
        }
        // Set default category if not provided
        const roomCategory = category || "기타"; // Default category '기타' (or any other default you prefer)
        const sql = `
      INSERT INTO room (title, sub_title, owner_id, category, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`;
        await connection.query(sql, [title, subTitle, ownerId, roomCategory]);
        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "Room created successfully",
            }),
        };
    }
    catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal server error",
            }),
        };
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
};
exports.createRoom = createRoom;
const deleteRoom = async (event) => {
    var _a;
    let connection = null;
    try {
        connection = await promise_1.default.createConnection(dbConfig);
        const roomId = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.roomId;
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
        const [result] = await connection.query(sql, [
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
    }
    catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal server error",
            }),
        };
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
};
exports.deleteRoom = deleteRoom;
const closeRoom = async (event) => {
    var _a;
    let connection = null;
    try {
        connection = await promise_1.default.createConnection(dbConfig);
        const roomId = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.roomId;
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
        const [result] = await connection.query(sql, [
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
    }
    catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal server error",
            }),
        };
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
};
exports.closeRoom = closeRoom;
const enterRoom = async (event) => {
    let connection = null;
    try {
        connection = await promise_1.default.createConnection(dbConfig);
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
        ]));
        if (result.affectedRows === 1) {
            return {
                statusCode: 201,
                body: JSON.stringify({
                    message: "User entered the room successfully",
                }),
            };
        }
        else {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Failed to enter room",
                }),
            };
        }
    }
    catch (error) {
        console.error("Error entering room:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal server error",
            }),
        };
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
};
exports.enterRoom = enterRoom;
const getAllUsersInRoom = async (event) => {
    let connection = null;
    try {
        connection = await promise_1.default.createConnection(dbConfig);
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
      WHERE ru.room_id = ?
      ORDER BY ru.roomUser_id ASC`; // roomUser_id 오름차순으로 정렬
        const [rows] = await connection.query(sql, [roomId]);
        return {
            statusCode: 200,
            body: JSON.stringify(rows),
        };
    }
    catch (error) {
        console.error("Error fetching users in room:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to fetch users in room",
            }),
        };
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
};
exports.getAllUsersInRoom = getAllUsersInRoom;
const updateScore = async (event) => {
    let connection = null;
    try {
        connection = await promise_1.default.createConnection(dbConfig);
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
        const [roomRows] = (await connection.query(checkRoomSql, [roomId]));
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
        ]));
        if (result.affectedRows === 1) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "User score updated successfully",
                }),
            };
        }
        else {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Failed to update user score",
                }),
            };
        }
    }
    catch (error) {
        console.error("Error updating user score in room:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal server error",
            }),
        };
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
};
exports.updateScore = updateScore;
const deleteUserInRoom = async (event) => {
    let connection = null;
    try {
        connection = await promise_1.default.createConnection(dbConfig);
        const { roomId, userId } = event.pathParameters || {};
        if (!roomId || !userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Missing roomId or userId",
                }),
            };
        }
        const sql = `
      DELETE FROM room_user
      WHERE room_id = ? AND user_id = ? AND score = -1`;
        const [result] = (await connection.query(sql, [roomId, userId]));
        if (result.affectedRows === 1) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "User deleted successfully",
                }),
            };
        }
        else {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "User not found or not eligible for deletion",
                }),
            };
        }
    }
    catch (error) {
        console.error("Error deleting user from room:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal server error",
            }),
        };
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
};
exports.deleteUserInRoom = deleteUserInRoom;


/***/ }),

/***/ 818:
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),

/***/ 498:
/***/ ((module) => {

module.exports = require("mysql2/promise");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(757);
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;
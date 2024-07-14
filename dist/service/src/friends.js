/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 677:
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
exports.blockFollower = exports.unfollowUser = exports.followUser = exports.getFollowings = exports.getFollowers = void 0;
const dotenv = __importStar(__webpack_require__(818));
const promise_1 = __importDefault(__webpack_require__(498));
dotenv.config();
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};
const getFollowers = async (event) => {
    let connection = null;
    try {
        connection = await promise_1.default.createConnection(dbConfig);
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
    }
    catch (error) {
        console.error("Error fetching followers:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to fetch followers",
            }),
        };
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
};
exports.getFollowers = getFollowers;
const getFollowings = async (event) => {
    let connection = null;
    try {
        connection = await promise_1.default.createConnection(dbConfig);
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
    }
    catch (error) {
        console.error("Error fetching followings:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to fetch followings",
            }),
        };
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
};
exports.getFollowings = getFollowings;
const followUser = async (event) => {
    let connection = null;
    try {
        connection = await promise_1.default.createConnection(dbConfig);
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
        ]));
        if (result.affectedRows === 1) {
            return {
                statusCode: 201,
                body: JSON.stringify({
                    message: "Successfully followed user",
                }),
            };
        }
        else {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Failed to follow user",
                }),
            };
        }
    }
    catch (error) {
        console.error("Error following user:", error);
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
exports.followUser = followUser;
const unfollowUser = async (event) => {
    let connection = null;
    try {
        connection = await promise_1.default.createConnection(dbConfig);
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
        ]));
        if (result.affectedRows === 1) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Unfollowed successfully",
                }),
            };
        }
        else {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Failed to unfollow",
                }),
            };
        }
    }
    catch (error) {
        console.error("Error unfollowing user:", error);
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
exports.unfollowUser = unfollowUser;
const blockFollower = async (event) => {
    let connection = null;
    try {
        connection = await promise_1.default.createConnection(dbConfig);
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
        const [result] = (await connection.query(sql, [userid, followerId]));
        if (result.affectedRows === 1) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Follower blocked successfully",
                }),
            };
        }
        else {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Failed to block follower",
                }),
            };
        }
    }
    catch (error) {
        console.error("Error blocking follower:", error);
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
exports.blockFollower = blockFollower;


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
/******/ 	var __webpack_exports__ = __webpack_require__(677);
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;
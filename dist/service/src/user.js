/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 377:
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
exports.changeUserInfo = exports.getUserById = exports.getAllUsers = void 0;
const dotenv = __importStar(__webpack_require__(818));
const promise_1 = __importDefault(__webpack_require__(498));
dotenv.config();
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};
const getAllUsers = async (event) => {
    let connection = null;
    try {
        connection = await promise_1.default.createConnection(dbConfig);
        const sql = `
            SELECT * FROM users
            ORDER BY total_score DESC`;
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
                message: 'Internal server error',
            }),
        };
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (event) => {
    var _a;
    let connection = null;
    try {
        connection = await promise_1.default.createConnection(dbConfig);
        const userId = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.userId;
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
        const [rows] = await connection.query(sql, [userId]);
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
    }
    catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error',
            }),
        };
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
};
exports.getUserById = getUserById;
const changeUserInfo = async (event) => {
    var _a;
    let connection = null;
    try {
        connection = await promise_1.default.createConnection(dbConfig);
        const userId = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.userId;
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
        const fieldsToUpdate = [];
        const values = [];
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
    }
    catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error',
            }),
        };
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
};
exports.changeUserInfo = changeUserInfo;


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
/******/ 	var __webpack_exports__ = __webpack_require__(377);
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;
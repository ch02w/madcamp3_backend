/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 561:
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
exports.kakao = void 0;
const axios_1 = __importDefault(__webpack_require__(938));
const dotenv = __importStar(__webpack_require__(818));
const promise_1 = __importDefault(__webpack_require__(498));
dotenv.config();
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};
const kakaoAPIKey = process.env.KAKAO_API_KEY || '';
const kakaoRedirectURI = process.env.KAKAO_REDIRECT_URI || '';
const kakao = async (event) => {
    const queryParameters = event.queryStringParameters;
    const authorizationCode = queryParameters === null || queryParameters === void 0 ? void 0 : queryParameters.code;
    if (!authorizationCode) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Authorization code missing'
            }),
        };
    }
    let connection = null;
    try {
        console.log('1. Requesting token');
        const tokenResponse = await axios_1.default.post('https://kauth.kakao.com/oauth/token', new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: kakaoAPIKey,
            redirect_uri: kakaoRedirectURI,
            code: authorizationCode,
        }).toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        console.log('2. Token received');
        const accessToken = tokenResponse.data.access_token;
        const userResponse = await axios_1.default.get('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        console.log('3. User information received');
        const user = userResponse.data;
        console.log(dbConfig.host, dbConfig.user, dbConfig.password, dbConfig.database);
        // DB 연결 및 사용자 정보 저장
        connection = await promise_1.default.createConnection(dbConfig);
        const [rows] = await connection.execute(`INSERT INTO users (user_id, user_name, user_image)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE user_name = VALUES(user_name), user_image = VALUES(user_image)`, [user.id.toString(), user.kakao_account.profile.nickname, user.kakao_account.profile.profile_image_url]);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Login successful',
                user
            }),
        };
    }
    catch (error) {
        console.error('Error:', error);
        if (error instanceof Error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Login failed', error: error.message }),
            };
        }
        else {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Login failed', error: 'Unknown error occurred' }),
            };
        }
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
};
exports.kakao = kakao;


/***/ }),

/***/ 938:
/***/ ((module) => {

module.exports = require("axios");

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
/******/ 	var __webpack_exports__ = __webpack_require__(561);
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;
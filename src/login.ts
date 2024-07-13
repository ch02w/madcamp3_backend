import { APIGatewayProxyHandler } from "aws-lambda";
import axios from "axios";
import * as dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

// const dbConfig = {
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATANAME
// };
// const kakao_api_key = process.env.KAKAO_API_KEY || '';
// const kakao_redirect_uri = process.env.KAKAO_REDIRECT_URI || '';

export const kakao: APIGatewayProxyHandler = async (event) => {
    const queryParameters = event.queryStringParameters;
    const authorizationCode = queryParameters?.code;
    if (!authorizationCode) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Authorization code missing'
            }),
        };
    }

    let connection;

    try {
        const tokenResponse = await axios.post(
            'https://kauth.kakao.com/oauth/token',
            new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: "f6cd63eaf3ea52e89ff8978fd1f187d4",
                redirect_uri: "https://0vkisdzcrd.execute-api.ap-northeast-2.amazonaws.com/dev/oauth",
                code: authorizationCode,
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const user = userResponse.data;
        // const userId = user.id.toString();
        // const userName = user.kakao_account.profile.nickname;
        // const userImage = user.kakao_account.profile.profile_image_url;
        // const userGender = user.kakao_account.gender === 'male' ? '남성' : '여성';
        // const bio = ''; // 한 줄 소개글 기본값
        // const totalScore = 0; // 누적 점수 기본값
        //
        // // DB에 연결
        // connection = await mysql.createConnection(dbConfig);
        //
        // // 사용자 정보 저장
        // const [rows] = await connection.execute(
        //     `INSERT INTO users (user_id, user_name, user_image, user_gender, bio, total_score)
        //      VALUES (?, ?, ?, ?, ?, ?)
        //      ON DUPLICATE KEY UPDATE user_name = VALUES(user_name), user_image = VALUES(user_image), user_gender = VALUES(user_gender), bio = VALUES(bio), total_score = VALUES(total_score)`,
        //     [userId, userName, userImage, userGender, bio, totalScore]
        // );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Login successful',
                user
            }),
        };
    } catch (error) {
        console.error('Error:', error);
        // if (connection) {
        //     await connection.end();
        // }
        if (error instanceof Error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Login failed', error: error.message }),
            };
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Login failed', error: 'Unknown error occurred' }),
            };
        }
    } finally {
        // if (connection) {
        //     await connection.end();
        // }
    }
};

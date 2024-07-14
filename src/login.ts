import { APIGatewayProxyHandler } from "aws-lambda";
import axios from "axios";
import * as dotenv from "dotenv";
import mysql, { Connection } from "mysql2/promise";

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

const kakaoAPIKey = process.env.KAKAO_API_KEY || '';
const kakaoRedirectURI = process.env.KAKAO_REDIRECT_URI || '';

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

    let connection: Connection | null = null;

    try {
        console.log('1. Requesting token');
        const tokenResponse = await axios.post(
            'https://kauth.kakao.com/oauth/token',
            new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: kakaoAPIKey,
                redirect_uri: kakaoRedirectURI,
                code: authorizationCode,
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        console.log('2. Token received');

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        console.log('3. User information received');

        const user = userResponse.data;
        console.log(dbConfig.host, dbConfig.user, dbConfig.password, dbConfig.database);

        // DB 연결 및 사용자 정보 저장
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            `INSERT INTO users (user_id, user_name, user_image)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE user_name = VALUES(user_name), user_image = VALUES(user_image)`,
            [user.id.toString(), user.kakao_account.profile.nickname, user.kakao_account.profile.profile_image_url]
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Login successful',
                user
            }),
        };
    } catch (error) {
        console.error('Error:', error);

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
        if (connection) {
            await connection.end();
        }
    }};

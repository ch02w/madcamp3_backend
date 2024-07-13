import {APIGatewayProxyHandler} from "aws-lambda";
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
}
const kakao_api_key = process.env.KAKAO_API_KEY || '';
const kakao_redirect_uri = process.env.KAKAO_REDIRECT_URI || '';

export const kakao: APIGatewayProxyHandler = async (event) => {
    const pathParameters = event.pathParameters;
    const queryParameters = event.queryStringParameters;
    const authorizationCode= queryParameters?.code
    if (!authorizationCode) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Authorization code missing'
            }),
        };
    }

    try {
        const tokenResponse = await axios.post(
            'https://kauth.kakao.com/oauth/token',
            new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: kakao_api_key,
                redirect_uri: kakao_redirect_uri,
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
        const name = user.name;
        const id = user.id;
        const profile_image = user.profile.profile_image_url;


        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Login successful',
                user,
            }),
        };
    } catch (error) {
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
    }
};
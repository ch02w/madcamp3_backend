// import * as AWS from "aws-sdk";
// import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

// const dynamoDb = new AWS.DynamoDB.DocumentClient();

// export const connectHandler = async (
//   event: APIGatewayEvent
// ): Promise<APIGatewayProxyResult> => {
//   const connectionId = event.requestContext.connectionId || ""; // API Gateway 이벤트에서 connectionId 가져오기

//   // connectionId를 DynamoDB 또는 다른 영구 저장소에 저장
//   await saveConnectionId(connectionId);

//   return {
//     statusCode: 200,
//     body: "Connected successfully", // 연결 성공 응답
//   };
// };

// export const disconnectHandler = async (
//   event: APIGatewayEvent
// ): Promise<APIGatewayProxyResult> => {
//   const connectionId = event.requestContext.connectionId!; // 연결 해제 이벤트에서 connectionId 가져오기

//   // connectionId를 DynamoDB 또는 다른 영구 저장소에서 삭제
//   await deleteConnectionId(connectionId);

//   return {
//     statusCode: 200,
//     body: "Disconnected successfully", // 연결 해제 성공 응답
//   };
// };

// export const offerHandler = async (
//   event: APIGatewayEvent
// ): Promise<APIGatewayProxyResult> => {
//   const body = JSON.parse(event.body || "{}"); // 요청 본문 파싱
//   const { roomId, offer } = body; // 요청에서 roomId와 offer 추출

//   if (!roomId || !offer) {
//     return {
//       statusCode: 400,
//       body: "Invalid request. 'roomId' and 'offer' are required.", // 유효하지 않은 요청 처리
//     };
//   }

//   // 같은 방에 있는 모든 클라이언트에게 offer 브로드캐스팅
//   await broadcastMessage(
//     event,
//     roomId,
//     JSON.stringify({ action: "offer", offer })
//   );

//   return {
//     statusCode: 200,
//     body: "Offer sent successfully", // offer 전송 성공 응답
//   };
// };

// export const answerHandler = async (
//   event: APIGatewayEvent
// ): Promise<APIGatewayProxyResult> => {
//   const body = JSON.parse(event.body || "{}"); // 요청 본문 파싱
//   const { roomId, answer } = body; // 요청에서 roomId와 answer 추출

//   if (!roomId || !answer) {
//     return {
//       statusCode: 400,
//       body: "Invalid request. 'roomId' and 'answer' are required.", // 유효하지 않은 요청 처리
//     };
//   }

//   // 같은 방에 있는 모든 클라이언트에게 answer 브로드캐스팅
//   await broadcastMessage(
//     event,
//     roomId,
//     JSON.stringify({ action: "answer", answer })
//   );

//   return {
//     statusCode: 200,
//     body: "Answer sent successfully", // answer 전송 성공 응답
//   };
// };

// async function saveConnectionId(connectionId: string) {
//   // connectionId를 DynamoDB 테이블 또는 다른 영구 저장소에 저장
//   const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
//     TableName: process.env.CONNECTIONS_TABLE!, // 환경 변수에서 테이블 이름 가져오기
//     Item: {
//       connectionId: connectionId,
//     },
//   };

//   await dynamoDb.put(params).promise(); // DynamoDB에 put 요청 보내기
// }

// async function deleteConnectionId(connectionId: string) {
//   // connectionId를 DynamoDB 테이블 또는 다른 영구 저장소에서 삭제
//   const params: AWS.DynamoDB.DocumentClient.DeleteItemInput = {
//     TableName: process.env.CONNECTIONS_TABLE!, // 환경 변수에서 테이블 이름 가져오기
//     Key: {
//       connectionId: connectionId,
//     },
//   };

//   await dynamoDb.delete(params).promise(); // DynamoDB에 delete 요청 보내기
// }

// async function broadcastMessage(
//   event: APIGatewayEvent,
//   roomId: string,
//   message: string
// ) {
//   const params: AWS.DynamoDB.DocumentClient.ScanInput = {
//     TableName: process.env.CONNECTIONS_TABLE!,
//   };

//   const data = await dynamoDb.scan(params).promise();
//   const connections = data.Items as { connectionId: string }[];

//   const apiGateway = new AWS.ApiGatewayManagementApi({
//     apiVersion: "2018-11-29",
//     endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
//   });

//   const promises = connections.map(async ({ connectionId }) => {
//     try {
//       await apiGateway
//         .postToConnection({
//           ConnectionId: connectionId,
//           Data: message,
//         })
//         .promise();
//     } catch (error) {
//       console.error(`Failed to send message to ${connectionId}`, error);
//     }
//   });

//   await Promise.all(promises);
// }

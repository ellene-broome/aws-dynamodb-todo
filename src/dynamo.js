import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand
} from '@aws-sdk/lib-dynamodb';

// Initialize the DynamoDB client with environment variables. MAKE SURE IT IS NOT PUBLIC
const client = new DynamoDBClient({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
  }
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

export async function scanTodos(setTodos) {
  try {
    const command = new ScanCommand({ TableName: 'To_Do' }); // Ensure the table name matches your DynamoDB table this is case-sensitive
    const response = await ddbDocClient.send(command);
    console.log("✅ Scan is a Success:", response.Items);
    return response.Items || [];
  } catch (err) {
    console.error("❌ Scan failed:", err);
    return [];
  }
}

// This is the function to create a new todo item in DynamoDB
export async function createTodo(item) {
  try {
    const command = new PutCommand({ TableName: 'To_Do', Item: item });
    const response = await ddbDocClient.send(command);
    console.log("✅ Item created:", response);
  } catch (err) {
    console.error("❌ Create failed:", err);
  }
}

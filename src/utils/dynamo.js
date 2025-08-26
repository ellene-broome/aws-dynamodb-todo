import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand
} from '@aws-sdk/lib-dynamodb';

// Initialize the DynamoDB client with environment variables. MAKE SURE IT IS NOT PUBLIC (i.e. do not hardcode your credentials)
const client = new DynamoDBClient({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
  }
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'To_Do'; // Ensure this matches your DynamoDB table name

// This function is to scan all todos
export async function scanTodos(setTodos) {
  try {
    const command = new ScanCommand({ TableName: TABLE_NAME });
    const response = await ddbDocClient.send(command);
    console.log("Scan is a Success:", response.Items);
    return response.Items || [];
  } catch (err) {
    console.error("Scan failed:", err);
    return [];
  }
}

// Create a new todo item
export async function createTodo(item) {
  try {
    const command = new PutCommand({ TableName: 'To_Do', Item: item });
    const response = await ddbDocClient.send(command);
    console.log("Item created:", response);
  } catch (err) {
    console.error("Create failed:", err);
  }
}

// Update an existing todo item
export async function updateTodo(id, updates) {
  try { 
    // Build the update expression dynamically
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    for (const key in updates) {
      updateExpression.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = updates[key];
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const response = await ddbDocClient.send(command);
    console.log("Item updated:", response.Attributes);
    return response.Attributes;
  } catch (err) {
    console.error("Update failed:", err);
  }
}

// Delete a todo item
export async function deleteTodo(id) {
  try {
    const command = new DeleteCommand({ TableName: TABLE_NAME, Key: { id } });

    const response = await ddbDocClient.send(command);
    console.log("Item deleted:", response);
  } catch (err) {
    console.error("Delete failed:", err);
  }
}

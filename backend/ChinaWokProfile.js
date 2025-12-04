const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.handler = async (event) => {
  const method = event.requestContext.http.method;
  
  // Si es GET, devolvemos el perfil del usuario
  if (method === 'GET') {
      // El userId debería venir por query param: /profile?userId=xyz
      const userId = event.queryStringParameters?.userId;
      if(!userId) return { statusCode: 400, body: "Falta userId" };

      const { Item } = await doc.send(new GetCommand({
          TableName: "ChinaWokCustomers",
          Key: { userId }
      }));
      
      return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify(Item || { addresses: [] })
      };
  }

  // Si es POST, guardamos una nueva dirección
  if (method === 'POST') {
      const body = JSON.parse(event.body || "{}");
      const { userId, address, name } = body; 

      if(!userId || !address) return { statusCode: 400, body: "Datos incompletos" };

      // Guardamos la dirección en una lista
      await doc.send(new UpdateCommand({
          TableName: "ChinaWokCustomers",
          Key: { userId },
          UpdateExpression: "SET addresses = list_append(if_not_exists(addresses, :empty_list), :newAddr), #n = :name",
          ExpressionAttributeNames: { "#n": "name" },
          ExpressionAttributeValues: {
              ":newAddr": [address],
              ":empty_list": [],
              ":name": name || "Cliente"
          }
      }));

      return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: "Dirección Guardada" })
      };
  }
};
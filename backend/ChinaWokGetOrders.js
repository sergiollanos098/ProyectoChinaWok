const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.handler = async (event) => {
  try {
    const userId = event.queryStringParameters?.userId;
    const tenantId = event.queryStringParameters?.tenantId;
    
    let command;

    // CASO 1: COCINA (Filtrar por Sucursal - Eficiente)
    if (tenantId) {
        console.log("Buscando por Tenant:", tenantId);
        command = new QueryCommand({
            TableName: "ChinaWokCore",
            KeyConditionExpression: "tenantId = :tid",
            ExpressionAttributeValues: { ":tid": tenantId }
        });
    } 
    // CASO 2: CLIENTE (Ver mis pedidos - Scan global filtrado)
    // (Como la tabla está partida por tenant, un usuario podría haber comprado en varias sedes,
    //  así que el Scan es aceptable aquí para juntar todo).
    else {
        command = new ScanCommand({ TableName: "ChinaWokCore" });
    }

    const response = await docClient.send(command);
    let items = response.Items || [];

    // Filtro adicional de usuario (si aplica)
    if (userId) {
        items = items.filter(order => order.customer && order.customer.userId === userId);
    }

    // Ordenar por fecha
    items.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(items)
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
const { SFNClient, SendTaskSuccessCommand } = require("@aws-sdk/client-sfn");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const sfn = new SFNClient({});
const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { tenantId, orderId, actor } = body;

    // 1. Obtener el Token guardado en DynamoDB
    const { Item } = await doc.send(new GetCommand({
      TableName: "ChinaWokCore", // <--- Asegúrate que este nombre coincida con tu tabla real
      Key: { tenantId, orderId }
    }));

    if (!Item || !Item.taskToken) throw new Error("Pedido no encontrado o sin token");

    console.log(`Desbloqueando pedido ${orderId} con token...`);

    // 2. Avisar a Step Functions que avance
    // IMPORTANTE: Aquí agregamos orderId y tenantId al output para no perderlos
    await sfn.send(new SendTaskSuccessCommand({
      taskToken: Item.taskToken,
      output: JSON.stringify({ 
        status: "OK", 
        completedBy: actor,
        timestamp: new Date().toISOString(),
        orderId: orderId,   // <--- ESTO ES LO NUEVO: Pasamos el ID al siguiente paso
        tenantId: tenantId  // <--- ESTO ES LO NUEVO: Pasamos el Tenant al siguiente paso
      })
    }));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Tarea Completada" })
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
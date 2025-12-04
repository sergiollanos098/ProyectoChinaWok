const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { EventBridgeClient, PutEventsCommand } = require("@aws-sdk/client-eventbridge");

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ebClient = new EventBridgeClient({});

exports.handler = async (event) => {
  const { token, orderId, tenantId, status, step, customer, items, total } = event;

  console.log(`Guardando orden: ${orderId}, total: ${total}`);

  let updateExp = "SET #s = :s, currentStep = :step, updatedAt = :now";
  let expValues = {
    ":s": status,
    ":step": step,
    ":now": new Date().toISOString()
  };
  // Inicializamos los nombres de atributos con el alias para status
  let expNames = { "#s": "status" };

  // --- CORRECCIÓN AQUÍ: Usamos alias #i para items y #t para total ---
  if (items) {
      updateExp += ", #i = :i";
      expValues[":i"] = items;
      expNames["#i"] = "items";
  }
  
  if (total) {
      updateExp += ", #t = :t";  // Usamos #t en la expresión
      expValues[":t"] = total;
      expNames["#t"] = "total";  // Definimos que #t significa "total"
  }
  // ------------------------------------------------------------------

  if (customer) {
      updateExp += ", customer = :c";
      expValues[":c"] = customer;
  }

  if (token && token !== "FINAL") {
    updateExp += ", taskToken = :tk";
    expValues[":tk"] = token;
  }

  try {
    await docClient.send(new UpdateCommand({
      TableName: "ChinaWokCore", // Revisa el nombre de tu tabla
      Key: { tenantId, orderId },
      UpdateExpression: updateExp,
      ExpressionAttributeNames: expNames, // Enviamos el diccionario de alias
      ExpressionAttributeValues: expValues
    }));

    // Integración EventBridge (Solo al entregar)
    if (status === "ENTREGADO") {
        await ebClient.send(new PutEventsCommand({
            Entries: [{
                Source: "chinawok.workflow",
                DetailType: "PedidoFinalizado",
                Detail: JSON.stringify({ orderId, tenantId, status, items, total, timestamp: new Date() }),
                EventBusName: "default"
            }]
        }));
    }

    return { status: "GUARDADO" };
    
  } catch (e) {
    console.error("Error Helper:", e);
    throw e; 
  }
};
import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";
const sfn = new SFNClient({});

export const handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : (event || {});
    const { tenantId, items, total } = body;
    const orderId = `ORD-${Date.now()}`;

    if (!items) throw new Error("Faltan items");

    // CAMBIO CLAVE: Pasamos 'body' entero mezclado con los datos nuevos
    // Esto asegura que 'customer' (userId, address) viaje al Step Function
    const inputPayload = { 
      ...body, 
      orderId, 
      timestamp: new Date().toISOString() 
    };

    await sfn.send(new StartExecutionCommand({
      stateMachineArn: "arn:aws:states:us-east-1:387765507107:stateMachine:ChinaWokWorkflow", // <--- OJO: Revisa que esté tu ARN
      input: JSON.stringify(inputPayload),
      name: `${tenantId || 'demo'}-${orderId}`
    }));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Pedido Creado", orderId })
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
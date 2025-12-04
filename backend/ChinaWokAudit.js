const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client({});

exports.handler = async (event) => {
  // EventBridge nos pasa el detalle del pedido en "detail"
  const pedido = event.detail;
  const orderId = pedido.orderId;

  const contenido = JSON.stringify(pedido, null, 2);

  // Guardamos en S3
  await s3.send(new PutObjectCommand({
    Bucket: "chinawok-auditoria-sl-123", // <--- PON EL NOMBRE DE TU BUCKET S3
    Key: `pedidos/${orderId}.json`,      // Nombre del archivo
    Body: contenido,
    ContentType: "application/json"
  }));

  console.log(`Auditoría guardada en S3 para ${orderId}`);
  return { status: "Archivado" };
};
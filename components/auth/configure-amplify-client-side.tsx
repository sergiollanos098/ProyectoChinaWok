"use client";

import { Amplify } from "aws-amplify";

// NOTA: Es una buena práctica mover estos valores a variables de entorno (.env.local)
// para no exponerlos directamente en el código fuente.
const cognitoConfig = {
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "us-east-1_ykk2wIGUQ",
  userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "29s00hdcadogncs9p99q9ui1g6",
};

Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: cognitoConfig.userPoolId,
        userPoolClientId: cognitoConfig.userPoolClientId,
      },
    },
  },
  {
    // Habilitar SSR es crucial para que Amplify funcione correctamente en Next.js
    ssr: true,
  }
);

export default function ConfigureAmplifyClientSide() {
  return null;
}

"use client";

import { Authenticator } from "@aws-amplify/ui-react";

/**
 * Este componente renderiza la interfaz de usuario de autenticación de AWS Amplify.
 * Reemplaza el formulario de pestañas manual por un flujo completo de
 * inicio de sesión, creación de cuenta y recuperación de contraseña.
 *
 * Los estilos se toman del archivo global `globals.css` donde se importó
 * `@aws-amplify/ui-react/styles.css`.
 */
export function AuthTabs() {
  return <Authenticator />;
}

# Conexión desde el navegador — preparada, todavía sin activar

GoDaddy ya tiene una aplicación Node que ejecuta v1.12.0 y una base MySQL alojada. La captura de su guía confirma que las cinco variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD` se inyectan automáticamente. No copiar contraseñas, importar SQL ni instalar programas en el PC del propietario.

Esta preparación permite escoger entre el envío incorporado en GoDaddy y el propio buzón Microsoft. No son el mismo remitente. Primero confirmar la modalidad con el propietario. La web de producción y su dominio no se cambian.

## 1. Actualizar solo Preview

Tras publicar y verificar v1.13.0 en `main`, usar **Update Preview** en la aplicación existente de GoDaddy. No seleccionar Publish to Live, cambiar de dominio ni crear otra aplicación. GoDaddy Preview y Live comparten base de datos; nuestra preparación usa únicamente tablas `lajolla_preview_v1_*`, sin alterar las que ya existan. El nombre de la aplicación y el identificador de almacenamiento se conservan entre actualizaciones.

## 2. Configuración privada en Settings → Secrets

Mantener `INQUIRY_ENABLED=false`. Para abrir la preparación privada:

| Nombre | Valor |
| --- | --- |
| `MAIL_SETUP_ENABLED` | `true` |
| `MAIL_PUBLIC_ORIGIN` | `https://45jk7nw93w.preview.c38.airoapp.ai` |
| `MAIL_SETUP_SECRET` | Contraseña aleatoria de al menos 32 caracteres generada y guardada en el gestor de contraseñas del propietario. Introducirla directamente en Secrets. |
| `INQUIRY_STORAGE_NAMESPACE` | `preview` |

El origen no incluye el token compartido, `/planning.html` ni otros parámetros. Las variables de base de datos las proporciona GoDaddy; no sobrescribirlas. No subir `.env` a GitHub. `MAIL_SETUP_SECRET` también cifra los tokens cuando se usa Microsoft: cambiarla sin una migración impide descifrar una conexión ya guardada. Su valor no se comparte en este chat ni en capturas. El servidor deriva una clave separada para protección de tráfico; no es una cuota mensual de facturación.

### Modalidad A: envío incorporado en GoDaddy

Añadir `MAIL_PROVIDER=godaddy` y `CONTACT_FORM_RECIPIENT_EMAIL=info@lajollacoralgables.com`. No requiere secreto de Microsoft ni contraseña del buzón. El remitente es el de la aplicación determinado por GoDaddy; el destinatario es el buzón del negocio y Reply-To es el visitante. No falsificar info como remitente ni verificar/reemplazar el dominio de producción para esta prueba. La documentación no demuestra ausencia de cuotas o costes: verificar los términos del plan antes del lanzamiento.

### Modalidad B: envío desde el buzón Microsoft

Añadir `MAIL_PROVIDER=microsoft`, `MAIL_AUTH_MODE=delegated` y los tres valores privados de Microsoft:

- Tenant: `11b9e825-f4fd-4c5e-9071-24e62b91d24b`.
- Client: `28b7a66d-eae8-4f5e-a603-3f218157d900`.
- Client secret: nuevo valor creado en Entra, después de revocar el compartido previamente en el chat. Guardarlo directamente en GoDaddy; no compartirlo aquí. El Id. del secreto no es su valor.

En **Entra → Registros de aplicaciones → La Jolla — Inquiries → Autenticación**, añadir plataforma **Web** y URI exacta:

`https://45jk7nw93w.preview.c38.airoapp.ai/admin/mail/callback`

No activar el flujo de cliente público ni Implicit Grant. En **Permisos de API → Microsoft Graph → Permisos delegados**, añadir `Mail.Send` y `User.Read`. No elegir permisos de aplicación, `Mail.Send.Shared`, `Mail.Read`, `Mail.ReadWrite` ni calendarios. User.Read comprueba el perfil y la dirección de la cuenta; no lee mensajes. El flujo solicita también openid/profile/offline_access para la sesión y su renovación. Revisar concesiones previas de esta aplicación; no añadir accesos generales al tenant. Mantener MFA y Security Defaults. No usar código de dispositivo, PowerShell ni Azure Cloud Shell.

## 3. Abrir el panel privado y comprobar persistencia

Reiniciar Preview después de editar Secrets. Abrir el enlace privado de GoDaddy como propietario y visitar `/admin/mail` en ese mismo origen. Introducir `MAIL_SETUP_SECRET` en la página; nunca en la URL. El acceso privado caduca en una hora y se cierra al reiniciar el proceso, sin borrar la conexión guardada.

Anotar el identificador de almacenamiento mostrado. Usar **Restart Preview App**, volver a entrar y comprobar el mismo identificador. Después usar **Update Preview**, volver a entrar y comprobarlo de nuevo. Solo entonces marcar la confirmación de persistencia. Esa marca registra la verificación del propietario; no sustituye un respaldo. No se han verificado estas operaciones sobre la base del negocio desde nuestra sesión.

Si se eligió Microsoft, pulsar **Conectar con Microsoft**, iniciar sesión como info y completar MFA. El servidor verifica la firma/tenant/audience/nonce del inicio de sesión y el perfil de Graph; rechaza otras cuentas. Los tokens quedan cifrados en MySQL y se renuevan internamente. Si Microsoft exige reautorización, se conserva la solicitud y hay que volver a conectar.

## 4. Una prueba real, identificada y privada

La página muestra un botón de prueba técnica después de la preparación. Marcar expresamente el envío y pulsar **Enviar prueba técnica**. Ese acto envía un correo real únicamente al buzón del negocio, sin datos de clientes. El asunto incluye **PRUEBA TECNICA — NO ES UNA CONSULTA NI RESERVA** y una referencia LJ. La UUID de prueba es persistente y específica de cada proveedor: no se cambia para forzar reenvíos.

Una respuesta aceptada no confirma recepción. Buscar el mensaje en info, incluido No deseado, y confirmar la referencia en el panel solo después de encontrarlo. Si el envío queda incierto, revisar también Enviados cuando proceda; el sistema no lo repite automáticamente. Las comprobaciones automáticas utilizan proveedores simulados y nunca pulsan este envío real.

## 5. Activar las consultas después de confirmar la recepción

Después de registrar almacenamiento, autorización cuando corresponda y recepción de la prueba, se puede cambiar `INQUIRY_ENABLED=true` en Preview y reiniciar. El servidor rechaza una activación prematura. Los formularios servidos por Node usan `/api/inquiries`; conservan campos tras fallos y una UUID para reintentos del mismo contenido durante la sesión. La consulta se guarda antes de notificar; no confirma citas ni reserva espacios. GitHub Pages conserva su transporte anterior y no ejecuta esta API.

Probar ambos formularios de Preview con datos ficticios claramente marcados, verificar registro y recepción, comprobar fallos y la navegación, y registrar la evidencia. La página pública y el dominio antiguo solo se reemplazan después de la autorización expresa del negocio. Calendario y disponibilidad son una integración posterior.

Referencias: [GoDaddy Node.js Hosting](https://dk.godaddy.com/help/deploy-my-cursor-or-claude-app-with-godaddy-nodejs-hosting-42908?lc=en-US), [envío incorporado](https://github.com/godaddy/nodejs-hosting-agent-skill/blob/main/skills/godaddy-nodejs-hosting/email.md), [MySQL gestionado](https://github.com/godaddy/nodejs-hosting-agent-skill/blob/main/skills/godaddy-nodejs-hosting/examples.md#managed-mysql), [Microsoft authorization code flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow), [Microsoft Graph sendMail](https://learn.microsoft.com/en-us/graph/api/user-sendmail).

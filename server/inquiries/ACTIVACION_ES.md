# Activación del correo propio — pendiente

La preparación actual permite iniciar sesión desde el navegador o usar el envío incorporado de GoDaddy. Seguir [CONEXION_NAVEGADOR_ES.md](CONEXION_NAVEGADOR_ES.md), que incorpora la base MySQL confirmada en el panel. La vía de aplicación con Exchange descrita a continuación sigue siendo una referencia avanzada no aplicada; no repetir el flujo de dispositivo bloqueado ni instalar programas en el PC del propietario.

Objetivo: guardar cada inquiry y notificar a info@lajollacoralgables.com usando su Microsoft 365. La web actual, el dominio de producción y el sitio antiguo no se reemplazan durante esta preparación. La migración a GoDaddy requiere autorización posterior del cliente. Esta guía no significa que la cuenta esté conectada.

## 1. Registrar la aplicación del negocio

Con el administrador del negocio, entrar en https://entra.microsoft.com/ y seleccionar el directorio que contiene el buzón. En **Entra ID → Registros de aplicaciones → Nuevo registro**:

- Nombre: **La Jolla — Inquiries**.
- Tipo de cuenta: **Solo cuentas de este directorio**.
- URI de redirección: vacía; este servicio se autentica de servidor a servidor.

Anotar el **Id. de aplicación (cliente)** y el **Id. de directorio (inquilino)** de Información general. Se pueden compartir para preparar la configuración: no son contraseñas. No enviar secretos de cliente ni la contraseña del correo en el chat.

En **Aplicaciones empresariales**, abrir esa misma aplicación y anotar su **Id. de objeto**. Este es el objeto del principal de servicio; no usar el Id. de objeto de «Registros de aplicaciones» para Exchange. Si el objeto empresarial no existe, verificar su creación en el directorio correcto antes de seguir.

## 2. Autorizar únicamente el buzón

El administrador debe tener los permisos de Exchange requeridos. GoDaddy permite entrar a Exchange desde **Correo y Office → Admin → Avanzado**. Si no tiene el rol necesario, resolverlo con el administrador del negocio o GoDaddy, sin desactivar MFA.

La conexión remota mediante código de dispositivo fue bloqueada con el error Microsoft 530035 («Access has been blocked by security defaults»). Mantener Security Defaults y MFA activados; no repetir ese flujo ni comprar Azure para desbloquearlo. La autorización de Exchange todavía no se ha aplicado. El cliente requiere todos sus pasos en el navegador, sin instalar o ejecutar nada en su PC; los comandos siguientes corresponden al operador en un entorno compatible.

Usar PowerShell de Exchange Online, iniciado con el administrador del negocio. Los siguientes comandos son una guía para revisión, no se han ejecutado en la cuenta. Sustituir únicamente los dos identificadores indicados y revisar si existen objetos o asignaciones previas antes de crear otros.

```powershell
Import-Module ExchangeOnlineManagement
Connect-ExchangeOnline

$appId = '<Id. de aplicación (cliente)>'
$servicePrincipalId = '<Id. de objeto de Aplicaciones empresariales>'

New-ServicePrincipal -AppId $appId -ObjectId $servicePrincipalId -DisplayName 'La Jolla — Inquiries'
New-ManagementScope -Name 'LaJolla-Inquiry-Mailbox' -RecipientRestrictionFilter "PrimarySmtpAddress -eq 'info@lajollacoralgables.com'"
New-ManagementRoleAssignment -Name 'LaJolla-Inquiry-Send' -Role 'Application Mail.Send' -App $servicePrincipalId -CustomResourceScope 'LaJolla-Inquiry-Mailbox'
Test-ServicePrincipalAuthorization -Identity $servicePrincipalId -Resource 'info@lajollacoralgables.com'
```

Revisar que **Application Mail.Send** tiene **InScope=True** para el buzón del negocio. Si hay otro buzón en el mismo directorio, comprobar que está fuera del ámbito con el mismo comando y su dirección. No crear un buzón para esta prueba. Si no hay otro, revisar el filtro del ámbito y sus destinatarios.

No conceder además **Mail.Send de aplicación sin ámbito** en «Permisos de API» de Entra: los permisos de Entra y los de Exchange se suman; un permiso general eliminaría la restricción buscada. Revisar también permisos previos del principal de servicio. `Test-ServicePrincipalAuthorization` comprueba Exchange, pero no detecta concesiones independientes de Entra.

Este servicio no requiere leer el correo ni acceder al calendario. Los permisos pueden tardar entre 30 minutos y dos horas en reflejarse en llamadas reales. El comando de prueba omite esa caché; su éxito no sustituye un envío recibido.

## 3. Configurar un entorno de pruebas privado

Hace falta Node >=22.13 y almacenamiento privado persistente para SQLite. Las nuevas capturas de GoDaddy muestran un asistente de despliegue Node.js. Antes de activar el correo, comprobar Node >=22.13 y que el almacenamiento privado sobrevive a reinicios y redespliegues. El constructor gratuito mostrado previamente no demuestra estas capacidades. Confirmar alojamiento compatible antes de contratar o activar costes. GitHub Pages sirve la web, pero no ejecuta este servidor.

El servidor web se inicia con `npm start`, respeta el `PORT` del alojamiento y mantiene `INQUIRY_ENABLED=false` por defecto. Su `/healthz` solo comprueba que el proceso funciona; no demuestra recepción de correo.

En la configuración privada del servidor, establecer las variables de `.env.example`. El secreto de la aplicación se crea y guarda por ese canal privado, con su fecha de caducidad y plan de rotación. No va en Git, JavaScript del navegador, capturas ni mensajes. El archivo de secretos y la base de datos deben estar fuera de la carpeta pública, con permisos restringidos. Los secretos pueden introducirse directamente en el asistente privado de GoDaddy. Si un secreto se comparte en el chat, revocarlo en Entra y sustituirlo directamente en GoDaddy antes de usarlo; no copiar su valor al código o a esta guía.

Para esta prueba no es necesario cambiar DNS ni conectar los formularios públicos. La base de datos debe persistir entre intentos: nunca usar `:memory:` para una prueba real.

## 4. Enviar una única prueba técnica

Con las variables privadas ya disponibles en el proceso, generar una UUID y anotarla en el registro de pruebas. Ejecutar desde el proyecto:

```text
node server/inquiries/verify-mail.mjs --send-technical-test <UUID-de-la-prueba>
```

Este comando puede enviar un correo real. Lo marca como **PRUEBA TECNICA — NO ES UNA CONSULTA NI RESERVA**, se dirige al propio buzón del negocio y guarda el intento antes de enviar. No usa datos de clientes ni modifica calendarios. Solo se ejecuta conscientemente por el operador; los tests automáticos utilizan proveedores simulados.

Repetir siempre con **la misma UUID, datos y base de datos** si hay que verificar un intento. Un envío ya aceptado no vuelve a enviarse. Un resultado incierto exige comprobar Enviados y la bandeja antes de reconciliarlo; no generar otra UUID para saltarse esa protección.

`success=true` significa guardado y aceptado por Microsoft, **no recibido**. `inboxReceiptVerified` permanece `false`: comprobar manualmente el mensaje en info@lajollacoralgables.com, incluido correo no deseado. Registrar referencia, hora, aceptación y recepción por separado. No copiar tokens o secretos al informe. Una consulta aceptada tampoco confirma una cita ni una reserva.

## 5. Conectar y publicar después de verificar

La recepción técnica prueba el buzón, pero aún quedan el endpoint HTTPS, protección contra abuso, integración de ambos formularios y pruebas del navegador. Revisar también persistencia, reintentos, errores y recuperación de los datos escritos. Solo entonces completar feature → dev → main con versión, tag y release. El reemplazo de la web antigua y la migración del dominio siguen pendientes de autorización expresa.

Referencias oficiales:

- https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app
- https://www.godaddy.com/en-uk/help/access-advanced-admin-centers-32132
- https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac
- https://learn.microsoft.com/en-us/powershell/exchange/connect-to-exchange-online-powershell
- https://learn.microsoft.com/en-us/graph/api/user-sendmail

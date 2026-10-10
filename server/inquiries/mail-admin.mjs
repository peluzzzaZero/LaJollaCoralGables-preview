// Owner-only browser setup. A private setup secret gates every action before OAuth.
import { randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { BUSINESS_MAILBOX } from './graph.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cookieName = '__Host-lajolla-mail-setup';
const digest = value => createHash('sha256').update(value).digest();

export function createMailAdmin({ origin, setupSecret, authorization, vault, technicalTest, testStatus, provider = 'microsoft', now = Date.now }) {
  if (!setupSecret || setupSecret.length < 32 || new URL(origin).origin !== origin || !origin.startsWith('https://')) throw new Error('private_mail_setup_required');
  const sessions = new Map();
  let failures = 0; let windowEnds = 0;
  const headers = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'" };
  const send = (res, status, text) => { res.writeHead(status, { ...headers, 'Content-Type': 'text/html; charset=utf-8' }); res.end(text); };
  const redirect = res => { res.writeHead(303, { ...headers, Location: '/admin/mail' }); res.end(); };
  const page = body => `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Conexión del correo · La Jolla</title><style>body{font:17px/1.65 system-ui;background:#f5f3eb;color:#26362e;margin:0}main{max-width:720px;margin:40px auto;padding:24px}input,button{font:inherit;padding:12px;box-sizing:border-box}input[type=password]{width:100%}button{background:#536456;color:white;border:0;cursor:pointer;margin:16px 0}form{margin:28px 0}code{overflow-wrap:anywhere}small{display:block}label{display:block}p{overflow-wrap:anywhere}</style><main><h1>Conectar el correo de La Jolla</h1>${body}</main></html>`;
  const sessionFor = req => {
    const value = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
    const session = sessions.get(value);
    return session && session.expiresAt > now() ? session : null;
  };
  const sessionForm = (session, path, body, button) => `<form method="post" action="${path}"><input type="hidden" name="csrf" value="${session.csrf}">${body}<button>${button}</button></form>`;
  const readForm = async req => {
    if (!req.headers['content-type']?.startsWith('application/x-www-form-urlencoded')) throw new Error('form_required');
    let bytes = 0; const chunks = [];
    for await (const chunk of req) { bytes += chunk.length; if (bytes > 4096) throw new Error('form_too_large'); chunks.push(chunk); }
    return new URLSearchParams(Buffer.concat(chunks).toString());
  };
  return {
    async handle(req, res) {
      const url = new URL(req.url, origin);
      const path = url.pathname;
      if (!['/admin/mail', '/admin/mail/connect', '/admin/mail/callback', '/admin/mail/storage', '/admin/mail/test', '/admin/mail/receipt', '/admin/mail/logout'].includes(path)) return send(res, 404, page('<p>Página no encontrada.</p>'));
      // Clean up expired memory-only owner sessions, including unused PKCE challenges.
      for (const [key, session] of sessions) if (session.expiresAt <= now()) sessions.delete(key);
      let session = sessionFor(req);
      if (path === '/admin/mail/callback' && req.method === 'GET') {
        const challenge = session?.challenge;
        if (session) delete session.challenge;
        if (!challenge || url.searchParams.getAll('state').length !== 1 || url.searchParams.get('state') !== challenge.state || challenge.expiresAt <= now()) {
          return send(res, 400, page('<p>La autorización no es válida o ha caducado. Vuelve a la conexión e inténtalo de nuevo.</p><a href="/admin/mail">Volver</a>'));
        }
        try {
          if (url.searchParams.has('error') || url.searchParams.getAll('code').length !== 1) throw new Error('authorization_failed');
          await authorization.finish(url.searchParams.get('code'), challenge);
          session.message = 'Buzón autorizado. Todavía no se ha enviado ningún correo por esta conexión.';
        } catch { session.message = 'No se pudo autorizar el buzón. Usa la cuenta info@lajollacoralgables.com y revisa los permisos delegados y la configuración privada.'; }
        return redirect(res); // Remove single-use authorization codes from the browser URL.
      }
      if (path === '/admin/mail' && req.method === 'GET') {
        if (!session) return send(res, 200, page('<p>Acceso privado del propietario. Introduce la clave de configuración guardada en GoDaddy como <code>MAIL_SETUP_SECRET</code>. No es la contraseña del correo.</p><form method="post" action="/admin/mail/connect"><label>Clave privada<input type="password" name="setup_secret" autocomplete="off" required maxlength="512"></label><button>Entrar a la configuración</button></form>'));
        let state;
        try { state = await authorization.status(); } catch { return send(res, 503, page('<p>No se puede abrir la conexión privada. Revisa el almacenamiento y la clave de configuración.</p>')); }
        const delivery = await testStatus();
        const storage = await vault.readMetadata('storage-confirmed') === 'yes';
        const status = provider === 'godaddy' ? state.connected ? 'Envío de GoDaddy configurado; recepción pendiente de comprobar' : 'Envío de GoDaddy pendiente de configuración'
          : state.connected ? 'Buzón autorizado' : state.reconnectRequired ? 'Es necesario volver a autorizar el buzón' : 'Buzón pendiente de autorización';
        let body = `<p>${escape(session.message || '')}</p><p><strong>${status}:</strong> ${BUSINESS_MAILBOX}</p><p>Esta página no activa el formulario público ni confirma reservas.</p>`;
        body += `<h2>1. Comprobar almacenamiento</h2><p>Identificador de almacenamiento: <code>${escape(vault.storageMarker)}</code></p><p>Anótalo, reinicia y redespliega la aplicación desde GoDaddy. Vuelve a entrar. Debe mantenerse el mismo identificador en ambas comprobaciones. Si cambia, no conectes el correo: falta almacenamiento persistente.</p>`;
        body += storage ? '<p>El propietario ha confirmado estas comprobaciones.</p>' : sessionForm(session, '/admin/mail/storage', '<label><input type="checkbox" name="confirmed" value="yes" required> He comprobado que el identificador permanece igual tras reiniciar y redesplegar.</label>', 'Confirmar comprobaciones');
        if (provider === 'godaddy') body += '<h2>2. Envío incorporado en GoDaddy</h2><p>El remitente es la aplicación de GoDaddy. Las consultas llegan al buzón del negocio y las respuestas se dirigen al correo del visitante. Esta modalidad no autoriza acceso al buzón de Microsoft.</p>';
        else {
          body += '<h2>2. Autorizar el buzón</h2><p>Microsoft solicitará inicio de sesión y MFA. La aplicación pide envío de correo y lectura del perfil para comprobar la cuenta; no pide lectura de mensajes.</p>';
          if (storage) body += sessionForm(session, '/admin/mail/connect', '', state.connected ? 'Volver a conectar con Microsoft' : 'Conectar con Microsoft');
        }
        body += '<h2>3. Prueba de recepción</h2><p>Se enviará únicamente al propio buzón una prueba marcada como técnica. El mismo intento se conserva para evitar duplicados.</p>';
        if (delivery?.state === 'accepted') {
          body += `<p>El servicio de correo aceptó la prueba con referencia <code>${escape(delivery.reference)}</code>. Eso no confirma su recepción.</p>`;
          body += await vault.readMetadata('receipt-reference') === delivery.reference ? '<p>El propietario confirmó la recepción de esta prueba.</p>' : sessionForm(session, '/admin/mail/receipt', `<label><input type="checkbox" name="confirmed" value="yes" required> He encontrado esta referencia en la bandeja de info@lajollacoralgables.com.</label>`, 'Confirmar recepción');
        } else if (storage && state.connected) body += sessionForm(session, '/admin/mail/test', '<label><input type="checkbox" name="confirmed" value="yes" required> Enviar una prueba real al buzón del negocio, sin datos de clientes.</label>', 'Enviar prueba técnica');
        if (delivery && delivery.state !== 'accepted') body += `<p>Estado del intento: ${escape(delivery.state)}. Ante un resultado incierto, revisa la bandeja y Enviados antes de cualquier acción adicional.</p>`;
        body += sessionForm(session, '/admin/mail/logout', '', 'Cerrar acceso privado');
        return send(res, 200, page(body));
      }
      if (req.method !== 'POST') return send(res, 405, page('<p>Método no permitido.</p>'));
      if (req.headers.origin !== origin) return send(res, 403, page('<p>Origen no permitido.</p>'));
      let form;
      try { form = await readForm(req); } catch { return send(res, 400, page('<p>Formulario no válido.</p>')); }
      if (!session) {
        if (path !== '/admin/mail/connect') return send(res, 401, page('<p>Vuelve a entrar al acceso privado.</p>'));
        if (windowEnds <= now()) { windowEnds = now() + 300000; failures = 0; }
        if (failures >= 10) return send(res, 429, page('<p>Espera cinco minutos antes de volver a intentarlo.</p>'));
        const provided = form.get('setup_secret') || '';
        if (!timingSafeEqual(digest(provided), digest(setupSecret))) { failures++; return send(res, 401, page('<p>Clave no válida.</p>')); }
        if (sessions.size >= 20) return send(res, 429, page('<p>Hay demasiadas sesiones de configuración. Espera antes de volver a entrar.</p>'));
        const id = randomBytes(32).toString('base64url');
        session = { csrf: randomBytes(32).toString('base64url'), expiresAt: now() + 3600000 };
        sessions.set(id, session);
        res.setHeader('Set-Cookie', `${cookieName}=${id}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`);
        return redirect(res);
      }
      if (form.getAll('csrf').length !== 1 || form.get('csrf') !== session.csrf) return send(res, 403, page('<p>Formulario caducado. Recarga la configuración.</p>'));
      if (path === '/admin/mail/logout') {
        session.expiresAt = 0;
        res.setHeader('Set-Cookie', `${cookieName}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
        return redirect(res);
      }
      if (path === '/admin/mail/storage' && form.get('confirmed') === 'yes') {
        await vault.writeMetadata('storage-confirmed', 'yes'); session.message = 'Comprobaciones de almacenamiento registradas por el propietario.';
      } else if (path === '/admin/mail/connect') {
        if (provider !== 'microsoft') return send(res, 409, page('<p>Esta modalidad usa el envío incorporado de GoDaddy.</p>'));
        if (await vault.readMetadata('storage-confirmed') !== 'yes') return send(res, 409, page('<p>Primero comprueba el almacenamiento persistente.</p>'));
        session.challenge = authorization.start();
        res.writeHead(303, { ...headers, Location: session.challenge.url }); return res.end();
      } else if (path === '/admin/mail/test' && form.get('confirmed') === 'yes') {
        if (await vault.readMetadata('storage-confirmed') !== 'yes' || !(await authorization.status()).connected) return send(res, 409, page('<p>Primero comprueba el almacenamiento y autoriza el buzón.</p>'));
        try {
          const result = await technicalTest();
          session.message = result.success ? 'El servicio de correo aceptó la prueba técnica. Comprueba su recepción antes de confirmarla.' : 'La prueba no se ha confirmado. Revisa la bandeja, Enviados y el estado del intento.';
        } catch { session.message = 'No se pudo verificar la prueba. No se ha confirmado recepción.'; }
      } else if (path === '/admin/mail/receipt' && form.get('confirmed') === 'yes') {
        const delivery = await testStatus();
        if (delivery?.state !== 'accepted') return send(res, 409, page('<p>No hay una prueba aceptada para confirmar.</p>'));
        await vault.writeMetadata('receipt-reference', delivery.reference); session.message = 'Recepción confirmada por el propietario. El formulario público permanece desactivado hasta su integración.';
      } else return send(res, 400, page('<p>Acción no válida.</p>'));
      return redirect(res);
    }
  };
}

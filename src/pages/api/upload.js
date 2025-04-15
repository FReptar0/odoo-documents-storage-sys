import xmlrpc from 'xmlrpc';

// Aumenta el límite si esperas archivos grandes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

/**
 * Recibe vía POST:
 * {
 *   fileName: string,   // nombre del archivo
 *   base64Data: string, // base64 del archivo sin prefijo
 *   mimetype?: string   // opcional, si quieres enviar el tipo de archivo exacto
 * }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  try {
    // 1) Obtenemos variables de entorno
    const {
      ODOO_HOST,
      ODOO_DB,
      ODOO_USER,
      ODOO_PASS,
      ODOO_FOLDER_ID,
    } = process.env;

    // 2) Extraemos datos del body
    const { fileName, base64Data, mimetype } = req.body || {};
    if (!fileName || !base64Data) {
      return res.status(400).json({
        error: 'Faltan parámetros: fileName o base64Data',
      });
    }

    // 3) Creamos cliente XML-RPC para la autenticación
    const common = xmlrpc.createClient({
      url: ODOO_HOST + '/xmlrpc/2/common',
    });

    // Promesa para autenticar
    const authenticateAsync = (db, user, pass) =>
      new Promise((resolve, reject) => {
        common.methodCall('authenticate', [db, user, pass, {}], (err, uid) => {
          if (err) return reject(err);
          resolve(uid);
        });
      });

    // Autenticar
    const uid = await authenticateAsync(ODOO_DB, ODOO_USER, ODOO_PASS);
    if (!uid) {
      return res
        .status(401)
        .json({ error: 'Credenciales inválidas o problemas de conexión a Odoo' });
    }

    // 4) Cliente para llamadas a modelos
    const models = xmlrpc.createClient({
      url: ODOO_HOST + '/xmlrpc/2/object',
    });

    // Helper promisificado para execute_kw
    const executeKw = (model, method, params) =>
      new Promise((resolve, reject) => {
        models.methodCall(
          'execute_kw',
          [ODOO_DB, uid, ODOO_PASS, model, method, params],
          (err, value) => {
            if (err) return reject(err);
            resolve(value);
          }
        );
      });

    // 5) Crear el adjunto (ir.attachment)
    //    - Le asignamos res_model='res.partner' y res_id=3
    //      para que se vincule a ese contacto en el chatter
    const attachmentVals = {
      name: fileName,
      datas: base64Data,
      mimetype: mimetype || 'application/octet-stream',
      res_model: 'res.partner', // Se enlaza a Contactos
      res_id: 3,               // ID del contacto
    };

    const attachmentId = await executeKw('ir.attachment', 'create', [attachmentVals]);
    if (!attachmentId) {
      return res.status(500).json({ error: 'No se pudo crear el ir.attachment' });
    }

    // 6) Crear el documento en la app Documentos (carpeta raíz = ODOO_FOLDER_ID)
    //    *Requiere que la app Documentos esté instalada*
    const folderId = parseInt(ODOO_FOLDER_ID, 10) || 1;

    // Dependiendo de la versión de Odoo, puede existir un campo res_model/res_id 
    // o resource_ref (ej: 'res.partner,3'). Si no existe, omite estas líneas.
    const documentVals = {
      name: fileName,
      folder_id: folderId,
      attachment_id: attachmentId,
      res_model: 'res.partner', // Enlaza también aquí si tu versión lo admite
      res_id: 3,               // ID del contacto
      partner_id: 3,         // ID del contacto
      // O en versiones más nuevas: resource_ref: 'res.partner,3',
    };

    const documentId = await executeKw('documents.document', 'create', [documentVals]);
    if (!documentId) {
      return res
        .status(500)
        .json({ error: 'No se pudo crear el documento en Documentos' });
    }

    // 7) Respuesta exitosa
    return res.status(200).json({
      message: 'Documento creado en la app Documentos de Odoo y asignado al contacto ID=3',
      attachmentId,
      documentId,
      folderId,
    });

  } catch (error) {
    console.error('Error subiendo archivo a Odoo:', error);
    return res.status(500).json({
      error: 'Error al subir archivo a Odoo',
      details: error.message,
    });
  }
}

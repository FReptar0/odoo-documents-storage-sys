import xmlrpc from 'xmlrpc';

// Aumenta el límite si esperas recibir datos grandes en el body
// (en este caso no es tan relevante, ya que es un GET)
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

/**
 * Devuelve la lista de todas las carpetas del modelo documents.folder en Odoo
 * Utiliza el método search_read para obtener los registros.
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido. Usa GET.' });
    }

    try {
        // 1) Obtenemos variables de entorno
        const {
            ODOO_HOST,
            ODOO_DB,
            ODOO_USER,
            ODOO_PASS,
        } = process.env;

        // 2) Creamos cliente XML-RPC para la autenticación
        const common = xmlrpc.createClient({
            url: ODOO_HOST + '/xmlrpc/2/common',
        });

        // Helper promisificado para autenticar
        const authenticateAsync = (db, user, pass) =>
            new Promise((resolve, reject) => {
                common.methodCall('authenticate', [db, user, pass, {}], (err, uid) => {
                    if (err) return reject(err);
                    resolve(uid);
                });
            });

        // 3) Autenticar en Odoo
        const uid = await authenticateAsync(ODOO_DB, ODOO_USER, ODOO_PASS);
        if (!uid) {
            return res.status(401).json({ error: 'Credenciales inválidas o problemas de conexión a Odoo' });
        }

        // 4) Creamos cliente para llamadas a modelos
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

        // 5) Hacemos search_read en documents.folder
        //    - domain vacío ([]) para traer todas las carpetas
        //    - fields: los campos que quieras ver (id, name, parent_id, etc.)
        const domain = [];  // ninguna restricción, traer todas
        const fields = ['id', 'name', 'parent_id']; // Ajusta a tus necesidades

        // search_read se invoca como: ['search_read', [domain], {fields, limit, offset}]
        const folders = await executeKw('documents.folder', 'search_read', [
            domain,
            { fields },
        ]);

        // 6) Devolvemos la lista como JSON
        return res.status(200).json({
            folders,
        });
    } catch (error) {
        console.error('Error al buscar carpetas en Odoo:', error);
        return res.status(500).json({
            error: 'Error al buscar carpetas en la app Documentos',
            details: error.message,
        });
    }
}

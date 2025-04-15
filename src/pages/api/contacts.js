import xmlrpc from 'xmlrpc';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Por si deseas subir o manejar algo grande; no es tan relevante para un GET
        },
    },
};

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido, usa GET.' });
    }

    try {
        // 1) Variables de entorno
        const { ODOO_HOST, ODOO_DB, ODOO_USER, ODOO_PASS } = process.env;

        // 2) Cliente para autenticar
        const common = xmlrpc.createClient({
            url: ODOO_HOST + '/xmlrpc/2/common',
        });

        // Helper promisificado para authenticate
        const authenticateAsync = (db, user, pass) =>
            new Promise((resolve, reject) => {
                common.methodCall('authenticate', [db, user, pass, {}], (err, uid) => {
                    if (err) return reject(err);
                    resolve(uid);
                });
            });

        // Autenticación
        const uid = await authenticateAsync(ODOO_DB, ODOO_USER, ODOO_PASS);
        if (!uid) {
            return res
                .status(401)
                .json({ error: 'Credenciales inválidas o problemas de conexión a Odoo' });
        }

        // 3) Cliente para llamadas a modelos
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

        // 4) Llamamos al método search_read en res.partner usando parámetros posicionales
        //    search_read(domain, fields, offset=0, limit=0, order='')
        const domain = [];  // Filtra aquí si gustas, p.ej. [['is_company', '=', false]]
        const partners = await executeKw('res.partner', 'search_read', [
            domain,                   // dominio
            ['id', 'name', 'email', 'phone'], // campos a leer
            0,                        // offset
            0,                        // limit (0 = sin límite)
            '',                       // order
        ]);

        // 5) Respuesta exitosa
        return res.status(200).json({ partners });
    } catch (error) {
        console.error('Error listando contactos en Odoo:', error);
        return res.status(500).json({
            error: 'Error al listar contactos',
            details: error.message,
        });
    }
}

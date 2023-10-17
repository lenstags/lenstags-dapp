import { NextApiRequest, NextApiResponse } from 'next';
import { addDoc, collection } from 'firebase/firestore'; // Importaciones necesarias

import { db } from '@lib/firebase';

type DataResponse = {
  message: string;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<DataResponse>
): Promise<void> => {
  if (req.method === 'POST') {
    const webhookData = req.body;

    try {
      // Accede a la colección y añade un nuevo documento
      const docRef = await addDoc(collection(db, 'webhooks'), webhookData);

      res
        .status(200)
        .json({
          message: `Datos guardados correctamente con ID: ${docRef.id}.`
        });
    } catch (error) {
      console.error('Error al guardar en Firestore', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Método no permitido');
  }
};

export default handler;

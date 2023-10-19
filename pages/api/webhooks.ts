import { NextApiRequest, NextApiResponse } from 'next';
import { collection, deleteDoc, doc, setDoc } from 'firebase/firestore';

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
    const chatData = webhookData?.message?.chat;

    if (chatData) {
      const { id: chat_id, title, type } = chatData;
      const chatId = String(chat_id);

      const isBotAdded = webhookData.message?.new_chat_members?.some(
        (member: any) => member.is_bot
      );

      const isBotRemoved = webhookData.message?.left_chat_member?.is_bot;

      if (isBotAdded) {
        const eventData = {
          title,
          type
        };

        try {
          console.log('bot added to chat: ', chatId);
          const docRef = doc(collection(db, 'added'), chatId);
          await setDoc(docRef, eventData, { merge: true });
          res.status(200).json({ message: `Bot agregado al chat: ${chatId}` });
        } catch (error) {
          console.error('Error al guardar en Firestore', error);
          res.status(500).json({ message: 'Error interno del servidor' });
        }
      } else if (isBotRemoved) {
        // Manejar lógica cuando el bot es eliminado
        try {
          const docRef = doc(collection(db, 'added'), String(chatId));
          await deleteDoc(docRef);
          res.status(200).json({
            message: `Bot eliminado del chat: ${chatId}. Documento eliminado.`
          });
        } catch (error) {
          console.error('Error al eliminar documento en Firestore', error);
          res.status(500).json({ message: 'Error interno del servidor' });
        }
      } else {
        // Si no es un evento relevante para el bot
        res
          .status(200)
          .json({ message: 'Evento recibido, pero no requerido.' });
      }
    } else {
      // Si el mensaje no contiene datos de chat
      res.status(200).json({ message: 'Mensaje sin datos de chat válidos.' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(200).end('Método no permitido');
  }
};

export default handler;

/*

Use this to configure the webhook ONCE BOT_TOKEN=6039944536:AAFhvMzjo5CcdghFZ7JkmB8sxYac40H3-qk

curl -F "url=https://testnet.nata.social/api/webhook" https://api.telegram.org/bot6039944536:AAFhvMzjo5CcdghFZ7JkmB8sxYac40H3-qk/setWebhook


curl -F "url=https://d5e3-190-137-17-159.ngrok.io/api/webhook" https://api.telegram.org/bot<TU_TOKEN_DE_BOT>/setWebhook
curl -F "url=https://d5e3-190-137-17-159.ngrok.io/api/webhooks" https://api.telegram.org/bot6039944536:AAFhvMzjo5CcdghFZ7JkmB8sxYac40H3-qk/setWebhook

*/

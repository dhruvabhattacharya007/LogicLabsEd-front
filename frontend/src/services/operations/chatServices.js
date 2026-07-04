import { apiConnector } from '../apiConnector';
import { chatApi } from '../apis';

export const sendChatMessage = async (message) => {
  try {
    const response = await apiConnector('POST', chatApi.POST_CHAT_API, { message });

    if (!response.data?.success) {
      return { success: false };
    }

    return { success: true, reply: response.data.reply };
  } catch (error) {
    return { success: false };
  }
}

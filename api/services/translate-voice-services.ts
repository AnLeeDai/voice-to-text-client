import instance from "@/lib/instance";
import {
  TranslateVoiceReqInterface,
  TranslateVoiceResInterface,
} from "../interfaces/translate-voice-interface";

export async function postTranslateVoice(
  data: TranslateVoiceReqInterface
): Promise<TranslateVoiceResInterface> {
  try {
    // Tạo FormData để gửi file
    const formData = new FormData();

    if (data.voice) {
      formData.append("voice", data.voice);
    }

    if (data.voice_url) {
      formData.append("voice_url", data.voice_url);
    }

    formData.append("model", data.model);

    const response = await instance.post<TranslateVoiceResInterface>(
      "/translate-voice/create",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
}

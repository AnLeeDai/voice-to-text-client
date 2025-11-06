import instance from "@/lib/instance";
import {
  TranslateVoiceReqInterface,
  TranslateVoiceResInterface,
} from "../interfaces/translate-voice-interface";
import { fixObjectEncoding } from "@/helpers/encoding-fix";

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

    // Fix encoding issues từ server
    const fixedData = fixObjectEncoding(
      response.data
    ) as TranslateVoiceResInterface;

    return fixedData;
  } catch (error) {
    throw error;
  }
}

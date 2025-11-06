import { useMutation, mutationOptions } from "@tanstack/react-query";

import { postTranslateVoice } from "../services/translate-voice-services";
import { TranslateVoiceReqInterface } from "../interfaces/translate-voice-interface";

export const useTranslateVoice = () => {
  return useMutation({
    mutationFn: (data: TranslateVoiceReqInterface) => {
      return postTranslateVoice(data);
    },
    ...mutationOptions,
  });
};

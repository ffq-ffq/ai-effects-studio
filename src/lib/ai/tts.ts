import { callModalApi } from "@/lib/modal/client";

export async function requestTextToSpeech(text: string, voice = "zh-CN-XiaoxiaoNeural") {
  return callModalApi<{ audioUrl: string }>({
    path: "/tts",
    body: { text, voice },
  });
}

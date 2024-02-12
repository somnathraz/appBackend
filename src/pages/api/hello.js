// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import fs from "fs/promises"; // Using promises for asynchronous operations
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

let speech_key = "dbbfb9e4b6c645818edcb84fc8bbaff6";
let speech_region = "eastus";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        speech_key,
        speech_region
      );

      // Assuming audio file is sent in the request body
      const audioData = req.body;
      console.log("====================================");
      console.log(audioData);
      console.log("====================================");
      const fromStream = async () => {
        let pushStream = sdk.AudioInputStream.createPushStream();
        let audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
        let speechRecognizer = new sdk.SpeechRecognizer(
          speechConfig,
          audioConfig
        );

        // Event Handlers
        speechRecognizer.recognizing = (s, e) => {
          console.log(`RECOGNIZING: Text=${e.result.text}`, "done");
        };

        speechRecognizer.recognized = (s, e) => {
          if (e.result.reason == sdk.ResultReason.RecognizedSpeech) {
            console.log(`RECOGNIZED: Text=${e.result.text}`, "fully done");
            res.status(200).json({ text: e.result.text });
          } else if (e.result.reason == sdk.ResultReason.NoMatch) {
            console.log("NOMATCH: Speech could not be recognized.");
          }
        };

        speechRecognizer.canceled = (s, e) => {
          // ... (Error handling if needed)
        };

        // Start continuous recognition
        speechRecognizer.startContinuousRecognitionAsync();

        // Continuously push audio data
        req.body.data.forEach((chunk) => pushStream.write(chunk));

        // To stop speech recognition:
        // speechRecognizer.stopContinuousRecognitionAsync();
      };

      fromStream();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error during speech recognition" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

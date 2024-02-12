// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import fs from "fs/promises"; // Using promises for asynchronous operations
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
const speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

speech_key = "dbbfb9e4b6c645818edcb84fc8bbaff6";
speech_region = "eastus";

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
      function fromStream() {
        let pushStream = sdk.AudioInputStream.createPushStream();

        on("data", function (arrayBuffer) {
          pushStream.write(audioData.slice());
        }).on("end", function () {
          pushStream.close();
        });

        let audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
        let speechRecognizer = new sdk.SpeechRecognizer(
          speechConfig,
          audioConfig
        );
        speechRecognizer.recognizeOnceAsync((result) => {
          console.log(`RECOGNIZED: Text=${result.text}`);
          speechRecognizer.close();
        });
      }
      // fromStream();

      res.status(200).json({ text: result.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error during speech recognition" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

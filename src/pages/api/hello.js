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
        try {
          pushStream.write(req.body.data);

          let audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
          let speechRecognizer = new sdk.SpeechRecognizer(
            speechConfig,
            audioConfig
          );

          speechRecognizer.recognizeOnceAsync((result) => {
            switch (result.reason) {
              case sdk.ResultReason.RecognizedSpeech:
                console.log(`RECOGNIZED: Text=${result.text}`);
                break;
              case sdk.ResultReason.NoMatch:
                console.log("NOMATCH: Speech could not be recognized.");
                break;
              case sdk.ResultReason.Canceled:
                const cancellation = sdk.CancellationDetails.fromResult(result);
                console.log(`CANCELED: Reason=${cancellation.reason}`);

                if (cancellation.reason == sdk.CancellationReason.Error) {
                  console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
                  console.log(
                    `CANCELED: ErrorDetails=${cancellation.errorDetails}`
                  );
                  console.log(
                    "CANCELED: Did you set the speech resource key and region values?"
                  );
                }
                break;
            }
            res.status(200).json({ text: result.text });
            speechRecognizer.close();
          });
        } catch (error) {
          console.error("Error in fromStream:", error);
          // Do not re-throw, the outer catch block will handle the error response
        }
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

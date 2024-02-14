import * as sdk from "microsoft-cognitiveservices-speech-sdk";

let speech_key = "c41bf0a656084a2ea816acda01428722";
let speech_region = "eastasia";

class AudioQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.speechKey=speech_key;
    this.serviceRegion=speech_region;
  }

  enqueue(audioChunk) {
    this.queue.push(audioChunk);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue() {
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const audioChunk = this.queue.shift();
      try {
        await this.processAudioChunk(audioChunk);
      } catch (error) {
        console.error('Error processing audio chunk:', error);
        // Handle error (e.g., retry mechanism or logging)
      }
    }
    this.isProcessing = false;
  }

  async processAudioChunk(audioChunk) {
    const speechConfig = sdk.SpeechConfig.fromSubscription(this.speechKey, this.serviceRegion);
    const pushStream = sdk.AudioInputStream.createPushStream();

    pushStream.write(Buffer.from(audioChunk, "base64"));
    pushStream.close();

    let audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

    let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    speechRecognizer.recognizeOnceAsync(result => {
      console.log('====================================');
      console.log(result);
      console.log('====================================');
      console.log(`RECOGNIZED: Text=${result.text}`);
      // Handle the recognized text as needed
      speechRecognizer.close();
    }, error => {
      console.error(error);
      speechRecognizer.close();
    });
  }
}

// Singleton instance of the queue
const audioQueue = new AudioQueue();



export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        speech_key,
        speech_region
      );
      speechConfig.speechRecognitionLanguage = "en-US";
      const audioChunk = req.body.data;

      // Assuming audio file is sent in the request body
      audioQueue.enqueue(audioChunk);
     
      res.status(202).json({ message: "Audio chunk received and queued for processing" });


    //   const fromStream = async () => {
    //     let pushStream = sdk.AudioInputStream.createPushStream();
    //     pushStream.write(audioData);
    //     let audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    //     console.log(audioConfig);
    //     let speechRecognizer = new sdk.SpeechRecognizer(
    //       speechConfig,
    //       audioConfig
    //     );
       
    //     // Start continuous recognition
    //   //   speechRecognizer.recognizeOnceAsync(result => {
    //   //     console.log(result,"if any");
    //   //     switch (result.reason) {
    //   //       case sdk.ResultReason.RecognizedSpeech:
    //   //           console.log(`RECOGNIZED: Text=${result.text}`);
    //   //           break;
    //   //       case sdk.ResultReason.NoMatch:
    //   //           console.log("NOMATCH: Speech could not be recognized.");
    //   //           break;
    //   //       case sdk.ResultReason.Canceled:
    //   //           const cancellation = sdk.CancellationDetails.fromResult(result);
    //   //           console.log(`CANCELED: Reason=${cancellation.reason}`);
        
    //   //           if (cancellation.reason == sdk.CancellationReason.Error) {
    //   //               console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
    //   //               console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
    //   //           }
    //   //           break;
    //   //       }
    //   //     speechRecognizer.close();
    //   // });

    //     // Continuously push audio data

    //     speechRecognizer.startContinuousRecognitionAsync()

    //     // To stop speech recognition:
    //     // speechRecognizer.stopContinuousRecognitionAsync();
    //   };

    //  await fromStream();
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error during speech recognition" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

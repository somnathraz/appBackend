import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = handleDataAvailable;
      mediaRecorderRef.current.start();
    });
  }, []);

  const handleDataAvailable = (e) => {
    audioChunksRef.current.push(e.data);
    if (mediaRecorderRef.current.state === "inactive") {
      const audioBlob = new Blob(audioChunksRef.current);
      sendDataToServer(audioBlob);
    }
  };

  const sendDataToServer = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob);
    const response = await fetch("/api/hello", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      // Handle error
      console.error("An error occurred while sending audio data to the server");
    }
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div>
        <button disabled={recording}>Start Recording</button>
        <button disabled={!recording}>Stop Recording</button>
      </div>
    </main>
  );
}

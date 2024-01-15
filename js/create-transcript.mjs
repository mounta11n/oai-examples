import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

async function main() {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream("audio-full.m4a"),
    model: "whisper-1",
    language: "de",
    prompt: "Das Folgende ist ein Protokoll aus einem Meeting:",
  });
// Show the output
//  console.log(transcription.text);
// save the output into a text file
  fs.writeFileSync("transcription-full.txt", transcription.text);
}
main();

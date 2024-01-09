import fs from "fs";
import path from "path";
import OpenAI from '../../node_modules/openai/index.js';
import player from 'play-sound';

const openai = new OpenAI();
const audioPlayer = player();

const speechFile = path.resolve("./speech.mp3");

function playSound(filePath) {
  audioPlayer.play(filePath, function(err){
    if (err) throw err
  });
}

async function main() {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "onyx",
    input: "Heute ist ein wundervoller Tag, um etwas zu schaffen, das Menschen lieben werden!",
  });
  console.log(speechFile);
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
  playSound(speechFile);
}
main();

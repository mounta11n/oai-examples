import OpenAI from '../node_modules/openai/index.js';
import readline from 'readline-sync';
import player from 'play-sound';
import fs from "fs";
import path from "path";

const openai = new OpenAI();
const audioPlayer = player();

const queue = [];
let isPlaying = false;
let audioIndex = 0; // Counter for clear file names



// ----- Function to manage the queue ----- //
async function processQueue() {
  while (queue.length > 0 || isPlaying) {
    if (!isPlaying && queue.length > 0) {
      const filePath = queue.shift();
      isPlaying = true;
      playSound(filePath);
    }
    // Wait a short time before the loop is carried out again.
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}



// ----- Function to play a sound ----- //
function playSound(filePath) {
  audioPlayer.play(filePath, function(err){
    if (err) {
      console.error('Fehler beim Abspielen des Sounds:', err);
      isPlaying = false;
      return;
    }
    // After the current file was played, check the queue.
    if (queue.length > 0) {
      const nextFilePath = queue.shift();
      playSound(nextFilePath);
    } else {
      isPlaying = false;
    }
  });
}



// ----- Function to generate speech ----- //
async function textToSpeech(sentence) {
  const speechFile = path.resolve(`./speech-${audioIndex++}.mp3`);
  try {
    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: sentence,
    });

    if (!mp3Response || !mp3Response.arrayBuffer) {
      console.error('Unerwartete Antwort von der OpenAI API:', mp3Response);
      return;
    }

    const buffer = Buffer.from(await mp3Response.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);

    // Add the file to the queue or play it off immediately.
    if (isPlaying) {
      queue.push(speechFile);
    } else {
      isPlaying = true;
      playSound(speechFile);
    }
  } catch (error) {
    console.error('Fehler bei der Sprachgenerierung:', error);
  }
}



// ----- Main Function ----- //
async function main() {
    let messages = [
        {"role": "system", "content": "Du bist ein hilfsbereiter Assistent."},
    ];

    while (true) {
        const userInput = readline.question('Please enter your question: ');

        messages.push({"role": "user", "content": userInput});

        const stream = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            stream: true,
        });

        let llmOutput = '';

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          llmOutput += content;
          process.stdout.write(content);

          // Use a regex to check whether the content received ends a sentence.
          const sentenceEndRegex = /[.!?]\s+/;
          let sentences = llmOutput.split(sentenceEndRegex);
          if (sentences.length > 1) {
            // Process all sentences to the last one, since it may not yet be complete.
            for (let i = 0; i < sentences.length - 1; i++) {
              await textToSpeech(sentences[i] + '.');
            }
            // Save the last sentence for further processing.
            llmOutput = sentences[sentences.length - 1];
          }
        }

        // Process the last sentence even when the end of stream has been reached.
        if (llmOutput.trim() !== '') {
          await textToSpeech(llmOutput.trim() + '.');
        }

        messages.push({"role": "assistant", "content": llmOutput});
        await processQueue();
    }
}
main();

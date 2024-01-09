from openai import OpenAI

client = OpenAI()

response = client.audio.speech.create(
    model="tts-1",
    voice="nova",
    input="Heute ist ein wundervoller Tag, um etwas zu schaffen, das Menschen lieben werden!",
)

response.stream_to_file("output.mp3")

import pygame

# Initialisiere Pygame Mixer
pygame.mixer.init()

# Lade die Datei
pygame.mixer.music.load("output.mp3")

# Spiele die Datei ab
pygame.mixer.music.play()

# Warten, bis die Wiedergabe beendet ist
while pygame.mixer.music.get_busy() == True:
    continue

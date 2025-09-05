import os
import sys
from TTS.api import TTS
from pydub import AudioSegment

if len(sys.argv) < 2:
  print("Uso: python tts_generate.py <dirPath>")
  sys.exit(1)

dir_path = sys.argv[1]

# Modelo que suporta múltiplas vozes e clonagem (multilingual + VITS)
model_name = "tts_models/multilingual/multi-dataset/your_tts"
tts = TTS(model_name)

voice_sample = os.path.join(os.path.dirname(__file__), "untitled.wav")

# Lista de arquivos de entrada e saída
text_files = [
  (os.path.join(dir_path, "roteiro_curto.txt"), os.path.join(dir_path, "audio_curto.mp3")),
  (os.path.join(dir_path, "roteiro_longo.txt"), os.path.join(dir_path, "audio_longo.mp3"))
]

for txt_file, audio_file in text_files:
  if not os.path.exists(txt_file):
    print(f"⚠️ Arquivo {txt_file} não encontrado, pulando...")
    continue

  with open(txt_file, 'r', encoding='utf-8') as f:
    texto = f.read().strip()
  
  temp_wav = audio_file.replace(".mp3", "_temp.wav")
  tts.tts_to_file(
    text=texto,
    speaker_wav=voice_sample,
    language="pt-br",
    file_path=temp_wav
  )
  
  audio = AudioSegment.from_wav(temp_wav)
  audio = audio.speedup(playback_speed=1.1)
  audio.export(audio_file, format="mp3")
  os.remove(temp_wav)

  print(f"✅ Áudio salvo em {audio_file}")

print("🎉 Todos os áudios MP3 foram gerados com sucesso!")

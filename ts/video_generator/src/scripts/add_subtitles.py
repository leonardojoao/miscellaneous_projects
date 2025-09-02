import whisper
import subprocess
import sys
import os

if len(sys.argv) < 3:
    print("Uso: python add_subtitles.py <video_input> <video_output>")
    sys.exit(1)

video_input = sys.argv[1]
video_output = sys.argv[2]
ass_file = os.path.splitext(video_output)[0] + ".ass"

# Configurações
max_words_per_line = 6
font_size = 39
margin_bottom = 150
font_name = "Arial"
border_size = 15
bg_r, bg_g, bg_b = 192, 192, 192
bg_opacity = 153

def ass_backcolor(r, g, b, opacity):
    return f"&H{opacity:02X}{b:02X}{g:02X}{r:02X}"

backcolor_ass = ass_backcolor(bg_r, bg_g, bg_b, bg_opacity)

model = whisper.load_model("medium")
result = model.transcribe(video_input)

def format_ass_time(t):
    h, r = divmod(int(t), 3600)
    m, s = divmod(r, 60)
    cs = int((t - int(t)) * 100)
    return f"{h:d}:{m:02d}:{s:02d}.{cs:02d}"

ass_header = f"""[Script Info]
Title: Legenda estilo YouTube/Netflix
ScriptType: v4.00+
Collisions: Normal
PlayResX: 1920
PlayResY: 1080
Timer: 100.0000

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font_name},{font_size},&H00FFFFFF,&H000000FF,&H00000000,{backcolor_ass},0,0,0,0,100,100,0,0,3,{border_size},0,2,0,0,{margin_bottom},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

with open(ass_file, "w", encoding="utf-8") as f:
    f.write(ass_header)
    for segment in result["segments"]:
        start, end, text = segment["start"], segment["end"], segment["text"].strip()
        words = text.split()
        chunks = [" ".join(words[i:i+max_words_per_line]) for i in range(0, len(words), max_words_per_line)]
        total_time = end - start
        chunk_time = total_time / len(chunks)
        for i, chunk in enumerate(chunks):
            chunk_start = start + i * chunk_time
            chunk_end = start + (i + 1) * chunk_time
            f.write(f"Dialogue: 0,{format_ass_time(chunk_start)},{format_ass_time(chunk_end)},Default,,0,0,0,,{chunk}\n")

subprocess.run([
    "ffmpeg", "-i", video_input,
    "-vf", f"ass={ass_file}",
    "-c:a", "copy", "-pix_fmt", "yuv420p", "-loglevel", "error",
    video_output
])

print(f"✅ Vídeo exportado em: {video_output}")

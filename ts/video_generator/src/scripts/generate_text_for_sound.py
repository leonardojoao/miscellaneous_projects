import re
import sys
import ollama
import os

if len(sys.argv) < 4:
  print("❌ Uso: gerar_audios.py <dirPath> <productName> [ShortVideo(true|false)] [LongVideo(true|false)]")
  sys.exit(1)

dir_path = sys.argv[1]
product_name = sys.argv[2]
short_video = sys.argv[3].lower() == "true" if len(sys.argv) > 3 else False
long_video = sys.argv[4].lower() == "true" if len(sys.argv) > 4 else False

prompt = f"""
Crie um roteiro de vídeo de vendas em PORTUGUÊS para o produto:

{product_name}

Gere duas versões:

1. Versão curta – aproximadamente 1 minuto
2. Versão longa – aproximadamente 4 minutos

⚠️ Instruções:
- Entregue apenas a narração em texto, sem marcações de cena, instruções técnicas, parênteses ou qualquer outra marcação.
- Não inclua "(Cena: ...)", "(Texto na tela: ...)", "(Narração...)" etc.
- Não inclua instruções de música ou efeitos sonoros.
- Não inclua marcações de tempo como "(1 minuto)" ou "(30 segundos)".
- Não inclua "Narrador:", "Narradora:", "Voz em off:" etc.
- Escreva em tom natural, como se fosse uma pessoa falando.
- A versão curta deve ser objetiva, chamativa e envolvente.
- A versão longa deve detalhar benefícios, características e vantagens do produto, mas mantendo a narração natural.
"""

response = ollama.chat(
  model="gemma3:12b",
  messages=[{"role": "user", "content": prompt}]
)

texto = response["message"]["content"]

# Regex para separar versões
padrao_curta = re.compile(r'(?i)versão curta\s*[-–:]*\s*(.+?)(?=versão longa|$)', re.DOTALL)
padrao_longa = re.compile(r'(?i)versão longa\s*[-–:]*\s*(.+)', re.DOTALL)

versao_curta_match = padrao_curta.search(texto)
versao_longa_match = padrao_longa.search(texto)

versao_curta = versao_curta_match.group(1).strip() if versao_curta_match else texto.strip()
versao_longa = versao_longa_match.group(1).strip() if versao_longa_match else texto.strip()

# Limpeza
def limpar(txt: str) -> str:
  txt = re.sub(r'\(.*?min(?:uto)?s?.*?\)', '', txt, flags=re.IGNORECASE).strip()
  txt = re.sub(r'^\*+\s*', '', txt)
  txt = re.sub(r'\*+\s*$', '', txt)
  return txt.strip()

versao_curta = limpar(versao_curta)
versao_longa = limpar(versao_longa)

# Salvar de acordo com ShortVideo
if short_video:
  curto_path = os.path.join(dir_path, "roteiro_curto.txt")
  with open(curto_path, "w", encoding="utf-8") as f:
    f.write(versao_curta)
  print(f"✅ Versão curta salva em {curto_path}")
elif long_video:
  longo_path = os.path.join(dir_path, "roteiro_longo.txt")
  with open(longo_path, "w", encoding="utf-8") as f:
    f.write(versao_longa)
  print(f"✅ Versão longa salva em {longo_path}")
else:
  curto_path = os.path.join(dir_path, "roteiro_curto.txt")
  longo_path = os.path.join(dir_path, "roteiro_longo.txt")
  with open(curto_path, "w", encoding="utf-8") as f:
    f.write(versao_curta)
  with open(longo_path, "w", encoding="utf-8") as f:
    f.write(versao_longa)
  print(f"✅ Versões curta e longa salvas em {dir_path}")

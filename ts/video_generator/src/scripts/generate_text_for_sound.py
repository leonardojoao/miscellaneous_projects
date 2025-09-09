import re
import sys
import ollama
import os

if len(sys.argv) < 3:
	print("❌ Uso: gerar_audios.py <dirPath> <productName>")
	sys.exit(1)

dir_path = sys.argv[1]
product_name = sys.argv[2]

prompt = f"""
Crie um roteiro de vídeo de vendas em PORTUGUÊS para o produto:

{product_name}

Gere duas versões:

1. Versão curta – aproximadamente 1 minuto
2. Versão longa – aproximadamente 3 minutos e 30 segundos

⚠️ Instruções:
- Entregue apenas a narração em texto, sem marcações de cena, instruções técnicas, parênteses ou qualquer outra marcação.
- Não inclua "(Cena: ...)", "(Texto na tela: ...), "(Instruções tecnicas: ...)", "(Instruções tecnicas: ..." ou (Narração...).
- Não inclua instruções de música como "(Música animada...)" ou "(Música aumenta...) ou (Música suave...) ou (Música finaliza...)".
- NÃo inclua instruções de efeitos sonoros como "(Efeito sonoro...)" ou "(Som de...)".
- Não inclua marcações de tempo como "(1 minuto)", "(30 segundos)", "(3 minutos e 30 segundos)" ou similares.
- Não incluia açoes como "Ação:", "Ações:", "Narrador:", "Narradora:", "Voz em off:", "Voz do narrador:", "Voz da narradora:" ou similares.
- Escreva em tom natural, como se fosse uma pessoa falando.
- Todo o texto deve estar em português, sem trechos em inglês.
- A versão curta deve ser objetiva, chamativa e envolvente.
- A versão longa deve detalhar benefícios, características e vantagens do produto, mas mantendo a narração natural.
"""

response = ollama.chat(
	model='gemma3:12b',
	messages=[{'role': 'user', 'content': prompt}]
)

texto = response['message']['content']

padrao_curta = re.compile(r'(?i)versão curta\s*[-–:]*\s*(.+?)(?=versão longa|$)', re.DOTALL)
padrao_longa = re.compile(r'(?i)versão longa\s*[-–:]*\s*(.+)', re.DOTALL)

versao_curta_match = padrao_curta.search(texto)
versao_longa_match = padrao_longa.search(texto)

versao_curta = versao_curta_match.group(1).strip() if versao_curta_match else texto.strip()
versao_longa = versao_longa_match.group(1).strip() if versao_longa_match else texto.strip()

# limpar texto
versao_curta = re.sub(r'\(.*?min(?:uto)?s?.*?\)', '', versao_curta, flags=re.IGNORECASE).strip()
versao_longa = re.sub(r'\(.*?min(?:uto)?s?.*?\)', '', versao_longa, flags=re.IGNORECASE).strip()

for pattern in [r'^\*+\s*', r'\*+\s*$']:
	versao_curta = re.sub(pattern, '', versao_curta)
	versao_longa = re.sub(pattern, '', versao_longa)

# salva no diretório do produto
curto_path = os.path.join(dir_path, 'roteiro_curto.txt')
longo_path = os.path.join(dir_path, 'roteiro_longo.txt')

with open(curto_path, 'w', encoding='utf-8') as f:
	f.write(versao_curta.strip())

with open(longo_path, 'w', encoding='utf-8') as f:
	f.write(versao_longa.strip())

print(f"✅ Arquivos salvos em {dir_path}")

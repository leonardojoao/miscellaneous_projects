import sys
import ollama

# Lê argumentos
if len(sys.argv) < 2:
  print("❌ Uso: python generate_title.py <nome_do_produto>")
  sys.exit(1)

produto = sys.argv[1]

# Prompt para geração
prompt = f"""
Crie UM ÚNICO TÍTULO DE PRODUTO em português, otimizado para vendas online, incluindo emojis. 
Não inclua explicações, listas ou subtítulos, apenas o título.

Produto:
{produto}
"""

# Chama o modelo
response = ollama.chat(
  model="gemma3:12b",
  messages=[{"role": "user", "content": prompt}]
)

# Extrai e limpa o texto
descricao = response["message"]["content"].strip()
descricao = descricao.replace("**", "")

# Imprime no stdout (NestJS vai capturar)
print(descricao)

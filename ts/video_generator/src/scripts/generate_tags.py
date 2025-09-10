import sys
import ollama

# Lê argumentos
if len(sys.argv) < 2:
  print("❌ Uso: python generate_tags.py <nome_do_produto>")
  sys.exit(1)

produto = sys.argv[1]

# Prompt para geração
prompt = f"""
Crie apenas TAGS para o produto em português, separadas por vírgula, otimizadas para vendas online. 
Não inclua explicações, listas, títulos, subtítulos ou qualquer texto adicional. Apenas as tags.

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

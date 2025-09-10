import sys
import ollama

# Lê argumentos
if len(sys.argv) < 3:
  print("❌ Uso: python generate_description.py <nome_do_produto> <link>")
  sys.exit(1)

produto = sys.argv[1]
link = sys.argv[2]

# Prompt para geração
prompt = f"""
Crie uma DESCRIÇÃO DE PRODUTO em português, otimizada para vendas online.

Produto:
{produto}

Descrição base:
👉 Garanta já a sua: 🔗 {link}

Quer praticidade e uma vida mais saudável? 🍃
Com a Iogurteira Elétrica Izumi® Bivolt, você prepara até 1 litro de iogurte grego natural e cremoso em casa, de forma simples e econômica.

⚡ Benefícios do iogurte feito na Izumi®:
✅ Rico em proteínas (até 2x mais que o iogurte comum)
✅ Menos lactose, ajudando na digestão
✅ Cheio de probióticos que fortalecem o intestino e imunidade
✅ Super versátil: saboreie puro, com frutas, mel, cereais ou use em receitas doces e salgadas

👉 Garanta já a sua: 🔗 {link}

Instruções:
- Escreva em um único texto corrido, envolvente e persuasivo.
- Use emojis para reforçar os benefícios e deixar a descrição mais atrativa.
- Inclua hashtags.
- Inclua chamadas para curtir, compartilhar ou se inscrever (isso é só para vídeo).
- Destaque benefícios e diferenciais do produto.
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

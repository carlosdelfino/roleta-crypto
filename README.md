# Roleta Crypto

Roleta de sorteio com visual de cassino, valores mínimo e máximo configuráveis e QR Code fixo no centro. Aplicação React 19 com Vite. Interface em português, responsiva para celular e computador.

## Executar

Requer Node.js 20.19+ ou 22.12+.

```bash
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite. Para gerar a versão estática:

```bash
npm test
npm run build
npm run preview
```

Publique o diretório `dist/` em uma hospedagem estática. Para hospedagem em subpasta, execute `npm run build -- --base=./`.

## Como usar

1. Informe os valores mínimo e máximo, inclusive.
2. Escolha 0, 2 ou 4 casas decimais. Só valores representáveis nessa precisão participam.
3. Informe um link completo HTTP ou HTTPS: o QR Code é gerado localmente e atualizado na mesma tela.
4. Clique em **Girar roleta**. O resultado aparece após a animação e os seis últimos resultados ficam na tela.

O sorteio usa `crypto.getRandomValues` e amostragem por rejeição para evitar viés de módulo. Todos os valores válidos do intervalo têm a mesma probabilidade. Intervalos com até 2³² possibilidades são aceitos. Em intervalos grandes, a roda mostra até 24 valores ilustrativos; o segmento de parada exibe o valor efetivamente sorteado.

O QR Code fica parado enquanto a roda gira. Ele contém o link informado e não recebe o resultado como parâmetro. Não há carteira, transferência de criptomoedas, servidor de resgate nem persistência do histórico. A aplicação não fornece comprovação pública ou auditoria independente do sorteio. As fontes externas são opcionais, com fontes de sistema como alternativa.

## Deploy na Vercel

Importe este repositório no painel da Vercel. Selecione o preset **Vite**, comando de build `npm run build` e diretório de saída `dist`. O arquivo `vercel.json` já declara essas configurações. Não são necessárias variáveis de ambiente.

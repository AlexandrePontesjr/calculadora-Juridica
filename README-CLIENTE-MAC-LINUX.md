# Calculadora Juridica - uso local no macOS e Linux

## Como abrir no macOS

1. Extraia o pacote recebido para uma pasta fixa, por exemplo `~/Aplicativos/CalculadoraJuridica`.
2. Abra `Iniciar Calculadora Juridica.command`.
3. O navegador deve abrir automaticamente em `http://127.0.0.1:8000/`.
4. Mantenha a janela do Terminal aberta enquanto estiver usando o sistema.
5. Para encerrar, volte para o Terminal e pressione `ENTER`.

Se o macOS bloquear a abertura, use o clique direito no arquivo `.command` e escolha `Abrir`. Se o arquivo perder permissao de execucao, rode no Terminal:

```bash
chmod +x "Iniciar Calculadora Juridica.command"
```

## Como abrir no Linux

1. Extraia o pacote recebido para uma pasta fixa, por exemplo `~/CalculadoraJuridica`.
2. No terminal, entre na pasta extraida.
3. Execute:

```bash
./"Iniciar Calculadora Juridica.sh"
```

4. O navegador deve abrir automaticamente em `http://127.0.0.1:8000/`.
5. Para encerrar, volte para o terminal e pressione `ENTER`.

## Dados locais

Os dados extraidos ficam no arquivo:

```text
data/contracheques.db
```

Para backup, copie esse arquivo com a Calculadora Juridica fechada.

## Logs

Se o sistema nao abrir, consulte:

```text
logs/app-out.log
logs/app-err.log
```

## Porta local

O pacote usa a porta local `8000`. Se outro programa estiver usando essa porta, feche o outro programa e abra novamente o inicializador.

## Observacoes

- O pacote de macOS deve ser gerado em um macOS.
- O pacote de Linux deve ser gerado em Linux.
- Os PDFs importados e os dados extraidos ficam no computador local neste modo de uso.

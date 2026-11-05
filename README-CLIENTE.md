# Calculadora Juridica - uso local

## Como abrir

1. Extraia a pasta recebida para um local fixo do computador, por exemplo `C:\CalculadoraJuridica`.
2. Abra `Iniciar Calculadora Juridica.bat`.
3. O navegador deve abrir automaticamente em `http://127.0.0.1:8000/`.
4. Mantenha a janela do inicializador aberta enquanto estiver usando o sistema.
5. Para encerrar, volte para a janela do inicializador e pressione `ENTER`.

## Dados locais

Os dados extraidos ficam no arquivo:

```text
data\contracheques.db
```

Para backup, copie esse arquivo com a Calculadora Juridica fechada.

## Logs

Se o sistema nao abrir, consulte:

```text
logs\app-out.log
logs\app-err.log
```

## Porta local

O pacote usa a porta local `8000`. Se outro programa estiver usando essa porta, feche o outro programa e abra novamente `Iniciar Calculadora Juridica.bat`.

## Observacoes

- O sistema roda localmente no computador.
- Os PDFs importados e os dados extraidos nao precisam ser enviados para um servidor externo para este modo de uso.
- Nao apague as pastas `.venv`, `src`, `frontend`, `data` ou `logs` de dentro do pacote.

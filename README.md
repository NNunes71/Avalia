# Aprova! — Treinador de Exames

Aplicação local para criar e praticar testes. O servidor usa apenas a biblioteca padrão do Python; não são necessárias dependências externas.

## Executar

No Windows, iniciar `Abrir_Aprova.bat`. A aplicação abre em `http://localhost:8731/app/Testes_Treino_Visual_Analysis.html`. Mantém a janela do servidor aberta durante a utilização. Se ainda estiver aberto o servidor estático antigo, fecha-o primeiro para libertar a porta 8731; usar o mesmo endereço mantém acessíveis os dados guardados anteriormente no browser.

O servidor local é necessário para apresentar as pastas de projetos e guardar os dados diretamente em ficheiros.

## Estrutura

- `app/` — interface e lógica da aplicação.
- `vendor/` — PDF.js e o respetivo worker, partilhados pela aplicação.
- `projetos/` — cada subpasta representa um projeto e é detetada pelo menu.
- `projetos/AiDAPT/` — bancos de perguntas, referências e recursos do projeto AiDAPT.

Dentro de cada pasta de projeto, a aplicação guarda:

- `project.json` — nome e definições do projeto, incluindo as séries.
- `bancos/` — bancos de perguntas criados e respetivos bancos estáticos.
- `progresso/` — testes guardados, contador, perguntas vistas e perguntas erradas.
- `ficheiros/` — PDFs anexados ao projeto.
- `referencias/` e `recursos/` — documentos e recursos do projeto, quando aplicável.

Para um projeto aparecer no seletor, a sua pasta tem de estar diretamente dentro de `projetos/`. A aplicação também cria e atualiza o respetivo `project.json`. A pasta `AiDAPT` é predefinida e não pode ser apagada pela aplicação.

As chaves dos fornecedores de IA permanecem nas definições locais do browser; não são escritas em ficheiros do projeto.

## Desenvolvimento

O backend local está em `server.py`. Para adicionar um banco estático ao AiDAPT, colocá-lo em `projetos/AiDAPT/bancos/` e incluí-lo na página da aplicação. PDF.js e o respetivo worker ficam em `vendor/`.

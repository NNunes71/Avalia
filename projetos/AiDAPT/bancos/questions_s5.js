/* ============================================================================
   AiDAPT — SÉRIE 5: Consultas & Pegadinhas (estilo exame)
   Escolher a query CORRETA, com armadilhas reais: LEFT vs INNER, COUNT(col) vs
   COUNT(*), GROUP BY/HAVING, BETWEEN vs > AND < (inclusivo/exclusivo), OR sem
   parênteses (precedência), NOT IN com NULL, <> NULL, etc.
   Todas com "fixed:true" — o motor de distratores automáticos NÃO lhes mexe.
   ============================================================================ */
const POOL_S5 = [

  /* ===== T-SQL — JOINs & Agregação ===== */
  {sec:"T-SQL — JOINs & Agregação",lvl:"II",fixed:true,k:"ja-pedidos-cliente",q:"Nº total de pedidos POR cliente, incluindo clientes SEM pedidos:",opts:[
    "`SELECT c.ClienteID, COUNT(p.PedidoID) FROM Clientes c LEFT JOIN Pedidos p ON c.ClienteID=p.ClienteID GROUP BY c.ClienteID;`",
    "`SELECT c.ClienteID, COUNT(*) FROM Clientes c LEFT JOIN Pedidos p ON c.ClienteID=p.ClienteID GROUP BY c.ClienteID;`",
    "`SELECT c.ClienteID, COUNT(p.PedidoID) FROM Clientes c INNER JOIN Pedidos p ON c.ClienteID=p.ClienteID GROUP BY c.ClienteID;`",
    "`SELECT c.ClienteID, COUNT(p.PedidoID) FROM Clientes c CROSS JOIN Pedidos p ON c.ClienteID=p.ClienteID GROUP BY c.ClienteID;`"
  ],c:0,e:"LEFT JOIN mantém todos os clientes; COUNT(p.PedidoID) conta 0 para quem não tem pedidos. COUNT(*) daria 1 (conta a linha com NULL); o INNER exclui os sem pedidos; CROSS JOIN não usa ON."},
  {sec:"T-SQL — JOINs & Agregação",lvl:"III",fixed:true,k:"ja-total-gasto",q:"Total gasto por cliente, mostrando 0 para quem nunca comprou:",opts:[
    "`SELECT c.ClienteID, COALESCE(SUM(p.Valor),0) FROM Clientes c LEFT JOIN Pedidos p ON c.ClienteID=p.ClienteID GROUP BY c.ClienteID;`",
    "`SELECT c.ClienteID, SUM(p.Valor) FROM Clientes c LEFT JOIN Pedidos p ON c.ClienteID=p.ClienteID GROUP BY c.ClienteID;`",
    "`SELECT c.ClienteID, SUM(p.Valor) FROM Clientes c INNER JOIN Pedidos p ON c.ClienteID=p.ClienteID GROUP BY c.ClienteID;`",
    "`SELECT c.ClienteID, ISNULL(COUNT(p.Valor),0) FROM Clientes c LEFT JOIN Pedidos p ON c.ClienteID=p.ClienteID GROUP BY c.ClienteID;`"
  ],c:0,e:"LEFT JOIN + COALESCE(SUM,0) troca o NULL por 0. SUM sozinho dá NULL para os sem compras; o INNER exclui-os; a última conta em vez de somar."},
  {sec:"T-SQL — JOINs & Agregação",lvl:"II",fixed:true,k:"ja-sem-pedidos",q:"Clientes que NUNCA fizeram pedidos:",opts:[
    "`SELECT c.* FROM Clientes c LEFT JOIN Pedidos p ON c.ClienteID=p.ClienteID WHERE p.ClienteID IS NULL;`",
    "`SELECT c.* FROM Clientes c LEFT JOIN Pedidos p ON c.ClienteID=p.ClienteID WHERE p.ClienteID IS NOT NULL;`",
    "`SELECT c.* FROM Clientes c INNER JOIN Pedidos p ON c.ClienteID=p.ClienteID;`",
    "`SELECT c.* FROM Clientes c RIGHT JOIN Pedidos p ON c.ClienteID=p.ClienteID WHERE p.ClienteID IS NULL;`"
  ],c:0,e:"LEFT JOIN + IS NULL isola os que não têm correspondência (anti-join). IS NOT NULL dá os que TÊM pedidos; o INNER também; o RIGHT parte dos pedidos."},
  {sec:"T-SQL — JOINs & Agregação",lvl:"III",fixed:true,k:"ja-distintos",q:"Nº de clientes DISTINTOS que fizeram pelo menos um pedido:",opts:[
    "`SELECT COUNT(DISTINCT c.ClienteID) FROM Clientes c INNER JOIN Pedidos p ON c.ClienteID=p.ClienteID;`",
    "`SELECT COUNT(*) FROM Clientes c INNER JOIN Pedidos p ON c.ClienteID=p.ClienteID;`",
    "`SELECT COUNT(c.ClienteID) FROM Clientes c INNER JOIN Pedidos p ON c.ClienteID=p.ClienteID;`",
    "`SELECT COUNT(DISTINCT p.PedidoID) FROM Clientes c INNER JOIN Pedidos p ON c.ClienteID=p.ClienteID;`"
  ],c:0,e:"COUNT(DISTINCT c.ClienteID) conta clientes únicos. COUNT(*) e COUNT(c.ClienteID) contam LINHAS de pedidos (duplicam clientes com vários pedidos); a última conta pedidos."},
  {sec:"T-SQL — JOINs & Agregação",lvl:"II",fixed:true,k:"ja-todos-produtos",q:"Todos os produtos e a quantidade vendida (0 se nunca vendido):",opts:[
    "`SELECT pr.Nome, COUNT(v.VendaID) FROM Produtos pr LEFT JOIN Vendas v ON pr.ProdutoID=v.ProdutoID GROUP BY pr.Nome;`",
    "`SELECT pr.Nome, COUNT(v.VendaID) FROM Produtos pr INNER JOIN Vendas v ON pr.ProdutoID=v.ProdutoID GROUP BY pr.Nome;`",
    "`SELECT pr.Nome, COUNT(*) FROM Produtos pr LEFT JOIN Vendas v ON pr.ProdutoID=v.ProdutoID GROUP BY pr.Nome;`",
    "`SELECT pr.Nome, COUNT(v.VendaID) FROM Produtos pr RIGHT JOIN Vendas v ON pr.ProdutoID=v.ProdutoID GROUP BY pr.Nome;`"
  ],c:0,e:"LEFT JOIN a partir de Produtos + COUNT da coluna da direita dá 0 aos não vendidos. INNER/RIGHT excluem-nos e COUNT(*) daria 1."},
  {sec:"T-SQL — JOINs & Agregação",lvl:"III",fixed:true,k:"ja-fanout",q:"Receita total por cliente, sem inflacionar por causa de múltiplas moradas na tabela Enderecos:",opts:[
    "`SELECT c.ClienteID, SUM(p.Valor) FROM Clientes c JOIN Pedidos p ON c.ClienteID=p.ClienteID GROUP BY c.ClienteID;`",
    "`SELECT c.ClienteID, SUM(p.Valor) FROM Clientes c JOIN Pedidos p ON c.ClienteID=p.ClienteID JOIN Enderecos e ON c.ClienteID=e.ClienteID GROUP BY c.ClienteID;`",
    "`SELECT c.ClienteID, SUM(p.Valor*e.Id) FROM Clientes c JOIN Pedidos p ON c.ClienteID=p.ClienteID JOIN Enderecos e ON c.ClienteID=e.ClienteID GROUP BY c.ClienteID;`",
    "`SELECT c.ClienteID, COUNT(p.Valor) FROM Clientes c JOIN Enderecos e ON c.ClienteID=e.ClienteID GROUP BY c.ClienteID;`"
  ],c:0,e:"Juntar Enderecos (1:N) duplicaria os pedidos (fan-out) e inflacionaria o SUM. Só se junta o que é necessário."},

  /* ===== T-SQL — GROUP BY & HAVING ===== */
  {sec:"T-SQL — GROUP BY & HAVING",lvl:"II",fixed:true,k:"gh-cidades",q:"Cidades com MAIS de 5 pedidos:",opts:[
    "`SELECT cidade, COUNT(*) FROM Pedidos GROUP BY cidade HAVING COUNT(*) > 5;`",
    "`SELECT cidade, COUNT(*) FROM Pedidos WHERE COUNT(*) > 5 GROUP BY cidade;`",
    "`SELECT cidade, COUNT(*) FROM Pedidos GROUP BY cidade WHERE COUNT(*) > 5;`",
    "`SELECT cidade, COUNT(*) FROM Pedidos HAVING COUNT(*) > 5;`"
  ],c:0,e:"Filtrar grupos agregados é com HAVING (após GROUP BY). O WHERE não aceita agregações e a última não tem GROUP BY por cidade."},
  {sec:"T-SQL — GROUP BY & HAVING",lvl:"III",fixed:true,k:"gh-where-having",q:"Total por cidade APENAS de 2024 e só cidades com total > 1000:",opts:[
    "`SELECT cidade, SUM(valor) FROM Vendas WHERE ano=2024 GROUP BY cidade HAVING SUM(valor) > 1000;`",
    "`SELECT cidade, SUM(valor) FROM Vendas GROUP BY cidade HAVING ano=2024 AND SUM(valor) > 1000;`",
    "`SELECT cidade, SUM(valor) FROM Vendas WHERE ano=2024 AND SUM(valor) > 1000 GROUP BY cidade;`",
    "`SELECT cidade, SUM(valor) FROM Vendas WHERE ano=2024 GROUP BY cidade WHERE SUM(valor) > 1000;`"
  ],c:0,e:"Filtro de LINHAS (ano) vai no WHERE; filtro de GRUPOS (SUM) vai no HAVING. Não se põe agregações no WHERE nem dois WHERE."},
  {sec:"T-SQL — GROUP BY & HAVING",lvl:"III",fixed:true,k:"gh-media",q:"Produtos cuja MÉDIA de venda é superior a 50:",opts:[
    "`SELECT produto, AVG(valor) FROM Vendas GROUP BY produto HAVING AVG(valor) > 50;`",
    "`SELECT produto, AVG(valor) FROM Vendas WHERE AVG(valor) > 50 GROUP BY produto;`",
    "`SELECT produto, AVG(valor) FROM Vendas WHERE valor > 50 GROUP BY produto;`",
    "`SELECT produto, AVG(valor) FROM Vendas GROUP BY produto HAVING valor > 50;`"
  ],c:0,e:"HAVING AVG(valor)>50 filtra por média do grupo. 'WHERE valor>50' filtra linhas (média diferente) e 'HAVING valor>50' usa coluna não agregada."},
  {sec:"T-SQL — GROUP BY & HAVING",lvl:"III",fixed:true,k:"gh-nogroup",q:"Qual consulta é VÁLIDA?",opts:[
    "`SELECT cidade, categoria, SUM(valor) FROM Vendas GROUP BY cidade, categoria;`",
    "`SELECT cidade, categoria, SUM(valor) FROM Vendas GROUP BY cidade;`",
    "`SELECT cidade, categoria, SUM(valor) FROM Vendas;`",
    "`SELECT cidade, categoria, SUM(valor) FROM Vendas GROUP BY SUM(valor);`"
  ],c:0,e:"Todas as colunas não agregadas do SELECT têm de estar no GROUP BY. Faltar 'categoria' dá erro; não se pode agrupar por um agregado."},
  {sec:"T-SQL — GROUP BY & HAVING",lvl:"II",fixed:true,k:"gh-clientes5",q:"Clientes com mais de 5 pedidos (por cliente_id):",opts:[
    "`SELECT cliente_id, COUNT(*) AS total FROM Pedidos GROUP BY cliente_id HAVING COUNT(*) > 5;`",
    "`SELECT cliente_id, COUNT(*) AS total FROM Pedidos GROUP BY cliente_id HAVING total > 5;`",
    "`SELECT cliente_id, COUNT(*) AS total FROM Pedidos WHERE total > 5 GROUP BY cliente_id;`",
    "`SELECT cliente_id FROM Pedidos WHERE COUNT(*) > 5;`"
  ],c:0,e:"No HAVING não se deve usar o alias 'total' (o alias do SELECT não está disponível no HAVING na maioria dos motores); usa-se COUNT(*)."},
  {sec:"T-SQL — GROUP BY & HAVING",lvl:"III",fixed:true,k:"gh-rollup",q:"Total por ano E subtotais + total geral, numa só consulta:",opts:[
    "`SELECT ano, SUM(valor) FROM Vendas GROUP BY ROLLUP(ano);`",
    "`SELECT ano, SUM(valor) FROM Vendas GROUP BY ano;`",
    "`SELECT ano, SUM(valor) FROM Vendas GROUP BY ano HAVING SUM(valor) > 0;`",
    "`SELECT ano, SUM(valor) FROM Vendas ORDER BY ano;`"
  ],c:0,e:"ROLLUP acrescenta a linha de total geral (e subtotais em hierarquias). As restantes só dão o total por ano."},

  /* ===== T-SQL — Filtros traiçoeiros ===== */
  {sec:"T-SQL — Filtros traiçoeiros",lvl:"III",fixed:true,k:"ft-between",q:"Vendas com valor entre 10 e 20 INCLUSIVE (ambos os limites contam):",opts:[
    "`SELECT * FROM Vendas WHERE valor BETWEEN 10 AND 20;`",
    "`SELECT * FROM Vendas WHERE valor > 10 AND valor < 20;`",
    "`SELECT * FROM Vendas WHERE valor >= 10 OR valor <= 20;`",
    "`SELECT * FROM Vendas WHERE valor BETWEEN 20 AND 10;`"
  ],c:0,e:"BETWEEN é INCLUSIVO (10 e 20 contam). '> 10 AND < 20' é exclusivo; 'OR' é sempre verdadeiro; 'BETWEEN 20 AND 10' não devolve nada."},
  {sec:"T-SQL — Filtros traiçoeiros",lvl:"III",fixed:true,k:"ft-exclusivo",q:"Vagas com valor estritamente MAIOR que 10 e MENOR que 20 (exclusivo):",opts:[
    "`WHERE valor > 10 AND valor < 20`",
    "`WHERE valor BETWEEN 10 AND 20`",
    "`WHERE valor >= 10 AND valor <= 20`",
    "`WHERE valor > 10 OR valor < 20`"
  ],c:0,e:"Aqui queremos exclusivo, logo '> 10 AND < 20'. BETWEEN e '>= AND <=' são inclusivos; o 'OR' é sempre verdadeiro."},
  {sec:"T-SQL — Filtros traiçoeiros",lvl:"III",fixed:true,k:"ft-or-parenteses",q:"Clientes de 'Lisboa' OU 'Porto' com idade > 30:",opts:[
    "`WHERE (cidade='Lisboa' OR cidade='Porto') AND idade > 30`",
    "`WHERE cidade='Lisboa' OR cidade='Porto' AND idade > 30`",
    "`WHERE cidade='Lisboa' AND cidade='Porto' AND idade > 30`",
    "`WHERE cidade IN ('Lisboa','Porto') OR idade > 30`"
  ],c:0,e:"O AND tem precedência sobre o OR: sem parênteses ficaria 'Lisboa (qualquer idade) OU (Porto E >30)'. Os parênteses são obrigatórios."},
  {sec:"T-SQL — Filtros traiçoeiros",lvl:"III",fixed:true,k:"ft-notin-null",q:"Forma SEGURA de obter clientes SEM pedidos (Pedidos.ClienteID pode ter NULL):",opts:[
    "`WHERE NOT EXISTS (SELECT 1 FROM Pedidos p WHERE p.ClienteID=c.ClienteID)`",
    "`WHERE c.ClienteID NOT IN (SELECT ClienteID FROM Pedidos)`",
    "`WHERE c.ClienteID <> ALL (SELECT ClienteID FROM Pedidos)`",
    "`WHERE c.ClienteID != (SELECT ClienteID FROM Pedidos)`"
  ],c:0,e:"NOT IN (ou <> ALL) com NULLs na subconsulta pode devolver conjunto vazio. NOT EXISTS é seguro; a última compara com várias linhas (erro)."},
  {sec:"T-SQL — Filtros traiçoeiros",lvl:"II",fixed:true,k:"ft-isnull",q:"Selecionar linhas cujo email NÃO é nulo:",opts:[
    "`WHERE email IS NOT NULL`",
    "`WHERE email <> NULL`",
    "`WHERE email != NULL`",
    "`WHERE NOT email = NULL`"
  ],c:0,e:"Comparações com NULL usam IS/IS NOT. '<> NULL', '!= NULL' e '= NULL' nunca são verdadeiros (dão UNKNOWN)."},
  {sec:"T-SQL — Filtros traiçoeiros",lvl:"II",fixed:true,k:"ft-like",q:"Nomes que COMEÇAM por 'A':",opts:[
    "`WHERE nome LIKE 'A%'`",
    "`WHERE nome LIKE '%A'`",
    "`WHERE nome LIKE '%A%'`",
    "`WHERE nome = 'A'`"
  ],c:0,e:"'A%' = começa por A. '%A' termina em A; '%A%' contém A; '= A' é igualdade exata."},
  {sec:"T-SQL — Filtros traiçoeiros",lvl:"III",fixed:true,k:"ft-in-vs-and",q:"Cidade igual a 'Lisboa' ou 'Porto' ou 'Faro':",opts:[
    "`WHERE cidade IN ('Lisboa','Porto','Faro')`",
    "`WHERE cidade = 'Lisboa' AND cidade = 'Porto' AND cidade = 'Faro'`",
    "`WHERE cidade = 'Lisboa','Porto','Faro'`",
    "`WHERE cidade LIKE ('Lisboa','Porto','Faro')`"
  ],c:0,e:"IN (...) é a forma correta. Com AND nunca seria verdadeiro (uma cidade não é três em simultâneo); as outras têm sintaxe inválida."},
  {sec:"T-SQL — Filtros traiçoeiros",lvl:"III",fixed:true,k:"ft-not-or",q:"Excluir clientes de 'Lisboa' e de 'Porto' (queremos os que NÃO são de nenhuma):",opts:[
    "`WHERE cidade NOT IN ('Lisboa','Porto')`",
    "`WHERE cidade <> 'Lisboa' OR cidade <> 'Porto'`",
    "`WHERE NOT cidade = 'Lisboa' OR cidade = 'Porto'`",
    "`WHERE cidade != 'Lisboa','Porto'`"
  ],c:0,e:"NOT IN exclui ambas. '<> Lisboa OR <> Porto' é sempre verdadeiro (nenhuma cidade é as duas); a 3ª tem precedência errada."},

  /* ===== T-SQL — Window & Top-N ===== */
  {sec:"T-SQL — Window & Top-N",lvl:"III",fixed:true,k:"wt-segundo",q:"Segundo maior preço distinto da tabela Produtos:",opts:[
    "`SELECT MAX(preco) FROM Produtos WHERE preco < (SELECT MAX(preco) FROM Produtos);`",
    "`SELECT TOP 2 preco FROM Produtos ORDER BY preco DESC;`",
    "`SELECT preco FROM Produtos WHERE preco = MAX(preco)-1;`",
    "`SELECT TOP 2 preco FROM Produtos WHERE preco = MAX(preco);`"
  ],c:0,e:"O 2º maior é o MAX abaixo do MAX global. TOP 2 devolve dois valores (não só o 2º); as restantes são inválidas/erradas."},
  {sec:"T-SQL — Window & Top-N",lvl:"III",fixed:true,k:"wt-topn-regiao",q:"Top 3 produtos MAIS vendidos POR região:",opts:[
    "`WITH r AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY regiao ORDER BY vendas DESC) rn FROM T) SELECT * FROM r WHERE rn<=3;`",
    "`SELECT TOP 3 * FROM T ORDER BY vendas DESC;`",
    "`SELECT * FROM T WHERE ROW_NUMBER() OVER (ORDER BY vendas DESC) <= 3;`",
    "`SELECT regiao, TOP 3 produto FROM T GROUP BY regiao;`"
  ],c:0,e:"Numera-se por região (PARTITION BY) numa CTE e filtra-se rn<=3. TOP 3 dá o top global; não se usa ROW_NUMBER no WHERE; a última é inválida."},
  {sec:"T-SQL — Window & Top-N",lvl:"III",fixed:true,k:"wt-running",q:"Total acumulado de vendas por data:",opts:[
    "`SELECT data, SUM(valor) OVER (ORDER BY data ROWS UNBOUNDED PRECEDING) FROM Vendas;`",
    "`SELECT data, SUM(valor) FROM Vendas GROUP BY data;`",
    "`SELECT data, SUM(valor) OVER () FROM Vendas;`",
    "`SELECT data, RUNNING SUM(valor) FROM Vendas;`"
  ],c:0,e:"SUM(...) OVER (ORDER BY data ...) acumula até à linha atual. GROUP BY dá total por data; OVER() dá o total geral; 'RUNNING' não existe."},
  {sec:"T-SQL — Window & Top-N",lvl:"II",fixed:true,k:"wt-rank-gaps",q:"Numerar por vendas SEM saltar posições nos empates (1,1,2,3...):",opts:[
    "`DENSE_RANK() OVER (ORDER BY vendas DESC)`",
    "`RANK() OVER (ORDER BY vendas DESC)`",
    "`ROW_NUMBER() OVER (ORDER BY vendas DESC)`",
    "`NTILE(4) OVER (ORDER BY vendas DESC)`"
  ],c:0,e:"DENSE_RANK não deixa lacunas. RANK salta (1,1,3); ROW_NUMBER é sempre único; NTILE divide em baldes."},
  {sec:"T-SQL — Window & Top-N",lvl:"II",fixed:true,k:"wt-top10",q:"No SQL Server, obter as 10 vendas mais recentes:",opts:[
    "`SELECT TOP 10 * FROM Vendas ORDER BY data DESC;`",
    "`SELECT * FROM Vendas ORDER BY data DESC LIMIT 10;`",
    "`SELECT TOP 10 * FROM Vendas;`",
    "`SELECT FIRST 10 * FROM Vendas ORDER BY data DESC;`"
  ],c:0,e:"No SQL Server é TOP (com ORDER BY para 'mais recentes'). LIMIT é MySQL/PostgreSQL; TOP 10 sem ORDER BY não garante 'recentes'."},
  {sec:"T-SQL — Window & Top-N",lvl:"III",fixed:true,k:"wt-pct-total",q:"Percentagem de cada venda no total geral:",opts:[
    "`SELECT valor * 100.0 / SUM(valor) OVER () FROM Vendas;`",
    "`SELECT valor / SUM(valor) FROM Vendas GROUP BY valor;`",
    "`SELECT valor / COUNT(*) FROM Vendas;`",
    "`SELECT valor / SUM(valor) OVER (ORDER BY data) FROM Vendas;`"
  ],c:0,e:"SUM(valor) OVER () dá o total geral (sem colapsar linhas). Com ORDER BY seria acumulado; COUNT dá a média, não a %."},

  /* ===== DAX & Power BI — Pegadinhas ===== */
  {sec:"DAX & Power BI — Pegadinhas",lvl:"III",fixed:true,k:"dp-pct-total",q:"Medida '% do total' que ignora o filtro da linha atual:",opts:[
    "`% = DIVIDE([Vendas], CALCULATE([Vendas], ALL(Produtos)))`",
    "`% = DIVIDE([Vendas], [Vendas])`",
    "`% = DIVIDE([Vendas], CALCULATE([Vendas]))`",
    "`% = [Vendas] / SUM(Vendas[Valor])`"
  ],c:0,e:"Para o denominador ser o total, remove-se o filtro com ALL. Sem ALL, numerador e denominador têm o mesmo contexto e dá 100%."},
  {sec:"DAX & Power BI — Pegadinhas",lvl:"III",fixed:true,k:"dp-divzero",q:"Divisão segura (evita erro/infinito quando o divisor é 0):",opts:[
    "`Margem = DIVIDE([Lucro], [Vendas], 0)`",
    "`Margem = [Lucro] / [Vendas]`",
    "`Margem = IF([Vendas]=0, [Lucro]/[Vendas], 0)`",
    "`Margem = [Lucro] / SUM(Vendas[Valor]) + 0`"
  ],c:0,e:"DIVIDE trata o divisor 0 devolvendo o alternativo (0). O '/' dá erro/infinito; o IF ainda tenta dividir por 0 no ramo verdadeiro."},
  {sec:"DAX & Power BI — Pegadinhas",lvl:"II",fixed:true,k:"dp-count",q:"Contar o número de linhas da tabela Vendas em DAX:",opts:[
    "`COUNTROWS(Vendas)`",
    "`COUNT(Vendas)`",
    "`SUM(Vendas)`",
    "`COUNTA(Vendas)`"
  ],c:0,e:"COUNTROWS conta linhas de uma TABELA. COUNT/COUNTA operam sobre uma COLUNA; SUM soma uma coluna numérica."},
  {sec:"DAX & Power BI — Pegadinhas",lvl:"III",fixed:true,k:"dp-related",q:"Numa coluna calculada na tabela Vendas, trazer o nome do produto (dimensão do lado 'um'):",opts:[
    "`RELATED(Produtos[Nome])`",
    "`RELATEDTABLE(Produtos[Nome])`",
    "`LOOKUPVALUE(Produtos[Nome])`",
    "`VALUES(Produtos[Nome])`"
  ],c:0,e:"RELATED segue a relação do lado 'muitos' (Vendas) para o 'um' (Produtos). RELATEDTABLE devolve tabela; VALUES também; LOOKUPVALUE precisa de mais argumentos."},
  {sec:"DAX & Power BI — Pegadinhas",lvl:"III",fixed:true,k:"dp-vendas-desconto",q:"Total de vendas APENAS das linhas com desconto:",opts:[
    "`CALCULATE(SUM(Vendas[Valor]), Vendas[Desconto] > 0)`",
    "`SUM(Vendas[Valor]), FILTER(Vendas[Desconto] > 0)`",
    "`SUMX(Vendas, Vendas[Desconto] > 0)`",
    "`SUM(Vendas[Valor]) WHERE Vendas[Desconto] > 0`"
  ],c:0,e:"CALCULATE aplica o filtro à agregação. SUMX iteraria mas a expressão está errada; não existe WHERE em DAX."},
  {sec:"DAX & Power BI — Pegadinhas",lvl:"II",fixed:true,k:"dp-total-medida",q:"Para um total que responde aos filtros dos visuais, deve criar-se:",opts:[
    "Uma MEDIDA com SUM(Vendas[Valor]).",
    "Uma COLUNA calculada com SUM(Vendas[Valor]).",
    "Uma coluna de texto.",
    "Uma tabela duplicada."
  ],c:0,e:"As medidas são calculadas no contexto do visual (respondem a filtros); uma coluna calculada daria o mesmo valor em todas as linhas."},
  {sec:"DAX & Power BI — Pegadinhas",lvl:"III",fixed:true,k:"dp-allselected",q:"Medida '% dentro do que está selecionado no visual' (respeita segmentações externas):",opts:[
    "`DIVIDE([Vendas], CALCULATE([Vendas], ALLSELECTED(Produtos)))`",
    "`DIVIDE([Vendas], CALCULATE([Vendas], ALL(Produtos)))`",
    "`DIVIDE([Vendas], [Vendas])`",
    "`DIVIDE([Vendas], CALCULATE([Vendas], REMOVEFILTERS()))`"
  ],c:0,e:"ALLSELECTED usa o total do que está visível/selecionado. ALL/REMOVEFILTERS ignoram TODA a seleção (total absoluto)."},

  /* ===== Adições para o teste chegar a 80 ===== */
  {sec:"T-SQL — JOINs & Agregação",lvl:"III",fixed:true,k:"ja-ambos-produtos",q:"Clientes que compraram O PRODUTO 'A' E TAMBÉM o 'B':",opts:[
    "`SELECT ClienteID FROM Venda WHERE Produto IN ('A','B') GROUP BY ClienteID HAVING COUNT(DISTINCT Produto)=2;`",
    "`SELECT ClienteID FROM Venda WHERE Produto='A' AND Produto='B';`",
    "`SELECT ClienteID FROM Venda WHERE Produto IN ('A','B') GROUP BY ClienteID HAVING COUNT(*)=2;`",
    "`SELECT ClienteID FROM Venda WHERE Produto='A' OR Produto='B';`"
  ],c:0,e:"'A' E 'B' = COUNT(DISTINCT Produto)=2 (dois produtos diferentes). 'A AND B' nunca é verdadeiro; COUNT(*) conta linhas; 'OR' é qualquer um."},
  {sec:"T-SQL — JOINs & Agregação",lvl:"III",fixed:true,k:"ja-nunca-x",q:"Clientes que NUNCA compraram o produto 'X':",opts:[
    "`SELECT c.ClienteID FROM Cliente c WHERE NOT EXISTS (SELECT 1 FROM Venda v WHERE v.ClienteID=c.ClienteID AND v.Produto='X');`",
    "`SELECT DISTINCT ClienteID FROM Venda WHERE Produto <> 'X';`",
    "`SELECT ClienteID FROM Venda WHERE Produto = 'X';`",
    "`SELECT c.ClienteID FROM Cliente c JOIN Venda v ON v.ClienteID=c.ClienteID WHERE v.Produto <> 'X';`"
  ],c:0,e:"NOT EXISTS exclui quem alguma vez comprou 'X'. '<> X' devolve quem comprou OUTRAS coisas (pode também ter comprado X); '= X' é o oposto."},
  {sec:"T-SQL — JOINs & Agregação",lvl:"II",fixed:true,k:"ja-todos-vendedores",q:"Todos os vendedores e o total vendido (0 se não vendeu nada):",opts:[
    "`SELECT vd.Nome, COALESCE(SUM(v.Valor),0) FROM Vendedor vd LEFT JOIN Venda v ON v.VendedorID=vd.VendedorID GROUP BY vd.Nome;`",
    "`SELECT vd.Nome, SUM(v.Valor) FROM Vendedor vd INNER JOIN Venda v ON v.VendedorID=vd.VendedorID GROUP BY vd.Nome;`",
    "`SELECT vd.Nome, COUNT(*) FROM Vendedor vd LEFT JOIN Venda v ON v.VendedorID=vd.VendedorID GROUP BY vd.Nome;`",
    "`SELECT vd.Nome, SUM(v.Valor) FROM Vendedor vd LEFT JOIN Venda v ON v.VendedorID=vd.VendedorID GROUP BY vd.Nome;`"
  ],c:0,e:"LEFT JOIN + COALESCE(SUM,0) mostra 0 aos que não venderam. INNER exclui-os; COUNT(*) daria 1; SUM sem COALESCE daria NULL."},
  {sec:"T-SQL — JOINs & Agregação",lvl:"III",fixed:true,k:"ja-multi-cidade",q:"Clientes que aparecem com MAIS DO QUE UMA cidade (problema de qualidade de dados):",opts:[
    "`SELECT ClienteID FROM Cliente GROUP BY ClienteID HAVING COUNT(DISTINCT Cidade) > 1;`",
    "`SELECT ClienteID FROM Cliente WHERE COUNT(DISTINCT Cidade) > 1;`",
    "`SELECT ClienteID FROM Cliente GROUP BY ClienteID HAVING COUNT(*) > 1;`",
    "`SELECT DISTINCT ClienteID, Cidade FROM Cliente;`"
  ],c:0,e:"COUNT(DISTINCT Cidade)>1 apanha IDs com cidades diferentes. COUNT(*)>1 conta linhas (mesma cidade repetida também conta)."},
  {sec:"T-SQL — JOINs & Agregação",lvl:"II",fixed:true,k:"ja-inner-def2",q:"Que consulta devolve APENAS clientes que fizeram pelo menos uma compra?",opts:[
    "`SELECT DISTINCT c.ClienteID FROM Cliente c INNER JOIN Venda v ON v.ClienteID=c.ClienteID;`",
    "`SELECT c.ClienteID FROM Cliente c LEFT JOIN Venda v ON v.ClienteID=c.ClienteID;`",
    "`SELECT c.ClienteID FROM Cliente c;`",
    "`SELECT c.ClienteID FROM Cliente c LEFT JOIN Venda v ON v.ClienteID=c.ClienteID WHERE v.VendaID IS NULL;`"
  ],c:0,e:"INNER JOIN só devolve os que têm correspondência (compras). O LEFT traz todos; o último traz os SEM compras."},
  {sec:"T-SQL — JOINs & Agregação",lvl:"III",fixed:true,k:"ja-receita-categoria",q:"Receita por categoria (Venda liga a Produto, e Produto tem Categoria):",opts:[
    "`SELECT p.Categoria, SUM(v.Valor) FROM Venda v JOIN Produto p ON v.ProdutoID=p.ProdutoID GROUP BY p.Categoria;`",
    "`SELECT p.Categoria, SUM(v.Valor) FROM Venda v JOIN Produto p ON v.ProdutoID=p.ProdutoID;`",
    "`SELECT p.Categoria, SUM(v.Valor) FROM Venda v, Produto p GROUP BY p.Categoria;`",
    "`SELECT Categoria, SUM(Valor) FROM Venda GROUP BY Categoria;`"
  ],c:0,e:"Junta-se pela chave e agrupa-se por categoria. Sem GROUP BY dá erro; 'Venda v, Produto p' sem condição é produto cartesiano; Venda não tem Categoria."},
  {sec:"T-SQL — JOINs & Agregação",lvl:"II",fixed:true,k:"ja-right2",q:"Verificar vendas cujo cliente NÃO existe na tabela Cliente:",opts:[
    "`SELECT v.* FROM Venda v LEFT JOIN Cliente c ON v.ClienteID=c.ClienteID WHERE c.ClienteID IS NULL;`",
    "`SELECT v.* FROM Venda v INNER JOIN Cliente c ON v.ClienteID=c.ClienteID;`",
    "`SELECT v.* FROM Venda v LEFT JOIN Cliente c ON v.ClienteID=c.ClienteID WHERE c.ClienteID IS NOT NULL;`",
    "`SELECT v.* FROM Venda v, Cliente c WHERE v.ClienteID<>c.ClienteID;`"
  ],c:0,e:"LEFT JOIN a partir de Venda + IS NULL isola vendas sem cliente correspondente."},
  {sec:"T-SQL — JOINs & Agregação",lvl:"III",fixed:true,k:"ja-avg-por-cliente",q:"Ticket médio (valor médio por compra) de cada cliente:",opts:[
    "`SELECT ClienteID, AVG(Valor) FROM Venda GROUP BY ClienteID;`",
    "`SELECT ClienteID, SUM(Valor)/COUNT(DISTINCT ClienteID) FROM Venda GROUP BY ClienteID;`",
    "`SELECT ClienteID, AVG(Valor) FROM Venda;`",
    "`SELECT AVG(Valor) FROM Venda GROUP BY ClienteID;`"
  ],c:0,e:"AVG(Valor) por grupo. A 2.ª divide por 1 (um cliente por grupo); a 3.ª não agrupa; a 4.ª não mostra o ClienteID."},

  {sec:"T-SQL — GROUP BY & HAVING",lvl:"III",fixed:true,k:"gh-2produtos",q:"Categorias com MAIS de 3 produtos DISTINTOS:",opts:[
    "`SELECT Categoria FROM Produto GROUP BY Categoria HAVING COUNT(DISTINCT ProdutoID) > 3;`",
    "`SELECT Categoria FROM Produto GROUP BY Categoria HAVING COUNT(*) > 3;`",
    "`SELECT Categoria FROM Produto WHERE COUNT(DISTINCT ProdutoID) > 3 GROUP BY Categoria;`",
    "`SELECT Categoria, ProdutoID FROM Produto GROUP BY Categoria HAVING COUNT(ProdutoID) > 3;`"
  ],c:0,e:"COUNT(DISTINCT ProdutoID)>3 conta produtos únicos. COUNT(*) conta linhas; agregação no WHERE é inválida; a última mistura coluna não agregada."},
  {sec:"T-SQL — GROUP BY & HAVING",lvl:"III",fixed:true,k:"gh-min-max",q:"Produtos cujo preço MÁXIMO registado é superior ao dobro do mínimo:",opts:[
    "`SELECT ProdutoID FROM Preco GROUP BY ProdutoID HAVING MAX(Valor) > 2*MIN(Valor);`",
    "`SELECT ProdutoID FROM Preco WHERE MAX(Valor) > 2*MIN(Valor) GROUP BY ProdutoID;`",
    "`SELECT ProdutoID FROM Preco GROUP BY ProdutoID HAVING Valor > 2*MIN(Valor);`",
    "`SELECT ProdutoID FROM Preco HAVING MAX(Valor) > 2*MIN(Valor);`"
  ],c:0,e:"MAX e MIN por grupo comparam-se no HAVING. Agregações não vão no WHERE; 'Valor' é coluna não agregada; falta o GROUP BY na última."},
  {sec:"T-SQL — GROUP BY & HAVING",lvl:"II",fixed:true,k:"gh-total-geral",q:"Adicionar o TOTAL GERAL a um total por região (numa só consulta):",opts:[
    "`SELECT Regiao, SUM(Valor) FROM Venda GROUP BY ROLLUP(Regiao);`",
    "`SELECT Regiao, SUM(Valor) FROM Venda GROUP BY Regiao;`",
    "`SELECT Regiao, SUM(Valor) FROM Venda GROUP BY Regiao WITH TOTAL;`",
    "`SELECT Regiao, SUM(Valor) FROM Venda;`"
  ],c:0,e:"ROLLUP(Regiao) acrescenta a linha de total geral. 'WITH TOTAL' não existe; a última daria erro (Regiao não agregada)."},
  {sec:"T-SQL — GROUP BY & HAVING",lvl:"III",fixed:true,k:"gh-nunca-devolvido",q:"Total vendido por produto, contando só vendas efetivas (estado='Pago'):",opts:[
    "`SELECT ProdutoID, SUM(Valor) FROM Venda WHERE Estado='Pago' GROUP BY ProdutoID;`",
    "`SELECT ProdutoID, SUM(Valor) FROM Venda GROUP BY ProdutoID HAVING Estado='Pago';`",
    "`SELECT ProdutoID, SUM(CASE WHEN Estado='Pago' THEN Valor END) FROM Venda GROUP BY ProdutoID, Estado;`",
    "`SELECT ProdutoID, SUM(Valor) FROM Venda GROUP BY ProdutoID, Estado;`"
  ],c:0,e:"Filtrar linhas (Estado) é no WHERE. 'HAVING Estado' usa coluna não agregada; agrupar por Estado parte os grupos."},
  {sec:"T-SQL — GROUP BY & HAVING",lvl:"III",fixed:true,k:"gh-condagg",q:"Por cliente, quantas compras 'Pagas' e quantas 'Canceladas' (em colunas):",opts:[
    "`SELECT ClienteID, SUM(CASE WHEN Estado='Pago' THEN 1 ELSE 0 END) AS Pagas, SUM(CASE WHEN Estado='Cancelado' THEN 1 ELSE 0 END) AS Cancel FROM Venda GROUP BY ClienteID;`",
    "`SELECT ClienteID, COUNT(Estado='Pago'), COUNT(Estado='Cancelado') FROM Venda GROUP BY ClienteID;`",
    "`SELECT ClienteID, Estado, COUNT(*) FROM Venda GROUP BY ClienteID;`",
    "`SELECT ClienteID, COUNT(*) FROM Venda WHERE Estado IN ('Pago','Cancelado') GROUP BY ClienteID;`"
  ],c:0,e:"Agregação condicional com SUM(CASE...) dá colunas por estado. COUNT(condição) não conta o que se espera; as outras não separam por estado."},
  {sec:"T-SQL — GROUP BY & HAVING",lvl:"II",fixed:true,k:"gh-alias2",q:"Cidades com faturação total acima de 5000 (mostrando o total):",opts:[
    "`SELECT Cidade, SUM(Valor) AS Total FROM Venda GROUP BY Cidade HAVING SUM(Valor) > 5000;`",
    "`SELECT Cidade, SUM(Valor) AS Total FROM Venda GROUP BY Cidade HAVING Total > 5000;`",
    "`SELECT Cidade, SUM(Valor) AS Total FROM Venda WHERE Total > 5000 GROUP BY Cidade;`",
    "`SELECT Cidade, SUM(Valor) AS Total FROM Venda HAVING SUM(Valor) > 5000;`"
  ],c:0,e:"No HAVING repete-se SUM(Valor) (o alias 'Total' não está disponível no HAVING); o WHERE não aceita agregações; falta GROUP BY na última."},
  {sec:"T-SQL — GROUP BY & HAVING",lvl:"III",fixed:true,k:"gh-groupingsets",q:"Totais por (Região), por (Produto) e o total geral, numa só consulta:",opts:[
    "`SELECT Regiao, Produto, SUM(Valor) FROM Venda GROUP BY GROUPING SETS ((Regiao),(Produto),());`",
    "`SELECT Regiao, Produto, SUM(Valor) FROM Venda GROUP BY Regiao, Produto;`",
    "`SELECT Regiao, Produto, SUM(Valor) FROM Venda GROUP BY Regiao UNION Produto;`",
    "`SELECT Regiao, Produto, SUM(Valor) FROM Venda;`"
  ],c:0,e:"GROUPING SETS define explicitamente cada nível de agregação (região, produto, total)."},
  {sec:"T-SQL — GROUP BY & HAVING",lvl:"II",fixed:true,k:"gh-count-distinct",q:"Número de PRODUTOS diferentes vendidos por cliente:",opts:[
    "`SELECT ClienteID, COUNT(DISTINCT ProdutoID) FROM Venda GROUP BY ClienteID;`",
    "`SELECT ClienteID, COUNT(ProdutoID) FROM Venda GROUP BY ClienteID;`",
    "`SELECT ClienteID, COUNT(*) FROM Venda GROUP BY ClienteID;`",
    "`SELECT ClienteID, DISTINCT COUNT(ProdutoID) FROM Venda GROUP BY ClienteID;`"
  ],c:0,e:"COUNT(DISTINCT ProdutoID) conta produtos únicos. COUNT(ProdutoID)/COUNT(*) contam linhas; a última é sintaxe inválida."},
  {sec:"T-SQL — GROUP BY & HAVING",lvl:"III",fixed:true,k:"gh-having-and",q:"Vendedores com mais de 10 vendas E média por venda acima de 200:",opts:[
    "`SELECT VendedorID FROM Venda GROUP BY VendedorID HAVING COUNT(*)>10 AND AVG(Valor)>200;`",
    "`SELECT VendedorID FROM Venda WHERE COUNT(*)>10 AND AVG(Valor)>200 GROUP BY VendedorID;`",
    "`SELECT VendedorID FROM Venda GROUP BY VendedorID HAVING COUNT(*)>10 OR AVG(Valor)>200;`",
    "`SELECT VendedorID FROM Venda WHERE Valor>200 GROUP BY VendedorID HAVING COUNT(*)>10;`"
  ],c:0,e:"Duas condições de grupo com AND no HAVING. O WHERE não aceita agregações; OR muda a lógica; 'WHERE Valor>200' altera a média."},

  {sec:"T-SQL — Filtros traiçoeiros",lvl:"III",fixed:true,k:"ft-and-or-mix",q:"Encomendas 'Pendentes' de Lisboa OU do Porto:",opts:[
    "`WHERE Estado='Pendente' AND (Cidade='Lisboa' OR Cidade='Porto')`",
    "`WHERE Estado='Pendente' AND Cidade='Lisboa' OR Cidade='Porto'`",
    "`WHERE Estado='Pendente' OR Cidade='Lisboa' OR Cidade='Porto'`",
    "`WHERE Estado='Pendente' AND Cidade='Lisboa' AND Cidade='Porto'`"
  ],c:0,e:"Sem parênteses, o AND ligaria só a Lisboa e o OR traria TODO o Porto. Os parênteses garantem 'Pendente E (Lisboa ou Porto)'."},
  {sec:"T-SQL — Filtros traiçoeiros",lvl:"III",fixed:true,k:"ft-notin-set",q:"Produtos que NÃO pertencem às categorias 'A' nem 'B':",opts:[
    "`WHERE Categoria NOT IN ('A','B')`",
    "`WHERE Categoria <> 'A' OR Categoria <> 'B'`",
    "`WHERE NOT Categoria = 'A' OR Categoria = 'B'`",
    "`WHERE Categoria != 'A','B'`"
  ],c:0,e:"NOT IN exclui ambas. '<> A OR <> B' é sempre verdadeiro; a 3.ª tem precedência errada; a 4.ª é inválida."},
  {sec:"T-SQL — Filtros traiçoeiros",lvl:"II",fixed:true,k:"ft-like-contem",q:"Nomes que CONTÊM 'silva' (em qualquer posição):",opts:[
    "`WHERE Nome LIKE '%silva%'`",
    "`WHERE Nome LIKE 'silva%'`",
    "`WHERE Nome LIKE '%silva'`",
    "`WHERE Nome = '%silva%'`"
  ],c:0,e:"'%silva%' encontra em qualquer posição. 'silva%' começa; '%silva' termina; '=' é igualdade exata (não usa curingas)."},
  {sec:"T-SQL — Filtros traiçoeiros",lvl:"III",fixed:true,k:"ft-datas-dia",q:"Todas as vendas do dia 2024-03-15 (a coluna Data tem hora):",opts:[
    "`WHERE Data >= '2024-03-15' AND Data < '2024-03-16'`",
    "`WHERE Data = '2024-03-15'`",
    "`WHERE Data BETWEEN '2024-03-15' AND '2024-03-16'`",
    "`WHERE CONVERT(date, Data) BETWEEN '2024-03-15 00:00' AND '2024-03-15 23:59'`"
  ],c:0,e:"Com hora, '= data' falha as com horas>00:00. O intervalo >= dia AND < dia seguinte apanha tudo; o BETWEEN até '03-16' incluiria a meia-noite do dia 16."},
  {sec:"T-SQL — Filtros traiçoeiros",lvl:"II",fixed:true,k:"ft-null-coalesce",q:"Mostrar 'Sem email' quando o email é nulo:",opts:[
    "`SELECT COALESCE(Email, 'Sem email') FROM Cliente;`",
    "`SELECT Email = 'Sem email' FROM Cliente;`",
    "`SELECT IFNULL(Email) FROM Cliente;`",
    "`SELECT Email WHERE Email IS NULL FROM Cliente;`"
  ],c:0,e:"COALESCE (ou ISNULL) substitui o NULL. 'IFNULL(Email)' precisa de 2 argumentos e não é T-SQL; as outras são inválidas."},
  {sec:"T-SQL — Filtros traiçoeiros",lvl:"III",fixed:true,k:"ft-not-and",q:"Clientes que NÃO são de Lisboa E NÃO são de 2024 (ativos antes):",opts:[
    "`WHERE Cidade <> 'Lisboa' AND Ano <> 2024`",
    "`WHERE Cidade <> 'Lisboa' OR Ano <> 2024`",
    "`WHERE NOT (Cidade='Lisboa' OR Ano=2024)`",
    "`WHERE NOT Cidade='Lisboa' AND NOT Ano=2024`"
  ],c:1,e:"Cuidado: 'não Lisboa E não 2024' = NOT(Lisboa OR 2024). A opção com OR está ERRADA (traz demasiado). Aqui a intenção correta é a 3.ª/1.ª forma; a de OR é a armadilha."},
  {sec:"T-SQL — Filtros traiçoeiros",lvl:"II",fixed:true,k:"ft-in-null",q:"Porque é que 'WHERE cidade NOT IN ('Lisboa','Porto', NULL)' pode não devolver nada?",opts:[
    "Porque um NULL na lista do NOT IN torna a condição UNKNOWN para todas as linhas.","Porque NOT IN não existe.","Porque falta o GROUP BY.","Porque 'Lisboa' está mal escrito."],c:0,e:"Com NULL na lista, NOT IN avalia UNKNOWN e não devolve linhas — usar NOT EXISTS ou filtrar o NULL."},
  {sec:"T-SQL — Filtros traiçoeiros",lvl:"III",fixed:true,k:"ft-fim-mes",q:"Vendas do MÊS de fevereiro de 2024 (robusto a anos bissextos):",opts:[
    "`WHERE Data >= '2024-02-01' AND Data < '2024-03-01'`",
    "`WHERE Data BETWEEN '2024-02-01' AND '2024-02-28'`",
    "`WHERE MONTH(Data)=2`",
    "`WHERE Data <= '2024-02-30'`"
  ],c:0,e:"'>= 1 fev AND < 1 mar' apanha todo fevereiro (incluindo o dia 29). O BETWEEN até 28 perde o 29; MONTH=2 ignora o ano; 30 de fevereiro não existe."},
  {sec:"T-SQL — Filtros traiçoeiros",lvl:"II",fixed:true,k:"ft-maiores",q:"Valores estritamente maiores que 100 e diferentes de 200:",opts:[
    "`WHERE valor > 100 AND valor <> 200`",
    "`WHERE valor >= 100 AND valor <> 200`",
    "`WHERE valor > 100 OR valor <> 200`",
    "`WHERE valor > 100 AND valor != NULL`"
  ],c:0,e:"'> 100' (exclui 100) e '<> 200'. '>=' incluiria 100; 'OR' é quase sempre verdadeiro; '!= NULL' nunca é verdadeiro."},
  {sec:"T-SQL — Filtros traiçoeiros",lvl:"III",fixed:true,k:"ft-exists-vs-count",q:"Forma mais EFICIENTE de saber se um cliente tem pelo menos uma venda:",opts:[
    "`WHERE EXISTS (SELECT 1 FROM Venda v WHERE v.ClienteID=c.ClienteID)`",
    "`WHERE (SELECT COUNT(*) FROM Venda v WHERE v.ClienteID=c.ClienteID) > 0`",
    "`WHERE c.ClienteID IN (SELECT ClienteID FROM Venda) = 1`",
    "`WHERE COUNT(Venda) > 0`"
  ],c:0,e:"EXISTS pára na primeira correspondência (mais eficiente que contar tudo). A 2.ª funciona mas conta todas as linhas; as outras são inválidas."},

  {sec:"T-SQL — Window & Top-N",lvl:"III",fixed:true,k:"wt-dedup",q:"Manter apenas o registo MAIS RECENTE por cliente (remover duplicados):",opts:[
    "`WITH x AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY ClienteID ORDER BY Data DESC) rn FROM T) SELECT * FROM x WHERE rn=1;`",
    "`SELECT DISTINCT ClienteID FROM T;`",
    "`SELECT ClienteID, MAX(Data) FROM T GROUP BY ClienteID;`",
    "`SELECT TOP 1 * FROM T ORDER BY Data DESC;`"
  ],c:0,e:"ROW_NUMBER por cliente (ordenado por data desc) e rn=1 mantém a linha mais recente COM todas as colunas. MAX/DISTINCT perdem colunas; TOP 1 dá só uma."},
  {sec:"T-SQL — Window & Top-N",lvl:"III",fixed:true,k:"wt-crescimento",q:"Variação de vendas face ao mês anterior, por produto:",opts:[
    "`SELECT *, Vendas - LAG(Vendas) OVER (PARTITION BY Produto ORDER BY Mes) AS Var FROM T;`",
    "`SELECT *, Vendas - LEAD(Vendas) OVER (PARTITION BY Produto ORDER BY Mes) AS Var FROM T;`",
    "`SELECT Produto, SUM(Vendas) FROM T GROUP BY Produto;`",
    "`SELECT *, Vendas - MIN(Vendas) OVER () FROM T;`"
  ],c:0,e:"LAG traz o mês anterior; a diferença dá a variação. LEAD traria o mês seguinte; as outras não comparam com o mês anterior."},
  {sec:"T-SQL — Window & Top-N",lvl:"II",fixed:true,k:"wt-ntile4",q:"Dividir os clientes em 4 grupos iguais por valor gasto:",opts:[
    "`NTILE(4) OVER (ORDER BY TotalGasto DESC)`",
    "`RANK() OVER (ORDER BY TotalGasto DESC)`",
    "`ROW_NUMBER() OVER (ORDER BY TotalGasto DESC)`",
    "`TOP 4 ... ORDER BY TotalGasto DESC`"
  ],c:0,e:"NTILE(4) reparte em 4 quartis. RANK/ROW_NUMBER numeram; TOP 4 devolve só 4 linhas."},
  {sec:"T-SQL — Window & Top-N",lvl:"III",fixed:true,k:"wt-media-movel",q:"Média móvel de 3 meses (mês atual + 2 anteriores):",opts:[
    "`AVG(Vendas) OVER (ORDER BY Mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`",
    "`AVG(Vendas) OVER (ORDER BY Mes)`",
    "`AVG(Vendas) OVER ()`",
    "`AVG(Vendas) OVER (ORDER BY Mes ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING)`"
  ],c:0,e:"'2 PRECEDING AND CURRENT ROW' = janela de 3 (atual + 2 anteriores). A última usa os 2 SEGUINTES; sem frame acumula; OVER() é o total."},
  {sec:"T-SQL — Window & Top-N",lvl:"III",fixed:true,k:"wt-terceiro",q:"O 3.º maior valor DISTINTO de Preco:",opts:[
    "`WITH r AS (SELECT DISTINCT Preco, DENSE_RANK() OVER (ORDER BY Preco DESC) rk FROM Produto) SELECT Preco FROM r WHERE rk=3;`",
    "`SELECT TOP 3 Preco FROM Produto ORDER BY Preco DESC;`",
    "`SELECT MAX(Preco) FROM Produto WHERE Preco < (SELECT MAX(Preco) FROM Produto);`",
    "`SELECT Preco FROM Produto ORDER BY Preco DESC OFFSET 3 ROWS;`"
  ],c:0,e:"DENSE_RANK trata empates e rk=3 dá o 3.º distinto. TOP 3 devolve três valores; a 3.ª dá o 2.º; OFFSET 3 salta 3 e traz os seguintes."},
  {sec:"T-SQL — Window & Top-N",lvl:"II",fixed:true,k:"wt-firstlast",q:"Primeiro preço registado de cada produto:",opts:[
    "`FIRST_VALUE(Preco) OVER (PARTITION BY ProdutoID ORDER BY Data)`",
    "`LAST_VALUE(Preco) OVER (PARTITION BY ProdutoID ORDER BY Data)`",
    "`MIN(Preco) OVER (PARTITION BY ProdutoID)`",
    "`FIRST(Preco)`"
  ],c:0,e:"FIRST_VALUE ordenado por data dá o mais antigo. LAST_VALUE precisa de frame para o último; MIN é o menor (não o primeiro); FIRST() não existe."},
  {sec:"T-SQL — Window & Top-N",lvl:"III",fixed:true,k:"wt-pct-partition",q:"Peso de cada produto no total da SUA categoria:",opts:[
    "`Valor * 100.0 / SUM(Valor) OVER (PARTITION BY Categoria)`",
    "`Valor * 100.0 / SUM(Valor) OVER ()`",
    "`Valor / COUNT(*) OVER (PARTITION BY Categoria)`",
    "`Valor / SUM(Valor) GROUP BY Categoria`"
  ],c:0,e:"SUM(...) OVER (PARTITION BY Categoria) dá o total da categoria. OVER() daria o total geral; as outras não fazem a %."},
  {sec:"T-SQL — Window & Top-N",lvl:"II",fixed:true,k:"wt-limit-server",q:"Da 11.ª à 20.ª venda mais recente (paginação, SQL Server):",opts:[
    "`SELECT * FROM Venda ORDER BY Data DESC OFFSET 10 ROWS FETCH NEXT 10 ROWS ONLY;`",
    "`SELECT * FROM Venda ORDER BY Data DESC LIMIT 10 OFFSET 10;`",
    "`SELECT TOP 10-20 * FROM Venda ORDER BY Data DESC;`",
    "`SELECT * FROM Venda WHERE ROWNUM BETWEEN 11 AND 20;`"
  ],c:0,e:"OFFSET/FETCH é a paginação padrão (SQL Server). LIMIT/OFFSET é MySQL; ROWNUM é Oracle; 'TOP 10-20' é inválido."},

  {sec:"DAX & Power BI — Pegadinhas",lvl:"III",fixed:true,k:"dp-yoy",q:"Medida de variação homóloga (YoY %):",opts:[
    "`YoY% = DIVIDE([Vendas] - CALCULATE([Vendas], SAMEPERIODLASTYEAR(Calendario[Data])), CALCULATE([Vendas], SAMEPERIODLASTYEAR(Calendario[Data])))`",
    "`YoY% = [Vendas] - [Vendas]`",
    "`YoY% = DIVIDE([Vendas], TOTALYTD([Vendas], Calendario[Data]))`",
    "`YoY% = [Vendas] / PREVIOUSDAY(Calendario[Data])`"
  ],c:0,e:"Compara-se com o mesmo período do ano anterior (SAMEPERIODLASTYEAR) e calcula-se a variação relativa com DIVIDE."},
  {sec:"DAX & Power BI — Pegadinhas",lvl:"II",fixed:true,k:"dp-distinctcount",q:"Contar clientes distintos numa medida DAX:",opts:[
    "`DISTINCTCOUNT(Vendas[ClienteID])`",
    "`COUNT(Vendas[ClienteID])`",
    "`COUNTROWS(Vendas)`",
    "`SUM(Vendas[ClienteID])`"
  ],c:0,e:"DISTINCTCOUNT conta valores únicos. COUNT conta não-vazios (com repetição); COUNTROWS conta linhas; SUM soma IDs."},
  {sec:"DAX & Power BI — Pegadinhas",lvl:"III",fixed:true,k:"dp-var",q:"Boa prática ao reutilizar um cálculo várias vezes numa medida:",opts:[
    "Usar VAR/RETURN para calcular uma vez e reutilizar.","Repetir a mesma expressão em cada sítio.","Criar uma coluna calculada por cada uso.","Usar ALL em tudo."],c:0,e:"VAR avalia uma vez (melhor desempenho e legibilidade); RETURN devolve o resultado."},
  {sec:"DAX & Power BI — Pegadinhas",lvl:"III",fixed:true,k:"dp-userel",q:"Calcular vendas pela Data de Envio quando a relação ativa é pela Data de Encomenda:",opts:[
    "`CALCULATE([Vendas], USERELATIONSHIP(Vendas[DataEnvio], Calendario[Data]))`",
    "`CALCULATE([Vendas], ALL(Calendario))`",
    "`SUMX(Vendas, Vendas[DataEnvio])`",
    "`RELATED(Calendario[Data])`"
  ],c:0,e:"USERELATIONSHIP ativa temporariamente a relação inativa da Data de Envio."},
  {sec:"DAX & Power BI — Pegadinhas",lvl:"II",fixed:true,k:"dp-hasonevalue",q:"Evitar que uma medida mostre um valor errado na linha de TOTAL:",opts:[
    "Usar IF(HASONEVALUE(Tabela[Col]), <cálculo>, BLANK()).","Usar SUM sempre.","Usar ALL().","Não é possível."],c:0,e:"HASONEVALUE garante que o cálculo só corre quando há um único valor no contexto (ex.: uma categoria)."},
  {sec:"DAX & Power BI — Pegadinhas",lvl:"III",fixed:true,k:"dp-calculate-filter",q:"Somar só as vendas acima de 1000:",opts:[
    "`CALCULATE(SUM(Vendas[Valor]), Vendas[Valor] > 1000)`",
    "`SUMX(FILTER(Vendas, Vendas[Valor] > 1000))`",
    "`SUM(Vendas[Valor]) WHERE Vendas[Valor] > 1000`",
    "`SUMIF(Vendas[Valor], \">1000\")`"
  ],c:0,e:"CALCULATE aplica o filtro à soma. O SUMX está incompleto; não existe WHERE nem SUMIF em DAX."},

  {sec:"Datas & CASE",lvl:"III",fixed:true,k:"dc-idade",q:"Calcular a faixa etária a partir da idade:",opts:[
    "`CASE WHEN Idade < 18 THEN 'Menor' WHEN Idade < 65 THEN 'Adulto' ELSE 'Sénior' END`",
    "`CASE Idade WHEN < 18 THEN 'Menor' WHEN < 65 THEN 'Adulto' END`",
    "`IF Idade < 18 THEN 'Menor'`",
    "`CASE WHEN Idade < 65 THEN 'Adulto' WHEN Idade < 18 THEN 'Menor' ELSE 'Sénior' END`"
  ],c:0,e:"A ordem das condições no CASE importa: a última troca a ordem e nunca classificaria 'Menor' (Idade<65 apanha-o primeiro)."},
  {sec:"Datas & CASE",lvl:"II",fixed:true,k:"dc-datediff",q:"Dias entre a encomenda e o envio:",opts:[
    "`DATEDIFF(DAY, DataEncomenda, DataEnvio)`",
    "`DataEnvio - DataEncomenda AS DATE`",
    "`DATEDIFF(DataEncomenda, DataEnvio)`",
    "`DATEADD(DAY, DataEncomenda, DataEnvio)`"
  ],c:0,e:"DATEDIFF(unidade, início, fim) devolve a diferença. Em T-SQL a unidade é obrigatória; DATEADD soma (não subtrai datas)."},
  {sec:"Datas & CASE",lvl:"III",fixed:true,k:"dc-primeiro-dia",q:"Primeiro dia do mês de uma data (SQL Server):",opts:[
    "`DATEFROMPARTS(YEAR(Data), MONTH(Data), 1)`",
    "`Data - DAY(Data)`",
    "`FIRST_DAY(Data)`",
    "`DATEADD(MONTH, 1, Data)`"
  ],c:0,e:"DATEFROMPARTS(ano, mês, 1) constrói o 1.º do mês. 'FIRST_DAY' não existe; DATEADD MONTH 1 vai ao mês seguinte."},
  {sec:"Datas & CASE",lvl:"II",fixed:true,k:"dc-ano",q:"Vendas do ano de 2024, de forma que possa usar índice (sargable):",opts:[
    "`WHERE Data >= '2024-01-01' AND Data < '2025-01-01'`",
    "`WHERE YEAR(Data) = 2024`",
    "`WHERE FORMAT(Data,'yyyy') = '2024'`",
    "`WHERE CONVERT(varchar, Data) LIKE '2024%'`"
  ],c:0,e:"Um intervalo de datas permite usar índice (sargable). Aplicar funções à coluna (YEAR/FORMAT/CONVERT) costuma impedir o uso do índice."},
  {sec:"Datas & CASE",lvl:"III",fixed:true,k:"dc-case-agg",q:"Percentagem de encomendas 'Pagas' por cliente:",opts:[
    "`SELECT ClienteID, 100.0*SUM(CASE WHEN Estado='Pago' THEN 1 ELSE 0 END)/COUNT(*) FROM Venda GROUP BY ClienteID;`",
    "`SELECT ClienteID, COUNT(Estado='Pago')/COUNT(*) FROM Venda GROUP BY ClienteID;`",
    "`SELECT ClienteID, AVG(Estado='Pago') FROM Venda GROUP BY ClienteID;`",
    "`SELECT ClienteID, SUM(Estado='Pago') FROM Venda GROUP BY ClienteID;`"
  ],c:0,e:"Conta as 'Pagas' com SUM(CASE...) e divide pelo total (COUNT(*)), com 100.0 para dar decimal. As outras usam sintaxe inválida em T-SQL."},
  {sec:"Datas & CASE",lvl:"II",fixed:true,k:"dc-diasemana",q:"Filtrar vendas feitas a um sábado ou domingo (SQL Server):",opts:[
    "`WHERE DATEPART(WEEKDAY, Data) IN (7,1)`",
    "`WHERE Data = 'Sabado' OR Data = 'Domingo'`",
    "`WHERE WEEKEND(Data) = 1`",
    "`WHERE DAY(Data) IN ('Sat','Sun')`"
  ],c:0,e:"DATEPART(WEEKDAY, ...) devolve o número do dia da semana (depende de DATEFIRST). 'WEEKEND' não existe; DAY dá o dia do mês."}

];
if (typeof window !== 'undefined') window.POOL_S5 = POOL_S5;
if (typeof module !== 'undefined' && module.exports) module.exports = { POOL_S5 };

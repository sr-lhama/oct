# Orlando Custom Tees | Auditoria de retomada
**Data da revisão:** 15/11/2026 (Orlando) / registros técnicos de 16/11 UTC
**Ambiente:** website GitHub Pages `sr-lhama/oct` (main); painel GitHub Pages `sr-lhama/oct-auth-preview` (main); Supabase `xemugzorxsmzmuuiidgu`.
**Estado desta revisão:** somente leitura e relatório. Nenhum pedido ou pagamento foi criado, alterado ou enviado nesta auditoria.

## Resumo confirmado
- Há **1 cliente, 1 solicitação, 1 estimate e 1 pedido** no banco novo; o pedido de teste **OCT-261116-130300** está em **sent** e o total é **US$ 281,16**.
- 5 produtos do catálogo e 3 fornecedores DTF permanecem registrados.
- 1 notificação administrativa e 3 entradas de histórico do pedido.
- 0 pagamentos, 0 mensagens internas e **0 mockups/provas de arte** registrados.
- As 7 Edge Functions OCT existem e estão com status ACTIVE: `oct-quote-request`, `oct-notify-quote`, `oct-email-estimate`, `oct-studio-proof`, `oct-customer-artwork`, `oct-artwork-approval`, `oct-legacy-import`.
- Logs Supabase mostram respostas HTTP 200 para envio da notificação e do estimate, além de leitura de arquivos privados. **HTTP 200 indica aceitação da função, não confirma entrega nas caixas de entrada**.
- Os scripts JS examinados no GitHub (`index.html`, `quote.html`, `customer.html`, `dashboard.html`, `login.html`, `js/site.js`, `js/garment-catalog.js`) passaram em verificação de sintaxe. Isso não valida funcionamento ou layout em navegador autenticado.
- GitHub Pages não foi acessível pelos recursos de navegação externa nesta auditoria. Não alegar teste E2E concluído.

## Prioridades imediatas (P0/P1)
- [ ] **P0: Studio e aprovação:** fazer teste real de salvamento do mockup PNG no `oct-studio-proof` e acesso com o login do cliente. Registros anteriores indicaram `OPTIONS 500` no Studio; função foi redeployada após correção, mas sem confirmação E2E. Não há prova salva. Testar frontal + traseira, e-mail com imagem, aprovação e rejeição, estado do pedido, histórico e permissões.
- [ ] **P0: Login do cliente:** abrir `https://sr-lhama.github.io/oct/customer.html` em sessão nova com o mesmo e-mail do pedido; verificar magic link e redirecionamento permitido do Supabase Auth, `oct_claim_my_quotes`, vinculação do pedido e acesso aos arquivos, valores, prova, histórico e recompra. Validar pelo menos dois usuários diferentes para evitar vazamento cruzado.
- [ ] **P1: E-mails novos:** testar os modelos de boas-vindas premium e o envio para `fabio@orlandocustomtees.com` e `orlandotshirt@gmail.com`, que foram implantados depois da confirmação do pedido existente. **Não foram ainda confirmados nas caixas reais.** O reenvio requer ação explícita do administrador e pode produzir e-mails duplicados.
- [ ] **P1: SEO do website público:** `index.html`, `quote.html`, `contact.html` e demais páginas examinadas contêm meta `noindex,nofollow`. Revisar o plano de indexação e remover somente nas páginas comerciais que devem constar no Google; manter `customer.html`/dashboard com `noindex`. Conferir canonical, Search Console, robots.txt, sitemap e domínio definitivo antes de alterar.
- [ ] **P1: Preços:** validar as faixas `tiers` com a tabela comercial vigente e regras por produto, quantidade, tamanhos, frente/costas, área DTF, impostos e frete. A sugestão de valor por peça atualmente consulta apenas tiers do produto; não equivale a cálculo completo de CMV e margem.
- [ ] **P1: Fluxo administrativo:** testar solicitação → conversão → edição de preços → salvar → envio do estimate → card `Enviado` → Studio → aprovação → pagamento → produção. Confirmar que o cliente não visualiza orçamento interno antes da aprovação.
- [ ] **P1: Segurança:** Supabase Security Advisor retornou 4 avisos WARN para funções SECURITY DEFINER executáveis por autenticados, 1 aviso de leaked password protection desligado, 1 aviso INFO de RLS sem policies na tabela privada de rate limiting. Revisar desenho das funções antes de alterar; algumas usam validação explícita de auth.uid e podem ser intencionais.
- [ ] **P1: Revisão da hospedagem e domínio:** website de teste em `sr-lhama.github.io/oct/`, painel em `sr-lhama.github.io/oct-auth-preview/`. Verificar experiência de login/navegação do painel sem expor dados em páginas públicas. O sistema original ChatGPT Sites continua separado.

## Prioridades secundárias (P2)
- [ ] **Portal e reorders:** testar `Order Again`, `Edit Draft`, mesmas artes sem links públicos, alterações de tamanho e status, mensagens internas, e comportamento após conversão.
- [ ] **Layout desktop e mobile:** verificar galeria frente/costas, marcadores de estampas, swatches do catálogo, formulário, seleção de cores, responsividade, modal dos termos e política e menus de todas as páginas. Confirmação visual real pendente.
- [ ] **Sistema de e-mails e registro:** registrar aceitação por destinatário e respostas de erro do Resend, evitar reenvios acidentais. Histórico de conversas externas do Zoho fica fora do escopo por decisão comercial.
- [ ] **Integração PayPal:** ainda não validada no novo ambiente; exigirá configuração segura, checagem de webhook, estado pago e conciliação. Nunca confirmar pagamento apenas por clique.
- [ ] **Frete:** campos de endereço manual estão implementados, sem cálculo e autocompletar por decisão comercial; cotação automática posterior.
- [ ] **Indicadores do dashboard:** revisar receitas e recebimentos, alertas sonoros, jornada, produção, cronômetro e fluxos de status em uso real.
- [ ] **Desempenho do banco:** Performance Advisor reportou 10 FKs sem índices, 1 índice não utilizado e 10 avisos sobre policies permissivas sobrepostas.
- [ ] **SEO/analytics:** nas páginas públicas examinadas não se encontrou canonical nem integração explícita de GA/Search Console, a confirmar no ambiente final.
- [ ] **Domínio e navegação:** revisar página legal, links do menu, redução do destaque de telefone, favicon e ativos sob domínio próprio.
- [ ] **Automação de testes:** adicionar testes de contrato dos endpoints, envio duplicado, login, isolamento de clientes e E2E do formulário até o pedido.

## O que não foi feito na auditoria
- Nenhum envio de e-mail ou criação de pedido de teste.
- Nenhum login em conta real do cliente e nenhum clique real no Studio.
- Nenhuma alteração em RLS, preços, DNS, Resend, site ou Supabase.
- Nenhuma confirmação real de layout, HTTP da hospedagem GitHub Pages, entrega na caixa de entrada ou confirmação PayPal.

## Links de retomada
- Site: https://sr-lhama.github.io/oct/
- Formulário: https://sr-lhama.github.io/oct/quote.html
- Área do cliente: https://sr-lhama.github.io/oct/customer.html
- Admin: https://sr-lhama.github.io/oct-auth-preview/dashboard.html
- Supabase: https://supabase.com/dashboard/project/xemugzorxsmzmuuiidgu
- Segurança Supabase: https://supabase.com/docs/guides/database/database-linter
- Repositório: https://github.com/sr-lhama/oct

**Próxima sessão recomendada:** 1) validar e corrigir Studio + aprovação; 2) validar novo e-mail administrativo e welcome premium; 3) testar portal do cliente; 4) auditoria de precificação; 5) revisão SEO antes da indexação.

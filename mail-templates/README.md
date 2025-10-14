# LokMoto Email Templates

Templates de email HTML responsivos com identidade visual LokMoto para uso no Supabase Auth.

## Estrutura

```
mail-templates/
  ├── README.md                    # Este arquivo
  ├── base-template.html           # Template base (referência)
  ├── confirm-signup.html          # Confirmação de cadastro
  ├── invite-user.html             # Convite de usuário
  ├── magic-link.html              # Magic link de login
  ├── reset-password.html          # Reset de senha
  └── email-change.html            # Confirmação de mudança de email
```

## Características

- ✅ Design responsivo (mobile-first)
- ✅ Identidade visual LokMoto (tema vermelho)
- ✅ Compatível com variáveis do Supabase
- ✅ Testado em principais clientes de email
- ✅ Dark mode friendly
- ✅ Acessível

## Variáveis do Supabase

O Supabase usa Go templates. As variáveis disponíveis são:

### Confirmação de Cadastro (`confirm-signup.html`)
- `{{ .ConfirmationURL }}` - URL de confirmação completa
- `{{ .Token }}` - Token de confirmação
- `{{ .TokenHash }}` - Hash do token
- `{{ .SiteURL }}` - URL do site configurado
- `{{ .Email }}` - Email do usuário

### Convite de Usuário (`invite-user.html`)
- `{{ .ConfirmationURL }}` - URL de aceitação do convite
- `{{ .Token }}` - Token do convite
- `{{ .TokenHash }}` - Hash do token
- `{{ .SiteURL }}` - URL do site
- `{{ .Email }}` - Email convidado

### Magic Link (`magic-link.html`)
- `{{ .ConfirmationURL }}` - URL do magic link
- `{{ .Token }}` - Token do magic link
- `{{ .TokenHash }}` - Hash do token
- `{{ .SiteURL }}` - URL do site
- `{{ .Email }}` - Email do usuário

### Reset de Senha (`reset-password.html`)
- `{{ .ConfirmationURL }}` - URL de reset
- `{{ .Token }}` - Token de reset
- `{{ .TokenHash }}` - Hash do token
- `{{ .SiteURL }}` - URL do site
- `{{ .Email }}` - Email do usuário

### Mudança de Email (`email-change.html`)
- `{{ .ConfirmationURL }}` - URL de confirmação
- `{{ .Token }}` - Token
- `{{ .TokenHash }}` - Hash do token
- `{{ .NewEmail }}` - Novo email
- `{{ .Email }}` - Email atual

## Como Usar

### 1. Configurar no Supabase Dashboard

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá para **Authentication** > **Email Templates**
3. Selecione o template que deseja customizar
4. Copie o conteúdo do arquivo HTML correspondente
5. Cole no editor do Supabase
6. Clique em **Save**

### 2. Configurar via Supabase CLI

Você também pode configurar via CLI:

```bash
# Configurar template de confirmação
supabase functions deploy --project-ref YOUR_PROJECT_REF

# Ou editar manualmente em supabase/config.toml
```

### 3. Testar Templates

Para testar os templates localmente:

1. Abra o arquivo HTML no navegador
2. Substitua manualmente as variáveis `{{ }}` por valores de exemplo
3. Verifique responsividade redimensionando a janela

### 4. Preview com Variáveis

Para preview com variáveis reais, use o Supabase Dashboard:
- Cada template tem um botão "Send Test Email"
- Isso enviará um email real com as variáveis preenchidas

## Customização

### Cores

As cores principais são definidas inline no CSS:

```css
/* Vermelho LokMoto */
--primary: #d32f2f;
--primary-dark: #b71c1c;
--primary-light: #ff6659;

/* Cinzas */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-600: #4b5563;
--gray-900: #111827;
```

Para mudar, edite os valores nos arquivos HTML.

### Logo

O logo é um ícone de moto inline SVG. Para usar uma imagem:

```html
<!-- Substituir -->
<svg>...</svg>

<!-- Por -->
<img src="https://seu-dominio.com/logo.png" alt="LokMoto" style="height: 40px;">
```

### Textos

Todos os textos estão em português. Para alterar:
1. Localize o texto no arquivo HTML
2. Edite diretamente
3. Salve e aplique no Supabase

## Compatibilidade

Templates testados em:
- ✅ Gmail (Web, iOS, Android)
- ✅ Outlook (Web, Desktop)
- ✅ Apple Mail (macOS, iOS)
- ✅ Yahoo Mail
- ✅ Thunderbird
- ✅ Protonmail

## Boas Práticas

1. **Sempre teste** antes de colocar em produção
2. **Use links absolutos** para imagens (não relativos)
3. **Evite JavaScript** (não funciona em emails)
4. **Use tabelas** para layout (melhor compatibilidade)
5. **Inline CSS** sempre que possível
6. **Alt text** em todas as imagens

## Troubleshooting

### Template não aparece no Supabase
- Certifique-se de salvar após colar o HTML
- Verifique se não há erros de sintaxe
- Limpe o cache do navegador

### Variáveis não são substituídas
- Verifique a sintaxe: `{{ .Variavel }}` (com ponto e espaços)
- Certifique-se de estar usando a variável correta para o template
- Consulte a documentação do Supabase Auth

### Email não é recebido
- Verifique spam/lixeira
- Confirme que o email está configurado no Supabase
- Verifique logs em Authentication > Logs

### Layout quebrado
- Teste em diferentes clientes de email
- Use inline CSS
- Evite CSS moderno não suportado
- Use tabelas para estrutura

## Recursos Adicionais

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Email Template Guidelines](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Can I Email](https://www.caniemail.com/) - Compatibilidade CSS em emails

## Suporte

Para dúvidas sobre os templates:
1. Consulte este README
2. Verifique a documentação do Supabase
3. Teste em ambiente de desenvolvimento primeiro

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2025  
**Autor**: LokMoto Team


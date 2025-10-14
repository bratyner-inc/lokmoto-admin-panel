# Fluxo de Autenticação - LokMoto

## 📋 Funcionalidades Implementadas

### 1. ✅ Login
- **Rota**: `/login`
- **Campos**: Email e senha
- **Links**:
  - "Esqueci minha senha" → `/forgot-password`
  - "Cadastre-se" → `/register`

### 2. ✅ Cadastro de Lojistas
- **Rota**: `/register`
- **Campos**:
  - Nome da Empresa / Razão Social
  - CNPJ (com máscara: 00.000.000/0000-00)
  - E-mail
  - Telefone (com máscara: (00) 00000-0000)
  - Senha (mínimo 6 caracteres)
  - Confirmar Senha
- **Fluxo**:
  1. Cria usuário no Supabase Auth
  2. Cria registro na tabela `rental_companies`
  3. Define `onboarding_completed = false`
  4. Redireciona para `/login` após confirmação de email
  5. Após login, será redirecionado para `/onboarding`

### 3. ✅ Esqueci Minha Senha
- **Rota**: `/forgot-password`
- **Funcionalidade**:
  - Envia email de recuperação via Supabase Auth
  - Usa método `resetPasswordForEmail()` do Supabase
  - Email contém link para `/reset-password`
  - Mensagem de confirmação após envio

### 4. ✅ Redefinir Senha
- **Rota**: `/reset-password`
- **Funcionalidade**:
  - Recebe token de reset via URL (hash)
  - Validação de força da senha:
    - Fraca (vermelho)
    - Média (amarelo)
    - Forte (verde)
  - Indicador visual de senhas coincidentes
  - Atualiza senha via Supabase Auth
  - Redireciona para `/login` após sucesso

---

## 🔧 Configuração do Supabase

### Email Templates (Necessário Configurar)

Para que o fluxo de "Esqueci minha senha" funcione corretamente, é necessário configurar os templates de email no Supabase:

#### 1. Acesse o Dashboard do Supabase
```
https://app.supabase.com/project/YOUR_PROJECT_ID/auth/templates
```

#### 2. Configure o Template "Reset Password"

**Assunto do Email**:
```
Redefinir senha - LokMoto
```

**Corpo do Email (HTML)**:
```html
<h2>Redefinir Senha - LokMoto</h2>

<p>Olá,</p>

<p>Você solicitou a redefinição de senha para sua conta no LokMoto.</p>

<p>Clique no botão abaixo para criar uma nova senha:</p>

<p>
  <a href="{{ .ConfirmationURL }}" 
     style="display: inline-block; background-color: #dc2626; color: white; 
            padding: 12px 24px; text-decoration: none; border-radius: 6px; 
            font-weight: 600;">
    Redefinir Senha
  </a>
</p>

<p>Ou copie e cole este link no seu navegador:</p>
<p style="color: #666; word-break: break-all;">{{ .ConfirmationURL }}</p>

<p><small>Se você não solicitou esta redefinição, ignore este email.</small></p>

<hr>
<p style="color: #999; font-size: 12px;">
  © {{ .Year }} LokMoto. Todos os direitos reservados.
</p>
```

#### 3. Configure a URL de Redirecionamento

No Supabase Dashboard:

**Authentication > URL Configuration**:
```
Site URL: http://localhost:8080 (desenvolvimento)
           ou https://seu-dominio.com (produção)

Redirect URLs:
  - http://localhost:8080/reset-password
  - https://seu-dominio.com/reset-password
```

---

## 🧪 Como Testar o Fluxo Completo

### Teste 1: Cadastro
1. Acesse `http://localhost:8080/register`
2. Preencha o formulário com dados válidos
3. ✅ Verifique se aparece mensagem de sucesso
4. ✅ Verifique se recebeu email de confirmação do Supabase
5. Confirme o email clicando no link recebido
6. Faça login com as credenciais criadas

### Teste 2: Esqueci Minha Senha
1. Acesse `http://localhost:8080/login`
2. Clique em "Esqueci minha senha"
3. Digite um email cadastrado
4. Clique em "Enviar Link de Recuperação"
5. ✅ Verifique se aparece mensagem de sucesso
6. ✅ Verifique sua caixa de entrada (e SPAM)
7. Abra o email e clique no link de redefinição
8. ✅ Verifique se foi redirecionado para `/reset-password`

### Teste 3: Redefinir Senha
1. Na página `/reset-password` (após clicar no link do email)
2. Digite uma nova senha
3. ✅ Observe o indicador de força da senha
4. Confirme a senha
5. ✅ Verifique se o botão só fica habilitado quando as senhas coincidem
6. Clique em "Redefinir Senha"
7. ✅ Verifique se aparece mensagem de sucesso
8. ✅ Verifique se foi redirecionado para `/login`
9. Faça login com a nova senha

---

## 🔐 Segurança Implementada

### Validações no Frontend
- ✅ Email válido (HTML5 validation)
- ✅ Senha mínima de 6 caracteres
- ✅ Confirmação de senha
- ✅ CNPJ com 14 dígitos
- ✅ Telefone formatado
- ✅ Indicador de força de senha

### Segurança do Supabase
- ✅ Tokens de reset expiram automaticamente (1 hora)
- ✅ Link de reset pode ser usado apenas uma vez
- ✅ Senha hasheada com bcrypt
- ✅ Email de confirmação obrigatório (pode ser configurado)
- ✅ Rate limiting para prevenir spam

---

## 📧 Configuração de Email (Produção)

Para ambiente de produção, configure um provedor de email custom:

### Opção 1: SendGrid
1. Crie uma conta no SendGrid
2. Obtenha API Key
3. Configure no Supabase:
   - Dashboard > Project Settings > Auth > SMTP Settings
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: `SUA_API_KEY`

### Opção 2: AWS SES
1. Configure AWS SES na região desejada
2. Verifique domínio e emails
3. Configure no Supabase com credenciais SMTP do SES

### Opção 3: Resend (Recomendado para Supabase)
1. Crie conta em https://resend.com
2. Configure domínio e DNS
3. Integre com Supabase via Edge Functions

---

## 🐛 Troubleshooting

### "Email não está sendo enviado"
**Solução**:
1. Verifique configuração SMTP no Supabase Dashboard
2. Verifique caixa de SPAM
3. Em desenvolvimento, use Mailtrap ou similar
4. Verifique logs no Supabase Dashboard

### "Link de reset não funciona"
**Solução**:
1. Verifique se a URL de redirecionamento está configurada corretamente
2. Certifique-se de que `/reset-password` está nas Redirect URLs
3. Verifique se o token não expirou (1 hora de validade)

### "Erro ao criar conta"
**Solução**:
1. Verifique se o email já está cadastrado
2. Confirme que a tabela `rental_companies` existe
3. Verifique RLS policies da tabela
4. Veja logs no Supabase Dashboard

---

## 📝 Código Relevante

### Envio de Email de Reset
```typescript
// src/infrastructure/auth/supabaseAuthService.ts
async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  // ...
}
```

### Reset de Senha
```typescript
// src/infrastructure/auth/supabaseAuthService.ts
async resetPassword(newPassword: string): Promise<ApiResponse> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  // ...
}
```

---

## ✅ Checklist de Implementação

- [x] Página de Login com links
- [x] Página de Cadastro de Lojistas
- [x] Página de Esqueci Minha Senha
- [x] Página de Redefinir Senha
- [x] Integração com Supabase Auth
- [x] Validações de formulário
- [x] Máscaras (CNPJ, Telefone)
- [x] Indicador de força de senha
- [x] Mensagens de erro/sucesso
- [x] Rotas públicas configuradas
- [ ] Templates de email configurados no Supabase ⚠️
- [ ] SMTP configurado para produção ⚠️
- [ ] Teste end-to-end completo

---

## 🚀 Próximos Passos

1. **Configurar templates de email** no Supabase Dashboard
2. **Testar fluxo completo** em desenvolvimento
3. **Configurar SMTP** para produção (SendGrid/SES/Resend)
4. **Adicionar testes automatizados** para autenticação
5. **Implementar 2FA** (opcional, para maior segurança)
6. **Adicionar rate limiting** customizado (se necessário)

---

## 📞 Suporte

Se encontrar problemas, verifique:
- Supabase Dashboard > Logs
- Console do navegador (F12)
- Network tab para ver requisições falhando

**Documentação Oficial**:
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Reset Password](https://supabase.com/docs/guides/auth/auth-password-reset)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)


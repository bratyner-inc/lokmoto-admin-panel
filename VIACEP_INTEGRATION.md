# Integração ViaCEP - LokMoto

## 📋 Visão Geral

Integração com a **API pública do ViaCEP** para busca automática de endereços baseada no CEP durante o onboarding de lojistas.

**API**: https://viacep.com.br/

---

## 🎯 Funcionalidades Implementadas

### 1. Serviço ViaCEP (`src/services/viaCepService.ts`)

Serviço dedicado para comunicação com a API do ViaCEP:

- ✅ Busca de endereço por CEP
- ✅ Validação de formato de CEP
- ✅ Formatação automática de CEP (00000-000)
- ✅ Tratamento de erros
- ✅ Mapeamento de resposta para formato interno

**Métodos principais**:
```typescript
viaCepService.getAddressByCep(cep: string): Promise<Address | null>
viaCepService.formatCep(cep: string): string
viaCepService.isValidCep(cep: string): boolean
```

### 2. Hook Custom (`src/presentation/hooks/useViaCep.ts`)

Hook React para facilitar o uso do ViaCEP em formulários:

- ✅ Estado de loading/error/address
- ✅ Função `searchCep` para buscar endereço
- ✅ Função `formatCep` para formatar enquanto digita
- ✅ Função `reset` para limpar dados
- ✅ Validação de CEP

**Uso**:
```typescript
const { loading, error, address, searchCep, formatCep } = useViaCep();
```

### 3. Onboarding Integrado (`src/presentation/pages/store-admin/Onboarding.tsx`)

Formulário de endereço otimizado com busca automática:

**Fluxo**:
1. Usuário digita CEP (com formatação automática)
2. Clica no botão de busca (ícone de lupa)
3. Sistema consulta ViaCEP
4. Campos preenchidos automaticamente:
   - ✅ Rua/Avenida (desabilitado)
   - ✅ Bairro (desabilitado)
   - ✅ Cidade (desabilitado)
   - ✅ Estado - UF (desabilitado)
5. Usuário preenche manualmente:
   - ✏️ Número (obrigatório)
   - ✏️ Complemento (opcional)

---

## 🔧 Como Funciona

### Exemplo de Requisição

**Input**: CEP `01001-000` ou `01001000`

**Request**: 
```
GET https://viacep.com.br/ws/01001000/json/
```

**Response**:
```json
{
  "cep": "01001-000",
  "logradouro": "Praça da Sé",
  "complemento": "lado ímpar",
  "unidade": "",
  "bairro": "Sé",
  "localidade": "São Paulo",
  "uf": "SP",
  "estado": "São Paulo",
  "regiao": "Sudeste",
  "ibge": "3550308",
  "gia": "1004",
  "ddd": "11",
  "siafi": "7107"
}
```

**Mapeamento para formato interno**:
```typescript
{
  zipCode: "01001-000",
  street: "Praça da Sé",
  neighborhood: "Sé",
  city: "São Paulo",
  state: "SP",
  region: "Sudeste",
  complement: "lado ímpar" // opcional
}
```

---

## 📝 Campos do Formulário

| Campo | Editável | Obrigatório | Fonte |
|-------|----------|-------------|-------|
| **CEP** | ✅ Sim | ✅ Sim | Usuário |
| **Rua/Avenida** | ❌ Não* | ⚠️ - | ViaCEP |
| **Número** | ✅ Sim | ✅ Sim | Usuário |
| **Complemento** | ✅ Sim | ❌ Não | Usuário |
| **Bairro** | ❌ Não* | ⚠️ - | ViaCEP |
| **Cidade** | ❌ Não* | ⚠️ - | ViaCEP |
| **Estado (UF)** | ❌ Não* | ⚠️ - | ViaCEP |

*Campos desabilitados após busca bem-sucedida do CEP

---

## 🎨 Interface do Usuário

### Estado Inicial
```
CEP: [_____-___] [🔍]
```

### Durante Busca
```
CEP: [01001-000] [⌛]
```

### Após Busca (Sucesso)
```
CEP: [01001-000] [🔍]
✓ Endereço encontrado

Rua/Avenida: [Praça da Sé] (desabilitado, fundo cinza)
Número: [___] (editável)
Complemento: [___] (editável, opcional)
Bairro: [Sé] (desabilitado, fundo cinza)
Cidade: [São Paulo] (desabilitado, fundo cinza)
Estado (UF): [SP] (desabilitado, fundo cinza)
```

### Erro
```
CEP: [99999-999] [🔍]
❌ CEP não encontrado. Verifique o número digitado.
```

---

## ✅ Validações Implementadas

### 1. Formato de CEP
```typescript
- Aceita: "01001000" ou "01001-000"
- Rejeita: CEPs com menos/mais de 8 dígitos
- Formata automaticamente: "01001000" → "01001-000"
```

### 2. CEP Inexistente
```typescript
- API retorna { "erro": true }
- Exibe mensagem: "CEP não encontrado"
```

### 3. Erro de Rede
```typescript
- Timeout ou falha de conexão
- Exibe mensagem: "Erro ao buscar CEP. Tente novamente."
```

### 4. Número Obrigatório
```typescript
- Valida antes de salvar
- Exibe mensagem se vazio
```

---

## 🧪 Testes Manuais

### Teste 1: Busca de CEP Válido
1. Acesse `/onboarding` (após cadastro)
2. Digite CEP: `01001000`
3. ✅ Deve formatar para: `01001-000`
4. Clique no botão de busca (lupa)
5. ✅ Deve exibir loading (ícone spinner)
6. ✅ Deve preencher automaticamente os campos
7. ✅ Campos preenchidos devem ficar desabilitados (fundo cinza)
8. ✅ Número e complemento devem ficar editáveis

### Teste 2: CEP Inválido (Formato)
1. Digite CEP: `123`
2. Clique no botão de busca
3. ✅ Deve exibir erro: "CEP inválido. Digite um CEP com 8 dígitos."

### Teste 3: CEP Inexistente
1. Digite CEP: `99999-999`
2. Clique no botão de busca
3. ✅ Deve exibir erro: "CEP não encontrado. Verifique o número digitado."

### Teste 4: Alteração de CEP
1. Busque um CEP válido (ex: `01001-000`)
2. Campos preenchidos
3. Altere o CEP para outro (ex: `04101-300`)
4. ✅ Deve limpar o indicador "Endereço encontrado"
5. ✅ Campos devem voltar a ser editáveis
6. Busque novamente
7. ✅ Deve preencher com novo endereço

### Teste 5: Salvar sem Número
1. Busque CEP válido
2. Não preencha o campo "Número"
3. Clique em "Próximo"
4. ✅ Deve validar e exibir erro

---

## 🔍 CEPs de Teste

| CEP | Local | Resultado |
|-----|-------|-----------|
| `01001-000` | Praça da Sé, SP | ✅ Válido |
| `04101-300` | Av. Paulista, SP | ✅ Válido |
| `20040-020` | Centro, Rio de Janeiro | ✅ Válido |
| `30130-000` | Centro, Belo Horizonte | ✅ Válido |
| `99999-999` | Inexistente | ❌ Erro |

---

## 📦 Estrutura de Arquivos

```
src/
├── services/
│   └── viaCepService.ts          # Serviço de integração com ViaCEP
├── presentation/
│   ├── hooks/
│   │   ├── useViaCep.ts          # Hook customizado para uso em formulários
│   │   └── index.ts              # Exporta useViaCep
│   └── pages/
│       └── store-admin/
│           └── Onboarding.tsx    # Formulário integrado com busca de CEP
```

---

## 🚀 Como Usar em Outros Formulários

Se precisar usar a busca de CEP em outros lugares:

```typescript
import { useViaCep } from '@/presentation/hooks';

function MeuFormulario() {
  const { loading, error, address, searchCep, formatCep } = useViaCep();
  const [cep, setCep] = useState('');

  const handleBuscarCep = async () => {
    const resultado = await searchCep(cep);
    if (resultado) {
      // Preencher formulário com resultado
      console.log(resultado.street, resultado.city, resultado.state);
    }
  };

  return (
    <div>
      <input
        value={cep}
        onChange={(e) => setCep(formatCep(e.target.value))}
        maxLength={9}
      />
      <button onClick={handleBuscarCep} disabled={loading}>
        {loading ? 'Buscando...' : 'Buscar'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

---

## ⚠️ Limitações

1. **API Pública**: Sem garantia de SLA
2. **Rate Limiting**: Sem limite documentado, mas é público
3. **Apenas Brasil**: Funciona apenas para CEPs brasileiros
4. **Sem Cache**: Cada busca faz uma nova requisição (pode adicionar cache local futuramente)

---

## 🔮 Melhorias Futuras (Opcional)

- [ ] Cache local de CEPs buscados (localStorage)
- [ ] Debounce na busca automática ao digitar
- [ ] Busca reversa (cidade/rua → CEP)
- [ ] Integração com outras APIs (Google Maps, OpenStreetMap)
- [ ] Histórico de CEPs buscados
- [ ] Analytics de CEPs mais buscados

---

## 📚 Referências

- **ViaCEP**: https://viacep.com.br/
- **Documentação**: https://viacep.com.br/ws/01001000/json/
- **Exemplos**: https://viacep.com.br/exemplo/javascript/

---

## ✅ Checklist de Implementação

- [x] Criar serviço ViaCEP
- [x] Criar hook useViaCep
- [x] Integrar no Onboarding
- [x] Validação de formato de CEP
- [x] Formatação automática
- [x] Desabilitar campos preenchidos automaticamente
- [x] Tratamento de erros
- [x] Feedback visual (loading, sucesso, erro)
- [x] Exportar hook no index
- [x] Documentação completa
- [ ] Testes automatizados (opcional)
- [ ] Cache local (opcional)

---

**Status**: ✅ **Implementado e Funcional**

🎉 A integração está completa e pronta para uso no onboarding!


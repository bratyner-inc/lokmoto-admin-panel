# LokMoto Landing Page

Landing page autocontida e modular para lojistas, com design system LokMoto (tema vermelho).

## Estrutura

```
src/landing/
  ├── index.tsx                    # Componente principal
  ├── components/                  # Componentes da landing
  │   ├── LandingHeader.tsx        # Header com navegação
  │   ├── HeroSection.tsx          # Hero principal
  │   ├── VantagensSection.tsx     # Cards de vantagens
  │   ├── RecursosSection.tsx      # Features detalhadas
  │   ├── PlanosSection.tsx        # Planos (integrado com DB)
  │   ├── FAQSection.tsx           # FAQ accordion
  │   ├── CTASection.tsx           # Call-to-action final
  │   └── LandingFooter.tsx        # Footer completo
  └── data/                        # Dados estáticos
      ├── benefits.ts              # Dados de vantagens
      ├── features.ts              # Dados de recursos
      └── faq.ts                   # Perguntas e respostas
```

## Características

- **Autocontida**: Todos os componentes e dados em uma pasta
- **Responsiva**: Mobile-first design com breakpoints
- **Animações**: Usa animações do Tailwind CSS
- **Integração Real**: Busca planos do banco de dados via `useSafe2PayPlans`
- **Design System**: Segue tema vermelho LokMoto
- **Acessibilidade**: Componentes Shadcn UI acessíveis

## Seções

1. **Header**: Logo, navegação, botões de login/cadastro
2. **Hero**: Título, subtítulo, CTAs, social proof
3. **Vantagens**: 6 cards com benefícios
4. **Recursos**: 4 features com layout alternado
5. **Planos**: Cards de planos (dados reais do banco)
6. **FAQ**: 5 perguntas frequentes em accordion
7. **CTA**: Call-to-action final com gradiente
8. **Footer**: 4 colunas com links e informações

## Dependências

### Componentes Shadcn UI
- Card, CardHeader, CardContent, CardTitle, CardDescription
- Button
- Accordion, AccordionItem, AccordionTrigger, AccordionContent
- Badge
- Separator
- Skeleton

### Ícones Lucide React
- Bike, LayoutDashboard, DollarSign, FileText, Wrench, BarChart
- Headphones, CheckCircle, ArrowRight, Menu, X, PlayCircle
- Mail, MapPin, Phone

### Hooks Personalizados
- `useSafe2PayPlans` (localizado em `src/presentation/hooks/useSafe2PayPlans.ts`)

## Como Usar

### No Projeto Atual

A landing page está acessível na rota raiz `/`.

```tsx
// Já configurado em src/App.tsx
<Route path="/" element={<LandingPage />} />
```

### Navegação

- Header possui links para seções (scroll suave)
- Botões de Login (`/login`) e Cadastro (`/register`)
- Footer com links internos e externos

## Portar para Outro Projeto

### 1. Copiar Pasta

```bash
cp -r src/landing /caminho/novo-projeto/src/
```

### 2. Ajustar Hook de Planos (se necessário)

Se o novo projeto não tiver o hook `useSafe2PayPlans`, você pode:

**Opção A**: Mockar os planos

```tsx
// Em PlanosSection.tsx
const mockPlans = [
  { idPlan: 0, name: 'Gratuito', amount: 0, ... },
  { idPlan: 1, name: 'Básico', amount: 99, ... },
  // ...
];
```

**Opção B**: Adaptar o hook para a nova fonte de dados

```tsx
import { usePlans } from '@/hooks/usePlans'; // Hook do novo projeto
```

### 3. Adicionar Rota

```tsx
// Em App.tsx do novo projeto
import LandingPage from './landing';

<Route path="/" element={<LandingPage />} />
```

### 4. Garantir Dependências

Certifique-se de que o novo projeto tem:
- Shadcn UI components (Card, Button, etc.)
- Lucide React icons
- React Router DOM
- Tailwind CSS com configuração similar

### 5. Ajustar Tema (opcional)

Se o novo projeto usar cores diferentes, ajuste em `tailwind.config.ts`:

```ts
// Manter tema vermelho ou adaptar
--primary: 0 84% 45%;
--primary-foreground: 0 0% 100%;
```

## Customização

### Alterar Conteúdo

Edite os arquivos em `src/landing/data/`:
- `benefits.ts`: Vantagens exibidas
- `features.ts`: Recursos detalhados
- `faq.ts`: Perguntas frequentes

### Alterar Textos do Hero

Edite `src/landing/components/HeroSection.tsx`:
- Título principal
- Subtítulo
- Textos dos botões
- Social proof (números)

### Alterar CTA Final

Edite `src/landing/components/CTASection.tsx`:
- Título do CTA
- Subtítulo
- Texto do botão

### Alterar Footer

Edite `src/landing/components/LandingFooter.tsx`:
- Links de navegação
- Informações de contato
- Redes sociais

## Responsividade

A landing é totalmente responsiva:

- **Mobile** (<768px): Layout 1 coluna, menu hamburger
- **Tablet** (768px-1024px): Layout 2 colunas
- **Desktop** (>1024px): Layout 3 colunas, full width

## Performance

- Componentes leves e otimizados
- Lazy loading de imagens (quando adicionadas)
- Animações GPU-accelerated
- Código splitting natural (React Router)

## SEO (Futuro)

Para melhorar SEO, adicione:

```tsx
// Em index.html ou usando react-helmet
<title>LokMoto - Sistema de Gestão para Locadoras de Motos</title>
<meta name="description" content="Gerencie sua locadora de motos com eficiência..." />
<meta name="keywords" content="locadora, motos, gestão, contratos" />
```

## Manutenção

Para atualizar a landing:

1. **Conteúdo**: Edite arquivos em `data/`
2. **Design**: Ajuste classes Tailwind nos componentes
3. **Funcionalidade**: Modifique componentes individuais
4. **Planos**: A seção busca automaticamente do banco

## Suporte

Para dúvidas sobre a landing page, consulte:
- Documentação do Shadcn UI: https://ui.shadcn.com/
- Documentação do Tailwind CSS: https://tailwindcss.com/
- Lucide Icons: https://lucide.dev/

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2025  
**Autor**: LokMoto Team


@AGENTS.md

# Diagnóstico: ThemeToggle não altera a UI

## Resumo

O `data-theme` no `<html>` está funcionando corretamente. O problema **não** está na `@custom-variant dark` do Tailwind v4 — ela está configurada de forma válida, mas **nenhum componente a utiliza**. A UI não muda porque os elementos visíveis usam **cores estáticas do Tailwind** (`bg-slate-100`, `text-slate-900`, etc.) em vez dos tokens de tema definidos em `globals.css`.

---

## O que funciona

| Camada                         | Status                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `toggleTheme` / `applyTheme`   | OK — alterna estado e grava no `localStorage`                                                          |
| `data-theme` no `<html>`       | OK — confirmado no DevTools                                                                            |
| Variáveis CSS em `globals.css` | OK — `[data-theme='dark']` sobrescreve `--color-background`, `--color-surface`, `--color-text-primary` |
| `@custom-variant dark`         | OK — sintaxe correta para `data-theme`                                                                 |

---

## Causa raiz

### 1. Componentes ignoram o sistema de tema

Os arquivos que definem a aparência visível usam classes com valores fixos:

```tsx
// src/app/page.tsx
<div className="min-h-screen bg-slate-100 text-slate-900">

// src/components/Container/index.tsx
<div className="min-h-screen bg-slate-100 text-slate-900">

// src/components/PostsList/index.tsx
<p className="text-gray-500">

// src/components/Header/index.tsx
'text-blue-500'
```

Essas classes compilam para cores hex/rgb **fixas** no build. Elas não leem `--color-background` nem reagem ao seletor `[data-theme='dark']`.

### 2. O `body` muda, mas fica invisível

Em `globals.css`, apenas o `body` consome as variáveis:

```css
body {
  background-color: var(--color-background);
  color: var(--color-text-primary);
}
```

Porém, `page.tsx` e `Container` renderizam um `<div className="min-h-screen bg-slate-100">` que cobre **toda a viewport** por cima do `body`. Mesmo que o fundo do `body` alterne, o usuário só vê o `slate-100` estático.

### 3. `@custom-variant dark` existe, mas não é usada

A variante customizada só tem efeito em classes com prefixo `dark:`:

```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

Nenhum arquivo do projeto usa `dark:bg-*`, `dark:text-*` ou similar. A variante está correta e ociosa — não é a fonte do bug.

---

## Por que as variáveis em `@theme` não resolvem sozinhas

No Tailwind v4, `@theme` registra tokens de design:

```css
@theme {
  --color-background: #f8f8f6;
  --color-text-primary: #1a1a18;
}
```

Isso gera utilitários como `bg-background` e `text-text-primary`. O bloco `[data-theme='dark']` sobrescreve essas variáveis em runtime — **desde que os componentes usem os utilitários semânticos**, não `bg-slate-100`.

Fluxo correto:

```
data-theme muda → variáveis CSS mudam → bg-background / text-text-primary refletem o novo valor
```

Fluxo atual (quebrado):

```
data-theme muda → variáveis CSS mudam → componentes com bg-slate-100 permanecem iguais
```

---

## Correção recomendada

### Opção A — Tokens semânticos (recomendada, alinhada ao `globals.css` atual)

Substituir cores fixas pelos tokens já definidos:

```tsx
// page.tsx e Container
<div className="min-h-screen bg-background text-text-primary">

// PostsList
<p className="text-text-primary/60">

// ThemeToggle
className="... border-black/10 dark:border-white/10"
// ou: border-[color-mix(in_srgb,var(--color-text-primary)_10%,transparent)]
```

Vantagem: uma única fonte de verdade (`globals.css`); trocar paleta exige editar só as variáveis.

### Opção B — Variante `dark:` do Tailwind

Manter cores explícitas com prefixo `dark:`:

```tsx
<div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
```

Vantagem: explícito e familiar. Desvantagem: duplicação de cores nos componentes; a `@custom-variant` passa a ser necessária.

### Opção C — Combinar ambas

Tokens semânticos para fundo/texto base + `dark:` para casos pontuais (bordas, ícones, estados hover).

---

## Bug secundário no ThemeContext

```tsx
useEffect(() => {
  applyTheme(theme);
}, []); // ← dependência vazia: só roda no mount
```

O toggle chama `applyTheme(next)` diretamente, então o clique funciona. Porém, se o estado `theme` mudar por outro caminho (ex.: sincronização entre abas), o `useEffect` não reagirá. Corrigir para `[theme]` ou remover o efeito e aplicar o tema apenas em `toggleTheme` + inicialização.

---

## Checklist de verificação pós-correção

1. Trocar `bg-slate-100 text-slate-900` por `bg-background text-text-primary` em `page.tsx` e `Container`
2. Atualizar `PostsList`, `Header` e `ThemeToggle` para usar tokens ou `dark:`
3. Recarregar a página e alternar o toggle — fundo e texto devem mudar imediatamente
4. Inspecionar no DevTools: elementos visíveis devem mostrar `background-color` vindo de `var(--color-background)`, não de `rgb(241 245 249)` (slate-100)

---

## Conclusão

| Suspeita                               | Veredicto                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------------ |
| `@custom-variant dark` mal configurada | **Não** — está correta, só não é usada                                         |
| Variáveis CSS em `globals.css`         | **Parcialmente** — funcionam no `body`, mas componentes não as consomem        |
| Outro lugar                            | **Sim** — classes Tailwind estáticas (`slate`, `gray`, `blue`) nos componentes |

O `ThemeToggle` e o `ThemeContext` fazem o trabalho deles. O gap está na camada de apresentação: **os componentes precisam usar o sistema de tema que o CSS já define**.

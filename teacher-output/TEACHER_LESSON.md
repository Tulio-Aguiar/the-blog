# TEACHER_LESSON — the-blog

Aula técnica derivada do snapshot completo do projeto `the-blog v0.1.0`. Escopo: App Router, camada de apresentação, contexto de tema, repositório de posts e configuração de build.

---

## Parte 1 — Contexto e Stack

O projeto é um blog mínimo em **Next.js com App Router**, **TypeScript strict** e **Tailwind CSS v4**. A arquitetura separa três eixos:

| Eixo                              | Arquivos                                                                      | Camada                             |
| --------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------- |
| Roteamento e composição de página | `layout.tsx`, `page.tsx`, `globals.css`                                       | App Router / Server Components     |
| Apresentação reutilizável         | `Container`, `Header`, `PostsList`, `SpinLoader`, `ThemeToggle`               | Componentes                        |
| Domínio e persistência            | `post-models.ts`, `post-repository.ts`, `json-post-repository.ts`, `index.ts` | Modelo + Repositório               |
| Estado de UI global               | `ThemeContext.tsx`                                                            | Context API (Client)               |
| Tooling                           | `next.config.ts`, `prettier.config.js`                                        | Configuração de build e formatação |

**Problema de domínio:** exibir uma lista de posts de um blog com suporte a tema claro/escuro e carregamento assíncrono na página inicial.

**Decisões de stack visíveis:**

- **App Router** com Server Components na rota raiz — `page.tsx` e `PostsList` rodam no servidor; o HTML chega ao cliente já resolvido.
- **Repository Pattern** — `PostRepository` é uma interface; `JsonPostRepository` lê `post.json` do filesystem via `fs/promises`, desacoplando a UI da origem dos dados.
- **Context API** para tema — estado global de UI (`light`/`dark`) com persistência em `localStorage` e atributo `data-theme` no DOM.
- **Tailwind v4** com `@import "tailwindcss"` e tokens em `@theme`, variante `dark` baseada em `[data-theme=dark]`.
- **Suspense** em `page.tsx` — streaming do `PostsList` com fallback `SpinLoader` enquanto o repositório resolve.

**Onde cada arquivo se encaixa:**

- `Container` — layout shell (largura máxima, padding, fundo).
- `PostsList` — Server Component assíncrono que consome `postRepository.findAll()`.
- `ThemeProvider` / `useTheme` — Provider no `layout.tsx`, Consumer em `ThemeToggle`.
- `JsonPostRepository` — implementação concreta de leitura de disco; ponto de troca futura (API, banco).
- `Header` — Client Component com `ThemeToggle`; presente no codebase mas **não importado** em `page.tsx` (header inline na página).

---

## Parte 2 — Contratos de Tipo

### `ContainerProps`

```tsx
type ContainerProps = {
  children: React.ReactNode;
};
```

| Campo      | Tipo              | Razão da escolha                                                                                                                                                |
| ---------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children` | `React.ReactNode` | Aceita qualquer nó renderizável (elementos, strings, fragments, arrays). `React.ReactElement` seria restritivo demais; `any` eliminaria checagem de composição. |

---

### `SpinLoaderProps`

```tsx
type SpinLoaderProps = {
  containerClasses?: string;
};
```

| Campo              | Tipo                | Razão da escolha                                                                                                                                                                              |
| ------------------ | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `containerClasses` | `string` (opcional) | Permite estender o container do spinner sem duplicar o componente. Opcional porque o uso padrão em `Suspense` não precisa de classes extras. Com `any`, classes inválidas passariam sem erro. |

---

### `Theme` (discriminated union implícita)

```tsx
type Theme = 'light' | 'dark';
```

| Campo | Tipo                | Razão da escolha                                                                                                                                                                                                                                                                                                                                                                                         |
| ----- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| —     | `'light' \| 'dark'` | Union literal de duas strings. O compilador restringe valores a esse conjunto. **Narrowing:** comparações como `theme === 'dark'` refinam o tipo dentro do bloco — após o check, TypeScript sabe que `theme` é `'dark'`, habilitando ramificações seguras em JSX e em `toggleTheme`. Com `string`, qualquer valor seria aceito e `applyTheme` poderia receber `'neon'`. Com `any`, narrowing desaparece. |

---

### `ThemeContextValue`

```tsx
type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};
```

| Campo         | Tipo         | Razão da escolha                                                                                                       |
| ------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `theme`       | `Theme`      | Estado atual legível por qualquer Consumer. Union literal garante consistência com `applyTheme` e `localStorage`.      |
| `toggleTheme` | `() => void` | Ação sem parâmetros — alternância binária. Retorno `void` indica efeito colateral (DOM + state), não valor de retorno. |

---

### `ThemeProviderProps`

```tsx
type ThemeProviderProps = {
  children: React.ReactNode;
};
```

| Campo      | Tipo              | Razão da escolha                                                                                        |
| ---------- | ----------------- | ------------------------------------------------------------------------------------------------------- |
| `children` | `React.ReactNode` | Padrão de Provider React — envolve a árvore que precisa de `useTheme`. Mesma razão de `ContainerProps`. |

---

### `PostModel`

```ts
export type PostModel = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: string;
};
```

| Campo           | Tipo      | Razão da escolha                                                                                            |
| --------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| `id`            | `string`  | Identificador opaco (UUID no seed). `number` serializaria mal em JSON cross-platform.                       |
| `title`         | `string`  | Título exibido na listagem.                                                                                 |
| `slug`          | `string`  | URL amigável para rota futura `/posts/[slug]`.                                                              |
| `excerpt`       | `string`  | Resumo na listagem — `PostsList` renderiza este campo.                                                      |
| `content`       | `string`  | Corpo completo para página de detalhe (ainda não implementada).                                             |
| `coverImageUrl` | `string`  | URL da imagem de capa — preparado para `next/image`.                                                        |
| `published`     | `boolean` | Flag de visibilidade — filtro futuro em `findAll`.                                                          |
| `createdAt`     | `Date`    | Timestamp de criação. **Atenção:** JSON.parse retorna string; sem transformação, runtime não é `Date` real. |
| `updatedAt`     | `Date`    | Mesma ressalva de `createdAt`.                                                                              |
| `author`        | `string`  | Nome do autor — sem entidade `Author` separada neste estágio.                                               |

---

### `PostRepository` (interface)

```ts
export interface PostRepository {
  findAll(): Promise<PostModel[]>;
  findById(id: string): Promise<PostModel | null>;
  create(post: PostModel): Promise<PostModel>;
  update(post: PostModel): Promise<PostModel>;
  delete(id: string): Promise<void>;
}
```

| Campo      | Tipo                                         | Razão da escolha                                                                                                           |
| ---------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `findAll`  | `() => Promise<PostModel[]>`                 | Contrato assíncrono — origem pode ser disco, HTTP ou DB.                                                                   |
| `findById` | `(id: string) => Promise<PostModel \| null>` | Busca por ID com null quando ausente. Implementação atual lança `Error` em vez de retornar null — divergência de contrato. |
| `create`   | `(post: PostModel) => Promise<PostModel>`    | Criação com retorno do registro persistido.                                                                                |
| `update`   | `(post: PostModel) => Promise<PostModel>`    | Atualização por objeto completo.                                                                                           |
| `delete`   | `(id: string) => Promise<void>`              | Remoção sem retorno de corpo.                                                                                              |

---

### `RootLayoutProps`

```tsx
type RootLayoutProps = {
  children: React.ReactNode;
};
```

| Campo      | Tipo              | Razão da escolha                                                  |
| ---------- | ----------------- | ----------------------------------------------------------------- |
| `children` | `React.ReactNode` | Slot do App Router — cada `page.tsx` do segmento é injetado aqui. |

---

## Parte 3 — Anatomia linha por linha

### `src/models/post/post-models.ts`

```ts
export type PostModel = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: string;
};
```

> Contrato de domínio central. Export nomeado permite `import type { PostModel }` nos repositórios sem puxar runtime. Campos espelham o shape do JSON em `src/db/seed/post.json`. `Date` no tipo é aspiracional — `JSON.parse` não instancia `Date`; isso é gap entre tipo e runtime.

---

### `src/repositories/post/post-repository.ts`

```ts
import { PostModel } from '../../models/post/post-models';

export interface PostRepository {
  findAll(): Promise<PostModel[]>;
  findById(id: string): Promise<PostModel | null>;
  create(post: PostModel): Promise<PostModel>;
  update(post: PostModel): Promise<PostModel>;
  delete(id: string): Promise<void>;
}
```

> Interface de porta — define o que a camada de apresentação pode pedir sem conhecer JSON, SQL ou API. Qualquer implementação (`JsonPostRepository`, futuro `ApiPostRepository`) deve honrar estas assinaturas. `interface` em vez de `type` é convenção para contratos extensíveis por classes.

---

### `src/repositories/post/json-post-repository.ts` — constantes e leitura

```ts
const ROOT_DIR = process.cwd();
const JSON_FILE_PATH = path.resolve(ROOT_DIR, 'src', 'db', 'seed', 'post.json');

const SIMULATE_WAIT_IN_MS = 0;
```

> `process.cwd()` resolve o diretório de execução do processo Node — no dev do Next.js, é a raiz do projeto. `path.resolve` monta caminho absoluto cross-platform. `SIMULATE_WAIT_IN_MS = 0` mantém a estrutura de delay sem custo real — útil para testar `Suspense` aumentando o valor.

```ts
private async readFromDisk(): Promise<PostModel[]> {
  const jsonContent = await readFile(JSON_FILE_PATH, 'utf-8');
  const parsed = JSON.parse(jsonContent);

  return parsed.posts;
}
```

> `readFile` de `fs/promises` só funciona no servidor — coerente com `PostsList` como Server Component. `JSON.parse` retorna `unknown` estruturalmente; o retorno `parsed.posts` confia no shape do arquivo sem validação Zod/schema. Em runtime, cada item é plain object, não `PostModel` tipado.

```ts
async findAll(): Promise<PostModel[]> {
  await this.simulateAwait();
  const posts = await this.readFromDisk();
  return posts;
}
```

> Método público consumido por `PostsList`. Sequência: delay opcional → leitura de disco → array de posts. Toda esta cadeia executa no servidor durante o render de `HomePage`.

```ts
async findById(id: string): Promise<PostModel | null> {
  await this.simulateAwait();
  const posts = await this.findAll();
  const post = posts.find((post) => post.id === id);

  if (!post) {
    throw new Error(`Post with id ${id} not found`);
  }

  return post || null;
}
```

> Reutiliza `findAll` — simples, porém O(n) e relê disco a cada chamada. O `throw` contradiz o retorno `null` declarado na interface: ou retorna entidade ou lança, nunca `null`. O `return post || null` após o throw é código morto para o caminho de sucesso.

```ts
async create(post: PostModel): Promise<PostModel> {
  return post;
}

async update(post: PostModel): Promise<PostModel> {
  return post;
}

async delete(id: string): Promise<void> {
  void id;
}
```

> Stubs — satisfazem a interface sem persistir. `void id` suprime lint de parâmetro não usado. Indicam CRUD planejado, não implementado.

---

### `src/repositories/post/index.ts`

```ts
import { PostRepository } from './post-repository';
import { JsonPostRepository } from './json-post-repository';

export const postRepository: PostRepository = new JsonPostRepository();
```

> Composition root do módulo de posts — único ponto onde a implementação concreta é escolhida. `PostsList` importa daqui, não de `json-post-repository.ts` diretamente. Troca para API = alterar uma linha.

---

### `src/contexts/ThemeContext.tsx` — criação e helpers

```tsx
'use client';

import { createContext, useContext, useState } from 'react';
```

> `'use client'` obrigatório: `useState`, `useContext`, `localStorage` e `document` são APIs de browser. Este arquivo define a fronteira Client do tema.

```tsx
const ThemeContext = createContext<ThemeContextValue | null>(null);
```

> Contexto inicializado com `null` — valor sentinela. Permite que `useTheme` detecte uso fora do Provider e lance erro explícito.

```tsx
const applyTheme = (theme: Theme): void => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
};
```

> Efeito colateral duplo: atributo `data-theme` no `<html>` aciona a variante `dark` do Tailwind e os overrides em `globals.css`; `localStorage` persiste entre sessões. Executado em cada `toggleTheme`.

```tsx
const resolveInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';

  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};
```

> Guard `typeof window` — no SSR/primeiro render do Provider, retorna `'light'` sem acessar browser. Após hidratação, lê preferência salva ou `prefers-color-scheme`. A checagem `stored === 'light' || stored === 'dark'` é narrowing manual sobre string do storage.

```tsx
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(resolveInitialTheme);

  const toggleTheme = (): void => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    setTheme(next);
  };

  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>;
};
```

> `useState` com inicializador lazy (`resolveInitialTheme` como referência de função — React chama uma vez). `toggleTheme` deriva `next` por alternância, aplica no DOM/storage antes de `setTheme` — ordem garante que CSS atualiza no mesmo tick do re-render. O Provider publica `{ theme, toggleTheme }` para todos os descendentes.

```tsx
export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
};
```

> Hook customizado encapsula `useContext` + validação. O `throw` falha rápido em desenvolvimento se alguém usar `ThemeToggle` fora do Provider. Retorno tipado como `ThemeContextValue`, nunca `null`.

---

### `src/components/ThemeToggle/ThemeToggle.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
```

> Client Component — depende de `useTheme` e event handlers. Path alias `@/` conforme Protocolo Aruanda.

```tsx
export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
```

> Padrão anti-hidratação: no servidor e no primeiro render client, `mounted` é `false` → retorna `null`. Após `useEffect`, `mounted` vira `true` e o botão renderiza. Evita mismatch entre tema resolvido no servidor (`light`) e tema real do `localStorage`. Trade-off: flash de ausência do botão até montagem.

```tsx
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className="flex cursor-pointer items-center gap-2 rounded-lg border border-black/10 ..."
    >
      {isDark ? <Sun /> : <Moon />}
      <span className="text-sm font-medium">
        {isDark ? 'Modo claro' : 'Modo escuro'}
      </span>
    </button>
  );
};
```

> `isDark` é narrowing derivado. `aria-label` e `title` alternam com o estado — acessibilidade. Ícones `Sun`/`Moon` invertem semanticamente: em dark mode, o botão oferece "Modo claro".

---

### `src/components/Container/index.tsx`

```tsx
type ContainerProps = {
  children: React.ReactNode;
};

export function Container({ children }: ContainerProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-screen-lg px-8">{children}</div>
    </div>
  );
}
```

> Shell de layout — `min-h-screen` força altura mínima viewport; `max-w-screen-lg` centraliza conteúdo. Server Component (sem `'use client'`). Classes `bg-slate-100`/`text-slate-900` coexistem com tokens `data-theme` — possível inconsistência visual quando tema escuro está ativo.

---

### `src/components/PostsList/index.tsx`

```tsx
import { postRepository } from '../../repositories/post';

export default async function PostsList() {
  const posts = await postRepository.findAll();
  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => {
        return (
          <div key={post.id} className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold">{post.title}</h2>
            <p className="text-gray-500">{post.excerpt}</p>
          </div>
        );
      })}
    </div>
  );
}
```

> Async Server Component — `await` no corpo é válido apenas sem `'use client'`. Busca posts no servidor; resultado vira HTML estático no payload. `key={post.id}` estabiliza reconciliação React. Import relativo `../../repositories/post` — inconsistente com alias `@/` usado em outros arquivos.

---

### `src/components/SpinLoader/index.tsx`

```tsx
import clsx from 'clsx';

type SpinLoaderProps = {
  containerClasses?: string;
};

export default function SpinLoader({ containerClasses }: SpinLoaderProps) {
  const classes = clsx(
    'flex',
    'items-center',
    'justify-center',
    containerClasses,
  );
  return (
    <div className={classes}>
      <div
        className={clsx(
          'w-10',
          'h-10',
          'border-5 border-slate-900 border-t-transparent',
          'rounded-full',
          'animate-spin',
        )}
      ></div>
    </div>
  );
}
```

> `clsx` funde classes base com `containerClasses` opcional — `undefined` é ignorado. Anel com `border-t-transparent` + `animate-spin` produz spinner CSS puro. Usado como `fallback` de `Suspense` — renderiza no servidor instantaneamente enquanto `PostsList` resolve.

---

### `src/components/Header/index.tsx`

```tsx
'use client';

import clsx from 'clsx';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

export default function Header() {
  return (
    <>
      <header className="flex items-center justify-end px-6 py-4">
        <ThemeToggle />
      </header>
      <h1
        className={clsx(
          'duration-500',
          'text-6xl',
          'font-bold',
          'text-blue-500',
          'transition-all',
          'hover:bg-blue-500',
          'hover:text-white',
        )}
        onClick={() => {
          console.log('clicou no h1');
        }}
      >
        Texto no meu H1
      </h1>
    </>
  );
}
```

> Client Component — `onClick` no `h1` exige JavaScript no cliente. Composição: `header` com `ThemeToggle` + `h1` interativo com transição hover. **Não referenciado** em `page.tsx` — código órfão no fluxo atual da home.

---

### `src/app/layout.tsx`

```tsx
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../contexts/ThemeContext';

export const metadata: Metadata = {
  title: 'Este é um blog com Next.js',
  description: 'Descrição do Site em si.',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

> Server Component que exporta `metadata` estático — injetado no `<head>` pelo Next.js. `import type { Metadata }` — importação de tipo puro. `ThemeProvider` (Client) é filho do layout Server — fronteira válida: o bundler cria chunk client separado. `className="dark"` no `<html>` conflita com `data-theme` gerenciado pelo contexto. `suppressHydrationWarning` no `<html>` suprime aviso de mismatch de atributos durante hidratação do tema.

---

### `src/app/page.tsx`

```tsx
import { Container } from '@/components/Container';
import PostsList from '@/components/PostsList';
import SpinLoader from '@/components/SpinLoader';
import { Suspense } from 'react';

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Container>
        <header>
          <h1 className="py-8 text-center text-6xl font-bold">
            Aqui é a HEADER
          </h1>
        </header>

        <Suspense fallback={<SpinLoader />}>
          <PostsList />
        </Suspense>

        <footer>
          <p className="py-8 text-center text-6xl font-bold">Footer</p>
        </footer>
      </Container>
    </div>
  );
}
```

> Server Component assíncrono (sem await próprio, mas filho async dentro de Suspense). Estrutura: wrapper externo duplica classes de `Container` — redundância de estilo. `Suspense` delimita streaming: shell (header/footer) envia primeiro; `PostsList` streama quando `findAll` completa. `SpinLoader` aparece no buraco de suspense.

---

### `src/app/globals.css`

```css
@import 'tailwindcss';
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

> Tailwind v4 — import único substitui `@tailwind base/components/utilities`. `@custom-variant dark` redefine `dark:` para responder a `data-theme=dark` em vez de `prefers-color-scheme` ou classe `.dark` padrão.

```css
@theme {
  --color-background: #f8f8f6;
  --color-surface: #ffffff;
  --color-text-primary: #1a1a18;
}

[data-theme='dark'] {
  --color-background: #1a1a18;
  --color-surface: #2c2c2a;
  --color-text-primary: #f1efe8;
}
```

> Tokens semânticos — componentes podem usar `bg-background` via `@theme`. Override em `[data-theme='dark']` troca paleta quando `applyTheme` seta o atributo.

```css
html,
html * {
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}
```

> Transição global em troca de tema — suaviza flash entre light/dark. Custo: toda mudança de cor em qualquer elemento herda transição de 300ms.

---

### `next.config.ts`

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: false,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [],
  },
  turbopack: {
    root: __dirname,
  },
} satisfies NextConfig;

export default nextConfig;
```

> `import type` + `satisfies NextConfig` — tipagem estrita sem widening. `ignoreBuildErrors: false` — build falha em erro TS. `turbopackFileSystemCacheForDev` acelera recompilação em dev. `remotePatterns: []` — nenhuma imagem remota permitida ainda. `turbopack.root` ancora resolução de módulos na raiz do projeto.

---

## Parte 4 — Fluxo de dados e estado

### Context API — Tema

```
resolveInitialTheme() → useState(theme)
         ↓
ThemeProvider value={{ theme, toggleTheme }}
         ↓
useTheme() em ThemeToggle
         ↓
toggleTheme() → applyTheme(next) → setTheme(next)
         ↓
[data-theme] no <html> + re-render Consumers
```

| Ação                                    | Estado antes     | Estado depois                                    | Efeito colateral                                     |
| --------------------------------------- | ---------------- | ------------------------------------------------ | ---------------------------------------------------- |
| Montagem do Provider                    | —                | `theme = resolveInitialTheme()` (SSR: `'light'`) | Nenhum até primeiro toggle                           |
| `toggleTheme()` com `theme === 'light'` | `'light'`        | `'dark'`                                         | `data-theme="dark"`, `localStorage.theme = 'dark'`   |
| `toggleTheme()` com `theme === 'dark'`  | `'dark'`         | `'light'`                                        | `data-theme="light"`, `localStorage.theme = 'light'` |
| `setMounted(true)` em ThemeToggle       | `mounted: false` | `mounted: true`                                  | Botão passa de `null` para render completo           |

**Por que Context e não prop drilling:** `ThemeToggle` pode ser montado em qualquer profundidade (Header, sidebar futura) sem passar props por cada nível. O Provider no `layout.tsx` cobre todas as rotas do segmento raiz.

**Por que `useState` e não `useReducer`:** o estado tem um único campo (`theme`) e uma única transição (toggle binário). Reducer adicionaria boilerplate (`SET_THEME`, `TOGGLE`) sem ganho de previsibilidade neste domínio.

### Fluxo de dados — Posts

```
page.tsx (Server)
    → Suspense boundary
        → PostsList (async Server Component)
            → postRepository.findAll()
                → JsonPostRepository.readFromDisk()
                    → fs.readFile → JSON.parse → posts[]
            → map → HTML (title, excerpt)
```

Sem estado React no fluxo de posts — dados fluem server-to-HTML. O cliente recebe markup; não há re-fetch no browser neste estágio.

---

## Parte 5 — Relação entre arquivos

### Grafo de dependências

```
post-models.ts
    ↑ import type
post-repository.ts (interface)
    ↑ implements
json-post-repository.ts
    ↑ instancia
repositories/post/index.ts ──export postRepository──→ PostsList
                                                          ↑
page.tsx ──Suspense──→ SpinLoader (fallback)
         ──import──→ Container

ThemeContext.tsx ──ThemeProvider──→ layout.tsx
                 ──useTheme──→ ThemeToggle.tsx ──import──→ Header.tsx (órfão)

globals.css ← import ─ layout.tsx
```

### Contratos entre módulos

| Exportador       | Consumidor                             | O que flui                               |
| ---------------- | -------------------------------------- | ---------------------------------------- |
| `PostModel`      | `PostRepository`, `JsonPostRepository` | Shape do post                            |
| `PostRepository` | `index.ts`, `JsonPostRepository`       | Interface de persistência                |
| `postRepository` | `PostsList`                            | Instância singleton `JsonPostRepository` |
| `ThemeProvider`  | `layout.tsx`                           | Contexto de tema para toda a app         |
| `useTheme`       | `ThemeToggle`                          | `{ theme, toggleTheme }`                 |
| `Container`      | `page.tsx`                             | Slot `children` de layout                |
| `SpinLoader`     | `page.tsx` via `Suspense`              | UI de loading                            |

### Arquivos sem relação direta no fluxo da home

- **`Header/index.tsx`** — não importado por `page.tsx`. Funciona isoladamente como alternativa de header com `ThemeToggle`, mas a home usa header inline sem toggle de tema.
- **`next.config.ts`**, **`prettier.config.js`** — tooling; sem import em runtime da aplicação.

### Ponto de atenção

- **`json-post-repository.ts` exporta `postRepository` duplicado** — mesma instância conceitual que `index.ts`. Consumidores devem usar apenas `repositories/post/index.ts` como composition root; o export na classe cria duplicidade de ponto de entrada.

---

## Parte 5-A — Arquitetura de Rotas

### Árvore de rotas

```
src/app/
├── globals.css      → stylesheet (global)
├── layout.tsx       → layout (segmento raiz)
└── page.tsx         → page (rota /)
```

| Segmento | Arquivo       | Tipo       | Ambiente                 |
| -------- | ------------- | ---------- | ------------------------ |
| `/`      | `layout.tsx`  | `layout`   | Server Component         |
| `/`      | `page.tsx`    | `page`     | Server Component (async) |
| global   | `globals.css` | stylesheet | importado pelo layout    |

Não há `loading.tsx`, `error.tsx`, `route.ts` ou segmentos dinâmicos (`[slug]`) neste snapshot.

### Fronteira Server / Client

| Arquivo                   | Classificação | Motivo                                           |
| ------------------------- | ------------- | ------------------------------------------------ |
| `layout.tsx`              | Server        | Sem hooks, exporta `metadata`, importa CSS       |
| `page.tsx`                | Server        | Async, compõe Server Components, usa `Suspense`  |
| `PostsList`               | Server        | `async` + `await postRepository` + `fs` indireto |
| `Container`, `SpinLoader` | Server        | Sem interatividade, sem hooks                    |
| `ThemeContext.tsx`        | **Client**    | `useState`, `localStorage`, `document`           |
| `ThemeToggle`             | **Client**    | `useEffect`, `onClick`, `useTheme`               |
| `Header`                  | **Client**    | `onClick`, importa `ThemeToggle`                 |

**Fronteira traçada em `layout.tsx`:** o layout permanece Server; `ThemeProvider` é o único Client boundary necessário no root — envolve `{children}` sem converter o layout inteiro.

**Persistência de layout:** ao navegar entre rotas filhas do mesmo `layout.tsx` (futuro `/about`, `/posts`), o layout não desmonta — `ThemeProvider` mantém estado de tema. Apenas o slot `{children}` troca.

**Análise da decisão:** posicionar `ThemeProvider` no root layout é adequado — tema é cross-cutting. `PostsList` como Server Component é adequado — leitura de filesystem não deve ir ao bundle client. **Inconsistência:** `page.tsx` não usa `Header` com `ThemeToggle`; o usuário na home não tem acesso ao toggle de tema apesar do Provider estar ativo.

---

## Parte Final — Auditoria e Exercícios

### Auditoria

**`RC002` — Componente sem arrow function detectado** _(🔵 Baixo)_

Arquivos: `Container`, `Header`, `PostsList`, `SpinLoader`.

```tsx
export function Container({ children }: ContainerProps) {
  return (/* ... */);
}
```

Problema: Protocolo Aruanda padroniza arrow functions para componentes. `function` é válido em React, mas fragmenta consistência com `ThemeToggle` e `ThemeProvider`.

```tsx
export const Container = ({ children }: ContainerProps) => {
  return (/* ... */);
};
```

---

**`RC003` — Props sem tipo explícito detectado** _(🟡 Médio)_

Arquivos: `Header`, `PostsList`, `ThemeToggle`.

```tsx
export default function Header() {
  return (/* ... */);
}
```

Problema: sem `type HeaderProps`, qualquer prop futura não será checada pelo compilador. Componentes sem props hoje devem declarar `type HeaderProps = Record<string, never>` ou `{}` explicitamente para manter o contrato e permitir evolução segura.

```tsx
type HeaderProps = Record<string, never>;

const Header = (_props: HeaderProps) => {
  return (/* ... */);
};

export default Header;
```

Para `ThemeToggle`:

```tsx
type ThemeToggleProps = Record<string, never>;

export const ThemeToggle = (_props: ThemeToggleProps) => {
  /* ... */
};
```

---

**`RC005` — `console.log` detectado em componente/hook** _(🟡 Médio)_

Arquivo: `Header`.

```tsx
onClick={() => {
  console.log('clicou no h1');
}}
```

Problema: log de debug vaza para produção, polui console do usuário, não é estruturado nem removível por ambiente.

```tsx
onClick={() => {
  // Removido — ou substituir por handler de domínio com prop onTitleClick?: () => void
}}
```

Versão com contrato explícito:

```tsx
type HeaderProps = {
  onTitleClick?: () => void;
};

const Header = ({ onTitleClick }: HeaderProps) => {
  return <h1 onClick={onTitleClick}>Texto no meu H1</h1>;
};
```

---

**`ESL002` — `eslint-disable` sem justificativa detectado** _(🔵 Baixo)_

Arquivo: `ThemeToggle`.

```tsx
useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setMounted(true);
}, []);
```

Problema: supressão sem explicar por que `set-state-in-effect` é aceitável aqui.

```tsx
useEffect(() => {
  // Montagem adiada evita hydration mismatch: tema pode diferir entre SSR e client
  // eslint-disable-next-line react-hooks/set-state-in-effect -- ver comentário acima
  setMounted(true);
}, []);
```

---

**`TS002` — Arquivo .ts com imports internos sem `import type`** _(🟡 Médio)_

Arquivos: `post-repository.ts`, `json-post-repository.ts`, `repositories/post/index.ts`.

```ts
import { PostModel } from '../../models/post/post-models';
import { PostRepository } from './post-repository';
```

Problema: `PostModel` e `PostRepository` são usados apenas como tipos em assinaturas. Import value pode impedir tree-shaking e incluir módulo desnecessariamente no bundle quando usado em contextos mistos.

```ts
import type { PostModel } from '@/models/post/post-models';
import type { PostRepository } from './post-repository';
```

Em `index.ts`, `JsonPostRepository` é valor (instanciação) — permanece import normal; `PostRepository` na anotação de tipo pode ser `import type`.

---

### Exercícios

#### Básico — Converter Container para arrow function e path alias

**Enunciado:** Refatore `Container` para arrow function exportada. Mova o arquivo para usar import `@/` caso outros componentes o referenciem. Mantenha as mesmas classes Tailwind.

**Critério de aceitação:**

- [ ] `Container` é `export const Container = (...) => { ... }`
- [ ] `type ContainerProps` permanece declarado
- [ ] `page.tsx` renderiza o layout idêntico ao anterior
- [ ] `npm run build` completa sem erros TypeScript

---

#### Médio — Integrar Header com ThemeToggle na home

**Enunciado:** Substitua o `<header>` inline de `page.tsx` pelo componente `Header`. Remova o `console.log`, adicione `type HeaderProps` (mesmo que vazio). Decida se `Header` permanece Client Component ou se extrai apenas o `h1` para Server — documente a decisão em um comentário de uma linha.

**Critério de aceitação:**

- [ ] `ThemeToggle` visível na rota `/`
- [ ] Alternar tema persiste após reload
- [ ] Nenhum `console.log` em componentes
- [ ] `Header` possui `type HeaderProps` explícito
- [ ] Sem erros de hidratação no console do browser

---

#### Avançado — Repositório com validação e rota de detalhe

**Enunciado:** (1) Adicione validação runtime ao `readFromDisk` com Zod ou schema manual — `createdAt`/`updatedAt` devem virar `Date`. (2) Corrija `findById` para retornar `null` em vez de `throw` quando ID não existe. (3) Crie `src/app/posts/[slug]/page.tsx` como Server Component que busca post por slug. (4) Use `import type` em todos os repositórios. (5) Centralize `postRepository` apenas em `index.ts`.

**Critério de aceitação aberto com revisão de decisões:**

- [ ] Listagem e detalhe funcionam com dados do JSON seed
- [ ] Tipo `PostModel` reflete runtime após parse (datas reais)
- [ ] Documentar em comentário: estratégia de cache (estático vs `revalidate`) escolhida para a rota de detalhe
- [ ] Justificar por que filesystem read permanece no servidor e não virou `fetch` para API
- [ ] `npm run lint` e `npm run build` verdes
- [ ] Revisão de par: outro dev consegue trocar `JsonPostRepository` por implementação HTTP alterando só `index.ts`

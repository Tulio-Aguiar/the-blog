# TEACHER_CONTEXT — the-blog

## Metadados

| Campo         | Valor                           |
| ------------- | ------------------------------- |
| Modo          | projeto completo                |
| Projeto       | the-blog v0.1.0                 |
| Framework     | Next.js                         |
| Linguagem     | TypeScript                      |
| Bundler       | Next.js                         |
| Estado global | Context API / local             |
| Módulos       | CommonJS                        |
| Stack         | Next.js · TypeScript · Tailwind |

## Arquivos Analisados

- `src\components\Container\index.tsx` (component, src)
- `src\components\Header\index.tsx` (component, src)
- `src\components\PostsList\index.tsx` (component, src)
- `src\components\SpinLoader\index.tsx` (component, src)
- `src\components\ThemeToggle\ThemeToggle.tsx` (component, src)
- `src\contexts\ThemeContext.tsx` (context, src)
- `src\models\post\post-models.ts` (module, src)
- `src\repositories\post\index.ts` (module, src)
- `src\repositories\post\json-post-repository.ts` (module, src)
- `src\repositories\post\post-repository.ts` (module, src)
- `next.config.ts` (config, root)
- `prettier.config.js` (module, root)
- `src\app\globals.css` (stylesheet, app)
- `src\app\layout.tsx` (next-layout, app)
- `src\app\page.tsx` (next-page, app)

## Análise por Arquivo

### `src\components\Container\index.tsx`

- **Tipo:** component
- **Complexidade:** básica
- **Linhas:** 12
- **Origem:** src
- **Padrões detectados:** hasPropsType, hasNamedExport, hasTailwind
- **Exports:** Container

**Conteúdo:**

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

### `src\components\Header\index.tsx`

- **Tipo:** component
- **Complexidade:** básica
- **Linhas:** 31
- **Origem:** src
- **Padrões detectados:** hasConsoleLog, hasDefaultExport, hasTailwind, hasUseClient
- **Exports:** Header
- **Imports internos:** ../ThemeToggle/ThemeToggle
- **Imports externos:** clsx

**Conteúdo:**

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

### `src\components\PostsList\index.tsx`

- **Tipo:** component
- **Complexidade:** básica
- **Linhas:** 18
- **Origem:** src
- **Padrões detectados:** hasDefaultExport, hasTailwind, hasAsync, hasAwait
- **Imports internos:** ../../repositories/post

**Conteúdo:**

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

### `src\components\SpinLoader\index.tsx`

- **Tipo:** component
- **Complexidade:** básica
- **Linhas:** 28
- **Origem:** src
- **Padrões detectados:** hasPropsType, hasDefaultExport
- **Exports:** SpinLoader
- **Imports externos:** clsx

**Conteúdo:**

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

### `src\components\ThemeToggle\ThemeToggle.tsx`

- **Tipo:** component
- **Complexidade:** básica
- **Linhas:** 35
- **Origem:** src
- **Padrões detectados:** hasUseState, hasUseEffect, hasEslintDisable, hasArrowComponent, hasNamedExport, hasTailwind
- **Hooks utilizados:** useEffect, useState, useTheme
- **Exports:** ThemeToggle
- **Imports internos:** @/contexts/ThemeContext
- **Imports externos:** react, lucide-react

**Conteúdo:**

```tsx
// src/components/ThemeToggle/ThemeToggle.tsx
'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null; // ou um placeholder com as mesmas dimensões

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

### `src\contexts\ThemeContext.tsx`

- **Tipo:** context
- **Complexidade:** avançada
- **Linhas:** 50
- **Origem:** src
- **Padrões detectados:** hasUseState, hasUseContext, hasCustomHook, hasContext, hasGeneric, hasArrowComponent, hasPropsType, hasNamedExport, hasUseClient
- **Hooks utilizados:** useContext, useState, useTheme
- **Exports:** ThemeProvider
- **Imports externos:** react

**Conteúdo:**

```tsx
'use client';

import { createContext, useContext, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: React.ReactNode;
};

const applyTheme = (theme: Theme): void => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
};

const resolveInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';

  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(resolveInitialTheme);

  const toggleTheme = (): void => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    setTheme(next);
  };

  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
};
```

### `src\models\post\post-models.ts`

- **Tipo:** module
- **Complexidade:** básica
- **Linhas:** 13
- **Origem:** src
- **Padrões detectados:** hasNamedExport
- **Exports:** PostModel

**Conteúdo:**

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

### `src\repositories\post\index.ts`

- **Tipo:** module
- **Complexidade:** básica
- **Linhas:** 5
- **Origem:** src
- **Padrões detectados:** hasNamedExport
- **Imports internos:** ./post-repository, ./json-post-repository

**Conteúdo:**

```ts
import { PostRepository } from './post-repository';
import { JsonPostRepository } from './json-post-repository';

export const postRepository: PostRepository = new JsonPostRepository();
```

### `src\repositories\post\json-post-repository.ts`

- **Tipo:** module
- **Complexidade:** básica
- **Linhas:** 68
- **Origem:** src
- **Padrões detectados:** hasGeneric, hasConsoleLog, hasCommentedCode, hasNamedExport, hasAsync, hasAwait
- **Exports:** JsonPostRepository
- **Imports internos:** ../../models/post/post-models, ./post-repository
- **Imports externos:** path, fs/promises

**Conteúdo:**

```ts
// import { readFile } from 'node:fs/promises'

import { PostModel } from '../../models/post/post-models';
import { PostRepository } from './post-repository';
import path from 'path';
import { readFile } from 'fs/promises';

const ROOT_DIR = process.cwd();
const JSON_FILE_PATH = path.resolve(ROOT_DIR, 'src', 'db', 'seed', 'post.json');

const SIMULATE_WAIT_IN_MS = 0;

export class JsonPostRepository implements PostRepository {
  private async simulateAwait() {
    if (SIMULATE_WAIT_IN_MS >= 0) {
      await new Promise((resolve) => setTimeout(resolve, SIMULATE_WAIT_IN_MS));
    }
  }
  private async readFromDisk(): Promise<PostModel[]> {
    const jsonContent = await readFile(JSON_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(jsonContent);

    return parsed.posts;
  }
  async findAll(): Promise<PostModel[]> {
    await this.simulateAwait();
    const posts = await this.readFromDisk();
    return posts;
  }

  async findById(id: string): Promise<PostModel | null> {
    await this.simulateAwait();
    const posts = await this.findAll();
    const post = posts.find((post) => post.id === id);

    if (!post) {
      throw new Error(`Post with id ${id} not found`);
    }

    return post || null;
  }

  async create(post: PostModel): Promise<PostModel> {
    return post;
  }

  async update(post: PostModel): Promise<PostModel> {
    return post;
  }

  async delete(id: string): Promise<void> {
    void id;
  }
}

export const postRepository: PostRepository = new JsonPostRepository();

// (async () => {
//   // const posts = await postRepository.findAll();
//   // posts.forEach((post) => {
//   //   console.log(post.author);
//   // });
//   const post = await postRepository.findById(
//     '99f8add4-7684-4c16-a316-616271db199e ',
//   );
//   console.log(post);
// })();
```

### `src\repositories\post\post-repository.ts`

- **Tipo:** module
- **Complexidade:** básica
- **Linhas:** 10
- **Origem:** src
- **Padrões detectados:** hasGeneric, hasNamedExport
- **Exports:** PostRepository
- **Imports internos:** ../../models/post/post-models

**Conteúdo:**

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

### `next.config.ts`

- **Tipo:** config
- **Complexidade:** básica
- **Linhas:** 20
- **Origem:** root
- **Padrões detectados:** hasImportType, hasDefaultExport
- **Imports externos:** next

**Conteúdo:**

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

### `prettier.config.js`

- **Tipo:** module
- **Complexidade:** básica
- **Linhas:** 12
- **Origem:** root
- **Padrões detectados:** hasDefaultExport

**Conteúdo:**

```js
/** @type {import("prettier").Config} */
const config = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 80,
  plugins: ['prettier-plugin-tailwindcss'],
};

export default config;
```

### `src\app\globals.css`

- **Tipo:** stylesheet
- **Complexidade:** básica
- **Linhas:** 24
- **Origem:** app
- **Ambiente:** Server Component
- **Padrões detectados:** nenhum padrão especial detectado

**Conteúdo:**

```css
@import 'tailwindcss';
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
@import 'tailwindcss';

@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

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
html,
html * {
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}
```

### `src\app\layout.tsx`

- **Tipo:** next-layout
- **Complexidade:** básica
- **Linhas:** 23
- **Origem:** app
- **Ambiente:** Server Component
- **Padrões detectados:** hasImportType, hasGeneric, hasPropsType, hasDefaultExport, hasNamedExport, hasTailwind
- **Exports:** RootLayout
- **Imports internos:** ../contexts/ThemeContext
- **Imports externos:** next

**Conteúdo:**

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

### `src\app\page.tsx`

- **Tipo:** next-page
- **Complexidade:** básica
- **Linhas:** 27
- **Origem:** app
- **Ambiente:** Server Component
- **Padrões detectados:** hasGeneric, hasDefaultExport, hasTailwind, hasAsync
- **Imports internos:** @/components/Container, @/components/PostsList, @/components/SpinLoader
- **Imports externos:** react

**Conteúdo:**

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

## Contexto de Framework

| Campo                       | Valor                  |
| --------------------------- | ---------------------- |
| Framework                   | Next.js com App Router |
| Arquivos de rota detectados | 3                      |
| Server Components           | 3                      |
| Client Components           | 0                      |
| Server Actions              | 0                      |

### Mapa de Rotas

| Arquivo               | Tipo        | Ambiente         |
| --------------------- | ----------- | ---------------- |
| `src\app\globals.css` | stylesheet  | Server Component |
| `src\app\layout.tsx`  | next-layout | Server Component |
| `src\app\page.tsx`    | next-page   | Server Component |

## Auditoria de Código

### src\components\Container\index.tsx

| Severidade | Código  | Mensagem                                |
| ---------- | ------- | --------------------------------------- |
| 🔵 Baixo   | `RC002` | Componente sem arrow function detectado |

**Detalhes:**

- **🔵 Baixo** `RC002` — Componente sem arrow function detectado
  > O padrão do Protocolo Aruanda é arrow function para todos os componentes. Componentes `function` são válidos, mas inconsistentes com o restante da base.

### src\components\Header\index.tsx

| Severidade | Código  | Mensagem                                   |
| ---------- | ------- | ------------------------------------------ |
| 🔵 Baixo   | `RC002` | Componente sem arrow function detectado    |
| 🟡 Médio   | `RC003` | Props sem tipo explícito detectado         |
| 🟡 Médio   | `RC005` | `console.log` detectado em componente/hook |

**Detalhes:**

- **🔵 Baixo** `RC002` — Componente sem arrow function detectado
  > O padrão do Protocolo Aruanda é arrow function para todos os componentes. Componentes `function` são válidos, mas inconsistentes com o restante da base.
- **🟡 Médio** `RC003` — Props sem tipo explícito detectado
  > Todo componente deve ter um `type [Nome]Props = { ... }` declarado. Props sem tipo desativam a checagem do compilador para toda a interface do componente.
- **🟡 Médio** `RC005` — `console.log` detectado em componente/hook
  > Logs de debug não devem ir para produção. Remova ou substitua por uma estratégia de logging estruturado.

### src\components\PostsList\index.tsx

| Severidade | Código  | Mensagem                                |
| ---------- | ------- | --------------------------------------- |
| 🔵 Baixo   | `RC002` | Componente sem arrow function detectado |
| 🟡 Médio   | `RC003` | Props sem tipo explícito detectado      |

**Detalhes:**

- **🔵 Baixo** `RC002` — Componente sem arrow function detectado
  > O padrão do Protocolo Aruanda é arrow function para todos os componentes. Componentes `function` são válidos, mas inconsistentes com o restante da base.
- **🟡 Médio** `RC003` — Props sem tipo explícito detectado
  > Todo componente deve ter um `type [Nome]Props = { ... }` declarado. Props sem tipo desativam a checagem do compilador para toda a interface do componente.

### src\components\SpinLoader\index.tsx

| Severidade | Código  | Mensagem                                |
| ---------- | ------- | --------------------------------------- |
| 🔵 Baixo   | `RC002` | Componente sem arrow function detectado |

**Detalhes:**

- **🔵 Baixo** `RC002` — Componente sem arrow function detectado
  > O padrão do Protocolo Aruanda é arrow function para todos os componentes. Componentes `function` são válidos, mas inconsistentes com o restante da base.

### src\components\ThemeToggle\ThemeToggle.tsx

| Severidade | Código   | Mensagem                                     |
| ---------- | -------- | -------------------------------------------- |
| 🟡 Médio   | `RC003`  | Props sem tipo explícito detectado           |
| 🔵 Baixo   | `ESL002` | `eslint-disable` sem justificativa detectado |

**Detalhes:**

- **🟡 Médio** `RC003` — Props sem tipo explícito detectado
  > Todo componente deve ter um `type [Nome]Props = { ... }` declarado. Props sem tipo desativam a checagem do compilador para toda a interface do componente.
- **🔵 Baixo** `ESL002` — `eslint-disable` sem justificativa detectado
  > Supressão de regra ESLint sem explicação. Adicione um comentário descrevendo por que a regra foi suprimida neste ponto.

### src\repositories\post\index.ts

| Severidade | Código  | Mensagem                                           |
| ---------- | ------- | -------------------------------------------------- |
| 🟡 Médio   | `TS002` | Arquivo .ts com imports internos sem `import type` |

**Detalhes:**

- **🟡 Médio** `TS002` — Arquivo .ts com imports internos sem `import type`
  > Para importações de tipo puro, `import type` garante que o módulo não é incluído no bundle de runtime. Verifique se há importações que deveriam usar essa diretiva.

### src\repositories\post\json-post-repository.ts

| Severidade | Código  | Mensagem                                           |
| ---------- | ------- | -------------------------------------------------- |
| 🟡 Médio   | `TS002` | Arquivo .ts com imports internos sem `import type` |

**Detalhes:**

- **🟡 Médio** `TS002` — Arquivo .ts com imports internos sem `import type`
  > Para importações de tipo puro, `import type` garante que o módulo não é incluído no bundle de runtime. Verifique se há importações que deveriam usar essa diretiva.

### src\repositories\post\post-repository.ts

| Severidade | Código  | Mensagem                                           |
| ---------- | ------- | -------------------------------------------------- |
| 🟡 Médio   | `TS002` | Arquivo .ts com imports internos sem `import type` |

**Detalhes:**

- **🟡 Médio** `TS002` — Arquivo .ts com imports internos sem `import type`
  > Para importações de tipo puro, `import type` garante que o módulo não é incluído no bundle de runtime. Verifique se há importações que deveriam usar essa diretiva.

## Instrução de Produção para o Cursor Agent

Você recebeu este arquivo como contexto estruturado. Leia **TEACHER_LESSON.md** (instrução completa em templates/).

**Modo de operação:** project
**Complexidade detectada:** básica, avançada
**Tipos de arquivo:** component, context, module, config, stylesheet, next-layout, next-page

**Seções obrigatórias nesta aula:**

- ## Parte 1 — Contexto e Stack
- ## Parte 2 — Contratos de Tipo
- ## Parte 3 — Anatomia linha por linha
- ## Parte 4 — Fluxo de dados e estado
- ## Parte 5-A — Arquitetura de Rotas
- ## Parte Final — Auditoria e Exercícios

**Regras de produção:**

- Escreva em Português (Brasil)
- Toda explicação de código deve ser linha por linha ou bloco por bloco, nunca resumida
- A seção de auditoria deve transformar cada ponto detectado em material pedagógico
- Exercícios: obrigatoriamente três — Básico, Médio e Avançado — com critério de aceitação explícito
- Não invente referências a outros arquivos que não estejam neste contexto
- Não use React.FC, não use any, não use caminhos relativos com ../ nos exemplos
- Em projetos Next.js: não use next/router — use next/navigation; declare sempre a estratégia de cache no fetch

Produza o arquivo `teacher-output/TEACHER_LESSON.md` na raiz do projeto analisado.

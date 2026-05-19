# 📸 Galeria Privada

Galeria de imagens privada com proteção por código de acesso.
Hospedada no Netlify, sem backend, sem banco de dados.

---

## ⚠️ Aviso de Segurança Importante

> **Este sistema NÃO oferece segurança real.**
>
> - A senha (`ACCESS_CODE`) fica visível no código-fonte do JavaScript.
> - Qualquer pessoa que inspecionar o código no navegador consegue ver a senha.
> - **As imagens continuam publicamente acessíveis** via URL direta, mesmo que o site esteja "protegido".
> - Esta proteção é adequada apenas para uso pessoal básico — não para dados confidenciais ou sensíveis.
>
> Para proteção real, você precisaria de autenticação com backend (ex: Netlify Identity, Firebase Auth, etc.).

---

## 🚀 Como fazer o deploy

### 1. GitHub

```bash
git init
git add .
git commit -m "Initial upload"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

### 2. Netlify

1. Acesse [netlify.com](https://netlify.com) e faça login.
2. Clique em **"Add new site" → "Import an existing project"**.
3. Escolha **GitHub** e selecione seu repositório.
4. Deixe as configurações padrão (o `netlify.toml` já cuida de tudo).
5. Clique em **"Deploy site"**.
6. Pronto! O deploy será automático a cada `git push`.

---

## 🔑 Como alterar a senha

Abra o arquivo `auth.js` e altere a linha:

```js
const ACCESS_CODE = "RS2026";
```

Substitua `"RS2026"` pela senha desejada, salve e faça o push:

```bash
git add auth.js
git commit -m "Alterar senha de acesso"
git push
```

O Netlify fará o deploy automaticamente.

---

## 🗂️ Como adicionar um novo álbum

### Passo 1 — Crie a pasta do álbum

Dentro da pasta `albums/`, crie uma nova pasta com o nome do álbum (sem espaços, use `-` ou `_`):

```
albums/
└── meu-novo-album/
    ├── foto1.jpg
    ├── foto2.jpg
    └── foto3.jpg
```

### Passo 2 — Atualize o arquivo `data/albums.json`

Adicione um novo objeto ao array JSON:

```json
{
  "name": "Meu Novo Álbum",
  "folder": "meu-novo-album",
  "cover": "foto1.jpg",
  "images": [
    "foto1.jpg",
    "foto2.jpg",
    "foto3.jpg"
  ]
}
```

**Campos:**
| Campo    | Descrição                                              |
|----------|--------------------------------------------------------|
| `name`   | Nome exibido na interface                              |
| `folder` | Nome exato da pasta dentro de `/albums/`               |
| `cover`  | Nome do arquivo usado como capa do álbum               |
| `images` | Lista de todos os arquivos de imagem do álbum, em ordem|

### Passo 3 — Faça o push

```bash
git add .
git commit -m "Adicionar álbum: Meu Novo Álbum"
git push
```

O Netlify fará o deploy em segundos.

---

## 🔗 Como as URLs públicas funcionam

Após o deploy, cada imagem terá uma URL pública no formato:

```
https://SEU-SITE.netlify.app/albums/PASTA/NOME-DO-ARQUIVO.jpg
```

**Exemplo:**
```
https://minha-galeria.netlify.app/albums/casamento/foto1.jpg
```

Você pode copiar essas URLs diretamente no modal de imagem, clicando no botão **"Copiar URL"**.

> ⚠️ Essas URLs são **públicas**: qualquer pessoa com o link pode acessar a imagem diretamente, **sem precisar da senha** do site.

---

## 🗃️ Estrutura do Projeto

```
gallery-site/
│
├── index.html          # Página principal
├── style.css           # Estilos (dark mode, responsivo)
├── script.js           # Lógica da galeria
├── auth.js             # Sistema de autenticação
├── netlify.toml        # Configuração do Netlify
├── README.md           # Esta documentação
│
├── albums/             # Suas imagens ficam aqui
│   ├── casamento/
│   │   ├── foto1.jpg
│   │   └── foto2.jpg
│   ├── evento/
│   └── viagem/
│
├── data/
│   └── albums.json     # Configuração dos álbuns
│
└── assets/
    ├── favicon.svg
    └── placeholder.svg
```

---

## 🎨 Recursos da Interface

- **Login por código** com feedback visual de erro
- **Sessão** salva por 8 horas (via `localStorage`)
- **Pesquisa** de álbuns por nome
- **Filtros** por ordem alfabética, recentes ou quantidade de fotos
- **Grid responsivo** de álbuns e imagens
- **Modal fullscreen** com navegação por teclado (← →) e tecla Esc
- **Download** de imagens direto pelo modal
- **Copiar URL pública** com um clique
- **Lazy loading** para carregamento rápido
- **Dark mode** elegante

---

## 🛠️ Tecnologias

- HTML5 puro
- CSS3 (sem framework)
- JavaScript Vanilla (sem biblioteca)
- Google Fonts (Playfair Display + DM Sans)

---

## 📱 Compatibilidade

Testado e otimizado para:
- Chrome, Firefox, Safari, Edge (versões modernas)
- Desktop, Tablet, Mobile

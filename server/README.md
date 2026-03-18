# 📦 Process Monitor SaaS - Asset Storage Platform

> Sistema SaaS para gerenciamento e upload de assets digitais com integração multi-cloud (Google Drive, OneDrive e armazenamento local)

## 🚀 Tecnologias

### Backend
- **NestJS** - Framework Node.js
- **TypeScript** - Linguagem
- **Prisma** - ORM
- **PostgreSQL** - Banco de dados
- **Redis + BullMQ** - Sistema de filas
- **WebSockets** - Real-time updates

### Integrações
- Google Drive API
- Microsoft Graph (OneDrive)
- Magic Link Authentication (JWT)

---

## 📁 Arquitetura

O projeto segue **Clean Architecture** com as seguintes camadas:

```
src/
├── domain/              # Regras de negócio
│   ├── entities/
│   ├── repositories/
│   ├── value-objects/
│   └── exceptions/
├── application/         # Casos de uso
│   ├── use-cases/
│   ├── dtos/
│   └── ports/
├── infrastructure/      # Implementações externas
│   ├── controllers/
│   ├── services/
│   ├── adapters/
│   │   ├── database/
│   │   ├── queue/
│   │   ├── storage/
│   │   ├── email/
│   │   └── oauth/
│   ├── guards/
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   └── modules/
├── config/             # Configurações
└── shared/             # Código compartilhado
    ├── constants/
    ├── types/
    ├── utils/
    └── interfaces/
```

---

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone <repository-url>
cd process-monitor-saas
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

### 4. Suba os containers Docker (PostgreSQL + Redis)
```bash
npm run docker:dev
```

### 5. Execute as migrations do Prisma
```bash
npm run prisma:migrate
```

### 6. Popule o banco com dados iniciais (seed)
```bash
npm run prisma:seed
```

### 7. Inicie o servidor de desenvolvimento
```bash
npm run start:dev
```

A aplicação estará disponível em: `http://localhost:3000`

---

## 📜 Scripts Disponíveis

### Desenvolvimento
```bash
npm run start:dev       # Inicia em modo desenvolvimento com hot-reload
npm run start:debug     # Inicia em modo debug
```

### Build & Produção
```bash
npm run build           # Compila o projeto
npm run start:prod      # Inicia em modo produção
```

### Prisma
```bash
npm run prisma:generate # Gera o Prisma Client
npm run prisma:migrate  # Cria e aplica migrations
npm run prisma:studio   # Abre o Prisma Studio (GUI)
npm run prisma:seed     # Popula o banco com dados iniciais
```

### Docker
```bash
npm run docker:dev        # Sobe containers de desenvolvimento (DB + Redis)
npm run docker:dev:down   # Para containers de desenvolvimento
npm run docker:prod       # Sobe containers de produção (completo)
npm run docker:prod:down  # Para containers de produção
npm run docker:build      # Reconstrói as imagens
```

### Testes & Qualidade
```bash
npm run test            # Executa testes unitários
npm run test:watch      # Testes em modo watch
npm run test:cov        # Testes com cobertura
npm run lint            # Executa o linter
npm run format          # Formata o código com Prettier
```

---

## 🐳 Docker

### Docker Compose - Desenvolvimento
```bash
docker-compose -f docker-compose.dev.yml up -d
```

Serviços disponíveis:
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **BullMQ Board**: `localhost:3001` (monitoramento de filas)

### Docker Compose - Produção
```bash
docker-compose up -d
```

Serviços incluem backend completo + dependências.

---

## 🗄️ Banco de Dados

### Schema Principal

#### Users
- Sistema de whitelist (apenas emails cadastrados)
- Magic Link authentication

#### Storage Providers
- Google Drive
- OneDrive
- Local Storage

#### Uploads & Files
- Sistema de filas
- Tracking de progresso
- Retry automático

### Visualizar Banco (Prisma Studio)
```bash
npm run prisma:studio
```

Acesse: `http://localhost:5555`

---

## 🔐 Autenticação

### Magic Link Flow

1. Usuário informa email
2. Sistema valida se email está na whitelist
3. Envia email com link mágico (token JWT)
4. Token expira em 15 minutos
5. Login gera JWT de sessão (válido por 7 dias)

### Emails Autorizados (Seed)
- `admin@processmonitor.com`
- `user1@example.com`
- `user2@example.com`
- `test@example.com`

---

## 🌐 API Endpoints

### Health Check
```
GET /api/health
```

### Autenticação
```
POST /api/auth/magic-link    # Solicita magic link
POST /api/auth/verify        # Verifica token e faz login
POST /api/auth/logout        # Logout
```

### Storage Providers
```
GET  /api/providers           # Lista providers do usuário
POST /api/providers/google    # Conecta Google Drive
POST /api/providers/microsoft # Conecta OneDrive
```

### Uploads
```
POST /api/uploads             # Cria novo upload
GET  /api/uploads/:id         # Status do upload
GET  /api/uploads/:id/files   # Lista arquivos do upload
```

---

## 🔄 Sistema de Filas

### BullMQ + Redis

**Filas disponíveis:**
- `upload-queue`: Processamento de uploads
- `email-queue`: Envio de emails

**Monitoramento:**
- BullMQ Board: `http://localhost:3001`

---

## 🎯 Roadmap

### ✅ Fase 1 - Fundação (Atual)
- [x] Setup inicial do projeto
- [x] Docker + PostgreSQL + Redis
- [x] Prisma configurado
- [x] Clean Architecture estruturada
- [x] Autenticação Magic Link
- [ ] CRUD de usuários

### 🚧 Fase 2 - Integrações
- [ ] Google Drive OAuth + Upload
- [ ] OneDrive OAuth + Upload
- [ ] Local Storage

### 🎨 Fase 3 - Upload System
- [ ] Sistema de filas (BullMQ)
- [ ] Upload chunked/resumable
- [ ] Progress tracking
- [ ] WebSockets (real-time)

### 🚀 Fase 4 - Features Avançadas
- [ ] Upload de pastas (recursive)
- [ ] Retry automático
- [ ] Deduplicação de arquivos
- [ ] Analytics

---

## 📝 Licença

MIT

---

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📧 Contato

Para dúvidas ou sugestões, abra uma issue no repositório.

---

**Feito com ❤️ usando NestJS + Clean Architecture**

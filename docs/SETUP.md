# Setup Guide

## Pré-requisitos

- Node.js 16+
- PostgreSQL 12+
- npm ou yarn
- Git

## Instalação do Banco de Dados

1. Criar banco de dados PostgreSQL:
```bash
createdb posale_stulz
```

2. Executar migrations (em desenvolvimento):
```bash
cd backend
npm run migrate
```

## Setup Backend

1. Clonar repositório e entrar no diretório:
```bash
git clone https://github.com/VitorHMAlves/posale-stulz.git
cd posale-stulz/backend
```

2. Instalar dependências:
```bash
npm install
```

3. Configurar variáveis de ambiente:
```bash
cp .env.example .env
# Editar .env com suas credenciais
```

4. Iniciar servidor em desenvolvimento:
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:5000`

## Setup Frontend

1. Entrar no diretório do frontend:
```bash
cd ../frontend
```

2. Instalar dependências:
```bash
npm install
```

3. Configurar variáveis de ambiente:
```bash
cp .env.example .env
```

4. Iniciar aplicação:
```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## Verificação

- Backend health check: `curl http://localhost:5000/health`
- Frontend: Abrir `http://localhost:3000` no navegador

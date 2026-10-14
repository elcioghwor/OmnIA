# 🚀 OmnIA - Orquestrador de Inteligência Artificial

O **OmnIA** é um orquestrador inteligente projetado para atuar como um roteador dinâmico de requisições de Inteligência Artificial. Ele gerencia contextos, armazena históricos localmente em um banco de dados relacional e pondera as solicitações para direcioná-las ao modelo ideal — alternando de maneira eficiente entre processamento local (inicialmente utilizando o **Ollama**) e integrações futuras com provedores de nuvem mais robustos.

---

## 💡 Recursos Principais

- **Orquestração Inteligente (IA Router):** Camada abstrata preparada para avaliar prompts e balancear o processamento entre modelos locais e APIs externas.
- **Streaming de Respostas em Tempo Real:** Implementação de barramento **SSE (Server-Sent Events)** para entrega incremental e instantânea de tokens de texto na interface (`text/event-stream`).
- **Gerenciamento Robusto de Contexto:** Retenção e mapeamento histórico estruturado de conversas completas (`user` e `assistant`).
- **Persistência de Dados Relacional:** Controle transacional completo de históricos de mensagens e sessões de chat.
- **Suporte a Modelos de Raciocínio (*Thinking*):** Engine adaptada para interceptar e tratar blocos de pensamento lógico de LLMs modernos.

---

## 🛠️ Stack Tecnológica

### Backend (API)
- **Runtime:** Node.js
- **Framework:** NestJS (Arquitetura Modular)
- **ORM:** TypeORM
- **Banco de Dados:** MySQL
- **Validação de Entrada:** Class-Validator & Class-Transformer
- **Comunicação Base:** Axios (Integração de streams de dados HTTP legíveis)

### Frontend (Interface)
- **Framework:** Angular
- **Linguagem:** TypeScript

### Infraestrutura Local de IA
- **Engine:** Ollama (Inicialmente integrada)

---

## 📁 Estrutura de Entidades (Banco de Dados)

O banco de dados **MySQL** é populado dinamicamente através do recurso de sincronização de esquemas (`synchronize: true`), mapeando as seguintes tabelas:

* **`Conversation`:** Armazena as sessões de chat abertas pelo usuário.
  - `id` (Primary Key, Auto-increment)
  - `title` (Varchar 255)
  - `createdAt` / `updatedAt` (Timestamps)
* **`Message`:** Armazena as interações individuais indexadas às conversas.
  - `id` (Primary Key)
  - `role` (`enum: ['user', 'assistant']`)
  - `content` (`longtext` para armazenar grandes volumes de texto/contexto)
  - `conversation_id` (Foreign Key indexada com `onDelete: 'CASCADE'`)

---

## ⚙️ Como Executar o Projeto

### Pré-requisitos Gerais
Certifique-se de possuir instalado em sua máquina:
- **Node.js** (Versão LTS recomendada)
- **Angular CLI** instalado globalmente (`npm install -g @angular/cli`)
- **MySQL Server** ativo e configurado
- **Ollama** rodando localmente com o modelo de sua preferência baixado (ex: `deepseek-r1`, `llama3`, etc.)

---

### 1. Inicializando o Backend (API)

Crie um arquivo `.env` na raiz da pasta `backend/` seguindo o modelo abaixo:

```env
PORT=3000

# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_DATABASE=omnia_db

# Configurações da IA Local (Ollama)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1
```

Agora, abra seu terminal e execute:
```bash
# Entrar no diretório do servidor
cd backend

# Instalar dependências
npm install

# Inicializar em modo de desenvolvimento (Watch mode)
npm run start:dev
```
A API estará ativa em `http://localhost:3000`.

---

### 2. Inicializando o Frontend (Angular)

Abra uma nova janela de terminal e execute os comandos:
```bash
# Entrar no diretório da interface
cd frontend

# Instalar as dependências do projeto
npm install

# Inicializar o servidor de desenvolvimento do Angular
npm run start
# ou
ng serve
```
A aplicação abrirá automaticamente ou estará disponível no seu navegador em `http://localhost:4200`.

---

## 🔌 Principais Endpoints da API

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| **POST** | `/chat` | Envia uma mensagem padrão e retorna o bloco de texto completo da resposta. |
| **POST** | `/chat/stream` | Abre uma conexão de eventos contínuos (**SSE**), enviando tokens em tempo real para o Angular. |
| **GET** | `/conversations` | Retorna a listagem de todas as conversas gravadas no banco de dados. |
| **GET** | `/conversations/:id/messages` | Recupera o histórico de mensagens síncronas de uma sessão específica. |

---

## 📈 Roadmap / Melhorias Futuras

- Implementação de lógica algorítmica para cálculo de custo/complexidade do prompt antes do direcionamento.
- Integração com APIs robustas de mercado (OpenAI GPT, Anthropic Claude, Google Gemini).
- Suporte nativo a mecanismos de *Retrieval-Augmented Generation* (RAG) utilizando bancos de vetores.

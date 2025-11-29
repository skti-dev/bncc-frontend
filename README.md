# 📚 BNCC App - Questionários Educacionais

> **Aplicativo móvel gamificado para questionários educacionais baseados na Base Nacional Comum Curricular (BNCC)**




## 📱 Screenshots

![Imagem do WhatsApp de 2025-10-12 à(s) 20 45 22_1631eb31](https://github.com/user-attachments/assets/8c02bd29-4787-4fa0-ba7f-b86e10cfb14b)
![Imagem do WhatsApp de 2025-10-12 à(s) 20 45 22_aed18bc2](https://github.com/user-attachments/assets/5e7df8ab-9cab-45c4-888e-c491d05a3607)
![IMG-20251012-WA0009](https://github.com/user-attachments/assets/c2ae3ee3-0ff1-40d8-a864-93833fc5acce)
![IMG-20251012-WA0011](https://github.com/user-attachments/assets/9e1afd05-f133-4dfd-8ee2-0691bca328a9)
![IMG-20251012-WA0012](https://github.com/user-attachments/assets/0acfdff1-cbcd-4998-83fc-42146735e820)
![IMG-20251012-WA0013](https://github.com/user-attachments/assets/96321ccd-6098-49fa-a214-263df61c3446)
![IMG-20251012-WA0014](https://github.com/user-attachments/assets/0adbe71c-225b-4f8d-9458-6b1ec51aeed1)
![Imagem do WhatsApp de 2025-10-12 à(s) 20 45 21_aad0fd7f](https://github.com/user-attachments/assets/4a44ea8a-92d9-424a-b606-2637b9e72d53)


[![Made with Expo](https://img.shields.io/badge/Made%20with-Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.81.4-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
](https://www.typescriptlang.org/)

---

## 🎯 Sobre o Projeto

O **BNCC App** é uma aplicação mobile desenvolvida em React Native/Expo que oferece uma experiência gamificada para estudantes realizarem questionários educacionais. O app é baseado na Base Nacional Comum Curricular e abrange as principais disciplinas do ensino fundamental.

### ✨ Características Principais

- 🎮 **Interface Gamificada** - Visual atrativo com elementos lúdicos
- 📱 **Cross-Platform** - Funciona em iOS e Android
- 🎨 **Temas por Disciplina** - Cores específicas para cada matéria
- 🔐 **Sistema de Autenticação** - Login seguro com persistência
- 📊 **Resultados Detalhados** - Análise completa do desempenho
- 🖼️ **Suporte a Imagens** - Questões com apoio visual
- 🔄 **Sincronização em Tempo Real** - Dados sempre atualizados

---

## 🚀 Funcionalidades

### 📝 Questionários Inteligentes

- Questões filtradas por disciplina e ano escolar
- Suporte a imagens e formatação de texto
- Processamento de quebras de linha (`\n`)
- Embaralhamento automático das questões
- Interface responsiva e intuitiva

### 🎯 Disciplinas Disponíveis

- **🇧🇷 Língua Portuguesa (LP)** - Cor temática: Azul
- **🔢 Matemática (MA)** - Cor temática: Verde
- **🔬 Ciências (CI)** - Cor temática: Roxo

### 📊 Sistema de Resultados

- **Meus Resultados** - Histórico completo de questionários
- **Detalhes por Resultado** - Análise questão por questão
- **Estatísticas Visuais** - Pontuação, percentual e acertos
- **Paginação Inteligente** - Carregamento otimizado
- **Pull-to-Refresh** - Atualização por deslize

### 🔍 Visualização de Questões

- **Modal Detalhado** - Questão completa com gabarito
- **Comparação Visual** - Resposta do usuário vs. gabarito
- **Indicadores Coloridos** - Status de acerto/erro
- **Imagens Responsivas** - Suporte completo a mídia

---

## 🏗️ Arquitetura

### 📂 Estrutura do Projeto

```
bncc-app/
├── app/                          # Telas da aplicação (Expo Router)
│   ├── (tabs)/                   # Navegação por abas
│   │   ├── index.tsx            # Tela inicial (Home)
│   │   ├── resultados.tsx       # Meus Resultados
│   │   └── _layout.tsx          # Layout das abas
│   ├── resultado-detalhes/      # Tela de detalhes
│   │   └── [id].tsx            # Detalhes do resultado
│   ├── login.tsx               # Tela de login
│   ├── questoes.tsx            # Questionários
│   └── _layout.tsx             # Layout raiz
├── components/                  # Componentes reutilizáveis
│   ├── questoes/               # Componentes modulares
│   │   ├── LoadingScreen.tsx   # Tela de carregamento
│   │   ├── ConfirmationScreen.tsx # Confirmação de envio
│   │   ├── SummaryScreen.tsx   # Resumo de respostas
│   │   ├── QuestionHeader.tsx  # Cabeçalho da questão
│   │   ├── QuestionCard.tsx    # Card da questão
│   │   └── NavigationButtons.tsx # Botões de navegação
│   └── ui/                     # Componentes de UI
├── services/                   # Serviços de API
│   ├── api.ts                 # Cliente HTTP base
│   ├── questionsApi.ts        # API de questões
│   └── resultsApi.ts          # API de resultados
├── contexts/                   # Contextos React
│   └── AuthContext.tsx        # Contexto de autenticação
├── constants/                  # Constantes da aplicação
│   └── theme.ts               # Cores e temas
└── hooks/                     # Hooks personalizados
    ├── use-discipline-theme.ts # Hook de temas por disciplina
    └── use-color-scheme.ts    # Hook de esquema de cores
```

### 🔧 Tecnologias Utilizadas

#### Frontend

- **React Native 0.81.4** - Framework para desenvolvimento mobile
- **Expo ~54.0.13** - Plataforma de desenvolvimento
- **TypeScript 5.9.2** - Tipagem estática
- **Expo Router 6.0.11** - Navegação declarativa

#### Navegação & UI

- **@react-navigation/native** - Sistema de navegação
- **@react-navigation/bottom-tabs** - Navegação por abas
- **expo-haptics** - Feedback tátil
- **expo-status-bar** - Gerenciamento da status bar

#### Estado & Dados

- **React Context API** - Gerenciamento de estado global
- **AsyncStorage** - Persistência local
- **Axios 1.12.2** - Cliente HTTP
- **React Hooks** - Gerenciamento de estado local

#### Desenvolvimento

- **ESLint** - Linting de código
- **Expo CLI** - Ferramentas de desenvolvimento
- **Metro** - Bundler React Native

---

## 🛠️ Instalação e Configuração

### 📋 Pré-requisitos

- **Node.js** 18+
- **npm** ou **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Simulador iOS** (macOS) ou **Android Studio** (Windows/macOS/Linux)

### ⚡ Instalação Rápida

```bash
# 1. Clone o repositório
git clone https://github.com/skti-dev/bncc-frontend.git
cd bncc-frontend

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# 4. Inicie o servidor de desenvolvimento
npm start
```

### 📱 Executando no Dispositivo

```bash
# Android
npm run android

# iOS (apenas macOS)
npm run ios

# Web
npm run web
```

### 🔧 Comandos Disponíveis

```bash
npm start          # Inicia o servidor Expo
npm run reset-project  # Reset do projeto
npm run lint       # Executa o linting
npm run android    # Executa no Android
npm run ios        # Executa no iOS  
npm run web        # Executa no navegador
```

---

## 🌐 API Integration

### 🔗 Endpoints Principais

#### Autenticação

```typescript
POST /login
Body: { email: string, password: string }
Response: { user: User, token: string }
```

#### Questões

```typescript
GET /questoes?page=1&disciplina=LP&ano=4&shuffle=true
Response: { data: Question[], total: number, hasNext: boolean }

GET /questoes/:id
Response: Question
```

#### Resultados

```typescript
PUT /resultados
Body: { disciplina, ano, email, respostas, pontuacao, total_questoes }

GET /resultados?page=1&email=user@email.com
Response: { data: MeuResultado[], total: number }

GET /resultados/:id
Response: ResultadoDetalhado
```

### 🔒 Autenticação

O app utiliza token-based authentication com:

- **AsyncStorage** para persistência do token
- **Interceptors Axios** para injeção automática
- **Auto-logout** em caso de token expirado
- **Context API** para estado global de autenticação

---

## 🎨 Design System

### 🎨 Componentes Estilizados

- **Cards Gamificados** - Sombras, bordas arredondadas, cores vibrantes
- **Botões Interativos** - Estados hover, pressed, disabled
- **Indicadores Visuais** - Badges, progress bars, status icons
- **Layout Responsivo** - Adaptação automática a diferentes telas

---

## 📊 Funcionalidades Detalhadas

### 🎯 Sistema de Questionários

#### Fluxo do Usuário

1. **Seleção** - Escolha disciplina e ano
2. **Carregamento** - Busca questões da API
3. **Resposta** - Interface intuitiva por questão
4. **Navegação** - Avançar/Voltar entre questões
5. **Revisão** - Resumo antes do envio
6. **Confirmação** - Submissão com feedback
7. **Resultado** - Redirecionamento para resultados

#### Recursos Avançados

- **Embaralhamento** - Questões em ordem aleatória
- **Persistência** - Respostas salvas localmente
- **Validação** - Verificação antes do envio
- **Feedback Tátil** - Vibração em interações
- **Estados de Loading** - UX fluida

### 📈 Sistema de Resultados

#### Meus Resultados

- **Lista Paginada** - Performance otimizada
- **Filtros** - Por disciplina, data, performance
- **Estatísticas** - Cards com métricas visuais
- **Pull-to-Refresh** - Atualização manual
- **Infinite Scroll** - Carregamento sob demanda

#### Detalhes do Resultado

- **Visão Geral** - Header com estatísticas principais
- **Lista de Respostas** - Status visual por questão
- **Análise Individual** - Comparação resposta vs gabarito
- **Modal de Questão** - Questão completa com imagem

---

## 🔧 Configuração Avançada

### 🌍 Variáveis de Ambiente

```bash
# .env
API_URL=
```

### 🔒 Configuração de Segurança

- **HTTPS Only** - Todas as requisições via HTTPS
- **Token Validation** - Verificação automática de expiração
- **Secure Storage** - AsyncStorage com encriptação
- **Input Sanitization** - Validação de dados de entrada

---

## 🧪 Testes e Qualidade

### 📏 Linting e Formatação

```bash
# Executar linting
npm run lint

# Verificação de tipos TypeScript
npx tsc --noEmit
```

### 🎯 Boas Práticas Implementadas

- **TypeScript Strict Mode** - Tipagem rigorosa
- **Component Modularity** - Componentes reutilizáveis
- **Custom Hooks** - Lógica compartilhada
- **Error Boundaries** - Tratamento de erros
- **Performance Optimization** - useCallback, useMemo
- **Accessibility** - Suporte a leitores de tela

---

## 🚀 Deploy e Distribuição

### 📱 Build para Produção

```bash
# Build Android
expo build:android

# Build iOS  
expo build:ios

# Build Web
expo build:web
```

### 🌐 Expo Application Services (EAS)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Configurar EAS
eas build:configure

# Build de produção
eas build --platform all
```

---

## 🤝 Contribuição

### 📝 Como Contribuir

1. **Fork** o repositório
2. **Crie** uma branch: `git checkout -b feature/nova-funcionalidade`
3. **Commit** suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. **Push** para a branch: `git push origin feature/nova-funcionalidade`
5. **Abra** um Pull Request

### 🐛 Reportando Bugs

Ao reportar bugs, inclua:

- **Descrição** clara do problema
- **Passos** para reproduzir
- **Screenshots** se aplicável
- **Informações** do dispositivo/ambiente

---



## 👨‍💻 Autor

**Augusto Seabra**

- 📧 Email: [augusto.t.seabra79@gmail.com](mailto:augusto.t.seabra79@gmail.com)
- 💼 LinkedIn: [/in/augusto-seabra-desenvolvedor](https://linkedin.com/in/augusto-seabra-desenvolvedor)
- 🐙 GitHub: [@skti-dev
  ](https://github.com/skti-dev)

---

<div align="center">

**Desenvolvido com ❤️ por Augusto Seabra**

[⬆ Voltar ao topo](#-bncc-app---questionários-educacionais)

</div>

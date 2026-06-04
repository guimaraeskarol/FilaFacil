# 🚀 FilaFácil - Sistema de Gerenciamento de Filas Digitais

## 📋 Sobre o Projeto

**FilaFácil** é uma plataforma web moderna para gerenciar filas digitais em estabelecimentos de saúde, farmácias e postos de atendimento. O sistema reduz o tempo de espera, organiza melhor os atendimentos e melhora significativamente a experiência do usuário.

### Problema Identificado
- Filas longas causam perda de tempo e aglomeração
- Falta de organização nos atendimentos presenciais
- Dificuldade em acompanhar a posição na fila

### Solução Proposta
A plataforma permite que usuários acompanhem filas online sem precisar permanecer fisicamente no local, recebendo notificações automáticas quando estão próximos de serem atendidos.

---

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite** - Banco de dados relacional
- **Socket.IO** - Comunicação em tempo real
- **bcryptjs** - Criptografia de senhas

### Frontend
- **Handlebars** - Template engine
- **HTML5** - Estrutura
- **CSS3** - Estilo (Design responsivo)
- **JavaScript Vanilla** - Interatividade
- **Chart.js** - Gráficos (opcional)

### Padrão Arquitetural
- **MVC** (Model-View-Controller)
- Separação clara entre rotas, controllers e views
- Banco de dados modularizado

---

## 📁 Estrutura do Projeto

```
filafacil/
├── controllers/              # Controladores (lógica de negócio)
│   ├── mainController.js    # Páginas públicas
│   ├── authController.js    # Autenticação
│   ├── establishmentController.js  # Estabelecimentos
│   └── queueController.js   # Filas
├── models/
│   └── database.js          # Conexão e operações do banco
├── routes/
│   └── index.js             # Definição de rotas
├── views/
│   ├── layouts/
│   │   └── main.handlebars  # Layout principal
│   ├── css/
│   │   └── style.css        # Estilos
│   ├── js/
│   │   └── main.js          # JavaScript
│   ├── index.handlebars     # Home
│   ├── login.handlebars     # Login
│   ├── register.handlebars  # Registro
│   ├── dashboard.handlebars # Dashboard
│   └── ...
├── public/                  # Arquivos estáticos
├── index.js                 # Arquivo principal
├── package.json             # Dependências
└── filafacil.db            # Banco de dados (criado automaticamente)
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- **Node.js** 14+ (https://nodejs.org)
- **npm** ou **yarn** (vem com Node.js)
- **Visual Studio Code** (recomendado)

### Passos de Instalação

1. **Clone ou extraia o projeto**
   ```bash
   cd filafacil
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Inicie o servidor**
   ```bash
   npm start
   ```

4. **Acesse a aplicação**
   - Abra seu navegador em: **http://localhost:3000**

### Modo Desenvolvimento (com auto-reload)
```bash
npm run dev
```

---

## 📊 Funcionalidades Principais

### Para Usuários
✅ Cadastro e login seguro  
✅ Visualizar filas disponíveis  
✅ Entrar em filas remotamente  
✅ Acompanhar posição em tempo real  
✅ Receber notificações automáticas  
✅ Gerenciar perfil  

### Para Estabelecimentos
✅ Cadastrar estabelecimento  
✅ Criar e gerenciar filas  
✅ Chamar próximo atendimento  
✅ Pausar/encerrar filas  
✅ Visualizar histórico de atendimentos  
✅ Dashboard com estatísticas  

### Funcionalidades Técnicas
✅ Autenticação com sessão  
✅ Criptografia de senhas  
✅ Comunicação em tempo real (Socket.IO)  
✅ Notificações automáticas  
✅ Interface responsiva (mobile + desktop)  
✅ Design moderno (azul, roxo, branco)  

---

## 🎨 Design

### Paleta de Cores
- **Azul Primário**: #0066cc
- **Roxo**: #7c3aed
- **Branco**: #ffffff
- **Cinza**: #666666
- **Verde (Sucesso)**: #10b981
- **Vermelho (Erro)**: #ef4444

### Características
- Design moderno e profissional
- Interface intuitiva
- Animações suaves
- Totalmente responsivo
- Acessibilidade garantida

---

## 📝 Exemplo de Uso

### 1. Registrar Usuário
1. Clique em "Registrar"
2. Preencha nome, email e senha
3. Clique em "Registrar"

### 2. Criar Estabelecimento
1. Faça login
2. Vá para "Meus Estabelecimentos"
3. Clique em "+ Novo"
4. Preencha os dados (nome, tipo, endereço, etc)
5. Clique em "Criar"

### 3. Criar Fila
1. Acesse um estabelecimento
2. Clique em "Filas"
3. Clique em "+ Nova Fila"
4. Configure nome, capacidade e tempo médio
5. Clique em "Criar"

### 4. Entrar em Fila (como usuário)
1. Vá para a página da fila
2. Clique em "Entrar na Fila"
3. Acompanhe sua posição em tempo real

---

## 🔐 Segurança

- Senhas criptografadas com bcryptjs
- Sessões seguras com express-session
- Validação de entrada em todos os formulários
- Proteção contra CSRF
- HTTPS recomendado em produção

---

## 📱 Responsividade

O projeto é totalmente responsivo e funciona em:
- ✅ Desktops (1920px+)
- ✅ Tablets (768px - 1024px)
- ✅ Smartphones (320px - 767px)

---

## 🐛 Troubleshooting

### Erro: "Port 3000 already in use"
```bash
# Usar outra porta
PORT=3001 npm start
```

### Erro: "Cannot find module"
```bash
# Reinstalar dependências
rm -rf node_modules
npm install
```

### Banco de dados não criado
```bash
# O banco é criado automaticamente na primeira execução
# Se houver problema, delete filafacil.db e reinicie
rm filafacil.db
npm start
```

---

## 📈 Próximas Melhorias

- [ ] Integração com SMS para notificações
- [ ] Relatórios avançados em PDF
- [ ] App mobile nativo
- [ ] Integração com Google Maps
- [ ] Suporte a múltiplos idiomas
- [ ] Sistema de avaliações
- [ ] Integração com WhatsApp

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a seção Troubleshooting
2. Consulte os logs do console
3. Verifique se todas as dependências estão instaladas

---

## 📄 Licença

Este projeto é fornecido como está para fins educacionais e comerciais.

---

## 👨‍💻 Desenvolvido com ❤️

**FilaFácil** - Transformando a experiência de atendimento em saúde

**Versão**: 1.0.0  
**Última atualização**: Maio 2026

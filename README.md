# 🤖 RichardEv - Agente de Código IA

<div align="center">

![RichardEv Banner](https://img.shields.io/badge/RichardEv-Agente%20IA-8B5CF6?style=for-the-badge&logo=robot&logoColor=white)

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![Groq](https://img.shields.io/badge/Groq-LLama%203.3-F55036?style=flat-square&logo=groq&logoColor=white)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Online-success?style=flat-square)]()

**Gerador de código com IA em tempo real usando streaming**

[🚀 Demo ao Vivo](https://frontend-agente-ia.onrender.com) • [📖 Documentação](#-como-usar) • [🐛 Reportar Bug](https://github.com/richard-pimetel/front-end-AgenteIA/issues)

</div>

---

## 📸 Screenshots

<div align="center">

### 🏠 Tela Inicial
![Tela Inicial](https://i.imgur.com/JQkH8Zy.png)

*Interface limpa e moderna com exemplos de uso*

---

### 💬 Chat com Streaming
![Chat Streaming](https://i.imgur.com/R8pKmYH.png)

*Código gerado em tempo real com syntax highlighting*

---

### 🌙 Tema Escuro & Claro
| Tema Escuro | Tema Claro |
|:-----------:|:----------:|
| ![Dark](https://i.imgur.com/dark-theme.png) | ![Light](https://i.imgur.com/light-theme.png) |

---

### 📱 Design Responsivo
![Mobile](https://i.imgur.com/mobile-view.png)

*Funciona perfeitamente em dispositivos móveis*

</div>

---

## ✨ Funcionalidades

### 🎯 Principais
- 🚀 **Streaming em Tempo Real** - Veja o código sendo gerado caractere por caractere
- 🌐 **17 Linguagens** - JavaScript, Python, Java, C, C++, Go, Rust, e mais
- 🤖 **Auto-detecção** - IA escolhe a melhor linguagem automaticamente
- 💾 **Histórico Local** - Suas conversas salvas no navegador

### ⚡ Recursos Avançados
| Recurso | Descrição |
|---------|-----------|
| ⏹️ Parar Geração | Interrompa a geração a qualquer momento |
| 🔄 Retry | Tente novamente em caso de erro |
| ⌨️ Atalhos | `Ctrl+Enter` enviar, `Ctrl+K` focar, `Esc` parar |
| 🌙 Temas | Alterne entre tema escuro e claro |
| 📤 Exportar | Baixe seu histórico em JSON |
| 📋 Copiar | Copie código ou resposta completa |
| 📱 Responsivo | Funciona em desktop, tablet e mobile |

---

## 🛠️ Tecnologias

<div align="center">

| Frontend | Backend | IA |
|:--------:|:-------:|:--:|
| ![React](https://img.shields.io/badge/-React-61DAFB?style=for-the-badge&logo=react&logoColor=black) | ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) | ![Groq](https://img.shields.io/badge/-Groq-F55036?style=for-the-badge&logo=groq&logoColor=white) |
| ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) | ![Express](https://img.shields.io/badge/-Express-000000?style=for-the-badge&logo=express&logoColor=white) | ![LLama](https://img.shields.io/badge/-LLama%203.3-8B5CF6?style=for-the-badge) |

</div>

---

## 🚀 Como Usar

### Pré-requisitos
- Node.js 18+
- NPM ou Yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/richard-pimetel/front-end-AgenteIA.git

# Entre na pasta
cd front-end-AgenteIA

# Instale as dependências
npm install

# Inicie o projeto
npm start
```

### Variáveis de Ambiente (opcional)

```env
# .env
REACT_APP_API_URL=https://backend-agente-ia-1.onrender.com/api
```

---

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl` + `Enter` | Enviar mensagem |
| `Ctrl` + `K` | Focar no input |
| `Ctrl` + `L` | Limpar chat |
| `Esc` | Parar geração |

---

## 🌐 API Endpoints

O frontend se conecta ao backend em:

```
https://backend-agente-ia-1.onrender.com/api
```

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/health` | Status da API |
| `POST` | `/generate` | Gerar código (normal) |
| `POST` | `/generate/stream` | Gerar código (streaming) |
| `GET` | `/history` | Histórico de códigos |

---

## 📁 Estrutura do Projeto

```
front-end-AgenteIA/
├── 📁 public/
│   ├── favicon.ico
│   └── index.html
├── 📁 src/
│   ├── App.js          # Componente principal
│   ├── App.css         # Estilos
│   ├── index.js        # Entry point
│   └── index.css       # Estilos globais
├── .gitignore
├── package.json
└── README.md
```

---

## 🎨 Linguagens Suportadas

<div align="center">

| | | | |
|:-:|:-:|:-:|:-:|
| ![JS](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | ![Python](https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white) | ![Java](https://img.shields.io/badge/-Java-007396?style=flat-square&logo=java&logoColor=white) | ![C](https://img.shields.io/badge/-C-A8B9CC?style=flat-square&logo=c&logoColor=black) |
| ![C++](https://img.shields.io/badge/-C++-00599C?style=flat-square&logo=cplusplus&logoColor=white) | ![C#](https://img.shields.io/badge/-C%23-239120?style=flat-square&logo=csharp&logoColor=white) | ![Go](https://img.shields.io/badge/-Go-00ADD8?style=flat-square&logo=go&logoColor=white) | ![Rust](https://img.shields.io/badge/-Rust-000000?style=flat-square&logo=rust&logoColor=white) |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | ![PHP](https://img.shields.io/badge/-PHP-777BB4?style=flat-square&logo=php&logoColor=white) | ![Ruby](https://img.shields.io/badge/-Ruby-CC342D?style=flat-square&logo=ruby&logoColor=white) | ![Swift](https://img.shields.io/badge/-Swift-FA7343?style=flat-square&logo=swift&logoColor=white) |
| ![Kotlin](https://img.shields.io/badge/-Kotlin-7F52FF?style=flat-square&logo=kotlin&logoColor=white) | ![SQL](https://img.shields.io/badge/-SQL-4479A1?style=flat-square&logo=mysql&logoColor=white) | ![HTML](https://img.shields.io/badge/-HTML-E34F26?style=flat-square&logo=html5&logoColor=white) | ![Shell](https://img.shields.io/badge/-Shell-4EAA25?style=flat-square&logo=gnubash&logoColor=white) |

</div>

---

## 🤝 Contribuindo

Contribuições são bem-vindas! 

1. Faça um Fork do projeto
2. Crie sua Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

<div align="center">

**Richard Pimentel**

[![GitHub](https://img.shields.io/badge/-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/richard-pimetel)
[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/richard-pimetel)

</div>

---

<div align="center">

**⭐ Se este projeto te ajudou, deixe uma estrela!**

![Footer](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)

</div>

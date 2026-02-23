
# 💎 Tanzine Finance

> **Premium Mobile-First Personal Finance Manager & AI Advisor**

Tanzine é um gerenciador financeiro de alta costura digital. Projetado para quem exige estética e inteligência, o app combina uma interface luxuosa com insights em tempo real via Gemini AI.

![Mobile First](https://img.shields.io/badge/UI-Mobile--First-blueviolet?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-Gemini--3--Flash-orange?style=for-the-badge)
![PWA](https://img.shields.io/badge/PWA-Installable-green?style=for-the-badge)

## ✨ Destaques de Produção

- 📱 **PWA Ready:** Instale no seu Android ou iOS diretamente pelo navegador.
- 🧠 **Smart Advisor:** A IA analisa seus últimos lançamentos e dá conselhos estratégicos.
- 🌓 **Design Imersivo:** Paleta `Tanzine Dark` otimizada para telas OLED.
- ⚡ **Performance:** Carregamento ultra-rápido via Import Maps (sem necessidade de build complexo).
- 💾 **Local-First:** Seus dados financeiros nunca saem do seu aparelho.

## 🚀 Como fazer o Deploy

Este projeto foi desenhado para ser hospedado em segundos:

### 1. Vercel (Recomendado)
- Conecte seu repositório GitHub.
- Nas configurações do projeto, adicione a **Environment Variable**:
  - `API_KEY`: Sua chave do [Google AI Studio](https://aistudio.google.com/).
- O deploy será automático.

### 🔥 Firebase (Opcional — Cloud Sync)
O app é **local-first**, mas você pode ativar **backup/restauração** com Firebase (Auth + Firestore).

1) Crie um projeto no Firebase e habilite:
- **Authentication → Email/Password**
- **Firestore Database**

2) Adicione estas variáveis no seu `.env` (Vite):
```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

3) Instale a dependência:
```bash
npm i firebase
```

4) No app, toque no ícone de nuvem (Home) para:
- Criar conta / Entrar
- Fazer **Backup** (upload)
- **Restaurar** (download)

### 2. GitHub Pages
- Como o projeto é estático (`index.html`), basta ativar o GitHub Pages nas configurações do repositório.
- *Nota:* Certifique-se de que a chave da API esteja disponível no ambiente ou passada via segredos.

## 🛠️ Stack Técnica
- **Framework:** React 19 (Experimental Features)
- **Estilo:** Tailwind CSS (Glassmorphism Engine)
- **Estado:** Zustand with LocalStorage Persistence
- **Inteligência:** Google Generative AI (Gemini 2.0/3.0)
- **Gráficos:** Recharts Mobile

## 🛡️ Licença
Este projeto está sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---
*Developed by a Senior Software Engineer for the modern financial world.*
// trigger deploy

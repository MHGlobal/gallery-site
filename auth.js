/**
 * auth.js — Sistema de autenticação simples por código de acesso
 *
 * ⚠️ AVISO DE SEGURANÇA:
 * Este sistema NÃO oferece segurança real. A senha fica visível
 * no código-fonte (frontend). Adequado apenas para proteção básica
 * de acesso, não para dados sensíveis.
 */

// ── Configuração ──────────────────────────────────────────────
const ACCESS_CODE = "RS2026";
const SESSION_KEY = "gallery_auth";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 horas

// ── Helpers de sessão ─────────────────────────────────────────

/**
 * Verifica se existe uma sessão válida (não expirada).
 * @returns {boolean}
 */
function isAuthenticated() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;

    const session = JSON.parse(raw);
    const expired = Date.now() > session.expiresAt;

    if (expired) {
      localStorage.removeItem(SESSION_KEY);
      return false;
    }

    return session.authenticated === true;
  } catch {
    return false;
  }
}

/**
 * Salva sessão autenticada no localStorage com expiração.
 */
function saveSession() {
  const session = {
    authenticated: true,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Encerra a sessão atual e redireciona para a tela de login.
 */
function logout() {
  localStorage.removeItem(SESSION_KEY);
  showLoginScreen();
}

// ── Interface de login ────────────────────────────────────────

/**
 * Exibe a tela de login e oculta a galeria.
 */
function showLoginScreen() {
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("gallery-app").style.display = "none";
  document.getElementById("code-input").value = "";

  const errorEl = document.getElementById("login-error");
  if (errorEl) {
    errorEl.style.display = "none";
    errorEl.textContent = "";
  }

  // Foca o campo automaticamente
  setTimeout(() => document.getElementById("code-input").focus(), 100);
}

/**
 * Exibe a galeria e oculta a tela de login.
 */
function showGallery() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("gallery-app").style.display = "block";
}

/**
 * Exibe mensagem de erro no formulário de login.
 * @param {string} message
 */
function showLoginError(message) {
  const errorEl = document.getElementById("login-error");
  if (!errorEl) return;

  errorEl.textContent = message;
  errorEl.style.display = "block";

  // Animação de shake no formulário
  const form = document.getElementById("login-form");
  form.classList.remove("shake");
  void form.offsetWidth; // forçar reflow para reiniciar animação
  form.classList.add("shake");
}

/**
 * Tenta autenticar com o código digitado.
 */
function handleLogin() {
  const input = document.getElementById("code-input").value.trim();

  if (!input) {
    showLoginError("Por favor, insira o código de acesso.");
    return;
  }

  if (input === ACCESS_CODE) {
    saveSession();
    showGallery();
    if (typeof initGallery === "function") initGallery();
  } else {
    showLoginError("Código incorreto. Tente novamente.");
    document.getElementById("code-input").value = "";
    document.getElementById("code-input").focus();
  }
}

// ── Inicialização ─────────────────────────────────────────────

/**
 * Ponto de entrada: decide qual tela mostrar ao carregar a página.
 */
function initAuth() {
  if (isAuthenticated()) {
    showGallery();
    if (typeof initGallery === "function") initGallery();
  } else {
    showLoginScreen();
  }
}

// Submete com Enter no campo de código
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("code-input");
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleLogin();
    });
  }

  initAuth();
});

/**
 * script.js — Lógica principal da galeria de imagens
 *
 * Responsável por:
 * - Carregar e renderizar álbuns a partir de albums.json
 * - Exibir grid de fotos ao abrir um álbum
 * - Modal fullscreen com download e cópia de URL
 * - Pesquisa e filtros
 * - Lazy loading de imagens
 */

// ── Estado global ─────────────────────────────────────────────
let allAlbums = [];
let currentAlbum = null;
let currentImageIndex = 0;

// ── Carregamento dos álbuns ───────────────────────────────────

/**
 * Carrega o arquivo data/albums.json e inicializa a galeria.
 */
async function initGallery() {
  try {
    showHomeLoading(true);
    const res = await fetch("data/albums.json");
    if (!res.ok) throw new Error(`Erro ao carregar álbuns: ${res.status}`);

    allAlbums = await res.json();

    renderHomeView(allAlbums);
    attachSearchListeners();
  } catch (err) {
    console.error(err);
    showHomeError("Não foi possível carregar os álbuns. Verifique o arquivo data/albums.json.");
  } finally {
    showHomeLoading(false);
  }
}

// ── Home: lista de álbuns ─────────────────────────────────────

function renderHomeView(albums) {
  const view = document.getElementById("home-view");
  const albumView = document.getElementById("album-view");
  albumView.style.display = "none";
  view.style.display = "block";

  const grid = document.getElementById("albums-grid");
  const empty = document.getElementById("empty-state");

  if (!albums.length) {
    grid.innerHTML = "";
    empty.style.display = "flex";
    return;
  }

  empty.style.display = "none";
  grid.innerHTML = albums.map((album, i) => buildAlbumCard(album, i)).join("");

  // Lazy loading das capas
  observeImages();
}

function buildAlbumCard(album, index) {
  const coverSrc = `albums/${album.folder}/${album.cover}`;
  const count = album.images ? album.images.length : 0;
  const label = count === 1 ? "1 foto" : `${count} fotos`;

  return `
    <div class="album-card" 
         style="animation-delay: ${index * 60}ms"
         onclick="openAlbum('${album.folder}')">
      <div class="album-thumb">
        <img
          data-src="${coverSrc}"
          src="assets/placeholder.svg"
          alt="${album.name}"
          loading="lazy"
          onerror="this.src='assets/placeholder.svg'"
        />
        <div class="album-overlay">
          <span class="album-open-icon">↗</span>
        </div>
      </div>
      <div class="album-info">
        <h3 class="album-name">${album.name}</h3>
        <span class="album-count">${label}</span>
      </div>
    </div>
  `;
}

// ── Álbum: grid de fotos ──────────────────────────────────────

function openAlbum(folder) {
  currentAlbum = allAlbums.find((a) => a.folder === folder);
  if (!currentAlbum) return;

  document.getElementById("home-view").style.display = "none";

  const albumView = document.getElementById("album-view");
  albumView.style.display = "block";

  document.getElementById("album-title").textContent = currentAlbum.name;

  const images = currentAlbum.images || [];
  const grid = document.getElementById("album-grid");

  if (!images.length) {
    grid.innerHTML = `<p class="no-images">Nenhuma imagem encontrada neste álbum.</p>`;
    return;
  }

  grid.innerHTML = images
    .map((img, i) => buildImageCard(img, i, folder))
    .join("");

  observeImages();

  // Scroll topo
  albumView.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildImageCard(filename, index, folder) {
  const src = `albums/${folder}/${filename}`;
  return `
    <div class="image-card" onclick="openModal(${index})">
      <img
        data-src="${src}"
        src="assets/placeholder.svg"
        alt="${filename}"
        loading="lazy"
        onerror="this.src='assets/placeholder.svg'"
      />
      <div class="image-hover-overlay">
        <span class="zoom-icon">⊕</span>
      </div>
    </div>
  `;
}

function goHome() {
  document.getElementById("album-view").style.display = "none";
  document.getElementById("home-view").style.display = "block";
  currentAlbum = null;
}

// ── Modal fullscreen ──────────────────────────────────────────

function openModal(index) {
  if (!currentAlbum) return;

  const images = currentAlbum.images || [];
  if (!images.length) return;

  currentImageIndex = index;
  renderModal(images[index]);

  const modal = document.getElementById("image-modal");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function renderModal(filename) {
  const folder = currentAlbum.folder;
  const src = `albums/${folder}/${filename}`;
  const publicUrl = `${location.origin}/albums/${folder}/${filename}`;

  document.getElementById("modal-image").src = src;
  document.getElementById("modal-image").alt = filename;
  document.getElementById("modal-filename").textContent = filename;
  document.getElementById("modal-download").href = src;
  document.getElementById("modal-download").download = filename;

  // Guarda URL pública para botão de copiar
  document.getElementById("modal-copy-btn").dataset.url = publicUrl;

  // Navegação: oculta setas se for a primeira/última imagem
  const images = currentAlbum.images || [];
  document.getElementById("modal-prev").style.visibility =
    currentImageIndex > 0 ? "visible" : "hidden";
  document.getElementById("modal-next").style.visibility =
    currentImageIndex < images.length - 1 ? "visible" : "hidden";

  // Reseta feedback de cópia
  resetCopyFeedback();
}

function closeModal() {
  document.getElementById("image-modal").style.display = "none";
  document.body.style.overflow = "";
  resetCopyFeedback();
}

function navigateModal(direction) {
  const images = currentAlbum.images || [];
  const next = currentImageIndex + direction;

  if (next < 0 || next >= images.length) return;

  currentImageIndex = next;
  renderModal(images[next]);
}

function copyImageUrl() {
  const btn = document.getElementById("modal-copy-btn");
  const url = btn.dataset.url;

  navigator.clipboard
    .writeText(url)
    .then(() => {
      btn.textContent = "✓ Copiado!";
      btn.classList.add("copied");
      setTimeout(resetCopyFeedback, 2000);
    })
    .catch(() => {
      // Fallback para navegadores sem clipboard API
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      btn.textContent = "✓ Copiado!";
      btn.classList.add("copied");
      setTimeout(resetCopyFeedback, 2000);
    });
}

function resetCopyFeedback() {
  const btn = document.getElementById("modal-copy-btn");
  if (btn) {
    btn.textContent = "Copiar URL";
    btn.classList.remove("copied");
  }
}

// ── Pesquisa e filtros ────────────────────────────────────────

function attachSearchListeners() {
  const searchInput = document.getElementById("search-input");
  const filterSelect = document.getElementById("filter-select");

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }
  if (filterSelect) {
    filterSelect.addEventListener("change", applyFilters);
  }
}

function applyFilters() {
  const query = document.getElementById("search-input")?.value.toLowerCase().trim() || "";
  const sort = document.getElementById("filter-select")?.value || "name";

  let filtered = allAlbums.filter((a) =>
    a.name.toLowerCase().includes(query)
  );

  if (sort === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "recent") {
    filtered.reverse(); // Assumindo que albums.json está em ordem cronológica
  } else if (sort === "count") {
    filtered.sort((a, b) => (b.images?.length || 0) - (a.images?.length || 0));
  }

  renderHomeView(filtered);
}

// ── Lazy loading via IntersectionObserver ─────────────────────

function observeImages() {
  const lazyImages = document.querySelectorAll("img[data-src]");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: "200px" }
    );

    lazyImages.forEach((img) => observer.observe(img));
  } else {
    // Fallback: carrega todas de imediato
    lazyImages.forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
  }
}

// ── Utilitários de UI ─────────────────────────────────────────

function showHomeLoading(show) {
  const el = document.getElementById("loading-state");
  if (el) el.style.display = show ? "flex" : "none";
}

function showHomeError(msg) {
  const el = document.getElementById("error-state");
  if (el) {
    el.textContent = msg;
    el.style.display = "block";
  }
}

// ── Eventos globais de teclado ────────────────────────────────

document.addEventListener("keydown", (e) => {
  const modal = document.getElementById("image-modal");
  if (!modal || modal.style.display === "none") return;

  if (e.key === "Escape") closeModal();
  if (e.key === "ArrowLeft") navigateModal(-1);
  if (e.key === "ArrowRight") navigateModal(1);
});

// Fecha modal ao clicar no backdrop
document.addEventListener("click", (e) => {
  const modal = document.getElementById("image-modal");
  if (e.target === modal) closeModal();
});

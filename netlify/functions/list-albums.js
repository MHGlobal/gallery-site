/**
 * netlify/functions/list-albums.js
 *
 * Função serverless que lê automaticamente a pasta /albums/
 * e retorna a estrutura completa de álbuns e imagens.
 *
 * Chamada pelo frontend via: GET /.netlify/functions/list-albums
 *
 * Ao adicionar uma imagem nova em qualquer pasta dentro de /albums/,
 * ela aparece automaticamente na galeria na próxima requisição.
 * Não é necessário editar nenhum arquivo.
 */

const fs   = require("fs");
const path = require("path");

// Extensões de imagem aceitas (case-insensitive)
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

// Pasta raiz dos álbuns — relativa à raiz do projeto no Netlify
const ALBUMS_DIR = path.join(__dirname, "..", "..", "albums");

// ── Helpers ──────────────────────────────────────────────────

/**
 * Verifica se um nome de arquivo é uma imagem aceita.
 * @param {string} filename
 * @returns {boolean}
 */
function isImage(filename) {
  return IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

/**
 * Lê uma pasta de álbum e retorna lista de imagens ordenadas.
 * @param {string} folderPath  Caminho absoluto da pasta do álbum
 * @returns {string[]}         Nomes dos arquivos de imagem
 */
function readAlbumImages(folderPath) {
  try {
    return fs
      .readdirSync(folderPath)
      .filter(isImage)
      .sort((a, b) => {
        // Ordena por data de modificação (mais recente primeiro)
        const statA = fs.statSync(path.join(folderPath, a)).mtimeMs;
        const statB = fs.statSync(path.join(folderPath, b)).mtimeMs;
        return statB - statA;
      });
  } catch {
    return [];
  }
}

/**
 * Lê todos os álbuns dentro de ALBUMS_DIR.
 * Cada subpasta é um álbum. Pastas sem imagens são incluídas mas ficam vazias.
 * @returns {object[]}
 */
function scanAlbums() {
  if (!fs.existsSync(ALBUMS_DIR)) {
    return [];
  }

  const entries = fs.readdirSync(ALBUMS_DIR, { withFileTypes: true });

  return entries
    .filter((e) => e.isDirectory())
    .map((dir) => {
      const folderPath = path.join(ALBUMS_DIR, dir.name);
      const images     = readAlbumImages(folderPath);
      const cover      = images[0] || null;

      // Usa o nome da pasta como nome do álbum,
      // convertendo hifens/underscores em espaços e capitalizando
      const name = dir.name
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      // Data de modificação da pasta (para ordenar por recentes)
      const mtime = fs.statSync(folderPath).mtimeMs;

      return {
        name,
        folder: dir.name,
        cover,
        images,
        count: images.length,
        updatedAt: mtime,
      };
    })
    .filter((album) => album.images.length > 0) // oculta pastas sem imagens
    .sort((a, b) => b.updatedAt - a.updatedAt);  // mais recentes primeiro
}

// ── Handler principal ─────────────────────────────────────────

exports.handler = async function (event) {
  // Apenas GET permitido
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const albums = scanAlbums();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        // Cache curto: 60s no browser, 300s na CDN do Netlify
        // Garante que novas imagens apareçam rapidamente após deploy
        "Cache-Control": "public, max-age=60, s-maxage=300",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(albums),
    };
  } catch (err) {
    console.error("[list-albums] Erro ao escanear álbuns:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro interno ao listar álbuns." }),
    };
  }
};

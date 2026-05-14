// ════════════════════════════════════════
//  CONFIGURACIÓN — edita esto
// ════════════════════════════════════════
const CONFIG = {
  username: 'dennis25884',
  showOnly: [
    'CiberSeguridad-Informes',
    'scripts-pentesting'
  ],
};
// ════════════════════════════════════════

const LANG_COLORS = {
  JavaScript: '#f7df1e',
  TypeScript:  '#3178c6',
  Python:      '#3572A5',
  HTML:        '#e34c26',
  CSS:         '#563d7c',
  Vue:         '#41b883',
  Rust:        '#dea584',
  Go:          '#00add8',
};

let allRepos = [];

async function fetchRepos() {
  const grid = document.getElementById('repos-grid');

  try {
    const res = await fetch(
      `https://api.github.com/users/${CONFIG.username}/repos?per_page=100&sort=updated`
    );

    if (!res.ok) throw new Error(`GitHub API respondió con ${res.status}`);

    let repos = await res.json();
    repos = repos.filter(r => CONFIG.showOnly.includes(r.name));
    repos.sort((a, b) =>
      CONFIG.showOnly.indexOf(a.name) - CONFIG.showOnly.indexOf(b.name)
    );

    allRepos = repos;
    grid.setAttribute('aria-busy', 'false');
    buildFilters(repos);
    renderCards(repos);

  } catch (err) {
    grid.setAttribute('aria-busy', 'false');
    grid.innerHTML = `<p id="state-message" role="alert">Error al cargar repos: ${err.message}</p>`;
  }
}

function buildFilters(repos) {
  const langs = [...new Set(repos.map(r => r.language).filter(Boolean))].sort();
  const container = document.getElementById('filters');

  langs.forEach(lang => {
    const btn = document.createElement('button');
    btn.className    = 'filter-btn';
    btn.dataset.lang = lang;
    btn.textContent  = lang;
    container.appendChild(btn);
  });

  container.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active');
      b.removeAttribute('aria-pressed');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');

    const lang     = btn.dataset.lang;
    const filtered = lang === 'all'
      ? allRepos
      : allRepos.filter(r => r.language === lang);

    renderCards(filtered);
  });

  container.querySelector('[data-lang="all"]').setAttribute('aria-pressed', 'true');
}

function renderCards(repos) {
  const grid = document.getElementById('repos-grid');

  if (!repos.length) {
    grid.innerHTML = '<p id="state-message">No hay repositorios para mostrar.</p>';
    return;
  }

  grid.innerHTML = '';

  repos.forEach((repo, i) => {
    const card = document.createElement('a');
    card.className            = 'repo-card';
    card.href                 = repo.html_url;
    card.target               = '_blank';
    card.rel                  = 'noopener noreferrer';
    card.style.animationDelay = `${i * 40}ms`;
    card.setAttribute('aria-label',
      `Repositorio ${repo.name}${repo.description ? ': ' + repo.description : ''}, se abre en una pestaña nueva`
    );

    const color  = LANG_COLORS[repo.language] || '#444444';
    const topics = (repo.topics || []).slice(0, 4)
      .map(t => `<span class="topic-tag">${t}</span>`)
      .join('');

    card.innerHTML = `
      <div class="card-header">
        <span class="repo-name">${repo.name}</span>
        <span class="repo-visibility ${repo.private ? 'private' : 'public'}"
              aria-label="${repo.private ? 'Repositorio privado' : 'Repositorio público'}">
          ${repo.private ? 'privado' : 'público'}
        </span>
      </div>

      ${repo.description ? `<p class="repo-desc">${repo.description}</p>` : ''}
      ${topics ? `<div class="topics" aria-label="Temas">${topics}</div>` : ''}

      <div class="card-footer" aria-label="Estadísticas">
        ${repo.language ? `
          <span class="lang-dot" style="background:${color}"
                role="img" aria-label="Lenguaje: ${repo.language}"></span>
          <span class="card-meta">${repo.language}</span>
        ` : ''}
        <span class="card-meta" aria-label="${repo.stargazers_count} estrellas">★ ${repo.stargazers_count}</span>
        <span class="card-meta" aria-label="${repo.forks_count} forks">⌥ ${repo.forks_count}</span>
      </div>
    `;

    grid.appendChild(card);
  });
}

fetchRepos();

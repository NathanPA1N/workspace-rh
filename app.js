const RH_AGENTS = [
  { id: 'rh_cv_matching', name: 'Agent CV matching', category: 'recrutement', color: '#0969da', icon: 'CV', status: 'Actif', desc: 'Analyse des CV et priorisation des candidatures selon les critères définis pour le poste.', capabilities: ['Lecture de CV', 'Scoring de compatibilité', 'Synthèse de candidature'], inputs: ['CV', 'Fiche de poste'], outputs: ['Shortlist argumentée', 'Scores de compatibilité'] },
  { id: 'rh_onboarding', name: 'Agent onboarding', category: 'parcours', color: '#008b72', icon: 'ON', status: 'Actif', desc: 'Coordonne les étapes d’arrivée et la préparation des nouveaux collaborateurs.', capabilities: ['Check-list d’arrivée', 'Relances ciblées', 'Suivi des habilitations'], inputs: ['Profil collaborateur', 'Date d’arrivée'], outputs: ['Parcours d’intégration', 'Points en attente'] },
  { id: 'rh_faq', name: 'Agent FAQ RH', category: 'support', color: '#8058c7', icon: 'FAQ', status: 'Actif', desc: 'Répond aux questions récurrentes à partir d’une base de connaissances RH validée.', capabilities: ['Réponse contextualisée', 'Sources contrôlées', 'Escalade RH'], inputs: ['Question collaborateur', 'Base RH'], outputs: ['Réponse sourcée', 'Sujet à escalader'] },
  { id: 'rh_matching', name: 'Agent Matching Profils', category: 'recrutement', color: '#d9693c', icon: 'MP', status: 'Actif', desc: 'Met en correspondance les compétences des profils et les besoins des équipes.', capabilities: ['Matching compétences', 'Comparaison de profils', 'Shortlist métier'], inputs: ['Besoins métiers', 'Viviers talents'], outputs: ['Profils recommandés', 'Justification du match'] },
  { id: 'rh_job_evaluation', name: 'Agent Job evaluation', category: 'talent', color: '#b37a09', icon: 'JE', status: 'Actif', desc: 'Structure l’évaluation des compétences pour éclairer les décisions de recrutement.', capabilities: ['Grille d’entretien', 'Score de compétences', 'Compte rendu partagé'], inputs: ['Grille de poste', 'Feedback entretien'], outputs: ['Évaluation consolidée', 'Recommandation'] }
];

const RH_WORKFLOW = { id: 'wf_recrutement', name: 'Recrutement & décision', desc: 'Du CV à la recommandation finale, avec des étapes visibles et traçables.', agents: RH_AGENTS.map(agent => agent.id) };
const state = { view: 'home', activeAgent: 'rh_cv_matching', activeCategory: 'all', agentQuery: '', aiOpen: false, activeFaq: 0, onboarding: new Set(['contrat', 'materiel', 'manager']), scores: { expertise: 4, collaboration: 5, potentiel: 4 } };

function esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
function byId(id) { return document.getElementById(id); }
function agent(id) { return RH_AGENTS.find(item => item.id === id); }
function toast(message) { const el = byId('toast'); el.textContent = message; el.classList.add('is-visible'); clearTimeout(toast.timeout); toast.timeout = setTimeout(() => el.classList.remove('is-visible'), 2800); }

function renderHome() {
  byId('home-hero-stats').innerHTML = [['12', 'postes ouverts'], ['48', 'candidatures actives'], ['7', 'arrivées ce mois']].map(([number, label]) => `<div class="hero-stat"><strong>${number}</strong><span>${label}</span></div>`).join('');
  byId('home-explore-cards').innerHTML = RH_AGENTS.map(item => `<button class="home-card rh-home-card" type="button" data-agent="${item.id}"><span class="rh-agent-icon" style="--agent-color:${item.color}">${item.icon}</span><span><strong>${item.name}</strong><small>${item.desc}</small></span><b>→</b></button>`).join('');
  byId('home-news-cards').innerHTML = [['Shortlist Data Analyst', '4 profils prêts pour la revue manager', 'rh_matching', '08:42'], ['Onboarding septembre', '3 actions à confirmer avant les arrivées', 'rh_onboarding', '09:15'], ['FAQ congés', 'Réponse RH mise à jour et validée', 'rh_faq', '10:03']].map(([title, detail, id, time]) => `<button class="home-card rh-news-card" type="button" data-agent="${id}"><span class="news-time">${time}</span><strong>${title}</strong><small>${detail}</small><span class="news-link">Ouvrir →</span></button>`).join('');
}

function renderCatalog() {
  const categories = [['all', 'Tous'], ['recrutement', 'Recrutement'], ['parcours', 'Parcours collaborateur'], ['support', 'Support RH'], ['talent', 'Talents']];
  byId('category-filters').innerHTML = categories.map(([id, label]) => `<button type="button" class="category-filter ${state.activeCategory === id ? 'active' : ''}" data-category="${id}">${label}</button>`).join('');
  const query = state.agentQuery.trim().toLowerCase();
  const items = RH_AGENTS.filter(item => (state.activeCategory === 'all' || item.category === state.activeCategory) && (!query || `${item.name} ${item.desc} ${item.capabilities.join(' ')}`.toLowerCase().includes(query)));
  byId('agents-grid').innerHTML = items.map(item => `<article class="agent-card"><div class="agent-card-head"><span class="rh-agent-icon rh-agent-icon--lg" style="--agent-color:${item.color}">${item.icon}</span><span class="agent-status"><i></i>${item.status}</span></div><h3>${item.name}</h3><p>${item.desc}</p><div class="agent-tags">${item.capabilities.slice(0, 3).map(capability => `<span>${capability}</span>`).join('')}</div><footer><span>${item.category}</span><button type="button" class="agent-open" data-agent="${item.id}">Ouvrir <b>→</b></button></footer></article>`).join('') || '<div class="rh-empty">Aucun agent ne correspond à cette recherche.</div>';
}

function renderWorkflows() {
  byId('workflow-templates').innerHTML = `<button class="workflow-template selected" type="button"><span class="rh-agent-icon" style="--agent-color:#0969da">WF</span><span><strong>${RH_WORKFLOW.name}</strong><small>${RH_WORKFLOW.desc}</small></span><b>5 agents</b></button>`;
  byId('workflow-canvas-header').innerHTML = `<div><strong>${RH_WORKFLOW.name}</strong><span>Workflow RH actif</span></div><button class="btn-primary" type="button" data-run-workflow>Exécuter le mock</button>`;
  byId('workflow-canvas').innerHTML = `<div class="rh-workflow-canvas"><div class="rh-workflow-label">Parcours candidat</div><div class="rh-workflow-line">${RH_WORKFLOW.agents.map((id, index) => { const item = agent(id); return `<button class="rh-workflow-node" type="button" data-agent="${id}" style="--agent-color:${item.color}"><span>${item.icon}</span><strong>${item.name}</strong><small>Étape ${index + 1}</small></button>${index < RH_WORKFLOW.agents.length - 1 ? '<i>→</i>' : ''}`; }).join('')}</div></div>`;
}

function renderProjects() {
  const projects = [['Recrutement Data & IA', '4 postes · 21 candidatures', 72, 'rh_cv_matching'], ['Parcours arrivées septembre', '7 collaborateurs · 5 étapes', 64, 'rh_onboarding'], ['Mobilité interne produit', '3 opportunités · 16 profils', 45, 'rh_matching']];
  byId('projects-grid').innerHTML = projects.map(([title, detail, progress, id]) => `<button class="rh-project-card" type="button" data-agent="${id}"><span class="project-kicker">Projet RH</span><strong>${title}</strong><small>${detail}</small><span class="rh-progress"><i style="width:${progress}%"></i></span><footer><span>${progress}% avancement</span><b>Ouvrir →</b></footer></button>`).join('');
}

function renderDashboards() {
  byId('dashboards-grid').innerHTML = `<section class="rh-kpi-row"><article><span>Time to hire</span><strong>31 j</strong><small>Objectif : 35 jours</small></article><article><span>Conversion entretien</span><strong>42%</strong><small>+6 pts ce trimestre</small></article><article><span>Expérience candidat</span><strong>4,6/5</strong><small>68 réponses</small></article><article><span>Mobilités internes</span><strong>9</strong><small>Depuis janvier</small></article></section><section class="rh-chart-card"><div><span class="project-kicker">Flux candidatures</span><h3>Activité par semaine</h3><p>Les volumes sont fictifs et servent uniquement à démontrer l'écran de pilotage.</p></div><div class="rh-bars"><i style="height:36%"></i><i style="height:62%"></i><i style="height:48%"></i><i style="height:83%"></i><i style="height:71%"></i><i style="height:92%"></i><i style="height:68%"></i></div></section>`;
}

function renderAlerts() {
  const alerts = [['Élevée', '2 retours manager en attente', 'Les entretiens sont terminés depuis plus de 48 heures.', '#d74c41'], ['À suivre', 'Pièces manquantes pour une arrivée', 'Le matériel de Sami Bellal n’est pas encore confirmé.', '#b37a09'], ['Information', 'FAQ : hausse des questions télétravail', 'Le contenu de réponse est prêt à être revu par l’équipe RH.', '#0969da']];
  byId('alertes-list').innerHTML = alerts.map(([level, title, detail, color]) => `<article class="rh-alert"><span class="rh-alert-level" style="--alert-color:${color}">${level}</span><div><strong>${title}</strong><p>${detail}</p></div><button class="agent-open" type="button" data-toast="Alerte ouverte dans le mock.">Traiter →</button></article>`).join('');
}

function renderConversations() {
  const items = [['Comment préparer la shortlist Data Analyst ?', 'Aujourd’hui · 10:14'], ['Quels onboardings demandent une relance ?', 'Aujourd’hui · 09:22'], ['Synthétiser les réponses sur le télétravail', 'Hier · 16:40']];
  byId('conversations-list').innerHTML = items.map(([title, date]) => `<button class="rh-conversation" type="button" data-open-copilot><span class="rh-agent-icon" style="--agent-color:#8058c7">AI</span><span><strong>${title}</strong><small>${date}</small></span><b>→</b></button>`).join('');
}

function cvMock() { return `<div class="rh-mock-section"><div class="rh-mock-heading"><div><h3>Profils recommandés</h3><p>Compatibilité avec le poste Data Analyst.</p></div><span class="agent-status"><i></i>3 profils qualifiés</span></div><div class="rh-candidate-list">${[['Camille Durand', 'SQL · Python · Power BI', '94%'], ['Lina Moreau', 'SQL · Tableau · Dataviz', '88%'], ['Théo Martin', 'Python · dbt · Azure', '82%']].map(([name, skills, score]) => `<article><span class="rh-avatar">${name.split(' ').map(word => word[0]).join('')}</span><span><strong>${name}</strong><small>${skills}</small></span><b>${score}</b><button type="button" data-toast="Profil ajouté à la shortlist.">＋</button></article>`).join('')}</div></div>`; }
function onboardingMock() { const checks = [['contrat', 'Contrat signé'], ['materiel', 'Matériel commandé'], ['access', 'Accès et habilitations'], ['manager', 'Point manager planifié'], ['welcome', 'Parcours d’accueil']]; return `<div class="rh-mock-section"><div class="rh-mock-heading"><div><h3>Onboarding de Sami Bellal</h3><p>Arrivée le 15 septembre · Direction Data.</p></div><b class="rh-completion">${state.onboarding.size}/5</b></div><div class="rh-checklist">${checks.map(([id, label]) => `<button class="${state.onboarding.has(id) ? 'done' : ''}" type="button" data-check="${id}"><span>${state.onboarding.has(id) ? '✓' : ''}</span>${label}<small>${state.onboarding.has(id) ? 'Validé' : 'À confirmer'}</small></button>`).join('')}</div></div>`; }
function faqMock() { const entries = [['Télétravail', 'Après la période d’essai, la demande est transmise dans le portail RH selon les règles de l’équipe.'], ['Congés', 'La demande de congés est soumise depuis le portail, puis validée par le responsable.'], ['Bulletin de paie', 'Les bulletins sont disponibles dans le coffre-fort numérique dès leur publication.']]; const current = entries[state.activeFaq]; return `<div class="rh-faq-mock"><div>${entries.map(([name], index) => `<button class="${index === state.activeFaq ? 'active' : ''}" type="button" data-faq="${index}">${name}<b>→</b></button>`).join('')}</div><article><span class="project-kicker">Réponse validée</span><h3>${current[0]}</h3><p>${current[1]}</p><small>Contenu contrôlé par l’équipe RH</small></article></div>`; }
function matchingMock() { return `<div class="rh-mock-section"><div class="rh-mock-heading"><div><h3>Matching pour Data Analyst</h3><p>Correspondance fondée sur les compétences attendues.</p></div><button class="agent-open" type="button" data-toast="Critères de matching ouverts.">Modifier critères →</button></div><div class="rh-match-grid">${[['Camille Durand', 94], ['Lina Moreau', 88], ['Théo Martin', 82]].map(([name, score]) => `<article><span class="rh-avatar">${name.split(' ').map(word => word[0]).join('')}</span><strong>${name}</strong><b>${score}%</b><span><i style="width:${score}%"></i></span></article>`).join('')}</div></div>`; }
function evaluationMock() { const labels = { expertise: 'Expertise métier', collaboration: 'Collaboration', potentiel: 'Potentiel' }; const total = Math.round(Object.values(state.scores).reduce((sum, value) => sum + value, 0) / 15 * 100); return `<div class="rh-evaluation"><div><h3>Évaluation de Camille Durand</h3><p>Entretien du 4 septembre · Data Analyst.</p>${Object.entries(state.scores).map(([key, value]) => `<label>${labels[key]}<output id="score-${key}">${value}/5</output><input type="range" min="1" max="5" value="${value}" data-score="${key}"></label>`).join('')}<button class="btn-primary" type="button" data-toast="Évaluation enregistrée dans le mock.">Enregistrer l’évaluation</button></div><aside><span>Score global</span><strong id="evaluation-total">${total}%</strong><p>Recommandation : poursuivre avec un entretien manager.</p><b>Favorable</b></aside></div>`; }

function renderAgentWorkspace() {
  const item = agent(state.activeAgent);
  const content = { rh_cv_matching: cvMock, rh_onboarding: onboardingMock, rh_faq: faqMock, rh_matching: matchingMock, rh_job_evaluation: evaluationMock }[item.id]();
  byId('agent-workspace-root').innerHTML = `<div class="aw-steps-strip"><button class="aw-back-btn" type="button" data-view="catalog">← <span>Catalogue d'agents</span></button>${RH_WORKFLOW.agents.map((id, index) => { const step = agent(id); const active = id === item.id ? 'aw-step-active' : ''; return `<button class="aw-step ${active}" type="button" data-agent="${id}" style="--sc:${step.color}"><span class="aw-step-num">${index + 1}</span>${step.name}</button>`; }).join('')}</div><div class="aw-layout"><section class="aw-main"><header class="rh-agent-workspace-head"><span class="rh-agent-icon rh-agent-icon--lg" style="--agent-color:${item.color}">${item.icon}</span><div><span class="project-kicker">Agent RH</span><h1>${item.name}</h1><p>${item.desc}</p></div><span class="agent-status"><i></i>${item.status}</span></header><div class="aw-messages"><article class="rh-agent-run"><div class="rh-run-top"><span>MOCK ACTIF</span><small>Dernière exécution : à l'instant</small></div>${content}</article></div><div class="aw-input-area"><div class="aw-input-wrapper"><span class="aw-input-agent-tag" style="background:${item.color}">${item.icon}</span><input id="agent-prompt" placeholder="Demander une action à ${item.name}" autocomplete="off"><button class="aw-send-btn" type="button" data-agent-prompt>↑</button></div></div></section><aside class="rh-agent-context"><span class="project-kicker">Contrat d'agent</span><h3>Entrées</h3>${item.inputs.map(value => `<span>${value}</span>`).join('')}<h3>Sorties</h3>${item.outputs.map(value => `<span>${value}</span>`).join('')}<button class="agent-open" type="button" data-toast="Les paramètres de l'agent sont disponibles dans ce mock.">Configurer →</button></aside></div>`;
}

function showView(view) {
  state.view = view;
  document.querySelectorAll('.view').forEach(element => element.classList.remove('active'));
  byId(`view-${view}`).classList.add('active');
  document.querySelectorAll('[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === view));
  byId('app-shell').classList.remove('ai-open');
}
function openAgent(id) { state.activeAgent = id; showView('agent-workspace'); renderAgentWorkspace(); }
function toggleAssistant(force) { state.aiOpen = typeof force === 'boolean' ? force : !state.aiOpen; byId('ai-panel').classList.toggle('open', state.aiOpen); byId('app-shell').classList.toggle('ai-open', state.aiOpen); if (state.aiOpen && !byId('ai-messages').children.length) byId('ai-messages').innerHTML = '<div class="ai-msg ai-msg-agent">Bonjour Marie. Je peux vous aider à prioriser les recrutements, les onboardings et les actions RH.</div>'; }
function showModal(content) { byId('modal-content').innerHTML = content; byId('agent-modal').classList.add('open'); }
function closeModal() { byId('agent-modal').classList.remove('open'); }

function boot() {
  renderHome(); renderCatalog(); renderWorkflows(); renderProjects(); renderDashboards(); renderAlerts(); renderConversations();
  byId('login-form').addEventListener('submit', event => { event.preventDefault(); byId('login-overlay').style.display = 'none'; byId('app-shell').style.display = 'flex'; });
  document.addEventListener('click', event => {
    const agentButton = event.target.closest('[data-agent]'); if (agentButton) { openAgent(agentButton.dataset.agent); return; }
    const viewButton = event.target.closest('[data-view]'); if (viewButton) { showView(viewButton.dataset.view); return; }
    const category = event.target.closest('[data-category]'); if (category) { state.activeCategory = category.dataset.category; renderCatalog(); return; }
    const check = event.target.closest('[data-check]'); if (check) { state.onboarding.has(check.dataset.check) ? state.onboarding.delete(check.dataset.check) : state.onboarding.add(check.dataset.check); renderAgentWorkspace(); return; }
    const faq = event.target.closest('[data-faq]'); if (faq) { state.activeFaq = Number(faq.dataset.faq); renderAgentWorkspace(); return; }
    if (event.target.closest('#assistant-toggle, #hero-copilot, [data-open-copilot], #new-chat')) { toggleAssistant(true); return; }
    if (event.target.closest('#assistant-close')) { toggleAssistant(false); return; }
    if (event.target.closest('#create-agent')) { showModal('<div class="rh-modal"><span class="project-kicker">Nouveau mock</span><h2>Créer un agent RH</h2><p>Le catalogue de démonstration contient déjà les cinq agents du parcours.</p><button class="btn-primary" type="button" data-close-modal>Fermer</button></div>'); return; }
    if (event.target.closest('#new-project')) { toast('Nouveau projet RH prêt à être configuré.'); return; }
    if (event.target.closest('#new-workflow')) { toast('Le workflow de recrutement est le mock actif.'); return; }
    if (event.target.closest('[data-run-workflow]')) { openAgent('rh_cv_matching'); toast('Workflow RH ouvert à sa première étape.'); return; }
    const notice = event.target.closest('[data-toast]'); if (notice) { toast(notice.dataset.toast); return; }
    if (event.target.closest('[data-agent-prompt]')) { const prompt = byId('agent-prompt').value.trim(); toast(prompt ? 'Demande enregistrée dans le mock.' : 'Saisissez une demande pour cet agent.'); return; }
    if (event.target.closest('[data-close-modal]')) closeModal();
  });
  byId('agent-search').addEventListener('input', event => { state.agentQuery = event.target.value; renderCatalog(); });
  document.addEventListener('input', event => { if (!event.target.matches('[data-score]')) return; state.scores[event.target.dataset.score] = Number(event.target.value); const output = byId(`score-${event.target.dataset.score}`); if (output) output.textContent = `${event.target.value}/5`; const total = byId('evaluation-total'); if (total) total.textContent = `${Math.round(Object.values(state.scores).reduce((sum, value) => sum + value, 0) / 15 * 100)}%`; });
  byId('ai-form').addEventListener('submit', event => { event.preventDefault(); const input = byId('ai-input'); const question = input.value.trim(); if (!question) return; byId('ai-messages').insertAdjacentHTML('beforeend', `<div class="ai-msg ai-msg-user">${esc(question)}</div><div class="ai-msg ai-msg-agent">Je consulte les informations disponibles dans ce mock RH. La priorité actuelle est la validation des retours manager et des actions d’onboarding.</div>`); input.value = ''; });
}

document.addEventListener('DOMContentLoaded', boot);
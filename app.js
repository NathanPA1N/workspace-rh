const agents = [
  { id: 'cv', title: 'Agent CV matching', subtitle: 'Pré-sélection des candidatures', icon: 'file-search', step: '01' },
  { id: 'onboarding', title: 'Agent onboarding', subtitle: "Parcours d'arrivée", icon: 'party-popper', step: '02' },
  { id: 'faq', title: 'Agent FAQ RH', subtitle: 'Réponses aux collaborateurs', icon: 'messages-square', step: '03' },
  { id: 'matching', title: 'Agent Matching Profils', subtitle: 'Shortlist métier', icon: 'git-compare-arrows', step: '04' },
  { id: 'evaluation', title: 'Agent Job evaluation', subtitle: 'Évaluation des compétences', icon: 'clipboard-check', step: '05' }
];

const candidates = [
  { id: 'camille', initials: 'CD', name: 'Camille Durand', role: 'Data Analyst', skills: ['SQL', 'Power BI', 'Python'], score: 94, color: 'green' },
  { id: 'lina', initials: 'LM', name: 'Lina Moreau', role: 'Data Analyst', skills: ['SQL', 'Tableau', 'Finance'], score: 88, color: 'coral' },
  { id: 'theo', initials: 'TM', name: 'Théo Martin', role: 'Data Analyst', skills: ['Python', 'dbt', 'Azure'], score: 82, color: '' }
];

const activity = [
  { icon: 'file-check-2', color: 'green', text: 'Camille Durand qualifiée pour Data Analyst', detail: 'Agent CV matching', time: '09:42' },
  { icon: 'calendar-check-2', color: 'blue', text: 'Entretien manager confirmé', detail: 'Poste Product Owner RH', time: '09:18' },
  { icon: 'circle-help', color: 'coral', text: 'Question congés traitée automatiquement', detail: 'Agent FAQ RH', time: '08:57' },
  { icon: 'badge-check', color: 'green', text: 'Dossier onboarding complété', detail: 'Sami Bellal · Direction Data', time: '08:35' }
];

const state = {
  activeAgent: 'cv',
  selectedCandidate: 'camille',
  candidateQuery: '',
  onboardingDone: new Set(['contract', 'equipment', 'manager']),
  activeFaq: 0,
  evaluation: { expertise: 4, collaboration: 5, leadership: 3 },
  view: 'overview'
};

function icon(name, extra = '') {
  return `<i data-lucide="${name}"${extra}></i>`;
}

function renderIcons() {
  if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.8 } });
}

function renderWorkflowRail() {
  document.querySelector('#workflow-rail').innerHTML = agents.map((agent, index) => {
    const activeIndex = agents.findIndex(item => item.id === state.activeAgent);
    const status = agent.id === state.activeAgent ? 'is-active' : index < activeIndex ? 'is-done' : '';
    const visualIcon = index < activeIndex ? 'check' : agent.icon;
    return `<button class="workflow-step ${status}" type="button" data-agent="${agent.id}">
      <span>${icon(visualIcon)}</span><span><strong>${agent.title}</strong><small>Agent ${agent.step}</small></span>
    </button>`;
  }).join('');
}

function candidateRow(candidate) {
  const selected = candidate.id === state.selectedCandidate ? 'is-selected' : '';
  return `<article class="candidate-row ${selected}">
    <div class="person"><span class="avatar ${candidate.color}">${candidate.initials}</span><span><strong>${candidate.name}</strong><small>${candidate.role}</small></span></div>
    <div class="skill-tags">${candidate.skills.map(skill => `<span class="tag">${skill}</span>`).join('')}</div>
    <strong class="score">${candidate.score}%</strong>
    <button class="row-button" type="button" title="Sélectionner ${candidate.name}" aria-label="Sélectionner ${candidate.name}" data-select-candidate="${candidate.id}">${icon('arrow-right')}</button>
  </article>`;
}

function cvPanel() {
  const filtered = candidates.filter(candidate => `${candidate.name} ${candidate.role} ${candidate.skills.join(' ')}`.toLowerCase().includes(state.candidateQuery.toLowerCase()));
  return `<div class="agent-toolbar"><div><h4>Candidatures recommandées</h4><p>Score construit sur les critères du poste Data Analyst.</p></div><input id="candidate-search" class="search-input" type="search" value="${state.candidateQuery}" placeholder="Rechercher un profil" aria-label="Rechercher un profil"></div>
    <div class="candidate-list">${filtered.length ? filtered.map(candidateRow).join('') : '<p>Aucun profil ne correspond à cette recherche.</p>'}</div>
    <div class="agent-footer"><small>3 profils sur 48 proposés pour revue manager.</small><button class="primary-action" type="button" data-next-agent="matching">Passer au matching ${icon('arrow-right')}</button></div>`;
}

function onboardingPanel() {
  const checks = [
    ['contract', 'Contrat signé', 'Validé'],
    ['equipment', 'Matériel commandé', 'Validé'],
    ['access', 'Accès et habilitations', 'À lancer'],
    ['manager', 'Point manager planifié', 'Validé'],
    ['welcome', "Parcours d'accueil", 'À planifier']
  ];
  const complete = state.onboardingDone.size;
  return `<div class="onboarding-layout"><div><div class="agent-toolbar"><div><h4>Onboarding de Sami Bellal</h4><p>Arrivée prévue le 15 septembre · Direction Data.</p></div></div><div class="checklist">${checks.map(([id, label, status]) => `<button class="check-item ${state.onboardingDone.has(id) ? 'is-done' : ''}" type="button" data-check="${id}"><span>${icon('check')}</span><span>${label}</span><small>${state.onboardingDone.has(id) ? 'Validé' : status}</small></button>`).join('')}</div></div><aside class="subpanel onboarding-aside"><span class="eyebrow">Avancement</span><div class="progress-ring"><span><strong>${Math.round(complete / checks.length * 100)}%</strong><small>complété</small></span></div><p>Les actions validées sont enregistrées dans le parcours collaborateur.</p><button class="primary-action" type="button" data-toast="Relance envoyée aux intervenants concernés.">${icon('send')}Relancer</button></aside></div>`;
}

const faqEntries = [
  { question: 'Combien de jours de télétravail puis-je demander ?', answer: 'Après validation de la période d’essai, chaque collaborateur peut demander jusqu’à deux jours de télétravail par semaine, selon l’accord en vigueur et l’organisation de son équipe.' },
  { question: 'Comment transmettre un arrêt de travail ?', answer: 'Déposez le volet destiné à l’employeur dans votre espace RH dans les 48 heures. L’équipe RH confirme la prise en compte et vous indique toute pièce complémentaire.' },
  { question: 'Où retrouver mon bulletin de paie ?', answer: 'Vos bulletins sont disponibles dans votre coffre-fort numérique depuis l’espace “Mes documents”. Une notification est envoyée dès leur mise à disposition.' },
  { question: 'Comment poser des congés ?', answer: 'Depuis le portail RH, sélectionnez vos dates puis soumettez votre demande. Votre responsable reçoit une notification et la décision apparaît dans votre calendrier.' }
];

function faqPanel() {
  const entry = faqEntries[state.activeFaq];
  return `<div class="faq-grid"><div class="faq-questions"><div><h4>Questions fréquentes</h4><p>Base de connaissances collaborateurs.</p></div>${faqEntries.map((faq, index) => `<button class="faq-question ${index === state.activeFaq ? 'is-active' : ''}" type="button" data-faq="${index}">${faq.question}${icon('chevron-right')}</button>`).join('')}</div><article class="answer-card"><span>RÉPONSE VALIDÉE</span><h4>${entry.question}</h4><p>${entry.answer}</p><footer>${icon('shield-check')}Contenu contrôlé par l'équipe RH</footer></article></div>`;
}

function matchingPanel() {
  const bestCandidates = candidates.slice(0, 3);
  return `<div class="match-layout"><div><div class="agent-toolbar"><div><h4>Shortlist recommandée</h4><p>Compatibilité calculée pour le poste sélectionné.</p></div></div><select class="role-select" id="role-select" aria-label="Poste à pourvoir"><option>Data Analyst · Direction Data</option><option>Product Owner RH · Direction RH</option><option>Chargé de recrutement · Talent</option></select><div class="match-cards">${bestCandidates.map(candidate => `<article class="match-card"><div class="person"><span class="avatar ${candidate.color}">${candidate.initials}</span><span><strong>${candidate.name}</strong><small>${candidate.skills.join(' · ')}</small></span></div><strong class="score">${candidate.score}%</strong></article><div class="fit-meter"><span style="width:${candidate.score}%"></span></div>`).join('')}</div><div class="agent-footer"><small>Critères pondérés : expertise, environnement, disponibilité.</small><button class="primary-action" type="button" data-next-agent="evaluation">Valider la shortlist ${icon('arrow-right')}</button></div></div><aside class="subpanel"><h4>Poste ciblé</h4><dl class="role-facts"><div><dt>Direction</dt><dd>Data & Innovation</dd></div><div><dt>Localisation</dt><dd>Paris · Hybride</dd></div><div><dt>Contrat</dt><dd>CDI</dd></div><div><dt>Priorité</dt><dd>Haute</dd></div></dl></aside></div>`;
}

function evaluationPanel() {
  const labels = { expertise: 'Expertise métier', collaboration: 'Collaboration', leadership: 'Leadership' };
  const total = Object.values(state.evaluation).reduce((sum, score) => sum + score, 0);
  const percentage = Math.round(total / 15 * 100);
  return `<div class="evaluation-layout"><div><div class="agent-toolbar"><div><h4>Évaluation de Camille Durand</h4><p>Entretien du 4 septembre · poste Data Analyst.</p></div></div>${Object.entries(state.evaluation).map(([key, value]) => `<div class="evaluation-score"><label for="score-${key}">${labels[key]}</label><output id="output-${key}">${value}/5</output><input id="score-${key}" type="range" min="1" max="5" value="${value}" data-score="${key}"></div>`).join('')}<div class="agent-footer"><small>Le score reste modifiable jusqu’à validation.</small><button class="primary-action" type="button" data-toast="Évaluation enregistrée dans le dossier candidat.">${icon('save')}Enregistrer l'évaluation</button></div></div><aside class="subpanel evaluation-summary"><span class="eyebrow">Score global</span><strong>${percentage}%</strong><p>Recommandation : poursuivre avec un entretien manager.</p><span class="agent-status"><i></i>Favorable</span></aside></div>`;
}

function renderAgentPanel() {
  const agent = agents.find(item => item.id === state.activeAgent);
  const panelByAgent = { cv: cvPanel, onboarding: onboardingPanel, faq: faqPanel, matching: matchingPanel, evaluation: evaluationPanel };
  document.querySelector('#agent-panel').innerHTML = `<header class="agent-header"><div class="agent-title"><span class="agent-symbol">${icon(agent.icon)}</span><div><span class="eyebrow">Agent ${agent.step}</span><h3>${agent.title}</h3><p>${agent.subtitle}</p></div></div><span class="agent-status"><i></i>Prêt</span></header><div class="agent-body">${panelByAgent[agent.id]()}</div>`;
}

function renderActivity() {
  document.querySelector('#activity-list').innerHTML = activity.map(item => `<article class="activity-item"><span class="activity-icon ${item.color}">${icon(item.icon)}</span><span><strong>${item.text}</strong><small>${item.detail}</small></span><time>${item.time}</time></article>`).join('');
}

function renderSecondaryView() {
  const secondary = document.querySelector('#secondary-view');
  const overview = document.querySelector('#overview-view');
  if (state.view === 'overview') { overview.hidden = false; secondary.hidden = true; return; }
  overview.hidden = true;
  secondary.hidden = false;
  const isAgents = state.view === 'agents';
  secondary.innerHTML = `<span class="eyebrow">${isAgents ? 'Catalogue RH' : 'Recrutement'}</span><h2>${isAgents ? 'Les cinq agents du workspace' : 'Viviers talents'}</h2><p>${isAgents ? 'Sélectionnez un agent pour ouvrir sa démonstration dans le parcours.' : 'Les profils sont simulés pour cette démonstration et ne constituent pas une base candidats réelle.'}</p><div class="empty-state">${icon(isAgents ? 'bot' : 'users-round')}<span><strong>${isAgents ? 'Parcours connecté' : 'Aucun vivier connecté'}</strong><span>${isAgents ? 'Les agents partagent une expérience de recrutement unifiée.' : 'Connectez votre ATS pour afficher les candidats actifs.'}</span></span></div>`;
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('is-visible'), 3400);
}

function setAgent(id) {
  state.activeAgent = id;
  state.view = 'overview';
  document.querySelectorAll('.side-link').forEach(button => button.classList.toggle('is-active', button.dataset.view === 'overview'));
  renderAll();
  document.querySelector('#agent-panel').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function renderAll() {
  renderWorkflowRail();
  renderAgentPanel();
  renderActivity();
  renderSecondaryView();
  renderIcons();
}

document.addEventListener('click', event => {
  const workflowButton = event.target.closest('[data-agent]');
  if (workflowButton) { setAgent(workflowButton.dataset.agent); return; }
  const nextAgent = event.target.closest('[data-next-agent]');
  if (nextAgent) { setAgent(nextAgent.dataset.nextAgent); showToast('Étape suivante ouverte dans le parcours RH.'); return; }
  const candidateButton = event.target.closest('[data-select-candidate]');
  if (candidateButton) { state.selectedCandidate = candidateButton.dataset.selectCandidate; renderAgentPanel(); renderIcons(); return; }
  const check = event.target.closest('[data-check]');
  if (check) { state.onboardingDone.has(check.dataset.check) ? state.onboardingDone.delete(check.dataset.check) : state.onboardingDone.add(check.dataset.check); renderAgentPanel(); renderIcons(); return; }
  const faq = event.target.closest('[data-faq]');
  if (faq) { state.activeFaq = Number(faq.dataset.faq); renderAgentPanel(); renderIcons(); return; }
  const notification = event.target.closest('[data-toast]');
  if (notification) { showToast(notification.dataset.toast); return; }
  const nav = event.target.closest('[data-view]');
  if (nav) { state.view = nav.dataset.view; document.querySelectorAll('.side-link').forEach(button => button.classList.toggle('is-active', button === nav)); renderSecondaryView(); renderIcons(); return; }
  if (event.target.closest('#new-request')) showToast('Formulaire de nouvelle demande prêt à être relié à votre ATS.');
});

document.addEventListener('input', event => {
  if (event.target.id === 'candidate-search') { state.candidateQuery = event.target.value; renderAgentPanel(); renderIcons(); }
  if (event.target.matches('[data-score]')) { state.evaluation[event.target.dataset.score] = Number(event.target.value); document.querySelector(`#output-${event.target.dataset.score}`).textContent = `${event.target.value}/5`; const summary = document.querySelector('.evaluation-summary strong'); if (summary) summary.textContent = `${Math.round(Object.values(state.evaluation).reduce((sum, value) => sum + value, 0) / 15 * 100)}%`; }
});

window.addEventListener('DOMContentLoaded', renderAll);
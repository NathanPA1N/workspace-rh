# Workspace RH

POC statique d'un workspace RH centré sur un parcours de recrutement et cinq agents simulés :

1. Agent CV matching
2. Agent onboarding
3. Agent FAQ RH
4. Agent Matching Profils
5. Agent Job evaluation

Les données affichées sont fictives. L'application ne contient ni données personnelles réelles, ni authentification, ni appel à une API métier.

## Lancer localement

Le projet ne nécessite ni installation ni compilation. Ouvrir simplement [`index.html`](index.html) dans un navigateur.

## Déploiement Vercel

Vercel reconnaît automatiquement cette application statique. Le déploiement de production est déclenché avec :

```sh
npx vercel --prod
```

## Structure

```text
index.html   # Shell et contenu initial
styles.css   # Design système et mise en page responsive
app.js       # États et interactions des mocks RH
vercel.json  # Configuration Vercel
```
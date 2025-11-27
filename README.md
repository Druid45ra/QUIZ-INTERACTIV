# QUIZ-INTERACTIV

Un proiect simplu de quiz interactiv construit cu HTML, CSS și JavaScript (Node.js + Express pentru partea de server).

## Descriere
Aplicația servește un set de întrebări din folderul `public` și păstrează scorurile pe server (vezi `server/` și `models/Score.js`). Este potrivită ca demo/templată pentru un quiz local.

## Structură proiect
- `public/` - fișiere statice (HTML, JS client, CSS, assets)
- `server/` - cod server (Express)
- `models/` - modele Mongoose sau obiecte pentru date
- `routes/` - rutele API (ex: `scores.js`)
- `package.json` - dependențe și scripturi

## Cerințe
- Node.js 14+ (recomandat 18+)
- npm sau yarn

## Instalare
1. Descarcă sau clonează repository-ul:

```powershell
git clone https://github.com/USERNAME/REPO.git
cd REPO
```

2. Instalează dependențele:

```powershell
npm install
```

3. (Opțional) Creează un fișier `.env` în rădăcină dacă serverul folosește variabile de mediu (ex: `PORT`, conexiune DB).

## Rulare locală
- Pornește serverul (comandă tipică):

```powershell
npm start
# sau, dacă există:
npm run dev
```

Deschide apoi în browser `http://localhost:3000` (sau portul specificat în `.env`).

## Lucrul cu codul
- Frontend: modifică fișierele din `public/` (`index.html`, `script.js`, `styles.css`)
- Backend: vezi `server/server.js` și `routes/scores.js` pentru API

## Contribuire
- Creează un branch nou pentru funcționalități: `git checkout -b feat-numele-functiei`
- Fă commit-uri clare și deschide un Pull Request pe GitHub

## Licență
Proiectul nu are o licență specificată. Adaugă un fișier `LICENSE` dacă dorești o licențiere deschisă.

---
Dacă vrei, pot adăuga și un `.gitignore` specific pentru Node.js și pot comite/împinge aceste schimbări pentru tine.
# Quiz Interactiv — Instrucțiuni de instalare și rulare

## Cerințe
- Browser modern (Chrome, Firefox, Edge).
- Nu sunt necesare build tools — proiectul rulează static.

## Pași de implementare
1. Creează folderul `quiz-interactiv`.
2. Creează fișierele `index.html`, `questions.js`, `script.js`, `README.md`.
3. Copiază conținutul din fișierele furnizate în fișierele respective.
4. Deschide `index.html` în browser (dublu click sau `Ctrl+O` -> selectează fișierul).
5. Apasă `Începe quiz` pentru a rula.

## Extensii posibile
- Înlocuiește `questions.js` cu un fișier JSON și încarcă via `fetch` (dacă rulezi prin server). 
- Adaugă temporizator per întrebare (setInterval).
- Păstrează istoricul jocurilor în localStorage (date, scor).
- Transformă aplicația în component React/Vue pentru scalare.

## Observații
- Codul folosește array methods (map, forEach) la inițializare și pentru randare.
- Interacțiunile sunt făcute doar cu DOM, fără reload.

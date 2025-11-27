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

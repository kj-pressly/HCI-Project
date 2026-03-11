# HCI Survey Apps

This workspace contains two simple web-based survey apps with 10 doctor-office demographic questions.

## 1) Basic survey app
- Folder: `survey-basic`
- Open `survey-basic/index.html` in your browser.

## 2) Rephrase-enabled survey app
- Folder: `survey-rephrase`
- Open `survey-rephrase/index.html` in your browser.
- Click **Rephrase** on any question for alternate plain-language wording.
- Type a short clarifying question in the inline box and click **Ask AI**.

## Notes
- Both apps are static HTML/CSS/JS (no backend needed).
- Submissions are shown in the browser console.

## Run both apps with one command
From the `HCI` folder:

```bash
chmod +x start-server.sh
./start-server.sh
```

Optional custom port:

```bash
./start-server.sh 8080
```

Then open:
- `http://localhost:5500/survey-basic/`
- `http://localhost:5500/survey-rephrase/`

## Rephrase notes
- Rephrase mode is local-only and does not require any API key.

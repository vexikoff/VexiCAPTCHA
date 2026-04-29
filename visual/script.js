let currentToken = '';
let currentMeta = null;
let solved = false;

async function loadCaptcha() {
    if (solved) return;
    try {
        const res = await fetch('/api/mn');
        const data = await res.json();
        currentToken = data.token;
        currentMeta = data._meta;
        const img = document.getElementById('captcha-img');
        if (img) img.src = data.imageUrl;
    } catch (e) {}
}

async function handleApprove() {
    if (solved) return;
    const input = document.getElementById('captcha-input');
    const answer = input ? input.value.trim() : '';
    if (!answer) { loadCaptcha(); return; }

    try {
        const res = await fetch('/api/mf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: currentToken, answer: answer, _meta: currentMeta })
        });
        const data = await res.json();

        if (data.verified) {
            solved = true;
            window.parent.postMessage({ type: 'CAPTCHA_SOLVED', token: currentToken }, '*');
        } else {
            loadCaptcha();
        }
    } catch (e) {
        loadCaptcha();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('approve-btn');
    if (btn) btn.addEventListener('click', handleApprove);
    const input = document.getElementById('captcha-input');
    if (input) input.addEventListener('keypress', function(e) { if (e.key === 'Enter') handleApprove(); });
    loadCaptcha();
});
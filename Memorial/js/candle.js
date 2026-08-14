// מודול הדלקת נר זיכרון דינמי

const candlesListRef = db.ref('candlesHistory');
const totalCandlesRef = db.ref('candleCount');
const candleBtn = document.getElementById('candleBtn');
const candleNameInput = document.getElementById('candleNameInput');
const candleFormDiv = document.getElementById('candleFormDiv');
let hasLitCandle = localStorage.getItem('candleLit_v3') === 'true';

if (hasLitCandle && candleFormDiv) {
    candleFormDiv.innerHTML = "<div class='bg-white/10 border border-white/20 text-white px-8 py-3 rounded-full font-medium cursor-default backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.1)]'><span class='text-xl'>🕯️</span> הנר שלך דולק</div>";
}

if (candleBtn) {
    candleBtn.addEventListener('click', () => {
        if (hasLitCandle) return;
        const name = candleNameInput ? candleNameInput.value.trim() : "";
        if (!name) {
            alert("אנא הזן את שמך כדי להדליק נר.");
            return;
        }
        const now = new Date();
        const timeString = now.toLocaleDateString('he-IL') + " - " + now.toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'});

        candlesListRef.push({ name: name, time: timeString }).then(() => {
            totalCandlesRef.set(firebase.database.ServerValue.increment(1));
            localStorage.setItem('candleLit_v3', 'true');
            hasLitCandle = true;
            if (candleFormDiv) {
                candleFormDiv.innerHTML = "<div class='bg-white/10 border border-white/20 text-white px-8 py-3 rounded-full font-medium cursor-default backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.1)]'><span class='text-xl'>🕯️</span> תודה, "+name+", הנר שלך דולק</div>";
            }
        });
    });
}

// האזנה לסך הנרות שהודלקו
totalCandlesRef.on('value', (snapshot) => {
    const count = snapshot.val() || 0;
    const countElem = document.getElementById('candleCountText');
    if (countElem) countElem.innerText = `${count} נרות הודלקו לזכרם`;
});

// האזנה לרשימת המדליקים
candlesListRef.on('value', (snapshot) => {
    const listDiv = document.getElementById('candleLightersList');
    if (!listDiv) return;
    listDiv.innerHTML = '';
    const data = snapshot.val();
    if (data) {
        const arr = Object.values(data).reverse();
        arr.forEach(item => {
            listDiv.innerHTML += `<div class="bg-white/5 border border-white/10 py-1.5 px-4 rounded-full shadow-sm inline-block mx-1 my-1 backdrop-blur-sm text-stone-200">🕯️ ${item.name} <span class="text-xs text-stone-400 ml-1">(${item.time})</span></div>`;
        });
    }
});

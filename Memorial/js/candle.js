// מודול הדלקת נר זיכרון דינמי

const candlesListRef = db.ref('candlesHistory');
const totalCandlesRef = db.ref('candleCount');
const candleBtn = document.getElementById('candleBtn');
const candleNameInput = document.getElementById('candleNameInput');
const candleFormDiv = document.getElementById('candleFormDiv');
let hasLitCandle = localStorage.getItem('candleLit_v3') === 'true';

if (hasLitCandle && candleFormDiv) {
    candleFormDiv.innerHTML = "<div class='bg-amber-900/80 border border-amber-500/50 text-amber-100 px-8 py-3 rounded-full font-bold cursor-default backdrop-blur-sm shadow-md inline-flex items-center gap-2'><span class='text-xl animate-pulse'>🕯️</span> <span>הנר שלך דולק במערכת</span></div>";
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
                candleFormDiv.innerHTML = "<div class='bg-amber-900/80 border border-amber-500/50 text-amber-100 px-8 py-3 rounded-full font-bold cursor-default backdrop-blur-sm shadow-md inline-flex items-center gap-2'><span class='text-xl animate-pulse'>🕯️</span> <span>תודה, "+name+", הנר שלך דולק במערכת</span></div>";
            }
        });
    });
}

// האזנה בזמן אמת לרשימת המדליקים וסנכרון מדויק של המונה
candlesListRef.on('value', (snapshot) => {
    const listDiv = document.getElementById('candleLightersList');
    const countElem = document.getElementById('candleCountText');
    if (!listDiv) return;
    
    listDiv.innerHTML = '';
    const data = snapshot.val();
    
    if (data) {
        const arr = Object.values(data).reverse(); // החדשים ביותר בראש
        
        // עדכון המונה באופן מדויק לפי כמות השמות הקיימים בפועל
        if (countElem) {
            countElem.innerText = `${arr.length} נרות הודלקו לזכרם`;
        }

        // רנדור כל השמות לרשימת הגלילה
        arr.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = "bg-white/10 hover:bg-white/15 border border-amber-400/20 py-2.5 px-4 rounded-xl flex items-center justify-between text-xs md:text-sm text-amber-100 transition shadow-2xs";
            card.innerHTML = `
                <div class="flex items-center gap-2 font-semibold">
                    <span class="text-amber-400 text-base">🕯️</span>
                    <span>${item.name}</span>
                </div>
                <span class="text-[11px] text-amber-200/60 font-medium">${item.time || ''}</span>
            `;
            listDiv.appendChild(card);
        });
    } else {
        if (countElem) countElem.innerText = `0 נרות הודלקו לזכרם`;
        listDiv.innerHTML = `
            <div class="text-center py-6 text-amber-200/50 text-xs font-medium">
                עדיין לא הודלקו נרות. היו הראשונים להדליק נר זיכרון!
            </div>
        `;
    }
});

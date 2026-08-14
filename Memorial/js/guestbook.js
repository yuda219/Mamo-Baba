// מודול ספר הזיכרונות וההקדשות, החלון הצף וסנכרון מול Firebase

const messagesRef = db.ref('messages');
const guestbookModal = document.getElementById('guestbookModal');
const modalReadSection = document.getElementById('modalReadSection');
const modalWriteSection = document.getElementById('modalWriteSection');
const modalTabRead = document.getElementById('modalTabRead');
const modalTabWrite = document.getElementById('modalTabWrite');
const modalMessagesList = document.getElementById('modalMessagesList');
const featuredMessagesContainer = document.getElementById('featuredMessagesContainer');
const guestbookSearchInput = document.getElementById('guestbookSearchInput');
const modalMessageForm = document.getElementById('modalMessageForm');
const modalWriteStatus = document.getElementById('modalWriteStatus');

let allMessagesList = [];

// פתיחת החלון הצף
window.openGuestbookModal = function(initialTab = 'read') {
    if (!guestbookModal) return;
    guestbookModal.classList.remove('hidden');
    guestbookModal.classList.add('flex');
    setTimeout(() => {
        guestbookModal.classList.remove('opacity-0');
    }, 10);
    switchModalTab(initialTab);
};

// סגירת החלון הצף
window.closeGuestbookModal = function() {
    if (!guestbookModal) return;
    guestbookModal.classList.add('opacity-0');
    setTimeout(() => {
        guestbookModal.classList.add('hidden');
        guestbookModal.classList.remove('flex');
    }, 300);
};

// מעבר בין לשוניות בחלון הצף
window.switchModalTab = function(tab) {
    if (tab === 'read') {
        if (modalReadSection) modalReadSection.classList.remove('hidden');
        if (modalWriteSection) modalWriteSection.classList.add('hidden');
        if (modalTabRead) modalTabRead.className = "pb-3 px-4 font-bold text-sm border-b-2 border-amber-800 text-amber-900 transition flex items-center gap-1.5";
        if (modalTabWrite) modalTabWrite.className = "pb-3 px-4 font-medium text-sm border-b-2 border-transparent text-stone-500 hover:text-stone-800 transition flex items-center gap-1.5";
    } else {
        if (modalReadSection) modalReadSection.classList.add('hidden');
        if (modalWriteSection) modalWriteSection.classList.remove('hidden');
        if (modalTabWrite) modalTabWrite.className = "pb-3 px-4 font-bold text-sm border-b-2 border-amber-800 text-amber-900 transition flex items-center gap-1.5";
        if (modalTabRead) modalTabRead.className = "pb-3 px-4 font-medium text-sm border-b-2 border-transparent text-stone-500 hover:text-stone-800 transition flex items-center gap-1.5";
    }
};

// יצירת כרטיסייה מעוצבת להקדשה
function createMessageCard(msg, index) {
    const initial = msg.name ? msg.name.trim().charAt(0) : "ז";
    const colors = [
        "bg-amber-700 text-amber-50",
        "bg-stone-800 text-stone-100",
        "bg-amber-900 text-amber-100",
        "bg-amber-800 text-amber-50"
    ];
    const colorClass = colors[index % colors.length];

    const card = document.createElement('div');
    card.className = "bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-md transition-all duration-300 relative group overflow-hidden";
    card.innerHTML = `
        <div class="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-amber-700 to-amber-900"></div>
        <div class="flex items-start justify-between mb-3 pr-2">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full ${colorClass} font-bold flex items-center justify-center text-sm shadow-xs border border-white/20">
                    ${initial}
                </div>
                <div>
                    <h4 class="font-bold text-stone-900 text-sm md:text-base font-serif-custom">${msg.name}</h4>
                    <span class="text-[11px] text-stone-400 block">${msg.date || ''}</span>
                </div>
            </div>
            <span class="text-amber-800/20 group-hover:text-amber-800/40 text-2xl font-serif leading-none transition-colors">“</span>
        </div>
        <p class="text-stone-700 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed pr-2 pl-1">${msg.text}</p>
    `;
    return card;
}

// סינון ורנדור תגובות בתוך החלון הצף
function renderModalMessages(messages) {
    if (!modalMessagesList) return;
    modalMessagesList.innerHTML = '';

    if (messages.length === 0) {
        modalMessagesList.innerHTML = `
            <div class="text-center py-10 px-4 text-stone-400">
                <span class="text-3xl block mb-2">📜</span>
                <p class="text-sm font-medium">לא נמצאו זיכרונות. היו הראשונים לכתוב הקדשה!</p>
            </div>
        `;
        return;
    }

    messages.forEach((msg, idx) => {
        modalMessagesList.appendChild(createMessageCard(msg, idx));
    });
}

// רנדור תגובות מובילות בעמוד הראשי
function renderFeaturedMessages(messages) {
    if (!featuredMessagesContainer) return;
    featuredMessagesContainer.innerHTML = '';

    const topMessages = messages.slice(0, 4);

    if (topMessages.length === 0) {
        featuredMessagesContainer.innerHTML = `
            <div class="col-span-2 text-center py-6 text-stone-400 text-sm bg-white p-6 rounded-2xl border border-stone-100">
                היה הראשון לכתוב זיכרון בספר הזיכרונות הצף...
            </div>
        `;
        return;
    }

    topMessages.forEach((msg, idx) => {
        featuredMessagesContainer.appendChild(createMessageCard(msg, idx));
    });
}

// חיפוש בזמן אמת בתוך החלון הצף
if (guestbookSearchInput) {
    guestbookSearchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const filtered = allMessagesList.filter(msg => 
            (msg.name && msg.name.toLowerCase().includes(term)) ||
            (msg.text && msg.text.toLowerCase().includes(term))
        );
        renderModalMessages(filtered);
    });
}

// הגשת טופס כתיבה חדש מתוך החלון הצף
if (modalMessageForm) {
    modalMessageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('modalSenderName');
        const textInput = document.getElementById('modalMessageText');
        
        const name = nameInput ? nameInput.value.trim() : "";
        const text = textInput ? textInput.value.trim() : "";
        if (!name || !text) return;

        const date = new Date().toLocaleDateString('he-IL');

        if (modalWriteStatus) {
            modalWriteStatus.classList.remove('hidden', 'bg-red-100', 'text-red-800');
            modalWriteStatus.className = "text-xs font-semibold text-center py-2.5 rounded-xl bg-amber-100 text-amber-900 block animate-pulse";
            modalWriteStatus.innerText = "שומר את ההקדשה בספר הזיכרונות...";
        }

        messagesRef.push({ name, text, date }).then(() => {
            if (modalWriteStatus) {
                modalWriteStatus.className = "text-xs font-semibold text-center py-2.5 rounded-xl bg-green-100 text-green-800 block";
                modalWriteStatus.innerText = "✨ תודה מקרב לב! ההקדשה נשמרה בספר הזיכרונות.";
            }
            
            if (nameInput) nameInput.value = '';
            if (textInput) textInput.value = '';

            setTimeout(() => {
                if (modalWriteStatus) modalWriteStatus.classList.add('hidden');
                switchModalTab('read');
            }, 1800);
        }).catch((err) => {
            console.error(err);
            if (modalWriteStatus) {
                modalWriteStatus.className = "text-xs font-semibold text-center py-2.5 rounded-xl bg-red-100 text-red-800 block";
                modalWriteStatus.innerText = "שגיאה בשמירה, אנא נסה שוב.";
            }
        });
    });
}

// האזנה בזמן אמת להודעות מ-Firebase
messagesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        allMessagesList = Object.values(data).reverse();
    } else {
        allMessagesList = [];
    }

    const count = allMessagesList.length;
    
    // עדכון מונים בעמוד
    const heroBadge = document.getElementById('heroMessageCountBadge');
    const fabBadge = document.getElementById('fabMessageCountBadge');
    const modalTabBadge = document.getElementById('modalTabMessageCount');

    if (heroBadge) heroBadge.innerText = count;
    if (fabBadge) fabBadge.innerText = count;
    if (modalTabBadge) modalTabBadge.innerText = count;

    renderFeaturedMessages(allMessagesList);
    renderModalMessages(allMessagesList);
});

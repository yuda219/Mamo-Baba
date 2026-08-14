// מודול אילן יוחסין דינמי, הוספת נינים ואישור מנהל המערכת

const treeDataRef = db.ref('familyTreeData');
const pendingRequestsRef = db.ref('pendingTreeRequests');
const ADMIN_PASSWORD = 'mamo';

// נתוני בסיס מלאים לכל 5 הענפים ו-21 הנכדים
const initialTreeStructure = {
    "branch_1": {
        title: "אורה וסמי יצחקי",
        childrenCount: 4,
        grandchildren: {
            "איתי": [],
            "אודליה": [],
            "אוהד": [],
            "איתמר": []
        }
    },
    "branch_2": {
        title: "אבי ויהודית סבג",
        childrenCount: 4,
        grandchildren: {
            "שנית": [],
            "אורטל": [],
            "יהודה": [],
            "חננאל": []
        }
    },
    "branch_3": {
        title: "יעל ודוד חן",
        childrenCount: 4,
        grandchildren: {
            "אודי": [],
            "שירן": [],
            "אדווה": [],
            "אריאל": []
        }
    },
    "branch_4": {
        title: "יהודית ואילן נגר",
        childrenCount: 5,
        grandchildren: {
            "לילך": [],
            "דורין": [],
            "אדיר": [],
            "נאור": [],
            "קוראל": []
        }
    },
    "branch_5": {
        title: "ויוון ושלומי בן חיון",
        childrenCount: 4,
        grandchildren: {
            "יותם": [],
            "אמיתי": [],
            "אביתר": [],
            "אליה": []
        }
    }
};

let currentTreeData = {};
let currentPendingRequests = {};
let selectedBranchKey = null;
let selectedGrandchildName = null;

// מיזוג חסין ובטוח בין הנתונים הקיימים ב-Firebase לנתוני הבסיס
function ensureTreeStructure(val) {
    const result = JSON.parse(JSON.stringify(initialTreeStructure));

    if (!val || typeof val !== 'object') return result;

    Object.keys(result).forEach(bKey => {
        if (val[bKey]) {
            if (val[bKey].title) result[bKey].title = val[bKey].title;
            if (val[bKey].childrenCount) result[bKey].childrenCount = val[bKey].childrenCount;
            if (val[bKey].grandchildren && typeof val[bKey].grandchildren === 'object') {
                Object.keys(result[bKey].grandchildren).forEach(gName => {
                    if (val[bKey].grandchildren[gName]) {
                        result[bKey].grandchildren[gName] = val[bKey].grandchildren[gName];
                    }
                });
                // שמירת נכדים חדשים אם התווספו
                Object.keys(val[bKey].grandchildren).forEach(gName => {
                    if (!result[bKey].grandchildren[gName]) {
                        result[bKey].grandchildren[gName] = val[bKey].grandchildren[gName];
                    }
                });
            }
        }
    });

    return result;
}

// האזנה בזמן אמת לשינויים באילן היוחסין
treeDataRef.on('value', (snapshot) => {
    const rawVal = snapshot.val();
    currentTreeData = ensureTreeStructure(rawVal);
    
    // אם הנתונים ב-Firebase היו חסרים או לא מלאים, נסנכרן בחזרה ל-Firebase
    if (!rawVal || Object.keys(rawVal).length === 0) {
        treeDataRef.set(currentTreeData);
    }
    
    renderFamilyTreeUI();
});

// האזנה לבקשות ממתינות לאישור מנהל
pendingRequestsRef.on('value', (snapshot) => {
    currentPendingRequests = snapshot.val() || {};
    updatePendingBadgeCount();
    renderPendingRequestsList();
});

// רנדור אילן היוחסין בדינמיות לפי הנתונים המעודכנים מ-Firebase
function renderFamilyTreeUI() {
    const container = document.getElementById('familyTreeBranchesContainer');
    if (!container) return;

    container.innerHTML = '';

    Object.keys(currentTreeData).forEach((branchKey) => {
        const branch = currentTreeData[branchKey];
        const branchCard = document.createElement('div');
        branchCard.className = "bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:border-amber-500/60 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group";
        
        let grandchildrenHTML = '';
        if (branch.grandchildren) {
            Object.keys(branch.grandchildren).forEach((gName) => {
                const greatGrandchildrenList = branch.grandchildren[gName] || [];
                const countBadge = greatGrandchildrenList.length > 0 
                    ? `<span class="bg-amber-800 text-amber-100 text-[10px] px-1.5 py-0.5 rounded-full mr-1 font-bold">${greatGrandchildrenList.length}</span>` 
                    : '';

                let greatChildrenBadges = '';
                if (greatGrandchildrenList.length > 0) {
                    greatChildrenBadges = `<div class="w-full flex flex-wrap gap-1 justify-center mt-1.5 pt-1.5 border-t border-amber-200/50">`;
                    greatGrandchildrenList.forEach((greatChild) => {
                        greatChildrenBadges += `<span class="bg-amber-100/90 text-amber-950 border border-amber-300 px-2 py-0.5 rounded-md text-[11px] font-medium shadow-2xs">🌱 ${greatChild}</span>`;
                    });
                    greatChildrenBadges += `</div>`;
                }

                grandchildrenHTML += `
                    <div class="flex flex-col items-center">
                        <button onclick="openAddGreatGrandchildrenModal('${branchKey}', '${gName}')" class="bg-stone-50 hover:bg-amber-50 text-stone-800 border border-stone-200/80 hover:border-amber-400 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition flex items-center gap-1 group/btn cursor-pointer" title="לחץ להוספת ילדים">
                            <span>${gName}</span>
                            ${countBadge}
                            <span class="text-[10px] text-amber-700 opacity-60 group-hover/btn:opacity-100 transition font-bold">+</span>
                        </button>
                        ${greatChildrenBadges}
                    </div>
                `;
            });
        }

        branchCard.innerHTML = `
            <div class="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-700 to-amber-900"></div>
            <div>
                <div class="w-3 h-3 rounded-full bg-amber-700 border-2 border-white shadow-2xs mx-auto -mt-2 mb-3 z-10"></div>
                <div class="text-center pb-3.5 border-b border-stone-100">
                    <h3 class="font-bold text-base sm:text-lg text-stone-900 font-serif-custom group-hover:text-amber-800 transition-colors leading-snug">${branch.title}</h3>
                    <span class="inline-block mt-1.5 bg-amber-100/90 text-amber-900 border border-amber-300 font-bold px-3 py-0.5 text-xs rounded-full shadow-2xs">${branch.childrenCount || 4} ילדים</span>
                </div>
                
                <div class="pt-4">
                    <span class="text-[11px] font-bold text-amber-900/70 tracking-wider block text-center mb-2.5 font-serif-custom">הילדים (נכדים):</span>
                    <div class="flex flex-wrap gap-1.5 justify-center items-start">
                        ${grandchildrenHTML}
                    </div>
                </div>
            </div>
        `;

        container.appendChild(branchCard);
    });
}

// מודל הוספת נינים
const addGreatGrandchildrenModal = document.getElementById('addGreatGrandchildrenModal');

window.openAddGreatGrandchildrenModal = function(branchKey, grandchildName) {
    selectedBranchKey = branchKey;
    selectedGrandchildName = grandchildName;

    const modalTitle = document.getElementById('addModalTargetName');
    if (modalTitle) modalTitle.innerText = grandchildName;

    const nameInput = document.getElementById('greatChildNameInput');
    if (nameInput) nameInput.value = '';

    const statusDiv = document.getElementById('addGreatChildStatus');
    if (statusDiv) statusDiv.classList.add('hidden');

    if (addGreatGrandchildrenModal) {
        addGreatGrandchildrenModal.classList.remove('hidden');
        addGreatGrandchildrenModal.classList.add('flex');
        setTimeout(() => addGreatGrandchildrenModal.classList.remove('opacity-0'), 10);
    }
};

window.closeAddGreatGrandchildrenModal = function() {
    if (!addGreatGrandchildrenModal) return;
    addGreatGrandchildrenModal.classList.add('opacity-0');
    setTimeout(() => {
        addGreatGrandchildrenModal.classList.add('hidden');
        addGreatGrandchildrenModal.classList.remove('flex');
    }, 300);
};

// הגשת טופס הוספת נינים
const addGreatChildForm = document.getElementById('addGreatChildForm');
if (addGreatChildForm) {
    addGreatChildForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('greatChildNameInput');
        const statusDiv = document.getElementById('addGreatChildStatus');
        
        if (!input || !input.value.trim()) return;

        // פיצול שמות לפי פסיקים במידה והזין כמה ילדים
        const namesArray = input.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        if (namesArray.length === 0) return;

        if (statusDiv) {
            statusDiv.className = "text-xs font-semibold text-center py-2 rounded-xl bg-amber-100 text-amber-900 block animate-pulse";
            statusDiv.innerText = "שולח את הבקשה לאישור מנהל...";
            statusDiv.classList.remove('hidden');
        }

        const newRequest = {
            branchKey: selectedBranchKey,
            grandchildName: selectedGrandchildName,
            childrenNames: namesArray,
            timestamp: new Date().toLocaleDateString('he-IL') + ' ' + new Date().toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'}),
            status: 'pending'
        };

        pendingRequestsRef.push(newRequest).then(() => {
            if (statusDiv) {
                statusDiv.className = "text-xs font-semibold text-center py-2 rounded-xl bg-green-100 text-green-800 block";
                statusDiv.innerText = "✨ הבקשה נשלחה בהצלחה! היא תתעדכן באילן היוחסין לאחר אישור המנהל.";
            }
            input.value = '';
            setTimeout(() => {
                closeAddGreatGrandchildrenModal();
            }, 1800);
        }).catch((err) => {
            console.error(err);
            if (statusDiv) {
                statusDiv.className = "text-xs font-semibold text-center py-2 rounded-xl bg-red-100 text-red-800 block";
                statusDiv.innerText = "שגיאה בשליחת הבקשה. אנא נסה שוב.";
            }
        });
    });
}

// פאנל מנהל המערכת (Admin Approval Panel)
const adminTreeModal = document.getElementById('adminTreeModal');
const adminAuthSection = document.getElementById('adminAuthSection');
const adminPanelSection = document.getElementById('adminPanelSection');
const adminPassInput = document.getElementById('adminPassInput');
const adminAuthStatus = document.getElementById('adminAuthStatus');
let isAdminAuthenticated = false;

window.openAdminTreeModal = function() {
    if (!adminTreeModal) return;
    adminTreeModal.classList.remove('hidden');
    adminTreeModal.classList.add('flex');
    setTimeout(() => adminTreeModal.classList.remove('opacity-0'), 10);

    if (isAdminAuthenticated) {
        showAdminPanel();
    } else {
        showAdminAuth();
    }
};

window.closeAdminTreeModal = function() {
    if (!adminTreeModal) return;
    adminTreeModal.classList.add('opacity-0');
    setTimeout(() => {
        adminTreeModal.classList.add('hidden');
        adminTreeModal.classList.remove('flex');
    }, 300);
};

function showAdminAuth() {
    if (adminAuthSection) adminAuthSection.classList.remove('hidden');
    if (adminPanelSection) adminPanelSection.classList.add('hidden');
    if (adminPassInput) adminPassInput.value = '';
    if (adminAuthStatus) adminAuthStatus.classList.add('hidden');
}

function showAdminPanel() {
    if (adminAuthSection) adminAuthSection.classList.add('hidden');
    if (adminPanelSection) adminPanelSection.classList.remove('hidden');

    const pendingTreeCount = Object.keys(currentPendingRequests).length;
    const rawPhotos = window.allVisitorPhotosRaw || {};
    const pendingPhotosCount = Object.keys(rawPhotos).filter(k => rawPhotos[k] && rawPhotos[k].status === 'pending').length;

    // אם יש תמונות ממתינות לאישור ואין בקשות נינים, פתח ישירות את לשונית התמונות
    if (pendingPhotosCount > 0 && pendingTreeCount === 0) {
        switchAdminTab('photos');
    } else {
        switchAdminTab('tree');
    }
}

// מעבר בין לשוניות בפאנל המנהל (בקשות נינים vs אישור תמונות)
window.switchAdminTab = function(tab) {
    const treeTab = document.getElementById('adminTabTree');
    const photosTab = document.getElementById('adminTabPhotos');
    const treeContent = document.getElementById('adminTreeTabContent');
    const photosContent = document.getElementById('adminPhotosTabContent');

    if (tab === 'tree') {
        if (treeContent) treeContent.classList.remove('hidden');
        if (photosContent) photosContent.classList.add('hidden');
        if (treeTab) treeTab.className = "pb-2.5 px-3 font-bold text-xs border-b-2 border-amber-800 text-amber-900 transition flex items-center gap-1.5 cursor-pointer";
        if (photosTab) photosTab.className = "pb-2.5 px-3 font-medium text-xs border-b-2 border-transparent text-stone-500 hover:text-stone-800 transition flex items-center gap-1.5 cursor-pointer";
        renderPendingRequestsList();
    } else {
        if (treeContent) treeContent.classList.add('hidden');
        if (photosContent) photosContent.classList.remove('hidden');
        if (photosTab) photosTab.className = "pb-2.5 px-3 font-bold text-xs border-b-2 border-amber-800 text-amber-900 transition flex items-center gap-1.5 cursor-pointer";
        if (treeTab) treeTab.className = "pb-2.5 px-3 font-medium text-xs border-b-2 border-transparent text-stone-500 hover:text-stone-800 transition flex items-center gap-1.5 cursor-pointer";
        if (typeof window.renderPendingPhotosList === 'function') {
            window.renderPendingPhotosList();
        }
    }
};

// ספירת בקשות נינים ממתינות
function updatePendingBadgeCount() {
    const pendingKeys = Object.keys(currentPendingRequests);
    const count = pendingKeys.length;
    const badge = document.getElementById('adminPendingTreeCountBadge');
    if (badge) {
        badge.innerText = count;
        if (count > 0) {
            badge.className = "bg-amber-500 text-stone-900 text-xs font-bold px-2 py-0.5 rounded-full animate-bounce";
        } else {
            badge.className = "bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-bold";
        }
    }

    if (typeof window.updateTotalPendingBadge === 'function') {
        window.updateTotalPendingBadge();
    }
}

// ספירת סך כל הבקשות והתמונות הממתינות בכפתור המנהל הראשי
window.updateTotalPendingBadge = function() {
    const pendingTreeCount = Object.keys(currentPendingRequests).length;
    const rawPhotos = window.allVisitorPhotosRaw || {};
    const pendingPhotosCount = Object.keys(rawPhotos).filter(k => rawPhotos[k] && rawPhotos[k].status === 'pending').length;
    
    const totalPending = pendingTreeCount + pendingPhotosCount;
    const mainBadge = document.getElementById('mainAdminTotalPendingBadge');
    if (mainBadge) {
        mainBadge.innerText = totalPending;
        if (totalPending > 0) {
            mainBadge.className = "bg-amber-500 text-stone-950 text-xs font-bold px-2.5 py-0.5 rounded-full animate-bounce shadow-xs";
        } else {
            mainBadge.className = "bg-stone-700 text-stone-300 text-xs font-semibold px-2 py-0.5 rounded-full";
        }
    }
};

// אימות סיסמת מנהל
const adminAuthForm = document.getElementById('adminAuthForm');
if (adminAuthForm) {
    adminAuthForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = adminPassInput ? adminPassInput.value.trim() : '';
        if (pass === ADMIN_PASSWORD) {
            isAdminAuthenticated = true;
            showAdminPanel();
        } else {
            if (adminAuthStatus) {
                adminAuthStatus.innerText = "סיסמה שגויה. אנא נסה שוב.";
                adminAuthStatus.className = "text-xs font-bold text-red-600 text-center block mt-2";
                adminAuthStatus.classList.remove('hidden');
            }
        }
    });
}

// ספירת בקשות ממתינות
function updatePendingBadgeCount() {
    const pendingKeys = Object.keys(currentPendingRequests);
    const count = pendingKeys.length;
    const badge = document.getElementById('adminPendingCountBadge');
    if (badge) {
        badge.innerText = count;
        if (count > 0) {
            badge.className = "bg-amber-500 text-stone-900 text-xs font-bold px-2 py-0.5 rounded-full animate-bounce";
        } else {
            badge.className = "bg-stone-700 text-stone-300 text-xs font-semibold px-2 py-0.5 rounded-full";
        }
    }
}

// רנדור רשימת הבקשות הממתינות בפאנל המנהל
function renderPendingRequestsList() {
    const listContainer = document.getElementById('adminPendingRequestsList');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    const pendingKeys = Object.keys(currentPendingRequests);

    if (pendingKeys.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-10 text-stone-400">
                <span class="text-3xl block mb-2">✨</span>
                <p class="text-sm font-medium">אין כרגע בקשות ממתינות לאישור.</p>
            </div>
        `;
        return;
    }

    pendingKeys.forEach((reqId) => {
        const req = currentPendingRequests[reqId];
        const card = document.createElement('div');
        card.className = "bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3";
        
        const childrenPills = req.childrenNames.map(n => `<span class="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-300">🌱 ${n}</span>`).join(' ');

        card.innerHTML = `
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <span class="font-bold text-stone-900 text-sm">הוספת נינים עבור: <span class="text-amber-800 font-serif-custom">${req.grandchildName}</span></span>
                    <span class="text-[10px] text-stone-400">(${req.timestamp || ''})</span>
                </div>
                <div class="flex flex-wrap gap-1.5 mt-2">
                    ${childrenPills}
                </div>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <button onclick="approveTreeRequest('${reqId}')" class="bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-2xs flex items-center gap-1 cursor-pointer">
                    <span>✓</span>
                    <span>אישור</span>
                </button>
                <button onclick="rejectTreeRequest('${reqId}')" class="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-2xs flex items-center gap-1 cursor-pointer">
                    <span>✕</span>
                    <span>דחייה</span>
                </button>
            </div>
        `;

        listContainer.appendChild(card);
    });
}

// אישור בקשה ע"י מנהל המערכת
window.approveTreeRequest = function(reqId) {
    const req = currentPendingRequests[reqId];
    if (!req) return;

    const { branchKey, grandchildName, childrenNames } = req;

    // שליפת הענף הנוכחי
    treeDataRef.child(`${branchKey}/grandchildren/${grandchildName}`).once('value', (snapshot) => {
        let existingList = snapshot.val() || [];
        // מיזוג שמות חדשים ללא כפילויות
        childrenNames.forEach(name => {
            if (!existingList.includes(name)) {
                existingList.push(name);
            }
        });

        // עדכון העץ ב-Firebase
        treeDataRef.child(`${branchKey}/grandchildren/${grandchildName}`).set(existingList).then(() => {
            // מחיקת הבקשה מהממתינים
            pendingRequestsRef.child(reqId).remove();
        });
    });
};

// דחיית בקשה ע"י מנהל המערכת
window.rejectTreeRequest = function(reqId) {
    if (confirm("האם אתה בטוח שברצונך לדחות בקשה זו?")) {
        pendingRequestsRef.child(reqId).remove();
    }
};

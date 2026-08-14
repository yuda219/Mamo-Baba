// מודול גלריית זיכרונות, קרוסלת Swiper, חלון רשת מלאה, העלאת תמונות מרובות ואישור מנהל

// תמונות ארכיון קבועות
const staticPhotos = [
    'images/pic1.jpg', 'images/pic2.jpg', 'images/pic3.jpg', 'images/pic4.jpg',
    'images/pic5.jpg', 'images/pic6.jpg', 'images/pic7.jpg', 'images/pic8.jpg',
    'images/pic9.jpg', 'images/pic10.jpg', 'images/pic11.jpg', 'images/pic12.jpg',
    'images/pic13.jpg', 'images/pic14.jpg', 'images/pic15.jpg', 'images/pic16.jpg'
];

// אתחול קרוסלת Swiper
let gallerySwiper = new Swiper(".gallery-swiper", {
    slidesPerView: 1.3,
    spaceBetween: 16,
    autoplay: {
        delay: 3500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    breakpoints: {
        480: { slidesPerView: 2, spaceBetween: 16 },
        640: { slidesPerView: 3, spaceBetween: 20 },
        768: { slidesPerView: 4, spaceBetween: 20 }
    }
});

// פתיחה וסגירה של חלון הגלרייה המלאה (Full Grid Modal)
const fullGalleryModal = document.getElementById('fullGalleryModal');

window.openFullGalleryModal = function() {
    if (!fullGalleryModal) return;
    fullGalleryModal.classList.remove('hidden');
    fullGalleryModal.classList.add('flex');
    setTimeout(() => {
        fullGalleryModal.classList.remove('opacity-0');
    }, 10);
};

window.closeFullGalleryModal = function() {
    if (!fullGalleryModal) return;
    fullGalleryModal.classList.add('opacity-0');
    setTimeout(() => {
        fullGalleryModal.classList.add('hidden');
        fullGalleryModal.classList.remove('flex');
    }, 300);
};

// יצירת אלמנט Slide בקרוסלה
function createSlideElement(src, badgeText, isUploaded = false) {
    const slide = document.createElement('div');
    slide.className = isUploaded ? "swiper-slide dynamic-slide" : "swiper-slide static-slide";
    
    const badgeBg = isUploaded 
        ? "bg-amber-900/80 text-amber-100 border-amber-500/40" 
        : "bg-stone-900/70 text-stone-200 border-white/20";

    slide.innerHTML = `
        <div class="relative group h-52 md:h-60 rounded-2xl overflow-hidden shadow-md cursor-pointer border border-stone-200/80 bg-stone-100 transition-all duration-300 hover:shadow-xl" onclick="openModal('${src}')">
            <img src="${src}" class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" onerror="this.closest('.swiper-slide').remove(); if(typeof gallerySwiper !== 'undefined') gallerySwiper.update();">
            
            <!-- Overlay עם אייקון הגדלה -->
            <div class="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-white backdrop-blur-[2px]">
                <span class="text-2xl mb-1 transform group-hover:scale-110 transition-transform">🔍</span>
                <span class="text-xs font-medium tracking-wide">לחץ להגדלה</span>
            </div>

            <!-- תווית תאריך / סוג -->
            <div class="absolute bottom-2.5 right-2.5 text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-md border ${badgeBg} shadow-xs pointer-events-none">
                ${badgeText}
            </div>
        </div>
    `;
    return slide;
}

// יצירת כרטיסייה לרשת הגלריה המלאה (Full Grid Modal)
function createGridCardElement(src, badgeText, isUploaded = false) {
    const card = document.createElement('div');
    card.className = "relative group h-40 sm:h-48 rounded-2xl overflow-hidden shadow-xs cursor-pointer border border-stone-200 bg-stone-100 transition-all duration-300 hover:shadow-xl hover:border-amber-500/60";
    card.onclick = () => openModal(src);

    const badgeBg = isUploaded 
        ? "bg-amber-900/80 text-amber-100 border-amber-500/40" 
        : "bg-stone-900/70 text-stone-200 border-white/20";

    card.innerHTML = `
        <img src="${src}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.closest('.relative').remove();">
        <div class="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-white backdrop-blur-[2px]">
            <span class="text-xl mb-1 transform group-hover:scale-110 transition-transform">🔍</span>
            <span class="text-[11px] font-medium">להגדלה</span>
        </div>
        <div class="absolute bottom-2 right-2 text-[10px] font-medium px-2.5 py-0.5 rounded-full backdrop-blur-md border ${badgeBg} shadow-2xs pointer-events-none">
            ${badgeText}
        </div>
    `;
    return card;
}

// טעינת תמונות ראשונית ועדכון דינמי (רק תמונות מאושרות הוצגו בגלריה הציבורית)
function renderGallery(rawPhotosDict = {}) {
    const wrapper = document.getElementById('mainGalleryWrapper');
    const gridContainer = document.getElementById('fullGalleryGrid');

    if (wrapper) wrapper.innerHTML = '';
    if (gridContainer) gridContainer.innerHTML = '';

    let totalCount = 0;
    const approvedUploadedPhotos = [];

    // סינון תמונות מאושרות בלבד (אלו עם status === 'approved' או תמונות ישנות ללא שדה status)
    if (rawPhotosDict) {
        Object.keys(rawPhotosDict).forEach((key) => {
            const p = rawPhotosDict[key];
            if (p.status === 'approved' || !p.status) {
                approvedUploadedPhotos.push(p);
            }
        });
    }

    // תמונות מועלות מאושרות (חדשות ביותר ראשונות)
    const uploadedArray = [...approvedUploadedPhotos].reverse();
    uploadedArray.forEach(photo => {
        const dateText = photo.date ? `מבקרים | ${photo.date}` : "תמונת מבקרים";
        if (wrapper) wrapper.appendChild(createSlideElement(photo.url, dateText, true));
        if (gridContainer) gridContainer.appendChild(createGridCardElement(photo.url, dateText, true));
        totalCount++;
    });

    // תמונות ארכיון קבועות
    staticPhotos.forEach((src, idx) => {
        const dateText = `ארכיון #${idx + 1}`;
        if (wrapper) wrapper.appendChild(createSlideElement(src, dateText, false));
        if (gridContainer) gridContainer.appendChild(createGridCardElement(src, dateText, false));
        totalCount++;
    });

    const badge = document.getElementById('photoCountBadge');
    if (badge) badge.innerText = `${totalCount} תמונות בגלריה`;

    const fullModalBadge = document.getElementById('fullGalleryModalBadge');
    if (fullModalBadge) fullModalBadge.innerText = `${totalCount} תמונות מוצגות ברשת המלאה`;

    gallerySwiper.update();
}

// Modal Logic (פתיחת תמונות בהגדלה)
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');

window.openModal = function(src) {
    if (!imageModal || !modalImage) return;
    modalImage.src = src;
    imageModal.classList.remove('hidden');
    imageModal.classList.add('flex');
    setTimeout(() => {
        imageModal.classList.remove('opacity-0');
    }, 10);
};

window.closeModal = function() {
    if (!imageModal || !modalImage) return;
    imageModal.classList.add('opacity-0');
    setTimeout(() => {
        imageModal.classList.add('hidden');
        imageModal.classList.remove('flex');
        modalImage.src = '';
    }, 300);
};

// לוגיקת העלאת תמונות מרובות וסנכרון בזמן אמת מול Firebase
const photoInput = document.getElementById('photoInput');
const fileInputLabel = document.getElementById('fileInputLabel');
const uploadPreviewDiv = document.getElementById('uploadPreviewDiv');
const uploadPreviewGrid = document.getElementById('uploadPreviewGrid');
const uploadPreviewBadge = document.getElementById('uploadPreviewBadge');
const cancelUploadPreview = document.getElementById('cancelUploadPreview');

if (photoInput) {
    photoInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files && files.length > 0) {
            if (fileInputLabel) {
                fileInputLabel.innerText = files.length === 1 
                    ? files[0].name 
                    : `נבחרו ${files.length} תמונות להעלאה`;
            }
            if (uploadPreviewBadge) {
                uploadPreviewBadge.innerText = `${files.length} תמונות`;
            }

            if (uploadPreviewGrid) uploadPreviewGrid.innerHTML = '';

            files.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (uploadPreviewGrid) {
                        const thumb = document.createElement('div');
                        thumb.className = "relative group w-14 h-14 rounded-xl overflow-hidden border border-amber-300 shadow-2xs bg-stone-100 flex-shrink-0";
                        thumb.innerHTML = `
                            <img src="${event.target.result}" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-black/30 text-white text-[9px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition">#${index + 1}</div>
                        `;
                        uploadPreviewGrid.appendChild(thumb);
                    }
                };
                reader.readAsDataURL(file);
            });

            if (uploadPreviewDiv) uploadPreviewDiv.classList.remove('hidden');
        }
    });
}

if (cancelUploadPreview) {
    cancelUploadPreview.addEventListener('click', () => {
        if (photoInput) photoInput.value = '';
        if (fileInputLabel) fileInputLabel.innerText = 'בחר תמונות להעלאה';
        if (uploadPreviewGrid) uploadPreviewGrid.innerHTML = '';
        if (uploadPreviewDiv) uploadPreviewDiv.classList.add('hidden');
    });
}

const dynamicGalleryRef = db.ref('visitorGallery');
const uploadBtn = document.getElementById('uploadPhotoBtn');
const uploadStatus = document.getElementById('uploadStatus');

if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
        const files = photoInput && photoInput.files ? Array.from(photoInput.files) : [];
        if (files.length === 0) {
            alert("אנא בחר לפחות תמונה אחת להעלאה.");
            return;
        }

        if (uploadStatus) {
            uploadStatus.classList.remove('hidden');
            uploadStatus.className = "text-xs font-bold text-amber-800 bg-amber-100/90 p-3 rounded-xl border border-amber-300 mb-4 text-center block animate-pulse";
            uploadStatus.innerText = `מעלה ${files.length} תמונות לגלריה, אנא המתן... (0/${files.length})`;
        }

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (uploadStatus) {
                uploadStatus.innerText = `מעלה תמונה ${i + 1} מתוך ${files.length}... (${file.name})`;
            }

            try {
                const storageRef = storage.ref('visitor_photos/' + Date.now() + '_' + i + '_' + file.name);
                const snapshot = await storageRef.put(file);
                const downloadURL = await snapshot.ref.getDownloadURL();

                await dynamicGalleryRef.push({
                    url: downloadURL,
                    date: new Date().toLocaleDateString('he-IL'),
                    status: 'pending',
                    timestamp: Date.now()
                });

                successCount++;
            } catch (err) {
                console.error("Upload error for file " + file.name, err);
                failCount++;
            }
        }

        if (uploadStatus) {
            if (successCount > 0) {
                const photoWord = successCount === 1 ? "התמונה הועברה" : `${successCount} התמונות הועברו`;
                uploadStatus.innerText = `✨ ${photoWord} בהצלחה לאישור מנהל המערכת! הן יופיעו בגלריה לאחר אישורן בפאנל המנהל.`;
                uploadStatus.className = "text-xs font-bold text-green-800 bg-green-50 p-3 rounded-xl border border-green-300 mb-4 text-center block shadow-2xs leading-relaxed";
            } else {
                uploadStatus.innerText = "שגיאה בהעלאת התמונות. אנא נסה שוב.";
                uploadStatus.className = "text-xs font-bold text-red-700 bg-red-50 p-3 rounded-xl border border-red-200 mb-4 text-center block";
            }
        }

        if (photoInput) photoInput.value = '';
        if (fileInputLabel) fileInputLabel.innerText = 'בחר תמונות להעלאה';
        if (uploadPreviewGrid) uploadPreviewGrid.innerHTML = '';
        if (uploadPreviewDiv) uploadPreviewDiv.classList.add('hidden');

        setTimeout(() => {
            if (uploadStatus) uploadStatus.classList.add('hidden');
        }, 8000);
    });
}

// ניהול תמונות ממתינות בפאנל המנהל (Admin Photo Approval Workflow)
window.allVisitorPhotosRaw = {};

dynamicGalleryRef.on('value', (snapshot) => {
    window.allVisitorPhotosRaw = snapshot.val() || {};
    renderGallery(window.allVisitorPhotosRaw);
    window.updatePendingPhotosBadgeCount();
    window.renderPendingPhotosList();
});

// עדכון מונה תמונות ממתינות בפאנל המנהל
window.updatePendingPhotosBadgeCount = function() {
    const raw = window.allVisitorPhotosRaw || {};
    const pendingKeys = Object.keys(raw).filter(k => raw[k] && raw[k].status === 'pending');
    const badge = document.getElementById('adminPendingPhotosCountBadge');
    
    if (badge) {
        badge.innerText = pendingKeys.length;
        if (pendingKeys.length > 0) {
            badge.className = "bg-amber-500 text-stone-900 text-xs font-bold px-2 py-0.5 rounded-full animate-bounce";
        } else {
            badge.className = "bg-stone-200 text-stone-700 text-xs font-semibold px-2 py-0.5 rounded-full";
        }
    }

    // עדכון סך כל הבלוקים הממתינים בכפתור המנהל הראשי בתחתית אילן היוחסין
    if (typeof window.updateTotalPendingBadge === 'function') {
        window.updateTotalPendingBadge();
    }
};

// רנדור רשימת התמונות הממתינות לאישור בפאנל המנהל
window.renderPendingPhotosList = function() {
    const container = document.getElementById('adminPendingPhotosList');
    if (!container) return;

    container.innerHTML = '';
    const raw = window.allVisitorPhotosRaw || {};
    const pendingKeys = Object.keys(raw).filter(k => raw[k] && raw[k].status === 'pending');

    if (pendingKeys.length === 0) {
        container.innerHTML = `
            <div class="text-center py-10 text-stone-400">
                <span class="text-3xl block mb-2">📸</span>
                <p class="text-sm font-medium">אין כרגע תמונות ממתינות לאישור.</p>
            </div>
        `;
        return;
    }

    pendingKeys.forEach((photoId) => {
        const photo = raw[photoId];
        const card = document.createElement('div');
        card.className = "bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4";
        
        card.innerHTML = `
            <div class="flex items-center gap-3.5 w-full sm:w-auto">
                <img src="${photo.url}" class="w-20 h-20 object-cover rounded-xl border border-stone-200 shadow-2xs cursor-pointer hover:scale-105 transition" onclick="openModal('${photo.url}')">
                <div>
                    <span class="text-xs font-bold text-stone-900 block">תמונת מבקר ממתינה לאישור</span>
                    <span class="text-[11px] text-stone-500 block mt-0.5">תאריך העלאה: ${photo.date || ''}</span>
                    <button onclick="openModal('${photo.url}')" class="text-[11px] text-amber-800 hover:underline font-bold mt-1 inline-block">🔍 לחץ לצפייה בגודל מלא</button>
                </div>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                <button onclick="approvePhoto('${photoId}')" class="bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-2xs flex items-center gap-1 cursor-pointer">
                    <span>✓</span>
                    <span>אישור לגלריה</span>
                </button>
                <button onclick="rejectPhoto('${photoId}')" class="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition shadow-2xs flex items-center gap-1 cursor-pointer">
                    <span>✕</span>
                    <span>דחייה</span>
                </button>
            </div>
        `;

        container.appendChild(card);
    });
};

// אישור תמונה ע"י המנהל
window.approvePhoto = function(photoId) {
    dynamicGalleryRef.child(`${photoId}/status`).set('approved').then(() => {
        console.log("Photo approved successfully!");
    });
};

// דחיית תמונה ע"י המנהל (מחיקה)
window.rejectPhoto = function(photoId) {
    if (confirm("האם אתה בטוח שברצונך לדחות ולמחוק תמונה זו?")) {
        dynamicGalleryRef.child(photoId).remove();
    }
};

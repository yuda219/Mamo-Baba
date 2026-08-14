// מודול גלריית זיכרונות, קרוסלת Swiper והעלאת תמונות

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

// טעינת תמונות ראשונית ועדכון דינמי מ-Firebase
function renderGallery(visitorPhotos = []) {
    const wrapper = document.getElementById('mainGalleryWrapper');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    let totalCount = 0;

    // תמונות מועלות מהמבקרים (חדשות ביותר ראשונות)
    const uploadedArray = [...visitorPhotos].reverse();
    uploadedArray.forEach(photo => {
        const dateText = photo.date ? `מבקרים | ${photo.date}` : "תמונת מבקרים";
        wrapper.appendChild(createSlideElement(photo.url, dateText, true));
        totalCount++;
    });

    // תמונות ארכיון קבועות
    staticPhotos.forEach((src, idx) => {
        wrapper.appendChild(createSlideElement(src, `ארכיון #${idx + 1}`, false));
        totalCount++;
    });

    const badge = document.getElementById('photoCountBadge');
    if (badge) badge.innerText = `${totalCount} תמונות בגלריה`;

    gallerySwiper.update();
}

// אתחול גלריית הבסיס
renderGallery([]);

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

// לוגיקת העלאת תמונות וסנכרון בזמן אמת מול Firebase
const photoInput = document.getElementById('photoInput');
const fileInputLabel = document.getElementById('fileInputLabel');
const uploadPreviewDiv = document.getElementById('uploadPreviewDiv');
const uploadPreviewImg = document.getElementById('uploadPreviewImg');
const uploadPreviewName = document.getElementById('uploadPreviewName');
const cancelUploadPreview = document.getElementById('cancelUploadPreview');

if (photoInput) {
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (fileInputLabel) fileInputLabel.innerText = file.name;
            const reader = new FileReader();
            reader.onload = (event) => {
                if (uploadPreviewImg) uploadPreviewImg.src = event.target.result;
                if (uploadPreviewName) uploadPreviewName.innerText = file.name;
                if (uploadPreviewDiv) uploadPreviewDiv.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });
}

if (cancelUploadPreview) {
    cancelUploadPreview.addEventListener('click', () => {
        if (photoInput) photoInput.value = '';
        if (fileInputLabel) fileInputLabel.innerText = 'בחר תמונה להעלאה';
        if (uploadPreviewDiv) uploadPreviewDiv.classList.add('hidden');
    });
}

const dynamicGalleryRef = db.ref('visitorGallery');
const uploadBtn = document.getElementById('uploadPhotoBtn');
const uploadStatus = document.getElementById('uploadStatus');

if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
        const file = photoInput ? photoInput.files[0] : null;
        if (!file) {
            alert("אנא בחר תמונה להעלאה קודם.");
            return;
        }

        if (uploadStatus) {
            uploadStatus.classList.remove('hidden');
            uploadStatus.innerText = "מעלה תמונה לקרוסלה, אנא המתן...";
            uploadStatus.className = "text-sm font-medium text-amber-700 mb-4 text-center block animate-pulse";
        }

        const storageRef = storage.ref('visitor_photos/' + Date.now() + '_' + file.name);
        
        storageRef.put(file).then((snapshot) => {
            return snapshot.ref.getDownloadURL();
        }).then((downloadURL) => {
            dynamicGalleryRef.push({ url: downloadURL, date: new Date().toLocaleDateString('he-IL') });
            
            if (uploadStatus) {
                uploadStatus.innerText = "התמונה הועלתה בהצלחה לגלריה!";
                uploadStatus.className = "text-sm font-medium text-green-600 mb-4 text-center block";
            }
            if (photoInput) photoInput.value = ''; 
            if (fileInputLabel) fileInputLabel.innerText = 'בחר תמונה להעלאה';
            if (uploadPreviewDiv) uploadPreviewDiv.classList.add('hidden');
            
            setTimeout(() => { 
                if (uploadStatus) uploadStatus.classList.add('hidden'); 
            }, 4000);
        }).catch((error) => {
            console.error(error);
            if (uploadStatus) {
                uploadStatus.innerText = "שגיאה בהעלאה. אנא נסה שוב.";
                uploadStatus.className = "text-sm font-medium text-red-600 mb-4 text-center block";
            }
        });
    });
}

// האזנה בזמן אמת לעדכוני תמונות מ-Firebase
dynamicGalleryRef.on('value', (snapshot) => {
    const data = snapshot.val();
    const photos = data ? Object.values(data) : [];
    renderGallery(photos);
});

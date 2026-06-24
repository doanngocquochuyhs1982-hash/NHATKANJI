// --- DỮ LIỆU ---
const data = {
    hiragana: [
        { char: 'あ', romaji: 'a' }, { char: 'い', romaji: 'i' }, { char: 'う', romaji: 'u' }, { char: 'え', romaji: 'e' }, { char: 'お', romaji: 'o' },
        { char: 'か', romaji: 'ka' }, { char: 'き', romaji: 'ki' }, { char: 'く', romaji: 'ku' }, { char: 'け', romaji: 'ke' }, { char: 'こ', romaji: 'ko' }
    ],
    katakana: [
        { char: 'ア', romaji: 'a' }, { char: 'イ', romaji: 'i' }, { char: 'ウ', romaji: 'u' }, { char: 'エ', romaji: 'e' }, { char: 'オ', romaji: 'o' },
        { char: 'カ', romaji: 'ka' }, { char: 'キ', romaji: 'ki' }, { char: 'ク', romaji: 'ku' }, { char: 'ケ', romaji: 'ke' }, { char: 'コ', romaji: 'ko' }
    ],
    kanji: [
        { char: '日', romaji: 'nichi / hi', meaning: 'Mặt trời, Ngày' },
        { char: '月', romaji: 'getsu / tsuki', meaning: 'Mặt trăng, Tháng' },
        { char: '火', romaji: 'ka / hi', meaning: 'Lửa' },
        { char: '水', romaji: 'sui / mizu', meaning: 'Nước' },
        { char: '木', romaji: 'moku / ki', meaning: 'Cây, Gỗ' }
    ]
};

// Tổng hợp từ vựng cho Flashcard và Quiz
const vocabList = [...data.kanji, { char: '猫', romaji: 'neko', meaning: 'Con mèo' }, { char: '犬', romaji: 'inu', meaning: 'Con chó' }];

// --- QUẢN LÝ TRẠNG THÁI (LOCAL STORAGE) ---
let userXP = parseInt(localStorage.getItem('nihongo_xp')) || 0;

function addXP(amount) {
    userXP += amount;
    localStorage.setItem('nihongo_xp', userXP);
    updateDashboard();
}

function resetProgress() {
    if(confirm('Bạn có chắc chắn muốn xóa toàn bộ tiến độ (XP) không?')) {
        userXP = 0;
        localStorage.setItem('nihongo_xp', 0);
        updateDashboard();
        alert('Đã xóa dữ liệu thành công!');
    }
}

// --- ĐIỀU HƯỚNG (ROUTING) ---
function navigate(viewId) {
    // Ẩn tất cả view
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    // Hiện view mục tiêu
    document.getElementById(viewId).classList.add('active');
    
    // Cập nhật trạng thái thanh điều hướng
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navBtn = Array.from(document.querySelectorAll('.nav-item')).find(btn => btn.getAttribute('onclick').includes(viewId));
    if(navBtn) navBtn.classList.add('active');

    // Kích hoạt logic riêng của từng trang
    if(viewId === 'home') updateDashboard();
    if(viewId === 'kana') renderKana('hiragana');
    if(viewId === 'kanji') renderKanji();
    if(viewId === 'flashcard' && !flashcardInitialized) initFlashcard();
    if(viewId === 'quiz') initQuiz();
    if(viewId === 'dashboard') updateDashboard();
}

// --- TÍNH NĂNG: KANA & KANJI ---
function renderKana(type) {
    const grid = document.getElementById('kana-grid');
    grid.innerHTML = data[type].map(item => `
        <div class="kana-card">
            <div class="kana-char">${item.char}</div>
            <div class="kana-romaji">${item.romaji}</div>
        </div>
    `).join('');
}

function switchKana(type) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderKana(type);
}

function renderKanji() {
    const list = document.getElementById('kanji-grid');
    list.innerHTML = data.kanji.map(item => `
        <div class="kanji-item">
            <div class="kanji-char">${item.char}</div>
            <div class="kanji-info">
                <h4>${item.meaning}</h4>
                <p>${item.romaji}</p>
            </div>
        </div>
    `).join('');
}

// --- TÍNH NĂNG: FLASHCARD ---
let currentCardIndex = 0;
let flashcardInitialized = false;

function initFlashcard() {
    flashcardInitialized = true;
    updateFlashcardUI();
}

function updateFlashcardUI() {
    const card = vocabList[currentCardIndex];
    document.getElementById('fc-front').textContent = card.char;
    document.getElementById('fc-back').innerHTML = `
        <div class="romaji">${card.romaji}</div>
        <div class="meaning">${card.meaning}</div>
    `;
    document.getElementById('current-flashcard').classList.remove('flipped');
}

function flipCard() {
    document.getElementById('current-flashcard').classList.toggle('flipped');
}

function nextCard() {
    currentCardIndex = (currentCardIndex + 1) % vocabList.length;
    updateFlashcardUI();
}

function prevCard() {
    currentCardIndex = (currentCardIndex - 1 + vocabList.length) % vocabList.length;
    updateFlashcardUI();
}

// --- TÍNH NĂNG: QUIZ ---
let currentQuizCorrect = null;

function initQuiz() {
    document.getElementById('quiz-container').classList.remove('hidden');
    document.getElementById('quiz-result').classList.add('hidden');
    
    // Chọn ngẫu nhiên 1 câu đúng
    const correctIndex = Math.floor(Math.random() * vocabList.length);
    currentQuizCorrect = vocabList[correctIndex];
    
    // Tạo danh sách câu sai
    let options = [currentQuizCorrect];
    while(options.length < 4) {
        const randomItem = vocabList[Math.floor(Math.random() * vocabList.length)];
        if(!options.includes(randomItem)) options.push(randomItem);
    }
    
    // Trộn đáp án
    options.sort(() => Math.random() - 0.5);
    
    // Hiển thị UI
    document.getElementById('quiz-question').textContent = `Nghĩa của từ "${currentQuizCorrect.char}" là gì?`;
    
    const optionsHtml = options.map((opt, index) => `
        <button class="option-btn" onclick="checkAnswer('${opt.meaning}', this)">${opt.meaning}</button>
    `).join('');
    
    document.getElementById('quiz-options').innerHTML = optionsHtml;
}

function checkAnswer(selectedMeaning, btnElement) {
    // Vô hiệu hóa các nút sau khi chọn
    document.querySelectorAll('.option-btn').forEach(btn => btn.style.pointerEvents = 'none');
    
    const isCorrect = selectedMeaning === currentQuizCorrect.meaning;
    const feedback = document.getElementById('quiz-feedback');
    
    if(isCorrect) {
        btnElement.classList.add('correct');
        feedback.textContent = '🎉 Chính xác! (+10 XP)';
        addXP(10);
    } else {
        btnElement.classList.add('wrong');
        feedback.textContent = `❌ Sai rồi! Đáp án đúng là: ${currentQuizCorrect.meaning}`;
        // Đánh dấu nút đúng
        document.querySelectorAll('.option-btn').forEach(btn => {
            if(btn.textContent === currentQuizCorrect.meaning) btn.classList.add('correct');
        });
    }
    
    setTimeout(() => {
        document.getElementById('quiz-container').classList.add('hidden');
        document.getElementById('quiz-result').classList.remove('hidden');
    }, 1000);
}

// --- TÍNH NĂNG: DASHBOARD ---
function updateDashboard() {
    // Cập nhật Home
    document.getElementById('home-xp').textContent = userXP;
    
    // Cập nhật Dashboard Profile
    const dashXpEl = document.getElementById('dash-xp');
    const xpProgressEl = document.getElementById('xp-progress');
    
    if (dashXpEl && xpProgressEl) {
        dashXpEl.textContent = `${userXP} XP`;
        // Giả sử mục tiêu là 1000 XP (Tối đa 100%)
        let percentage = (userXP / 1000) * 100;
        if(percentage > 100) percentage = 100;
        xpProgressEl.setAttribute('stroke-dasharray', `${percentage}, 100`);
    }
}

// Khởi tạo ban đầu
window.onload = () => {
    updateDashboard();
};

// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Ambil semua elemen penting dari HTML
    const novelPromptEl = document.getElementById('novel-prompt');
    const lyricPromptEl = document.getElementById('lyric-prompt');
    const generateNovelBtn = document.getElementById('generate-novel-btn');
    const generateLyricBtn = document.getElementById('generate-lyric-btn');
    const resultContainer = document.getElementById('result-container');
    const resultOutputEl = document.getElementById('result-output');
    const loadingSpinner = document.getElementById('loading-spinner');
    const copyBtn = document.getElementById('copy-btn');

    let novelHistory = ""; // Menyimpan semua bab novel yang sudah dibuat
    let isLoading = false;

    // Fungsi utama untuk memanggil API
    async function handleGenerate(type) {
        if (isLoading) return;

        isLoading = true;
        updateUIForLoading(true);

        const prompt = type === 'novel' ? novelPromptEl.value : lyricPromptEl.value;
        const context = type === 'novel' ? novelHistory : null;

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, prompt, context })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Terjadi kesalahan di server.');
            }

            const data = await response.json();

            if (type === 'novel') {
                const newChapter = data.result;
                const chapterNumber = (novelHistory.match(/--- BAB/g) || []).length + 2;
                novelHistory += `\n\n--- BAB ${chapterNumber-1} ---\n\n${newChapter}`;
                resultOutputEl.textContent = novelHistory.trim();
                generateNovelBtn.textContent = `Lanjutkan ke Bab ${chapterNumber}`;
            } else {
                resultOutputEl.textContent = data.result;
            }
        } catch (error) {
            resultOutputEl.textContent = `Oops! Terjadi kesalahan: ${error.message}`;
        } finally {
            isLoading = false;
            updateUIForLoading(false);
        }
    }

    function updateUIForLoading(loading) {
        if (loading) {
            resultContainer.style.display = 'block';
            resultOutputEl.classList.add('hidden');
            loadingSpinner.classList.remove('hidden');
            generateNovelBtn.disabled = true;
            generateLyricBtn.disabled = true;
        } else {
            loadingSpinner.classList.add('hidden');
            resultOutputEl.classList.remove('hidden');
            generateNovelBtn.disabled = false;
            generateLyricBtn.disabled = false;
        }
    }
    
    // Fungsi untuk menyalin teks
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(resultOutputEl.textContent)
            .then(() => alert('Teks berhasil disalin! 😝'))
            .catch(err => alert('Gagal menyalin teks.'));
    });

    // Tambahkan event listener ke tombol
    generateNovelBtn.addEventListener('click', () => handleGenerate('novel'));
    generateLyricBtn.addEventListener('click', () => handleGenerate('lyrics'));
});

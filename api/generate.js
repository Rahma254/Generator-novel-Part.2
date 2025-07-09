// api/generate.js

// Handler utama yang akan dieksekusi Vercel
export default async function handler(request, response) {
    // Hanya izinkan metode POST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Ambil API Key dari Environment Variable di Vercel
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error("API Key OpenRouter belum diatur di Environment Variable.");
        }

        const { type, prompt, context } = request.body;

        if (!type || !prompt) {
            return response.status(400).json({ error: 'Tipe dan prompt dibutuhkan' });
        }

        let messages = [];
        let system_prompt = "";
        // Model yang cepat dan bagus untuk tugas kreatif. Kamu bisa ganti!
        const modelToUse = "anthropic/claude-3-haiku-20240307"; 

        if (type === 'novel') {
            system_prompt = `Anda adalah seorang novelis berbakat bernama Nabila. Tugas Anda adalah menulis satu bab penuh (sekitar 1500-2000 kata) yang menarik dan deskriptif. Fokus hanya pada penulisan bab, tanpa komentar tambahan.`;
            if (context) {
                messages.push({ role: 'user', content: `Ini adalah bab-bab sebelumnya dari novel:\n\n${context}` });
                messages.push({ role: 'assistant', content: "Baik, saya sudah membacanya. Saya siap melanjutkan ceritanya." });
                messages.push({ role: 'user', content: `Sekarang, tolong tuliskan bab selanjutnya berdasarkan sinopsis awal: "${prompt}".` });
            } else {
                messages.push({ role: 'user', content: `Tuliskan Bab 1 dari sebuah novel baru berdasarkan sinopsis ini: "${prompt}".` });
            }
        } else if (type === 'lyrics') {
            system_prompt = `Anda adalah seorang penulis lirik lagu profesional. Ciptakan lirik yang puitis dan emosional (verse, chorus, bridge) berdasarkan permintaan pengguna. Fokus hanya pada lirik, tanpa komentar.`;
            messages.push({ role: 'user', content: `Tuliskan lirik lagu dengan detail ini: ${prompt}` });
        }

        const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "model": modelToUse,
                "messages": [
                    { "role": "system", "content": system_prompt },
                    ...messages
                ]
            })
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            throw new Error(`OpenRouter API error: ${apiResponse.status} ${errorText}`);
        }

        const data = await apiResponse.json();
        const resultText = data.choices[0].message.content;

        // Kirim hasil kembali ke browser
        return response.status(200).json({ result: resultText });

    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: error.message || 'Terjadi kesalahan internal pada server' });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Socket.IO Connection ---
    const socket = io();
    let socketId = null;

    socket.on('connect', () => {
        console.log('Connected to server via WebSockets');
        socketId = socket.id;
    });

    socket.on('progress_update', (data) => {
        // Update progress bars dynamically based on active conversion
        const activeBars = document.querySelectorAll('.progress-fill');
        activeBars.forEach(bar => {
            bar.style.width = `${data.percent}%`;
        });

        const activeStatus = document.querySelectorAll('.status-text');
        activeStatus.forEach(status => {
            status.textContent = data.status;
        });
    });

    // --- Theme System ---
    window.changeTheme = (theme) => {
        document.body.className = ''; // Reset
        if (theme !== 'neon') {
            document.body.classList.add(`theme-${theme}`);
        }
        localStorage.setItem('preferred_theme', theme);
    };

    const savedTheme = localStorage.getItem('preferred_theme') || 'neon';
    document.getElementById('theme-selector').value = savedTheme;
    changeTheme(savedTheme);

    // --- Localization System ---
    const translations = {
        en: {
            nav_dashboard: "Dashboard",
            nav_audio: "Audio",
            nav_video: "Video",
            nav_image: "Image",
            nav_ocr: "OCR (Text)",
            nav_url: "URL / Web",
            nav_docs: "Documents",
            nav_history: "History",
            nav_faq: "FAQ / Help",
            settings: "Settings",
            system_online: "System Online",
            hero_title: "Limitless Conversion Power",
            hero_subtitle: "Convert anything to anything. Fast, secure, and local.",
            card_audio_title: "Audio Converter",
            card_audio_desc: "MP3, WAV, FLAC, AAC",
            card_video_title: "Video Converter",
            card_video_desc: "MP4, MKV, AVI, WEBM",
            card_image_title: "Image Converter",
            card_image_desc: "JPG, PNG, WEBM, ICO",
            card_ocr_title: "OCR / Text",
            card_ocr_desc: "Image to Text",
            card_url_title: "URL Downloader",
            card_url_desc: "YouTube, Spotify -> MP3/MP4",
            faq_title: "Frequently Asked Questions",
            drag_drop: "Drag & Drop Files Here",
            select_files: "Select Files",
            output_format: "Output Format:",
            convert_now: "Convert Now",
            ocr_note: "Extracts text from images to .txt file.",
            mode: "Mode:",
            download_convert: "Download & Convert",
            action: "Action:",
            process: "Process",
            settings_title: "System Settings",
            permanent_mode: "Permanent Mode",
            permanent_desc: "Run silently in background on startup.",
            btn_activate: "Activate",
            create_exe: "Create Application (.exe)",
            exe_desc: "Compile this entire system into a standalone executable.",
            btn_create: "Create",
            bot_protection: "Bot Protection Bypass",
            bot_desc: "Advanced user-agent randomization is active by default.",
            active: "ACTIVE",
            advanced_options: "Advanced Options",
            clear_history: "Clear History",
            lbl_bitrate: "Bitrate:",
            lbl_resolution: "Resolution:",
            lbl_fps: "FPS:",
            lbl_mute: "Mute Audio:",
            lbl_width: "Resize Width:",
            lbl_height: "Resize Height:",
            lbl_quality: "Quality (JPG/WEBP):",
            lbl_grayscale: "Grayscale:",
            theme_title: "Theme",
            theme_desc: "Select your preferred visual style.",
            faq_q1: "How do I convert a file?",
            faq_a1: "Select the category from the sidebar, drag and drop your file, choose the format, and click Convert.",
            faq_q2: "Is it secure?",
            faq_a2: "Yes! Everything runs locally on your machine. No files are uploaded to the internet.",
            faq_q3: "What if conversion fails?",
            faq_a3: "Check if the file is corrupted. For media files, ensure FFmpeg is installed correctly.",
            faq_q4: "How to use OCR?",
            faq_a4: "Upload an image with text to the OCR tab. Ensure Tesseract-OCR is installed on your system.",
            faq_q5: "Can I download YouTube videos?",
            faq_a5: "Yes, use the URL Downloader tab. Paste the link and choose Audio or Video mode.",
            faq_q6: "What is Permanent Mode?",
            faq_a6: "It creates a script to run the converter silently in the background when you start your computer.",
            faq_q7: "How to create an EXE?",
            faq_a7: "Go to Settings and click 'Create'. It compiles the app into a standalone executable file.",
            faq_q8: "Supported formats?",
            faq_a8: "We support MP3, MP4, PNG, JPG, PDF, DOCX, and many more advanced formats like FLAC, MKV, WEBP.",
            faq_q9: "Is it free?",
            faq_a9: "Yes, this is a free and open-source tool running on your local machine.",
            faq_q10: "System Requirements?",
            faq_a10: "Windows 10/11, Python 3.x, FFmpeg, and Tesseract (for OCR)."
        },
        tr: {
            nav_dashboard: "Kontrol Paneli",
            nav_audio: "Ses",
            nav_video: "Video",
            nav_image: "Görsel",
            nav_ocr: "OCR (Metin)",
            nav_url: "URL / Web",
            nav_docs: "Belgeler",
            nav_history: "Geçmiş",
            nav_faq: "SSS / Yardım",
            settings: "Ayarlar",
            system_online: "Sistem Çevrimiçi",
            hero_title: "Sınırsız Dönüştürme Gücü",
            hero_subtitle: "Her şeyi her şeye dönüştürün. Hızlı, güvenli ve yerel.",
            card_audio_title: "Ses Dönüştürücü",
            card_audio_desc: "MP3, WAV, FLAC, AAC",
            card_video_title: "Video Dönüştürücü",
            card_video_desc: "MP4, MKV, AVI, WEBM",
            card_image_title: "Görsel Dönüştürücü",
            card_image_desc: "JPG, PNG, WEBM, ICO",
            card_ocr_title: "OCR / Metin",
            card_ocr_desc: "Görselden Metne",
            card_url_title: "URL İndirici",
            card_url_desc: "YouTube, Spotify -> MP3/MP4",
            faq_title: "Sıkça Sorulan Sorular",
            drag_drop: "Dosyaları Buraya Sürükleyin",
            select_files: "Dosya Seç",
            output_format: "Çıktı Formatı:",
            convert_now: "Dönüştür",
            ocr_note: "Görsellerden metni .txt dosyasına çıkarır.",
            mode: "Mod:",
            download_convert: "İndir ve Dönüştür",
            action: "İşlem:",
            process: "İşle",
            settings_title: "Sistem Ayarları",
            permanent_mode: "Kalıcı Mod",
            permanent_desc: "Başlangıçta arka planda sessizce çalıştır.",
            btn_activate: "Aktifleştir",
            create_exe: "Uygulama Oluştur (.exe)",
            exe_desc: "Tüm sistemi tek bir çalıştırılabilir dosyaya derle.",
            btn_create: "Oluştur",
            bot_protection: "Bot Koruması Bypass",
            bot_desc: "Gelişmiş user-agent rastgeleleştirme varsayılan olarak aktiftir.",
            active: "AKTİF",
            advanced_options: "Gelişmiş Seçenekler",
            clear_history: "Geçmişi Temizle",
            lbl_bitrate: "Bit Hızı:",
            lbl_resolution: "Çözünürlük:",
            lbl_fps: "FPS:",
            lbl_mute: "Sesi Kapat:",
            lbl_width: "Genişlik:",
            lbl_height: "Yükseklik:",
            lbl_quality: "Kalite (JPG/WEBP):",
            lbl_grayscale: "Siyah Beyaz:",
            theme_title: "Tema",
            theme_desc: "Tercih ettiğiniz görsel stili seçin.",
            faq_q1: "Dosya nasıl dönüştürülür?",
            faq_a1: "Kenar çubuğundan kategoriyi seçin, dosyanızı sürükleyip bırakın, formatı seçin ve Dönüştür'e tıklayın.",
            faq_q2: "Güvenli mi?",
            faq_a2: "Evet! Her şey yerel makinenizde çalışır. Hiçbir dosya internete yüklenmez.",
            faq_q3: "Dönüştürme başarısız olursa?",
            faq_a3: "Dosyanın bozuk olup olmadığını kontrol edin. Medya dosyaları için FFmpeg'in kurulu olduğundan emin olun.",
            faq_q4: "OCR nasıl kullanılır?",
            faq_a4: "Metin içeren bir görseli OCR sekmesine yükleyin. Sisteminizde Tesseract-OCR'ın kurulu olduğundan emin olun.",
            faq_q5: "YouTube videoları indirebilir miyim?",
            faq_a5: "Evet, URL İndirici sekmesini kullanın. Linki yapıştırın ve Ses veya Video modunu seçin.",
            faq_q6: "Kalıcı Mod nedir?",
            faq_a6: "Bilgisayarınızı başlattığınızda dönüştürücüyü arka planda sessizce çalıştırmak için bir komut dosyası oluşturur.",
            faq_q7: "EXE nasıl oluşturulur?",
            faq_a7: "Ayarlara gidin ve 'Oluştur'a tıklayın. Uygulamayı tek bir çalıştırılabilir dosyaya derler.",
            faq_q8: "Desteklenen formatlar?",
            faq_a8: "MP3, MP4, PNG, JPG, PDF, DOCX ve FLAC, MKV, WEBP gibi birçok gelişmiş formatı destekliyoruz.",
            faq_q9: "Ücretsiz mi?",
            faq_a9: "Evet, bu yerel makinenizde çalışan ücretsiz ve açık kaynaklı bir araçtır.",
            faq_q10: "Sistem Gereksinimleri?",
            faq_a10: "Windows 10/11, Python 3.x, FFmpeg ve Tesseract (OCR için)."
        },
        de: {
            nav_dashboard: "Instrumententafel",
            nav_audio: "Audio",
            nav_video: "Video",
            nav_image: "Bild",
            nav_ocr: "OCR (Text)",
            nav_url: "URL / Web",
            nav_docs: "Dokumente",
            nav_history: "Verlauf",
            nav_faq: "FAQ / Hilfe",
            settings: "Einstellungen",
            system_online: "System Online",
            hero_title: "Grenzenlose Konvertierung",
            hero_subtitle: "Konvertieren Sie alles in alles. Schnell, sicher und lokal.",
            card_audio_title: "Audio Konverter",
            card_audio_desc: "MP3, WAV, FLAC, AAC",
            card_video_title: "Video Konverter",
            card_video_desc: "MP4, MKV, AVI, WEBM",
            card_image_title: "Bild Konverter",
            card_image_desc: "JPG, PNG, WEBM, ICO",
            card_ocr_title: "OCR / Text",
            card_ocr_desc: "Bild zu Text",
            card_url_title: "URL Downloader",
            card_url_desc: "YouTube, Spotify -> MP3/MP4",
            faq_title: "Häufig gestellte Fragen",
            drag_drop: "Dateien hierher ziehen",
            select_files: "Dateien auswählen",
            output_format: "Ausgabeformat:",
            convert_now: "Konvertieren",
            ocr_note: "Extrahiert Text aus Bildern in eine .txt-Datei.",
            mode: "Modus:",
            download_convert: "Herunterladen & Konvertieren",
            action: "Aktion:",
            process: "Verarbeiten",
            settings_title: "Systemeinstellungen",
            permanent_mode: "Dauermodus",
            permanent_desc: "Beim Start still im Hintergrund ausführen.",
            btn_activate: "Aktivieren",
            create_exe: "Anwendung erstellen (.exe)",
            exe_desc: "Kompilieren Sie das gesamte System in eine ausführbare Datei.",
            btn_create: "Erstellen",
            bot_protection: "Bot-Schutz Umgehung",
            bot_desc: "Erweiterte User-Agent-Randomisierung ist standardmäßig aktiv.",
            active: "AKTIV",
            advanced_options: "Erweiterte Optionen",
            clear_history: "Verlauf löschen",
            lbl_bitrate: "Bitrate:",
            lbl_resolution: "Auflösung:",
            lbl_fps: "FPS:",
            lbl_mute: "Stummschalten:",
            lbl_width: "Breite:",
            lbl_height: "Höhe:",
            lbl_quality: "Qualität (JPG/WEBP):",
            lbl_grayscale: "Graustufen:",
            theme_title: "Thema",
            theme_desc: "Wählen Sie Ihren bevorzugten visuellen Stil.",
            faq_q1: "Wie konvertiere ich eine Datei?",
            faq_a1: "Wählen Sie die Kategorie, ziehen Sie Ihre Datei hinein, wählen Sie das Format und klicken Sie auf Konvertieren.",
            faq_q2: "Ist es sicher?",
            faq_a2: "Ja! Alles läuft lokal auf Ihrem Rechner. Keine Dateien werden ins Internet hochgeladen.",
            faq_q3: "Was tun bei Fehlern?",
            faq_a3: "Prüfen Sie, ob die Datei beschädigt ist. Stellen Sie sicher, dass FFmpeg installiert ist.",
            faq_q4: "Wie nutze ich OCR?",
            faq_a4: "Laden Sie ein Bild mit Text hoch. Stellen Sie sicher, dass Tesseract-OCR installiert ist.",
            faq_q5: "Kann ich YouTube-Videos laden?",
            faq_a5: "Ja, nutzen Sie den URL-Downloader. Link einfügen und Audio oder Video wählen.",
            faq_q6: "Was ist der Dauermodus?",
            faq_a6: "Er erstellt ein Skript, um den Konverter beim Start still im Hintergrund auszuführen.",
            faq_q7: "Wie erstelle ich eine EXE?",
            faq_a7: "Gehen Sie zu Einstellungen und klicken Sie auf 'Erstellen'.",
            faq_q8: "Unterstützte Formate?",
            faq_a8: "MP3, MP4, PNG, JPG, PDF, DOCX und viele mehr wie FLAC, MKV, WEBP.",
            faq_q9: "Ist es kostenlos?",
            faq_a9: "Ja, dies ist ein kostenloses Open-Source-Tool.",
            faq_q10: "Systemanforderungen?",
            faq_a10: "Windows 10/11, Python 3.x, FFmpeg und Tesseract (für OCR)."
        }
    };

    window.setLanguage = (lang) => {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
        localStorage.setItem('preferred_lang', lang);
    };

    const savedLang = localStorage.getItem('preferred_lang') || 'tr';
    setLanguage(savedLang);


    // --- Tab Switching ---
    const navLinks = document.querySelectorAll('.nav-links li');
    const views = document.querySelectorAll('.view');
    const headerTitle = document.getElementById('page-title');

    window.switchTab = (tabId) => {
        navLinks.forEach(link => {
            if (link.dataset.tab === tabId) {
                link.classList.add('active');
                const key = link.querySelector('span').getAttribute('data-i18n');
                const currentLang = localStorage.getItem('preferred_lang') || 'tr';
                headerTitle.textContent = translations[currentLang][key];
            } else {
                link.classList.remove('active');
            }
        });

        views.forEach(view => {
            if (view.id === tabId) {
                view.classList.add('active');
                if (tabId === 'history') loadHistory();
            } else {
                view.classList.remove('active');
            }
        });
    };

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            switchTab(link.dataset.tab);
        });
    });


    // --- 3D Tilt Effect ---
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });


    // --- Advanced Options Toggle ---
    window.toggleAdv = (id) => {
        const el = document.getElementById(id);
        if (el.style.display === 'block') {
            el.style.display = 'none';
        } else {
            el.style.display = 'block';
        }
    };

    // --- System Monitor Polling ---
    const updateStats = async () => {
        try {
            const response = await fetch('/api/system/stats');
            const data = await response.json();

            document.getElementById('cpu-bar').style.width = `${data.cpu}%`;
            document.getElementById('cpu-text').textContent = `${data.cpu}%`;

            document.getElementById('ram-bar').style.width = `${data.ram}%`;
            document.getElementById('ram-text').textContent = `${data.ram}%`;
        } catch (e) {
            console.error("Stats error", e);
        }
    };
    setInterval(updateStats, 2000);


    // --- File Upload Handling ---
    const setupDropzone = (type) => {
        const dropzone = document.getElementById(`${type}-dropzone`);
        const input = document.getElementById(`${type}-input`);
        const btn = dropzone.querySelector('.btn-select');

        if (!dropzone) return;

        btn.addEventListener('click', () => input.click());
        input.addEventListener('change', (e) => handleFiles(e.target.files, type));
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
        dropzone.addEventListener('dragleave', () => { dropzone.classList.remove('dragover'); });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            handleFiles(e.dataTransfer.files, type);
        });
    };

    const handleFiles = (files, type) => {
        const fileList = document.getElementById(`${type}-file-list`);
        fileList.innerHTML = '';
        Array.from(files).forEach(file => {
            const item = document.createElement('div');
            item.classList.add('file-item');

            // Preview Logic
            let previewHtml = '';
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                previewHtml = `<img src="${url}" class="preview-media" style="display:block; max-height: 100px; margin-right: 10px;">`;
            }

            item.innerHTML = `
                <div class="file-info" style="display: flex; align-items: center;">
                    ${previewHtml}
                    <div>
                        <i class="fa-solid fa-file"></i>
                        <span>${file.name}</span>
                        <span style="color: #aaa; font-size: 0.8rem; margin-left: 10px;">(${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                </div>
                <div class="status-container" style="text-align: right;">
                    <div class="status-text">Ready</div>
                    <div class="progress-bar" style="width: 100px; height: 5px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-top: 5px; overflow: hidden;">
                        <div class="progress-fill" style="width: 0%; height: 100%; background: var(--accent-primary); transition: width 0.3s;"></div>
                    </div>
                </div>
            `;
            fileList.appendChild(item);
            item.fileObject = file;
        });
    };

    ['audio', 'video', 'image', 'docs'].forEach(setupDropzone);


    // --- History System ---
    const addToHistory = (type, name, status) => {
        const history = JSON.parse(localStorage.getItem('conversion_history') || '[]');
        history.unshift({
            type,
            name,
            status,
            date: new Date().toLocaleString()
        });
        if (history.length > 20) history.pop(); // Keep last 20
        localStorage.setItem('conversion_history', JSON.stringify(history));
    };

    window.loadHistory = () => {
        const list = document.getElementById('history-list');
        const history = JSON.parse(localStorage.getItem('conversion_history') || '[]');

        if (history.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #aaa;">No history yet.</p>';
            return;
        }

        list.innerHTML = '';
        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item glass-panel';
            div.style.marginBottom = '10px';
            div.style.padding = '10px';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.innerHTML = `
                <div>
                    <strong>${item.type.toUpperCase()}</strong>: ${item.name}
                </div>
                <div style="color: ${item.status === 'Success' ? '#00ff88' : '#ff4444'}">
                    ${item.status} <span style="color: #aaa; font-size: 0.8rem;">(${item.date})</span>
                </div>
            `;
            list.appendChild(div);
        });
    };

    window.clearHistory = () => {
        localStorage.removeItem('conversion_history');
        loadHistory();
    };


    // --- Conversion Logic ---
    window.startConversion = async (type) => {
        const fileList = document.getElementById(`${type}-file-list`);
        const format = document.getElementById(`${type}-format`)?.value;
        const items = fileList.querySelectorAll('.file-item');

        if (items.length === 0) {
            alert('Please select files first!');
            return;
        }

        for (const item of items) {
            const file = item.fileObject;
            const statusText = item.querySelector('.status-text');

            statusText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
            statusText.style.color = 'var(--accent-primary)';

            const formData = new FormData();
            formData.append('file', file);
            formData.append('socket_id', socketId); // Send Socket ID
            if (format) formData.append('format', format);

            // Collect Advanced Options
            if (type === 'audio') {
                formData.append('bitrate', document.getElementById('audio-bitrate').value);
            } else if (type === 'video') {
                formData.append('resolution', document.getElementById('video-resolution').value);
                formData.append('fps', document.getElementById('video-fps').value);
            } else if (type === 'image') {
                formData.append('width', document.getElementById('image-width').value);
                formData.append('height', document.getElementById('image-height').value);
                formData.append('quality', document.getElementById('image-quality').value);
            } else if (type === 'docs') {
                formData.append('action', document.getElementById('docs-action').value);
            }

            try {
                const response = await fetch(`/api/convert/${type}`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    statusText.innerHTML = `<a href="${result.download_url}" class="btn-download" download><i class="fa-solid fa-download"></i> Download</a>`;
                    addToHistory(type, file.name, 'Success');
                    item.querySelector('.progress-fill').style.width = '100%';
                } else {
                    statusText.innerHTML = `<span style="color: #ff4444;">Error: ${result.error}</span>`;
                    addToHistory(type, file.name, 'Failed');
                }
            } catch (error) {
                statusText.innerHTML = `<span style="color: #ff4444;">Failed</span>`;
                addToHistory(type, file.name, 'Network Error');
                console.error(error);
            }
        }
    };

    window.startUrlConversion = async () => {
        const url = document.getElementById('url-input').value;
        const mode = document.getElementById('url-mode').value;
        const statusDiv = document.getElementById('url-status');

        if (!url) {
            alert('Please enter a URL');
            return;
        }

        statusDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing... This may take a while.';
        statusDiv.style.color = 'var(--accent-primary)';

        try {
            const response = await fetch('/api/convert/url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, mode, socket_id: socketId })
            });

            const result = await response.json();

            if (response.ok) {
                statusDiv.innerHTML = `Success! <a href="${result.download_url}" class="btn-download" target="_blank"><i class="fa-solid fa-download"></i> Download</a>`;
                addToHistory('url', url, 'Success');
            } else {
                statusDiv.innerHTML = `<span style="color: #ff4444;">Error: ${result.error}</span>`;
                addToHistory('url', url, 'Failed');
            }
        } catch (error) {
            statusDiv.innerHTML = '<span style="color: #ff4444;">Network Error</span>';
            addToHistory('url', url, 'Network Error');
        }
    };

    // --- Settings Modal ---
    const modal = document.getElementById('settings-modal');
    window.openSettings = () => modal.style.display = 'flex';
    window.closeSettings = () => modal.style.display = 'none';
    window.onclick = (event) => { if (event.target == modal) closeSettings(); };

    window.makePermanent = async () => {
        const btn = document.querySelector('button[onclick="makePermanent()"]');
        const originalText = btn.textContent;
        btn.textContent = "Processing...";
        try {
            const response = await fetch('/api/settings/permanent', { method: 'POST' });
            const result = await response.json();
            alert(result.message || result.error);
        } catch (e) { alert("Error connecting to server"); }
        btn.textContent = originalText;
    };

    window.createExe = async () => {
        const btn = document.querySelector('button[onclick="createExe()"]');
        const originalText = btn.textContent;
        btn.textContent = "Building...";
        try {
            const response = await fetch('/api/settings/create-exe', { method: 'POST' });
            const result = await response.json();
            alert(result.message || result.error);
        } catch (e) { alert("Error connecting to server"); }
        btn.textContent = originalText;
    };

    // Image Quality Slider Update
    const qualitySlider = document.getElementById('image-quality');
    const qualityVal = document.getElementById('quality-val');
    if (qualitySlider) {
        qualitySlider.addEventListener('input', (e) => {
            qualityVal.textContent = `${e.target.value}%`;
        });
    }

    // --- YouTube Music Player ---
    let player;
    let isPlaying = false;
    const musicToggle = document.getElementById('music-toggle');
    const musicStatus = document.querySelector('.music-status');
    const visualizer = document.querySelector('.music-visualizer');

    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
        player = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: 'jfKfPfyJRdk', // Lofi Girl - more reliable stream
            playerVars: {
                'playsinline': 1,
                'controls': 0,
                'loop': 1,
                'playlist': 'jfKfPfyJRdk',
                'autoplay': 1, // Try autoplay
                'allow': 'autoplay'
            },
            events: {
                'onReady': onPlayerReady,
                'onError': onPlayerError
            }
        });
    };

    function onPlayerReady(event) {
        console.log("Player Ready");
        player.setVolume(100);

        // Attempt immediate play
        player.playVideo();

        // Browser Policy Hack: Unmute/Play on FIRST click anywhere on the page
        document.body.addEventListener('click', function () {
            if (!isPlaying) {
                player.unMute();
                player.playVideo();
                updateMusicUI(true);
            }
        }, { once: true });

        musicToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent body click from firing
            if (isPlaying) {
                player.pauseVideo();
                updateMusicUI(false);
            } else {
                player.unMute();
                player.playVideo();
                updateMusicUI(true);
            }
        });
    }

    function onPlayerError(event) {
        console.error("YouTube Player Error:", event.data);
        musicStatus.textContent = "Music Error";
        musicStatus.style.color = "#ff4444";
    }

    function updateMusicUI(playing) {
        isPlaying = playing;
        if (playing) {
            musicToggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
            musicStatus.textContent = "Lofi Radio Live";
            visualizer.style.opacity = '1';
        } else {
            musicToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
            musicStatus.textContent = "Music Paused";
            visualizer.style.opacity = '0.3';
        }
    }

    // --- Welcome Modal Logic ---
    const welcomeModal = document.getElementById('welcome-modal');

    // Check if user has seen the welcome message
    if (!localStorage.getItem('welcome_seen')) {
        if (welcomeModal) welcomeModal.style.display = 'flex';
    }

    window.closeWelcome = () => {
        if (welcomeModal) {
            welcomeModal.style.display = 'none';
            localStorage.setItem('welcome_seen', 'true');

            // Auto-play music on welcome close if possible
            if (player && typeof player.playVideo === 'function') {
                player.unMute();
                player.playVideo();
                updateMusicUI(true);
            }
        }
    };
});

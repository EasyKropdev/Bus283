const SITE_VERSION = "2.5";

const schedule = [
    { wd: "06:00 — 06:30", we: "06:30 — 07:10" },
    { wd: "06:30 — 07:10", we: "07:30 — 08:10" },
    { wd: "07:00 — 07:40", we: "08:50 — 09:30" },
    { wd: "07:40 — 08:20", we: "10:30 — 11:30" },
    { wd: "08:10 — 08:45", we: "12:30 — 13:30" },
    { wd: "09:00 — 09:40", we: "14:30 — 15:30" },
    { wd: "10:30 — 11:00", we: "16:40 — 17:20" },
    { wd: "12:00 — 12:30", we: "18:00 — 18:40" },
    { wd: "13:30 — 14:00", we: "19:40 — 20:10" },
    { wd: "14:30 — 15:00", we: null },
    { wd: "15:30 — 16:00", we: null },
    { wd: "16:30 — 17:00", we: null },
    { wd: "17:30 — 18:00", we: null },
    { wd: "18:00 — 18:30", we: null },
    { wd: "19:40 — 20:10", we: null }
];

function checkUpdates() {
    if (document.getElementById('verDisplay')) {
        document.getElementById('verDisplay').innerText = "v" + SITE_VERSION;
    }
    const savedVersion = localStorage.getItem('site_version');
    if (savedVersion && savedVersion !== SITE_VERSION) {
        localStorage.setItem('site_version', SITE_VERSION);
        setTimeout(() => { window.location.reload(true); }, 500);
    } else {
        localStorage.setItem('site_version', SITE_VERSION);
    }
}

const bibleVerses = [
    "«Промовляє до нього Ісус: Я — дорога, і правда, і життя. До Батька не приходить ніхто, якщо не через Мене» (Від Івана 14:6)",
    "«Бо так полюбив Бог світ, що віддав Сина Свого Однородженого, щоб кожен, хто вірує в Нього, не загинув, але мав життя вічне» (Від Івана 3:16)",
    "«Господь — то мій Пастир, тому в недостатку не буду. Він на пасовиськах зелених оселить мене, на тихую воду мене запровадить» (Псалом 22:1-2)",
    "«Все можу в Тім, Хто мене підкріпляє — у Христі Ісусі. Бо Бог не дав нам духа страху, але сили, любові та здорового розуму» (Филип'ян 4:13)",
    "«Бо Я знаю ті думки, які думаю про вас, — говорить Господь, — думки про спокій, а не про лихо, щоб дати вам будучність та надію» (Єремії 29:11)",
    "«Господь буде стерегти твій вихід та вхід твій відтепер і аж довіку. Він не дасть нозі твоїй спіткнутися, і не здрімає Той, Хто тебе стереже» (Псалом 120:3,8)",
    "«Прийдіть до Мене, усі струджені та обтяжені, — і Я заспокою вас! Візьміть на себе ярмо Моє, і навчіться від Мене, бо Я тихий і серцем покірливий» (Від Матвія 11:28-29)"
];

async function fetchWeather() {
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=48.50&longitude=32.26&current_weather=true&timezone=auto');
        const dw = await res.json();
        const temp = Math.round(dw.current_weather.temperature);
        const code = parseInt(dw.current_weather.weathercode);
        document.getElementById('weather-info').innerText = `Кропивницький: ${temp}°C`;
        let wish = "Гарної та благословенної дороги!";
        if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) wish = "☔️ На вулиці дощить. Не забудьте парасольку!";
        else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) wish = "❄️ На вулиці сніг. Одягайтеся тепліше!";
        else if (code >= 95) wish = "⛈ Обережно, прогнозується гроза!";
        else if (temp <= -1) wish = "❄️ На вулиці мороз. Одягайтеся тепліше!";
        else if (temp >= 28) wish = "☀️ Сьогодні спекотно. Візьміть пляшечку води!";
        else if (code === 0) wish = "☀️ Сьогодні ясно. Бажаємо чудової подорожі!";
        else if (code >= 1 && code <= 3) wish = "☁️ Сьогодні хмарно. Комфортної поїздки!";
        document.getElementById('wish-text').innerText = wish;
    } catch (e) {
        document.getElementById('weather-info').innerText = "Погода оновлюється";
    }
}

function setMode(mode) {
    const switcher = document.getElementById('switcher');
    if (switcher) switcher.setAttribute('data-mode', mode);

    document.getElementById('btn-market').classList.toggle('active', mode === 'market');
    document.getElementById('btn-sozonivka').classList.toggle('active', mode === 'sozonivka');

    const label = (mode === 'market') ? "Критий Ринок — Созонівка" : "Созонівка — Критий Ринок";
    document.getElementById('label-main').innerText = label;

    const body = document.getElementById('schedule-body');
    body.innerHTML = '';

    schedule.forEach(row => {
        const tr = document.createElement('tr');
        [row.wd, row.we].forEach(val => {
            const td = document.createElement('td');
            if (val) {
                const parts = val.split(' — ');
                const displayTime = (mode === 'market') ? parts[0] : parts[1];
                td.innerText = displayTime;
                td.addEventListener('click', (e) => selectTrip(displayTime, td, e));
            } else {
                td.innerText = '-';
            }
            tr.appendChild(td);
        });
        body.appendChild(tr);
    });
    deselectAll();
}

let activeTime = "";
function selectTrip(time, el, event) {
    if (time === '-') return;
    event.stopPropagation();
    activeTime = time;

    document.querySelectorAll('td').forEach(t => t.classList.remove('selected'));
    el.classList.add('selected');

    const timerBlock = document.getElementById('timer-block');
    timerBlock.classList.add('visible');

    const calBtn = document.getElementById('calBtn');
    calBtn.style.display = 'inline-block';

    updateTimer(time);
}

function deselectAll(event) {
    if (event && event.target) {
        // Якщо клікнули по кнопці поділитися, таймеру або таблиці — не закриваємо
        if (event.target.closest('#timer-block, td, .sw-btn, .share-btn, #calBtn')) {
            return;
        }
    }

    activeTime = "";
    document.querySelectorAll('td').forEach(t => t.classList.remove('selected'));

    const tb = document.getElementById('timer-block');
    if (tb) tb.classList.remove('visible');

    if (window.tInt) {
        clearInterval(window.tInt);
        window.tInt = null;
    }
}

function updateTimer(time) {
    const [h, m] = time.split(':');
    let target = new Date();
    target.setHours(parseInt(h), parseInt(m), 0, 0);
    if (target < new Date()) target.setDate(target.getDate() + 1);
    if (window.tInt) clearInterval(window.tInt);

    const timerDisplay = document.getElementById('countdown');
    window.tInt = setInterval(() => {
        const diff = target - new Date();
        if (diff <= 0) {
            clearInterval(window.tInt);
            timerDisplay.innerText = "Рейс відійшов";
            return;
        }
        const hrs = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const mns = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const scs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        timerDisplay.innerText = `До рейсу: ${hrs}:${mns}:${scs}`;
    }, 1000);
}

function addToCalendar(event) {
    if (!activeTime) return;
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const [h, m] = activeTime.split(':');
    let start = new Date();
    start.setHours(parseInt(h), parseInt(m), 0, 0);

    const fmt = d => d.toISOString().replace(/-|:|\.\d+/g, '');
    const end = new Date(start.getTime() + 30 * 60000);

    const icsData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'SUMMARY:Автобус 283',
        `DTSTART:${fmt(start)}`,
        `DTEND:${fmt(end)}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bus283.ics';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 250);
}

function shareApp(event) {
    if (event) event.stopPropagation();
    if (navigator.share) {
        navigator.share({
            title: 'Автобус 283',
            text: 'Розклад руху автобуса 283',
            url: window.location.href
        }).catch(() => { });
    }
}

let scrollTicking = false;
window.onscroll = function () {
    if (!scrollTicking) {
        window.requestAnimationFrame(() => {
            let scroll = window.pageYOffset || document.documentElement.scrollTop;
            document.documentElement.style.setProperty('--angle-1', (scroll * 2) + 'deg');
            document.documentElement.style.setProperty('--angle-2', (scroll * -0.8) + 'deg');
            const header = document.getElementById("mainHeader");
            if (scroll > 50) {
                if (!header.classList.contains("scrolled")) header.classList.add("scrolled");
            } else {
                if (header.classList.contains("scrolled")) header.classList.remove("scrolled");
            }
            scrollTicking = false;
        });
        scrollTicking = true;
    }
};

window.onload = function () {
    checkUpdates();
    const quoteEl = document.getElementById('bible-quote');
    if (quoteEl && typeof bibleVerses !== 'undefined') {
        quoteEl.innerText = bibleVerses[Math.floor(Math.random() * bibleVerses.length)];
    }
    fetchWeather();
    setMode('market');
};

const topBlock    = document.getElementById('top-block');
const leftBlock   = document.getElementById('left-block');
const textInput   = document.getElementById('text-input');
const parseBtn    = document.getElementById('parse-btn');
const displayArea = document.getElementById('display-area');

let items = [];
let dragged = null;
let offsetX = 0, offsetY = 0;

const randomColor = () => {
    const c = () => Math.floor(Math.random()*156)+100;
    return `rgb(${c()},${c()},${c()})`;
};
const createEl = (tag, cls, text) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text) el.textContent = text;
    return el;
};

// ---------- создание элемента ----------
function createItem(text, color, key) {
    const el = createEl('div', 'item');
    el.draggable = true;

    el.dataset.key = key;
    el.dataset.text = text;
    el.dataset.originalColor = color;

    el.append(
        createEl('span', 'key', key),
        createEl('span', '', text)
    );

    el.style.backgroundColor = color;

    el.addEventListener('dragstart', onStart);
    el.addEventListener('dragend', onEnd);
    el.addEventListener('click', onTopClick);

    return el;
}

// ---------- перетаскивание ----------
function onStart(e) {
    dragged = this;
    const r = this.getBoundingClientRect();
    offsetX = e.clientX - r.left;
    offsetY = e.clientY - r.top;

    this.classList.add('dragging');

    // Важно: pointer-events выключаем только ПОСЛЕ начала drag
    setTimeout(() => {
        this.style.pointerEvents = 'none';
    }, 0);

    if (this.parentNode === leftBlock) this.dataset.fromLeft = "1";
}

function onEnd() {
    if (!dragged) return;

    dragged.classList.remove('dragging');

    // вернуть кликабельность
    dragged.style.pointerEvents = 'auto';

    dragged = null;
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
}

// ---------- логика размещения без наложений ----------
function fixCollisions(el) {
    const rect = el.getBoundingClientRect();
    const others = [...topBlock.querySelectorAll('.item')]
        .filter(o => o !== el);

    others.forEach(o => {
        const r = o.getBoundingClientRect();

        const overlapX = rect.left < r.right && rect.right > r.left;
        const overlapY = rect.top < r.bottom && rect.bottom > r.top;

        if (overlapX && overlapY) {
            // аккуратное смещение вниз
            const newTop = parseFloat(el.style.top) + (r.height + 6);
            const maxTop = topBlock.clientHeight - el.offsetHeight - 5;

            el.style.top = clamp(newTop, 5, maxTop) + "px";
        }
    });
}

// ---------- верхний блок ----------
topBlock.addEventListener('dragover', e => {
    if (!dragged) return;
    e.preventDefault();

    const r = topBlock.getBoundingClientRect();

    let x = e.clientX - r.left - offsetX;
    let y = e.clientY - r.top - offsetY;

    x = clamp(x, 10, r.width - dragged.offsetWidth - 10);
    y = clamp(y, 5,  r.height - dragged.offsetHeight - 5);

    dragged.style.position = 'absolute';
    dragged.style.left = x + 'px';
    dragged.style.top  = y + 'px';

    if (dragged.parentNode !== topBlock) topBlock.append(dragged);

    fixCollisions(dragged);
});

topBlock.addEventListener('drop', () => {
    if (!dragged) return;

    dragged.classList.add('in-top');
    dragged.style.backgroundColor = '#cccccc';
});

// ---------- левый блок ----------
leftBlock.addEventListener('dragover', e => e.preventDefault());

leftBlock.addEventListener('drop', () => {
    if (!dragged) return;
    if (dragged.parentNode === leftBlock) return;

    dragged.classList.remove('in-top');
    dragged.style.position = '';
    dragged.style.left = '';
    dragged.style.top = '';

    const itemObj = items.find(i => i.key === dragged.dataset.key);

    const index = items.findIndex(i => i.key === dragged.dataset.key);
    const targetIndex = index;

    leftBlock.insertBefore(
        dragged,
        leftBlock.children[targetIndex] ?? null
    );

    dragged.style.backgroundColor = dragged.dataset.originalColor;
});

// ---------- вывод текста по клику ----------
function onTopClick() {
    if (this.parentNode !== topBlock) return;

    const span = createEl('span', 'display-item', this.dataset.text);
    span.style.color = this.dataset.originalColor;

    displayArea.append(span);
    displayArea.scrollTop = displayArea.scrollHeight;
}

// ---------- парсинг ----------
parseBtn.addEventListener('click', () => {
    const raw = textInput.value.trim();
    if (!raw) return;

    const parts = raw.split('-').map(s => s.trim()).filter(Boolean);

    items = [];
    leftBlock.innerHTML = '';
    topBlock.innerHTML = '';
    displayArea.innerHTML = '';

    const order = { a: 0, b: 1, n: 2 };

    const parsed = parts.map(t => {
        let type = /^\d+$/.test(t) ? 'n' :
            t[0] === t[0].toUpperCase() ? 'b' : 'a';

        const sortKey = type === 'n' ? (+t) : t.toLowerCase();

        return { text: t, type, sortKey };
    });

    parsed.sort((x, y) => (
        order[x.type] - order[y.type] ||
        (x.type === 'n'
            ? x.sortKey - y.sortKey
            : x.sortKey.localeCompare(y.sortKey, 'ru'))
    ));

    const counters = { a:1, b:1, n:1 };

    parsed.forEach(obj => {
        const key = obj.type + (counters[obj.type]++);
        const color = randomColor();
        const el = createItem(obj.text, color, key);

        items.push({ key, el });
        leftBlock.append(el);
    });
});

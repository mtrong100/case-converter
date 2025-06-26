// Khởi tạo AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
    
    initTheme();
    loadHistory();
    setupEventListeners();
});

// DOM Elements
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const themeBtn = document.getElementById('themeBtn');
const clearBtn = document.getElementById('clearBtn');
const pasteBtn = document.getElementById('pasteBtn');
const copyInputBtn = document.getElementById('copyInputBtn');
const copyOutputBtn = document.getElementById('copyOutputBtn');
const saveBtn = document.getElementById('saveBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const historyList = document.getElementById('historyList');

// Case conversion buttons
const upperCaseBtn = document.getElementById('upperCaseBtn');
const lowerCaseBtn = document.getElementById('lowerCaseBtn');
const capitalizeBtn = document.getElementById('capitalizeBtn');
const sentenceCaseBtn = document.getElementById('sentenceCaseBtn');
const invertCaseBtn = document.getElementById('invertCaseBtn');
const alternatingCaseBtn = document.getElementById('alternatingCaseBtn');
const titleCaseBtn = document.getElementById('titleCaseBtn');
const slugCaseBtn = document.getElementById('slugCaseBtn');

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

function updateThemeButton(theme) {
    const icon = themeBtn.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

function setupEventListeners() {
    themeBtn.addEventListener('click', toggleTheme);
    
    clearBtn.addEventListener('click', clearText);
    pasteBtn.addEventListener('click', pasteText);
    copyInputBtn.addEventListener('click', () => copyToClipboard(inputText));
    copyOutputBtn.addEventListener('click', () => copyToClipboard(outputText));
    saveBtn.addEventListener('click', saveToHistory);
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    upperCaseBtn.addEventListener('click', () => convertCase('uppercase'));
    lowerCaseBtn.addEventListener('click', () => convertCase('lowercase'));
    capitalizeBtn.addEventListener('click', () => convertCase('capitalize'));
    sentenceCaseBtn.addEventListener('click', () => convertCase('sentence'));
    invertCaseBtn.addEventListener('click', () => convertCase('invert'));
    alternatingCaseBtn.addEventListener('click', () => convertCase('alternating'));
    titleCaseBtn.addEventListener('click', () => convertCase('title'));
    slugCaseBtn.addEventListener('click', () => convertCase('slug'));
    
    inputText.addEventListener('input', () => {
        localStorage.setItem('lastInput', inputText.value);
    });
    
    const lastInput = localStorage.getItem('lastInput');
    if (lastInput) {
        inputText.value = lastInput;
    }
}

async function clearText() {
    inputText.value = '';
    outputText.value = '';
    localStorage.removeItem('lastInput');
    inputText.focus();
    showNotification('Đã xóa nội dung');
}

async function pasteText() {
    try {
        const text = await navigator.clipboard.readText();
        inputText.value = text;
        localStorage.setItem('lastInput', text);
        showNotification('Đã dán nội dung từ clipboard');
    } catch (err) {
        showNotification('Không thể dán văn bản. Vui lòng kiểm tra quyền truy cập clipboard.', true);
        console.error('Failed to read clipboard contents: ', err);
    }
}

async function copyToClipboard(textarea) {
    try {
        await navigator.clipboard.writeText(textarea.value);
        showNotification('Đã sao chép vào clipboard!');
    } catch (err) {
        showNotification('Không thể sao chép văn bản. Vui lòng kiểm tra quyền truy cập clipboard.', true);
        console.error('Failed to copy text: ', err);
    }
}

function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = 'notification fade-in';
    notification.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> ${message}`;
    
    if (isError) {
        notification.style.backgroundColor = 'var(--warning-color)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function convertCase(type) {
    const text = inputText.value;
    if (!text.trim()) return;
    
    let result = '';
    
    switch (type) {
        case 'uppercase':
            result = text.toUpperCase();
            break;
        case 'lowercase':
            result = text.toLowerCase();
            break;
        case 'capitalize':
            result = text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
            break;
        case 'sentence':
            result = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, char => char.toUpperCase());
            break;
        case 'invert':
            result = text.split('').map(char => 
                char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
            ).join('');
            break;
        case 'alternating':
            result = text.split('').map((char, index) => 
                index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
            ).join('');
            break;
        case 'title':
            const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;
            result = text.toLowerCase().replace(/\b\w+/g, (word, index, all) => {
                if (index > 0 && index + word.length !== all.length &&
                    smallWords.test(word) && !/^[A-Z]/.test(word)) {
                    return word;
                }
                return word.charAt(0).toUpperCase() + word.substr(1);
            });
            break;
        case 'slug':
            result = text.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
            break;
        default:
            result = text;
    }
    
    outputText.value = result;
    showNotification(`Đã chuyển đổi sang kiểu ${type.replace(/^\w/, c => c.toUpperCase())}`);
}

function saveToHistory() {
    if (!outputText.value.trim()) {
        showNotification('Không có nội dung để lưu vào lịch sử', true);
        return;
    }
    
    const history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
    const timestamp = new Date().toISOString();
    
    history.unshift({
        input: inputText.value,
        output: outputText.value,
        timestamp: timestamp
    });
    
    if (history.length > 20) {
        history.pop();
    }
    
    localStorage.setItem('conversionHistory', JSON.stringify(history));
    loadHistory();
    showNotification('Đã lưu vào lịch sử!');
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="no-history"><i class="fas fa-info-circle"></i> Không có lịch sử nào.</p>';
        return;
    }
    
    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item fade-in';
        historyItem.style.animationDelay = `${index * 0.1}s`;
        
        const content = document.createElement('div');
        content.className = 'history-content';
        content.innerHTML = `
            <div class="history-time">${formatDate(item.timestamp)}</div>
            <div class="history-output">${truncateText(item.output, 50)}</div>
        `;
        
        const actions = document.createElement('div');
        actions.className = 'history-actions';
        
        const loadBtn = document.createElement('button');
        loadBtn.innerHTML = '<i class="fas fa-redo"></i> Tải lại';
        loadBtn.title = 'Tải lại nội dung này';
        loadBtn.addEventListener('click', () => {
            inputText.value = item.input;
            outputText.value = item.output;
            localStorage.setItem('lastInput', item.input);
            showNotification('Đã tải lại nội dung từ lịch sử');
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Xóa';
        deleteBtn.title = 'Xóa mục này khỏi lịch sử';
        deleteBtn.addEventListener('click', () => deleteHistoryItem(index));
        
        actions.appendChild(loadBtn);
        actions.appendChild(deleteBtn);
        historyItem.appendChild(content);
        historyItem.appendChild(actions);
        historyList.appendChild(historyItem);
    });
}

function deleteHistoryItem(index) {
    const history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
    history.splice(index, 1);
    localStorage.setItem('conversionHistory', JSON.stringify(history));
    loadHistory();
    showNotification('Đã xóa mục khỏi lịch sử');
}

function clearHistory() {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử không?')) {
        localStorage.removeItem('conversionHistory');
        loadHistory();
        showNotification('Đã xóa toàn bộ lịch sử!');
    }
}

function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
        return `Hôm nay, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInHours < 48) {
        return `Hôm qua, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    }
}

function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
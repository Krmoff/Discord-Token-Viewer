function maskToken(token) {
  if (!token || token.length < 8) return "********";
  return token.slice(0, 4) + "****" + token.slice(-4);
}

const translations = {
  tr: {
    copied: "Kopyalandı!",
    noDiscord: "Discord açık değil veya doğru sekmede değilsiniz.",
    noToken: "Token bulunamadı!",
    tokenLabel: "Token:",
    clickToCopy: "Kopyalamak için tıkla"
  },
  en: {
    copied: "Copied!",
    noDiscord: "Discord is not open or you are not on the correct tab.",
    noToken: "No token found!",
    tokenLabel: "Token:",
    clickToCopy: "Click to copy"
  }
};

let currentLang = 'tr';

function getText(key) {
  return translations[currentLang][key] || key;
}

function copyToClipboard(token, element) {
  navigator.clipboard.writeText(token).then(() => {
    element.classList.add('copied');
    element.textContent = getText('copied');
    setTimeout(() => {
      element.classList.remove('copied');
      element.textContent = maskToken(token);
    }, 1200);
  });
}

async function fetchTokens() {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url.startsWith("https://discord.com")) {
      showMessage(getText('noDiscord'));
      return;
    }
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Tüm hesapların tokenini bul (MultiAccountStore içindeki users array)
        let tokens = [];
        try {
          const multi = window.localStorage.getItem("MultiAccountStore");
          if (multi) {
            const obj = JSON.parse(multi);
            if (
              obj &&
              obj._state &&
              Array.isArray(obj._state.users)
            ) {
              obj._state.users.forEach(user => {
                if (user && user.token) {
                  tokens.push(user.token);
                }
              });
            }
          }
        } catch {}
        // Tekli hesap varsa klasik token keyinden al
        const singleToken = window.localStorage.getItem("token");
        if (singleToken && !tokens.includes(singleToken)) {
          tokens.unshift(singleToken);
        }
        return tokens;
      }
    }, (results) => {
      const result = results && results[0] && results[0].result;
      renderTokens(result);
    });
  });
}

function renderTokens(tokenList) {
  const accountsDiv = document.getElementById('accounts');
  accountsDiv.innerHTML = "";
  if (!tokenList || !tokenList.length) {
    accountsDiv.innerHTML = `<span>${getText('noToken')}</span>`;
    return;
  }
  tokenList.forEach(token => {
    const row = document.createElement('div');
    row.className = 'account-row';

    const labelSpan = document.createElement('span');
    labelSpan.className = 'account-name';
    labelSpan.textContent = getText('tokenLabel');

    const tokenSpan = document.createElement('span');
    tokenSpan.className = 'token';
    tokenSpan.textContent = maskToken(token);
    tokenSpan.title = getText('clickToCopy');
    tokenSpan.onclick = () => copyToClipboard(token, tokenSpan);

    row.appendChild(labelSpan);
    row.appendChild(tokenSpan);
    accountsDiv.appendChild(row);
  });
}

function showMessage(msg) {
  const accountsDiv = document.getElementById('accounts');
  accountsDiv.innerHTML = `<span>${msg}</span>`;
}

function loadLanguage() {
  chrome.storage.sync.get(['language'], (result) => {
    currentLang = result.language || 'tr';
    document.getElementById('language').value = currentLang;
    fetchTokens(); // Reload tokens with new language
  });
}

function saveLanguage(lang) {
  currentLang = lang;
  chrome.storage.sync.set({ language: lang });
}

document.addEventListener('DOMContentLoaded', () => {
  loadLanguage();
  document.getElementById('language').addEventListener('change', (e) => {
    saveLanguage(e.target.value);
    fetchTokens(); // Refresh display
  });
});
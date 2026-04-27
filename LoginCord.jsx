import React, { useState, useEffect } from "react";

const translations = {
  tr: {
    copied: "Token kopyalandı!",
    username: "Kullanıcı adı",
    tokenPlaceholder: "Tokeni buraya yapıştırın.",
    login: "Giriş yap",
    addedAccounts: "Eklenen Hesaplar:",
    noAccounts: "Henüz hesap eklenmedi.",
    copyToken: "Tokeni kopyala",
    note: "Not: Bu eklenti hiçbir şekilde log tutmaz!",
    language: "Dil:"
  },
  en: {
    copied: "Token copied!",
    username: "Username",
    tokenPlaceholder: "Paste your token here.",
    login: "Login",
    addedAccounts: "Added Accounts:",
    noAccounts: "No accounts added yet.",
    copyToken: "Copy token",
    note: "Note: This extension does not log anything!",
    language: "Language:"
  }
};

const LoginCord = () => {
  const [accounts, setAccounts] = useState([]);
  const [inputName, setInputName] = useState("");
  const [inputToken, setInputToken] = useState("");
  const [currentLang, setCurrentLang] = useState('tr');

  useEffect(() => {
    // Load language from storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['language'], (result) => {
        setCurrentLang(result.language || 'tr');
      });
    }
  }, []);

  const getText = (key) => {
    return translations[currentLang][key] || key;
  };

  // Token kopyalama fonksiyonu
  const copyToken = (token) => {
    navigator.clipboard.writeText(token);
    alert(getText('copied'));
  };

  // Hesap ekleme fonksiyonu
  const addAccount = () => {
    if (inputName && inputToken) {
      setAccounts([...accounts, { name: inputName, token: inputToken }]);
      setInputName("");
      setInputToken("");
    }
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setCurrentLang(lang);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ language: lang });
    }
  };

  return (
    <div style={{
      background: "#23272A",
      color: "#fff",
      padding: "20px",
      borderRadius: "10px",
      width: "350px",
      margin: "auto",
      fontFamily: "sans-serif"
    }}>
      <h2 style={{ textAlign: "center" }}>LoginCord</h2>
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="language">{getText('language')}</label>
        <select id="language" value={currentLang} onChange={handleLanguageChange} style={{ marginLeft: "10px" }}>
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
        </select>
      </div>
      <input
        type="text"
        placeholder={getText('username')}
        value={inputName}
        onChange={(e) => setInputName(e.target.value)}
        style={{ width: "100%", marginBottom: "8px", padding: "8px", borderRadius: "4px" }}
      />
      <input
        type="text"
        placeholder={getText('tokenPlaceholder')}
        value={inputToken}
        onChange={(e) => setInputToken(e.target.value)}
        style={{ width: "100%", marginBottom: "8px", padding: "8px", borderRadius: "4px" }}
      />
      <button
        onClick={addAccount}
        style={{
          width: "100%",
          padding: "10px",
          background: "#5865F2",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          fontWeight: "bold",
          marginBottom: "12px"
        }}
      >
        {getText('login')}
      </button>
      <div>
        <p><b>{getText('addedAccounts')}</b></p>
        {accounts.length === 0 && <p style={{ fontSize: "14px" }}>{getText('noAccounts')}</p>}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {accounts.map((acc, idx) => (
            <li key={idx} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 0"
            }}>
              <span>{acc.name}</span>
              <span
                style={{
                  background: "#444",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginLeft: "8px",
                  fontSize: "12px"
                }}
                title={getText('copyToken')}
                onClick={() => copyToken(acc.token)}
              >
                {acc.token}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p style={{ fontSize: "12px", marginTop: "16px", color: "#b9bbbe" }}>
        {getText('note')}
      </p>
    </div>
  );
};

export default LoginCord;
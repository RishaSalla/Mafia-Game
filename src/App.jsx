import React, { useState, useEffect } from 'react';

// قائمة الأدوار المتاحة
const ROLES = [
  { id: 'mafia', label: 'زعيم المافيا 🕶️', team: 'mafia', count: 1 },
  { id: 'doctor', label: 'الطبيب 🩺', team: 'villager', count: 1 },
  { id: 'detective', label: 'المحقق 🕵️‍♂️', team: 'villager', count: 1 },
  { id: 'villager', label: 'مواطن 👱', team: 'villager', count: 1 }, // يمكن زيادتهم
];

function App() {
  const [phase, setPhase] = useState('setup'); // setup, role-reveal, night, day, vote, game-over
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [inputName, setInputName] = useState('');
  const [rolesList, setRolesList] = useState([]);
  const [showRole, setShowRole] = useState(false);
  const [logs, setLogs] = useState([]);

  // --- 1. مرحلة الإعداد: إضافة اللاعبين ---
  const addPlayer = () => {
    if (inputName.trim() === "") return;
    setPlayers([...players, { name: inputName, role: null, isAlive: true }]);
    setInputName("");
  };

  const startGame = () => {
    if (players.length < 3) {
      alert("تحتاج 3 لاعبين على الأقل!");
      return;
    }
    assignRoles();
  };

  // توزيع الأدوار عشوائياً
  const assignRoles = () => {
    let availableRoles = [];
    
    // نضمن وجود مافيا وطبيب ومحقق
    availableRoles.push(ROLES.find(r => r.id === 'mafia'));
    availableRoles.push(ROLES.find(r => r.id === 'doctor'));
    if (players.length >= 4) availableRoles.push(ROLES.find(r => r.id === 'detective'));

    // الباقي مواطنين
    while (availableRoles.length < players.length) {
      availableRoles.push(ROLES.find(r => r.id === 'villager'));
    }

    // خلط الأدوار
    availableRoles = availableRoles.sort(() => Math.random() - 0.5);

    // تعيينها للاعبين
    const newPlayers = players.map((p, index) => ({
      ...p,
      role: availableRoles[index]
    }));

    setPlayers(newPlayers);
    setPhase('role-reveal');
  };

  // --- 2. كشف الأدوار (Pass & Play) ---
  const nextPlayerReveal = () => {
    setShowRole(false);
    if (currentPlayerIndex + 1 < players.length) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      setPhase('night');
      setCurrentPlayerIndex(0);
    }
  };

  // --- واجهة المستخدم (Render) ---
  return (
    <div className="container">
      
      {/* الشعار والعنوان */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 className="fade-in">لعبة المافيا</h1>
        <p style={{ opacity: 0.8 }}>نسخة الجوال الاحترافية</p>
      </div>

      {/* --- شاشة 1: إدخال الأسماء --- */}
      {phase === 'setup' && (
        <div className="card fade-in">
          <h2>مرحباً بكم! 👋</h2>
          <p>سجل أسماء اللاعبين للبدء</p>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              className="input-field"
              placeholder="اسم اللاعب"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
            />
          </div>
          <button className="btn" onClick={addPlayer}>إضافة لاعب +</button>

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            {players.map((p, i) => (
              <div key={i} style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {i + 1}. {p.name}
              </div>
            ))}
          </div>

          {players.length > 0 && (
            <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={startGame}>
              بدء اللعب ({players.length}) 🚀
            </button>
          )}
        </div>
      )}

      {/* --- شاشة 2: كشف الأدوار سراً --- */}
      {phase === 'role-reveal' && (
        <div className="card fade-in">
          <h2>دور اللاعب: {players[currentPlayerIndex].name}</h2>
          <p className="pulse-animation">⚠️ مرر الجوال لهذا اللاعب فقط!</p>
          
          {!showRole ? (
            <button className="btn btn-primary" onClick={() => setShowRole(true)}>
              اضغط لكشف دورك
            </button>
          ) : (
            <div className="role-card fade-in">
              <h1 style={{ fontSize: '3rem' }}>{players[currentPlayerIndex].role.label}</h1>
              <p>احفظ دورك جيداً ولا تخبر أحداً!</p>
              <button className="btn" onClick={nextPlayerReveal}>
                فهمت، التالي 👉
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- شاشة 3: اللعبة (تجريبية) --- */}
      {phase === 'night' && (
        <div className="card fade-in">
          <h1 style={{ color: '#888' }}>🌃 حل الليل...</h1>
          <p>الجميع نيام الآن.</p>
          <button className="btn btn-primary" onClick={() => setPhase('setup')}>
            (هذه نسخة تجريبية - اضغط للعودة)
          </button>
        </div>
      )}

    </div>
  );
}

export default App;

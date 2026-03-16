import React, { useState, useRef, useEffect } from 'react';

// ── Crypto knowledge base ─────────────────────────────────────────────────
const KNOWLEDGE = {
  greetings: ['hi','hello','hey','yo','sup','hola','howdy'],
  farewells:  ['bye','goodbye','cya','see ya','later'],
  thanks:     ['thanks','thank you','thx','ty'],
};

const COIN_FACTS = {
  bitcoin:  { sym:'BTC', desc:'Bitcoin is the first and largest cryptocurrency by market cap, created by Satoshi Nakamoto in 2009. It uses Proof-of-Work consensus and has a fixed supply of 21 million coins.' },
  ethereum: { sym:'ETH', desc:'Ethereum is a decentralized platform for smart contracts and dApps, created by Vitalik Buterin. It transitioned to Proof-of-Stake in 2022 with "The Merge".' },
  solana:   { sym:'SOL', desc:'Solana is a high-performance blockchain known for fast transactions (~65,000 TPS) and low fees. It uses Proof-of-History combined with Proof-of-Stake.' },
  bnb:      { sym:'BNB', desc:'BNB is the native token of Binance exchange and BNB Chain. It is used for trading fee discounts, payments, and gas fees on BSC.' },
  xrp:      { sym:'XRP', desc:'XRP is Ripple\'s native currency, designed for fast cross-border payments. It can settle transactions in 3-5 seconds with very low fees.' },
  dogecoin: { sym:'DOGE', desc:'Dogecoin started as a meme in 2013 but became a top-10 coin. It has no hard cap supply and is supported by Elon Musk as "the people\'s crypto".' },
  cardano:  { sym:'ADA', desc:'Cardano is a research-driven blockchain using Ouroboros PoS consensus. It is peer-reviewed and focuses on scalability, interoperability, and sustainability.' },
  avalanche:{ sym:'AVAX', desc:'Avalanche is a fast, eco-friendly blockchain with 4,500 TPS. It uses a unique consensus protocol and supports custom subnets for launching blockchains.' },
  polkadot: { sym:'DOT', desc:'Polkadot connects multiple blockchains via parachains, enabling cross-chain communication. It was founded by Ethereum co-founder Gavin Wood.' },
  pepe:     { sym:'PEPE', desc:'PEPE is a meme coin based on the Pepe the Frog internet meme. It surged 1000%+ in 2023 and became the top meme coin by market cap.' },
};

const TIPS = [
  '💡 Tip: Never invest more than you can afford to lose in crypto.',
  '💡 Tip: Dollar-cost averaging (DCA) reduces the impact of volatility.',
  '💡 Tip: Always use hardware wallets for long-term storage.',
  '💡 Tip: DYOR — Do Your Own Research before investing.',
  '💡 Tip: Diversify across different sectors: DeFi, L1s, L2s, AI tokens.',
  '💡 Tip: Set stop-losses to protect your portfolio from sudden crashes.',
  '💡 Tip: Beware of FOMO — high hype often precedes major corrections.',
  '💡 Tip: The Fear & Greed Index can signal market tops and bottoms.',
  '💡 Tip: Layer 2 solutions like Arbitrum and Optimism reduce ETH gas fees.',
  '💡 Tip: Stablecoins (USDC, USDT) can protect you during bear markets.',
];

const DEFI_TERMS = {
  defi: 'DeFi (Decentralized Finance) refers to financial services built on blockchain without banks. Examples: Uniswap, Aave, Compound.',
  nft:  'NFTs (Non-Fungible Tokens) are unique digital assets on blockchain. They prove ownership of digital art, collectibles, and more.',
  dao:  'A DAO (Decentralized Autonomous Organization) is an organization governed by smart contracts and token holders, not executives.',
  amm:  'An AMM (Automated Market Maker) uses liquidity pools instead of order books for trading. Uniswap and Pancakeswap are popular AMMs.',
  yield:'Yield farming is earning rewards by providing liquidity to DeFi protocols. Returns are measured as APY (Annual Percentage Yield).',
  staking:'Staking is locking up crypto to validate transactions and earn rewards. Ethereum, Solana, and Cardano all support staking.',
  gas:  'Gas is the fee paid to execute transactions on Ethereum. It fluctuates based on network congestion and is denominated in Gwei.',
  whale:'A whale is a crypto investor holding a very large amount of a coin, capable of moving markets with large buy or sell orders.',
  dyor: 'DYOR stands for "Do Your Own Research". It is a reminder to verify information before investing rather than relying on tips.',
  fomo: 'FOMO (Fear Of Missing Out) is the anxiety of missing a price rally. It often leads to buying at market tops.',
  fud:  'FUD (Fear, Uncertainty, Doubt) is negative news or misinformation spread to cause panic selling in crypto markets.',
  hodl: 'HODL is a misspelling of "hold" that became a crypto mantra meaning to keep your crypto long-term despite volatility.',
  bull: 'A bull market is a period of rising asset prices. In crypto, bull markets often feature euphoria and massive price gains.',
  bear: 'A bear market is a sustained decline in asset prices (typically 20%+ from highs). Crypto bear markets can last 1-2 years.',
  rsi:  'RSI (Relative Strength Index) measures momentum on a 0-100 scale. Above 70 = overbought, below 30 = oversold.',
  macd: 'MACD (Moving Average Convergence Divergence) is a trend-following indicator that shows the relationship between two EMAs.',
  layer2:'Layer 2 solutions like Arbitrum and Optimism are built on top of Ethereum to provide faster, cheaper transactions.',
};

function getAIResponse(message) {
  const msg = message.toLowerCase().trim();

  // Greetings
  if (KNOWLEDGE.greetings.some(g => msg.includes(g))) {
    return '👋 Hey there! I\'m CryptoNova AI. I can help you with:\n• Crypto explanations & fundamentals\n• Trading strategies & tips\n• DeFi terms & concepts\n• Technical indicators\n\nWhat would you like to know?';
  }

  // Farewells
  if (KNOWLEDGE.farewells.some(f => msg.includes(f))) {
    return '👋 Goodbye! Stay safe and trade smart! Remember: bull markets make you feel like a genius, bear markets remind you of humility. 😊';
  }

  // Thanks
  if (KNOWLEDGE.thanks.some(t => msg.includes(t))) {
    return '😊 You\'re welcome! Always happy to help. Any other crypto questions?';
  }

  // Price inquiry
  if ((msg.includes('price') || msg.includes('worth') || msg.includes('value') || msg.includes('how much')) ) {
    if (msg.includes('bitcoin') || msg.includes('btc')) return '📊 Bitcoin (BTC) price updates are shown in real-time on the Trading Terminal page. Check the left panel for the latest BTC price!';
    if (msg.includes('ethereum') || msg.includes('eth')) return '📊 Ethereum (ETH) prices are available live on the Trading Terminal. It is currently trading around its recent range.';
    return '📊 For live prices, check the **Trading Terminal** page or the **Market** page! Prices update every 20 seconds from live market feeds.';
  }

  // Prediction / forecast
  if (msg.includes('predict') || msg.includes('forecast') || msg.includes('future') || msg.includes('moon') || msg.includes('pump')) {
    return '🤖 For AI price predictions, check the **AI Signal** tab in the Trading Terminal! It uses RSI, MACD, Bollinger Bands, and momentum to generate buy/sell signals with confidence scores.\n\n⚠️ Remember: No one can accurately predict crypto prices. Use signals as one tool, not the only tool.';
  }

  // Investment advice
  if (msg.includes('buy') || msg.includes('sell') || msg.includes('invest') || msg.includes('should i')) {
    return '⚠️ **This is not financial advice.** I can share educational information, but investment decisions are yours to make.\n\n📚 Key principles:\n• Never invest more than you can afford to lose\n• Diversify your portfolio\n• Have a clear exit strategy\n• Dollar-cost average to reduce risk\n\nCheck the AI Signal panel for technical analysis signals!';
  }

  // Coin-specific facts
  for (const [name, info] of Object.entries(COIN_FACTS)) {
    if (msg.includes(name) || msg.includes(info.sym.toLowerCase())) {
      return `🪙 **${name.charAt(0).toUpperCase() + name.slice(1)} (${info.sym})**\n\n${info.desc}`;
    }
  }

  // DeFi terms
  for (const [term, explanation] of Object.entries(DEFI_TERMS)) {
    if (msg.includes(term)) {
      return `📖 **${term.toUpperCase()}**\n\n${explanation}`;
    }
  }

  // Trading tips
  if (msg.includes('tip') || msg.includes('advice') || msg.includes('strategy') || msg.includes('help')) {
    return TIPS[Math.floor(Math.random() * TIPS.length)] + '\n\nAsk me about specific coins, DeFi terms, or trading concepts!';
  }

  // Technical analysis
  if (msg.includes('technical') || msg.includes('indicator') || msg.includes('chart') || msg.includes('analysis')) {
    return '📈 **Technical Analysis Tools in CryptoNova:**\n\n• **RSI** — Momentum oscillator (0-100)\n• **MACD** — Trend direction & momentum\n• **Bollinger Bands** — Volatility & price channels\n• **SMA/EMA** — Moving averages for trend\n• **Volume** — Confirms price moves\n\nAll these are available on the Trading Terminal chart!';
  }

  // Blockchain basics
  if (msg.includes('blockchain') || msg.includes('what is crypto') || msg.includes('how does')) {
    return '⛓️ **Blockchain Basics:**\n\nA blockchain is a distributed ledger of transactions verified by a network of nodes. Key properties:\n\n• **Decentralized** — No single authority controls it\n• **Immutable** — Transactions cannot be altered\n• **Transparent** — All transactions are public\n• **Secure** — Cryptographically linked blocks\n\nCrypto currencies (BTC, ETH) use blockchain as their foundation.';
  }

  // Portfolio help
  if (msg.includes('portfolio') || msg.includes('diversif') || msg.includes('allocat')) {
    return '📦 **Portfolio Strategy Tips:**\n\n• **Core (50-60%):** BTC + ETH as base\n• **Growth (25-35%):** L1s like SOL, AVAX, NEAR\n• **High-risk (10-15%):** Meme coins, micro-caps\n• **Stablecoins:** Keep 5-10% for buying dips\n\nCheck your portfolio on the **Portfolio** page!';
  }

  // Market conditions
  if (msg.includes('market') || msg.includes('bull') || msg.includes('bear') || msg.includes('crash') || msg.includes('dip')) {
    return '📊 **Market Cycle Wisdom:**\n\n🐂 **Bull Market signals:** New ATHs, high trading volumes, greed index >70, mainstream media coverage\n🐻 **Bear Market signals:** Drawdowns >60%, low volume, fear index <30, project FUD\n\nThe **Fear & Greed Index** on the Dashboard gives a current market sentiment reading!';
  }

  // Default
  const defaults = [
    '🤔 Interesting question! Try asking me about:\n• Specific coins (Bitcoin, Ethereum, Solana)\n• DeFi terms (yield farming, staking, AMM)\n• Trading concepts (RSI, MACD, bull/bear market)\n• Portfolio strategies',
    '🤖 I\'m best at crypto education! Ask me about:\n• How specific cryptocurrencies work\n• Technical analysis indicators\n• DeFi and Web3 concepts\n• Trading tips and risk management',
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// ── Chat message component ────────────────────────────────────────────────
function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex', gap: 10, marginBottom: 14,
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: isUser ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'linear-gradient(135deg,#00d4aa,#0891b2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, border: `1px solid ${isUser ? '#3b82f6' : '#00d4aa'}44`,
      }}>
        {isUser ? '👤' : '🤖'}
      </div>
      <div style={{
        maxWidth: '78%', padding: '10px 14px', borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
        background: isUser ? 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(99,102,241,0.15))' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isUser ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.08)'}`,
        fontSize: 13, color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-line',
      }}>
        {msg.text}
        <div style={{ fontSize: 10, color: '#4a5e78', marginTop: 5, textAlign: isUser ? 'right' : 'left' }}>
          {msg.time}
        </div>
      </div>
    </div>
  );
}

// ── Quick question chips ──────────────────────────────────────────────────
const QUICK_QUESTIONS = [
  'What is Bitcoin?', 'Explain DeFi', 'What is RSI?',
  'Give me a trading tip', 'What is staking?', 'What is MACD?',
];

// ── Main AIChatBot component ──────────────────────────────────────────────
export default function AIChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 0, role: 'ai', text: '👋 Hello! I\'m CryptoNova AI assistant.\n\nI can help you understand cryptocurrencies, DeFi concepts, trading strategies, and more!\n\nWhat would you like to know?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  useEffect(() => {
    if (open && !minimized && inputRef.current) inputRef.current.focus();
  }, [open, minimized]);

  const sendMessage = (text) => {
    const userText = (text || input).trim();
    if (!userText) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userText, time }]);
    setInput('');
    setIsTyping(true);
    
    // Call our intelligent backend AI
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/ai/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ message: userText })
    })
      .then(res => res.json())
      .then(data => {
        const response = data.response;
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: response, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      })
      .catch(err => {
        console.error("AI Error:", err);
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: "Sorry, I'm having trouble connecting to my brain right now. Please try again later!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      })
      .finally(() => setIsTyping(false));
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Floating action button */}
      <div
        onClick={() => setOpen(o => !o)}
        title="AI Chat Assistant"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg,#00d4aa,#3b82f6)',
          boxShadow: '0 4px 20px rgba(0,212,170,0.4), 0 2px 8px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 24, transition: 'transform 0.2s, box-shadow 0.2s',
          animation: open ? 'none' : 'chatPulse 2.5s infinite',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open ? '✕' : '🤖'}
      </div>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 28, zIndex: 9998,
          width: minimized ? 280 : 380, height: minimized ? 52 : 560,
          background: 'linear-gradient(180deg,#0d1829 0%,#08101e 100%)',
          border: '1px solid rgba(0,212,170,0.2)',
          borderRadius: 18, overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column',
          fontFamily: 'Inter,sans-serif',
          transition: 'height 0.25s ease, width 0.25s ease',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(90deg,rgba(0,212,170,0.12),rgba(59,130,246,0.08))',
            borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4aa,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>CryptoNova AI</div>
              <div style={{ fontSize: 11, color: '#00d4aa', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4aa', display: 'inline-block', animation: 'livepulse 1.8s infinite' }} />
                Online · Crypto Expert
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setMinimized(m => !m)} style={{ background: 'none', border: 'none', color: '#4a5e78', cursor: 'pointer', fontSize: 16, padding: 4, lineHeight: 1 }}>
                {minimized ? '▲' : '▼'}
              </button>
              <button onClick={() => setMessages([messages[0]])} style={{ background: 'none', border: 'none', color: '#4a5e78', cursor: 'pointer', fontSize: 12, padding: 4 }} title="Clear chat">
                🗑
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', scrollbarWidth: 'thin', scrollbarColor: '#1a2840 transparent' }}>
                {messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}
                {isTyping && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4aa,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                    <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px 16px 16px 16px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#00d4aa', display: 'inline-block', animation: `typingDot 1s infinite ${i * 0.18}s` }} />)}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick questions */}
              <div style={{ padding: '6px 12px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
                {QUICK_QUESTIONS.map(q => (
                  <button key={q} onClick={() => sendMessage(q)} style={{
                    padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(0,212,170,0.2)',
                    background: 'rgba(0,212,170,0.05)', color: '#00d4aa', fontSize: 11, cursor: 'pointer',
                    whiteSpace: 'nowrap', transition: '0.15s', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,170,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,212,170,0.05)'}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, flexShrink: 0 }}>
                <input
                  ref={inputRef}
                  value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                  placeholder="Ask anything about crypto..."
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, padding: '9px 12px', color: '#e2e8f0', fontSize: 13, outline: 'none',
                    fontFamily: 'inherit', transition: '0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <button onClick={() => sendMessage()} disabled={!input.trim()} style={{
                  width: 38, height: 38, borderRadius: 10, border: 'none',
                  background: input.trim() ? 'linear-gradient(135deg,#00d4aa,#3b82f6)' : 'rgba(255,255,255,0.06)',
                  color: input.trim() ? '#fff' : '#4a5e78', cursor: input.trim() ? 'pointer' : 'default',
                  fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.15s',
                }}>
                  ➤
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes chatPulse { 0%,100%{box-shadow:0 4px 20px rgba(0,212,170,0.4),0 2px 8px rgba(0,0,0,0.4)} 50%{box-shadow:0 4px 30px rgba(0,212,170,0.7),0 2px 8px rgba(0,0,0,0.4)} }
        @keyframes typingDot { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
      `}</style>
    </>
  );
}

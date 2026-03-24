import React, { useState, useRef, useEffect } from 'react';
import { askAI } from '../../services/api';

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

  if (KNOWLEDGE.greetings.some(g => msg.includes(g))) {
    return '👋 Welcome to the Neural Interface. I am Nova-7.\n\nI can assist with:\n• Protocol fundamental analysis\n• Yield farming & staking diagnostics\n• Technical indicator interpretation\n• Portfolio structural optimization\n\nWhat vector shall we analyze today?';
  }

  if (KNOWLEDGE.farewells.some(f => msg.includes(f))) {
    return '👋 Protocol terminated. Stay disciplined and maintain structural integrity. The market is a machine; trade accordingly. 😊';
  }

  if (KNOWLEDGE.thanks.some(t => msg.includes(t))) {
    return '😊 Intelligence parity achieved. Happy to serve the cluster. Any further queries?';
  }

  if ((msg.includes('price') || msg.includes('worth') || msg.includes('value') || msg.includes('how much')) ) {
    return '📊 Real-time price vectors are streaming in the Trading Terminal. Check the liquidity panels for sub-second precision.';
  }

  if (msg.includes('predict') || msg.includes('forecast') || msg.includes('future') || msg.includes('moon') || msg.includes('pump')) {
    return '🤖 Predictive vectors are available in the **Neural Forecasting** panel. We analyze LSTM-V4 gradients to project T+24H market paths.\n\n⚠️ Caution: All projections are probabilistic, not deterministic.';
  }

  for (const [name, info] of Object.entries(COIN_FACTS)) {
    if (msg.includes(name) || msg.includes(info.sym.toLowerCase())) {
      return `🪙 **NODE_IDENTIFIED: ${name.toUpperCase()} (${info.sym})**\n\n${info.desc}`;
    }
  }

  const defaults = [
    '🤔 QUERY_UNRECOGNIZED. Try asking about:\n• Asset Nodes (BTC, ETH, SOL)\n• DeFi Stratums (Yield, Staking, AMM)\n• Momentum Indicators (RSI, MACD)\n• Risk Management Parameters',
    '🤖 NEURAL_MISMATCH. I am optimized for crypto-economic intelligence. Ask me about L1 architectures, smart contract diagnostics, or technical market oscillators.'
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// ── Chat message component ────────────────────────────────────────────────
function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex', gap: 12, marginBottom: 20,
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: isUser ? 'var(--cmc-blue)' : 'var(--cmc-green)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: isUser ? '0 4px 12px rgba(56, 97, 251, 0.3)' : '0 4px 12px rgba(22, 199, 132, 0.3)'
      }}>
        {isUser ? '👤' : '🧠'}
      </div>
      <div style={{
        maxWidth: '82%', padding: '12px 16px', borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser ? 'rgba(56, 97, 251, 0.1)' : 'rgba(255, 255, 255, 0.05)',
        border: `1px solid ${isUser ? 'rgba(56, 97, 251, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
        fontSize: 13, color: '#fff', lineHeight: 1.5, whiteSpace: 'pre-line',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ position: 'relative' }}>
          {msg.text}
          <div style={{ 
            fontSize: 9, color: 'var(--text-muted)', marginTop: 8, textAlign: isUser ? 'right' : 'left', 
            fontWeight: 700 
          }}>
            {msg.time}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main AIChatBot component ──────────────────────────────────────────────
export default function AIChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 0, role: 'ai', text: 'PROTOCOL_INITIATED. I am Nova-7, your neural liquidity advisor.\n\nReady to analyze market vectors, evaluate DeFi protocols, or explain technical indicators.\n\nWhat intelligence do you require?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
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

  const sendMessage = (text) => {
    const userText = (text || input).trim();
    if (!userText) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userText, time }]);
    setInput('');
    setIsTyping(true);
    
    // Check if token exists, fallback to Mock if not
    const token = localStorage.getItem('token');
    
    if (token) {
      askAI({ message: userText })
        .then(res => {
          setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            role: 'ai', 
            text: res.data.response, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }]);
        })
        .catch(() => {
          setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            role: 'ai', 
            text: getAIResponse(userText), 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }]);
        })
        .finally(() => setIsTyping(false));
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: getAIResponse(userText), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setIsTyping(false);
      }, 800);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <div
        onClick={() => setOpen(o => !o)}
        title="NEURAL_ADVISOR"
        style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
          width: 60, height: 60, borderRadius: '50%',
          background: 'var(--cmc-blue)',
          boxShadow: '0 8px 24px rgba(56, 97, 251, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 26, transition: '0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {open ? '✕' : '🧠'}
      </div>

      {open && (
        <div className="glass-heavy neural-chat-terminal" style={{
          position: 'fixed', bottom: 104, right: 32, zIndex: 9998,
          width: minimized ? 280 : 380, height: minimized ? 56 : 580,
          borderRadius: 20, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid var(--cmc-border)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--bg-input)',
            borderBottom: '1px solid var(--cmc-border)', flexShrink: 0
          }}>
            <div style={{ 
                width: 32, height: 32, borderRadius: '50%', 
                background: 'var(--cmc-green)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: 16 
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>Nova-7 Advisor</div>
              <div style={{ fontSize: 10, color: 'var(--cmc-green)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cmc-green)' }} />
                Synchronized
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setMinimized(m => !m)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>
                {minimized ? '⤢' : '⤡'}
              </button>
              <button onClick={() => setMessages([messages[0]])} style={{ background: 'none', border: 'none', color: 'var(--cmc-red)', cursor: 'pointer', fontSize: 13 }}>
                🗑
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', scrollbarWidth: 'none' }}>
                {messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}
                {isTyping && (
                  <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🧠</div>
                    <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px 20px 20px 20px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <div className="neural-typing-dot" />
                        <div className="neural-typing-dot" style={{ animationDelay: '0.2s' }} />
                        <div className="neural-typing-dot" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ padding: '0 24px 20px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <textarea
                    ref={inputRef}
                    value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                    placeholder="QUERY_NEURAL_CORE..."
                    rows={1}
                    style={{
                      flex: 1, background: 'transparent', border: 'none',
                      padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none',
                      fontFamily: 'Space Mono', resize: 'none', maxHeight: 120
                    }}
                  />
                  <button onClick={() => sendMessage()} disabled={!input.trim()} style={{
                    width: 44, height: 44, borderRadius: 14, border: 'none',
                    background: input.trim() ? 'var(--blue)' : 'rgba(255,255,255,0.03)',
                    color: '#fff', cursor: input.trim() ? 'pointer' : 'default',
                    fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s',
                    boxShadow: input.trim() ? '0 5px 15px rgba(59,130,246,0.3)' : 'none'
                  }}>
                    ➤
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        .glass-heavy { background: rgba(10, 15, 28, 0.7) !important; backdrop-filter: blur(25px) saturate(210%); }
        .neural-typing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--blue); opacity: 0.3; animation: neural-type 1.4s infinite; }
        @keyframes neural-type { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }
      `}</style>
    </>
  );
}

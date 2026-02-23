// src/pages/Dashboard.js
import { useState, useEffect, useRef } from 'react'
import GithubServices from '../components/Dashboard/GithubServices'
import StripeServices from '../components/Dashboard/StripeServices'

const Dashboard = () => {
  const [activeService, setActiveService] = useState(null)
  const [activity, setActivity] = useState([])
  const [stats, setStats] = useState({ revenue: null, events: null, success: null, customers: null })
  const [tick, setTick] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const canvasRef = useRef(null)

  // Animated grid background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let frame, t = 0
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const draw = () => {
      const { width: W, height: H } = canvas
      ctx.clearRect(0, 0, W, H)
      // grid
      ctx.strokeStyle = 'rgba(0,255,200,0.035)'; ctx.lineWidth = 1
      for (let x = 0; x < W; x += 52) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
      for (let y = 0; y < H; y += 52) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }
      // scan line
      const scanY = H * ((t * 0.0025) % 1)
      const g = ctx.createLinearGradient(0, scanY-80, 0, scanY+80)
      g.addColorStop(0,'transparent'); g.addColorStop(0.5,'rgba(0,255,180,0.055)'); g.addColorStop(1,'transparent')
      ctx.fillStyle = g; ctx.fillRect(0, scanY-80, W, 160)
      // corner glows
      ;[[0,0],[W,0],[0,H],[W,H]].forEach(([x,y]) => {
        const r = 160 + Math.sin(t*0.008)*15
        const cg = ctx.createRadialGradient(x,y,0,x,y,r)
        cg.addColorStop(0,'rgba(99,91,255,0.06)'); cg.addColorStop(1,'transparent')
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill()
      })
      t++; frame = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize) }
  }, [])

  useEffect(() => { const id = setInterval(() => setTick(t=>t+1), 1000); return () => clearInterval(id) }, [])

  useEffect(() => { fetchData(); setTimeout(() => setLoaded(true), 80) }, [])

  const fetchData = async () => {
    try {
      const [logsRes, analyticsRes] = await Promise.all([
        fetch('http://localhost:5000/api/stripe/logs?limit=7').catch(()=>null),
        fetch('http://localhost:5000/api/stripe/analytics').catch(()=>null),
      ])
      if (analyticsRes?.ok) {
        const a = await analyticsRes.json()
        setStats({
          revenue:   `$${Number(a.totalRevenue||0).toLocaleString('en-US',{minimumFractionDigits:0})}`,
          events:    a.totalEvents ?? 0,
          success:   a.successRate ? `${a.successRate}%` : '—',
          customers: a.topCustomers?.length ?? 0,
        })
      }
      if (logsRes?.ok) {
        const logs = await logsRes.json()
        setActivity(logs.slice(0,7).map(l => ({
          id: l._id, type: l.type,
          email: l.data?.customer_email || l.data?.receipt_email || null,
          amount: l.data?.amount_paid || l.data?.amount || null,
          time: new Date(l.createdAt),
          ok: l.type?.includes('paid') || l.type?.includes('succeeded'),
        })))
      }
    } catch(e) { console.error(e) }
  }

  const now = new Date()
  const timeStr = now.toTimeString().slice(0,8)
  const dateStr = now.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
  const timeAgo = d => { const s=Math.floor((Date.now()-d)/1000); if(s<60) return `${s}s`; if(s<3600) return `${Math.floor(s/60)}m`; return `${Math.floor(s/3600)}h` }

  if (activeService==='stripe') return <StripeServices onBack={()=>setActiveService(null)} />
  if (activeService==='github') return <GithubServices onBack={()=>setActiveService(null)} />

  return (<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      :root{
        --cyan:#00ffe0;--purple:#7c3aed;--pink:#ff2d78;
        --stripe:#635BFF;--github:#58e6d9;--green:#00ff99;
        --bg:#060912;--panel:rgba(7,11,22,0.92);
        --border:rgba(0,255,220,0.1);--text:#c8d8f0;--dim:rgba(120,160,200,0.3);
      }
      .hud{
        position:fixed;inset:0;background:var(--bg);
        font-family:'Rajdhani',sans-serif;color:var(--text);
        overflow:hidden;display:grid;
        grid-template-rows:46px 1fr 28px;
      }
      canvas.bg{position:fixed;inset:0;pointer-events:none;z-index:0}

      /* TOP BAR */
      .topbar{
        position:relative;z-index:10;display:flex;align-items:center;
        border-bottom:1px solid var(--border);background:rgba(5,8,16,0.98);
        padding:0 18px;gap:0;
      }
      .tb-logo{
        font-family:'Share Tech Mono',monospace;font-size:12px;
        color:var(--cyan);letter-spacing:0.18em;
        text-shadow:0 0 14px var(--cyan);
        display:flex;align-items:center;gap:8px;
        padding-right:18px;border-right:1px solid var(--border);white-space:nowrap;
      }
      .tb-logo-hex{font-size:15px;animation:spinHex 10s linear infinite;display:inline-block}
      @keyframes spinHex{to{transform:rotate(360deg)}}

      .tb-stats{display:flex;align-items:center;flex:1}
      .tb-stat{
        display:flex;align-items:center;gap:10px;
        padding:0 18px;border-right:1px solid var(--border);height:46px;
      }
      .tb-stat-label{font-family:'Share Tech Mono',monospace;font-size:8px;color:var(--dim);letter-spacing:0.14em;text-transform:uppercase}
      .tb-stat-val{
        font-size:18px;font-weight:700;color:var(--cyan);
        text-shadow:0 0 12px rgba(0,255,224,0.6);letter-spacing:0.02em;
      }
      .tb-stat-val.ld{color:rgba(0,255,224,0.15);animation:flicker 1.4s ease infinite}

      .tb-right{margin-left:auto;display:flex;align-items:center;gap:0;border-left:1px solid var(--border)}
      .tb-clock{
        font-family:'Share Tech Mono',monospace;font-size:16px;
        color:var(--cyan);text-shadow:0 0 10px var(--cyan);
        letter-spacing:0.08em;padding:0 18px;
      }
      .tb-date{font-size:9px;color:var(--dim);letter-spacing:0.06em;display:block;text-align:right;margin-top:1px}

      .live-pill{
        display:flex;align-items:center;gap:6px;padding:0 16px;
        font-family:'Share Tech Mono',monospace;font-size:9px;
        color:var(--green);letter-spacing:0.12em;
        border-right:1px solid var(--border);height:46px;
      }
      .live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green);animation:blink 1.6s ease infinite}
      @keyframes blink{0%,100%{opacity:1;box-shadow:0 0 8px var(--green)}50%{opacity:0.3;box-shadow:none}}

      /* BODY */
      .body{
        position:relative;z-index:5;display:grid;
        grid-template-columns:1fr 1fr 290px;
        gap:1px;background:var(--border);overflow:hidden;
      }

      /* PANELS */
      .panel{
        background:var(--panel);backdrop-filter:blur(16px);
        padding:14px 16px;display:flex;flex-direction:column;overflow:hidden;
        opacity:0;transform:translateY(12px);
        transition:opacity 0.4s ease,transform 0.4s ease;
      }
      .panel.vis{opacity:1;transform:translateY(0)}
      .panel:nth-child(1){transition-delay:0.08s}
      .panel:nth-child(2){transition-delay:0.16s}
      .panel:nth-child(3){transition-delay:0.24s}

      .panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-shrink:0}
      .panel-title{
        font-family:'Share Tech Mono',monospace;font-size:9px;
        letter-spacing:0.2em;text-transform:uppercase;color:var(--dim);
        display:flex;align-items:center;gap:8px;
      }
      .panel-title::before{content:'';width:16px;height:1px;background:var(--cyan);box-shadow:0 0 6px var(--cyan)}
      .panel-tag{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:0.1em;opacity:0.45}

      /* SERVICE CARDS */
      .svc-panel{cursor:pointer;position:relative;overflow:hidden;transition:background 0.25s}
      .svc-panel:hover{background:rgba(10,16,32,0.98)}

      /* corner brackets */
      .bracket{position:absolute;width:18px;height:18px;border-color:var(--ac);border-style:solid;opacity:0.5;transition:opacity 0.3s,width 0.3s,height 0.3s}
      .bracket.tl{top:6px;left:6px;border-width:1px 0 0 1px}
      .bracket.tr{top:6px;right:6px;border-width:1px 1px 0 0}
      .bracket.bl{bottom:6px;left:6px;border-width:0 0 1px 1px}
      .bracket.br{bottom:6px;right:6px;border-width:0 1px 1px 0}
      .svc-panel:hover .bracket{opacity:1;width:24px;height:24px}

      /* scan line sweep */
      .svc-panel::after{
        content:'';position:absolute;left:0;right:0;height:1px;
        background:linear-gradient(90deg,transparent,var(--ac),transparent);
        opacity:0;top:-2px;pointer-events:none;
      }
      .svc-panel:hover::after{opacity:0.6;animation:sweep 1.8s linear infinite}
      @keyframes sweep{0%{top:0}100%{top:100%}}

      .svc-bg-number{
        position:absolute;right:-10px;bottom:-20px;
        font-family:'Rajdhani',sans-serif;font-size:140px;font-weight:800;
        color:var(--ac);opacity:0.03;letter-spacing:-0.05em;line-height:1;
        pointer-events:none;transition:opacity 0.3s;user-select:none;
      }
      .svc-panel:hover .svc-bg-number{opacity:0.06}

      .svc-inner{flex:1;display:flex;flex-direction:column;justify-content:space-between;padding:4px 0}
      .svc-index{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--ac);text-shadow:0 0 8px var(--ac);opacity:0.6;margin-bottom:8px}
      .svc-icon{
        font-size:36px;margin-bottom:10px;
        filter:drop-shadow(0 0 14px var(--ac));
        transition:transform 0.3s ease,filter 0.3s;display:inline-block;
      }
      .svc-panel:hover .svc-icon{transform:scale(1.1) translateY(-3px);filter:drop-shadow(0 0 22px var(--ac))}

      .svc-name{
        font-size:42px;font-weight:800;letter-spacing:-0.02em;
        color:#fff;text-shadow:0 0 24px var(--ac);
        line-height:1;margin-bottom:8px;
        transition:text-shadow 0.3s;
      }
      .svc-panel:hover .svc-name{text-shadow:0 0 40px var(--ac),0 0 80px var(--ac)}

      .svc-desc{
        font-family:'Share Tech Mono',monospace;font-size:9px;
        color:var(--dim);line-height:1.7;letter-spacing:0.05em;margin-bottom:14px;
        text-transform:uppercase;
      }
      .svc-footer{display:flex;align-items:center;justify-content:space-between}
      .svc-status{display:flex;align-items:center;gap:6px;font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--green);letter-spacing:0.14em}

      .svc-btn{
        font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;
        letter-spacing:0.12em;color:var(--ac);
        background:rgba(255,255,255,0.03);
        border:1px solid var(--ac);padding:6px 16px;cursor:pointer;
        text-transform:uppercase;
        clip-path:polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%);
        transition:background 0.2s,color 0.2s,box-shadow 0.2s;
      }
      .svc-panel:hover .svc-btn{background:var(--ac);color:#060912;box-shadow:0 0 20px var(--ac)}

      /* ACTIVITY */
      .act-scroll{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:1px}
      .act-scroll::-webkit-scrollbar{width:2px}
      .act-scroll::-webkit-scrollbar-thumb{background:var(--border)}

      .act-item{
        padding:8px 10px;background:rgba(255,255,255,0.015);
        border-left:2px solid rgba(255,255,255,0.06);
        transition:background 0.15s,border-color 0.15s;flex-shrink:0;
      }
      .act-item.ok{border-left-color:var(--green)}
      .act-item.bad{border-left-color:var(--pink)}
      .act-item:hover{background:rgba(255,255,255,0.04)}
      .act-r1{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:3px}
      .act-type{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
      .act-ago{font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--dim);flex-shrink:0}
      .act-r2{display:flex;align-items:center;gap:6px}
      .act-email{font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
      .act-amt{font-family:'Share Tech Mono',monospace;font-size:10px;font-weight:500;color:var(--green);text-shadow:0 0 8px var(--green);flex-shrink:0}
      .act-empty{display:flex;align-items:center;justify-content:center;flex:1;font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--dim);letter-spacing:0.1em}

      .ref-btn{
        font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:0.12em;
        color:var(--dim);background:none;border:1px solid var(--border);
        padding:3px 9px;cursor:pointer;transition:color 0.2s,border-color 0.2s;
      }
      .ref-btn:hover{color:var(--cyan);border-color:var(--cyan)}

      /* STATUS BAR */
      .statusbar{
        position:relative;z-index:10;display:flex;align-items:center;
        padding:0 18px;background:rgba(4,6,14,0.99);
        border-top:1px solid var(--border);gap:18px;
      }
      .sb-i{font-family:'Share Tech Mono',monospace;font-size:8px;color:var(--dim);letter-spacing:0.1em;display:flex;align-items:center;gap:5px}
      .sb-dot{width:5px;height:5px;border-radius:50%}
      .sb-right{margin-left:auto;display:flex;gap:16px}

      /* MISC */
      @keyframes flicker{0%,100%{opacity:0.15}50%{opacity:0.4}}
    `}</style>

    <canvas className="bg" ref={canvasRef} />

    <div className="hud">

      {/* ── TOP BAR ── */}
      <div className="topbar">
        <div className="tb-logo">
          <span className="tb-logo-hex">⬡</span>
          WEBHOOK_HUB
        </div>

        <div className="tb-stats">
          {[
            {label:'REVENUE',   val:stats.revenue},
            {label:'EVENTS',    val:stats.events},
            {label:'SUCCESS',   val:stats.success},
            {label:'CUSTOMERS', val:stats.customers},
          ].map(s=>(
            <div className="tb-stat" key={s.label}>
              <div className="tb-stat-label">{s.label}</div>
              <div className={`tb-stat-val${s.val==null?' ld':''}`}>{s.val??'——'}</div>
            </div>
          ))}
        </div>

        <div className="tb-right">
          <div className="live-pill">
            <div className="live-dot"/>LIVE
          </div>
          <div className="tb-clock">
            {timeStr}
            <span className="tb-date">{dateStr}</span>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="body">

        {/* Stripe */}
        <div className={`panel svc-panel${loaded?' vis':''}`} style={{'--ac':'#635BFF'}} onClick={()=>setActiveService('stripe')}>
          <div className="bracket tl"/><div className="bracket tr"/>
          <div className="bracket bl"/><div className="bracket br"/>
          <div className="svc-bg-number">01</div>

          <div className="panel-head">
            <div className="panel-title">Payment Service</div>
            <div className="panel-tag" style={{color:'#635BFF'}}>SVC-01</div>
          </div>
          <div className="svc-inner">
            <div>
              <div className="svc-index">[ 01 / 02 ]</div>
              <div className="svc-icon">💳</div>
              <div className="svc-name">STRIPE</div>
              <div className="svc-desc">
                PAYMENT PROCESSING<br/>
                INVOICE GENERATION<br/>
                ANALYTICS DASHBOARD
              </div>
            </div>
            <div className="svc-footer">
              <div className="svc-status"><div className="live-dot"/>ONLINE</div>
              <button className="svc-btn" onClick={e=>{e.stopPropagation();setActiveService('stripe')}}>LAUNCH →</button>
            </div>
          </div>
        </div>

        {/* GitHub */}
        <div className={`panel svc-panel${loaded?' vis':''}`} style={{'--ac':'#58e6d9'}} onClick={()=>setActiveService('github')}>
          <div className="bracket tl"/><div className="bracket tr"/>
          <div className="bracket bl"/><div className="bracket br"/>
          <div className="svc-bg-number">02</div>

          <div className="panel-head">
            <div className="panel-title">Dev Service</div>
            <div className="panel-tag" style={{color:'#58e6d9'}}>SVC-02</div>
          </div>
          <div className="svc-inner">
            <div>
              <div className="svc-index">[ 02 / 02 ]</div>
              <div className="svc-icon">⬡</div>
              <div className="svc-name">GITHUB</div>
              <div className="svc-desc">
                REPO MONITORING<br/>
                WEBHOOK EVENTS<br/>
                WORKFLOW TRACKING
              </div>
            </div>
            <div className="svc-footer">
              <div className="svc-status"><div className="live-dot"/>ONLINE</div>
              <button className="svc-btn" onClick={e=>{e.stopPropagation();setActiveService('github')}}>LAUNCH →</button>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className={`panel${loaded?' vis':''}`}>
          <div className="panel-head">
            <div className="panel-title">Live Feed</div>
            <button className="ref-btn" onClick={fetchData}>↻ SYNC</button>
          </div>
          <div className="act-scroll">
            {activity.length===0 ? (
              <div className="act-empty">AWAITING EVENTS…</div>
            ) : activity.map(item=>(
              <div key={item.id} className={`act-item ${item.ok?'ok':'bad'}`}>
                <div className="act-r1">
                  <div className="act-type">{item.type?.replace(/\./g,' ›')}</div>
                  <div className="act-ago">{timeAgo(item.time)}</div>
                </div>
                <div className="act-r2">
                  <div className="act-email">{item.email||'—'}</div>
                  {item.amount!=null&&<div className="act-amt">${(item.amount/100).toFixed(2)}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── STATUS BAR ── */}
      <div className="statusbar">
        <div className="sb-i"><div className="sb-dot" style={{background:'#00ff99',boxShadow:'0 0 6px #00ff99'}}/>SYSTEM NOMINAL</div>
        <div className="sb-i"><div className="sb-dot" style={{background:'#635BFF'}}/>STRIPE CONNECTED</div>
        <div className="sb-i"><div className="sb-dot" style={{background:'#58e6d9'}}/>GITHUB CONNECTED</div>
        <div className="sb-right">
          <div className="sb-i">v2.0.0</div>
          <div className="sb-i">WEBHOOK_HUB © 2026</div>
        </div>
      </div>

    </div>
  </>)
}

export default Dashboard
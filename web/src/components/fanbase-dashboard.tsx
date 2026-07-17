"use client";

import type { Match } from "@/lib/world-cup";
import Image from "next/image";
import { Check, ChevronRight, CircleAlert, ExternalLink, Fingerprint, LoaderCircle, LockKeyhole, ShieldCheck, Trophy, Wallet } from "lucide-react";
import { useState } from "react";
import { useAccount, useChainId, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injectiveTestnet } from "viem/chains";

type Application = { score: number; weight: number; commitment: string; explanation: string };
const short = (value: string) => `${value.slice(0, 6)}…${value.slice(-4)}`;

export function FanBaseDashboard({ match }: { match: Match | null }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [consent, setConsent] = useState(false);
  const [handle, setHandle] = useState("");
  const [application, setApplication] = useState<Application | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function apply() {
    if (!address || !match) return;
    setBusy(true); setNotice(null);
    const response = await fetch("/api/application", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ matchId: match.id, wallet: address, socialConsent: consent, xHandle: handle.replace("@", "") || undefined }) });
    const body = await response.json() as Application & { error?: string };
    setBusy(false);
    if (!response.ok) return setNotice(body.error ?? "Could not create your application.");
    setApplication(body);
  }

  async function startPayment() {
    setBusy(true); setNotice(null);
    const response = await fetch("/api/pay", { method: "POST" });
    const body = await response.json() as { error?: string };
    setBusy(false);
    setNotice(response.ok ? "Deposit settled. Your application is committed." : body.error ?? "Payment could not be initiated.");
  }

  return <main className="shell">
    <nav className="topbar" aria-label="Primary navigation">
      <a className="brand" href="#top"><span><Image src="/fanbase-football.png" alt="" width={27} height={27} priority /></span> FanBase</a>
      <div className="nav-links"><a href="#fairness">Fairness</a><a href="#how-it-works">How it works</a></div>
      {isConnected ? <button className="wallet connected" onClick={() => disconnect()}><span className="status-dot" />{short(address!)}</button> : <button className="wallet" disabled={isPending} onClick={() => connectors[0] && connect({ connector: connectors[0] })}><Wallet size={16} />{isPending ? "Connecting" : "Connect wallet"}</button>}
    </nav>

    <section id="top" className="hero">
      <div className="hero-copy">
        <p className="eyebrow"><span className="pulse" /> Fair allocation protocol</p>
        <h1>Real fans.<br /><em>Real chance.</em></h1>
        <p className="lede">A calmer way into football’s biggest matches. FanBase freezes the rules before the draw, makes every allocation verifiable, and makes scalping a dead end.</p>
        <div className="hero-actions"><a className="primary" href="#apply">Enter the draw <ChevronRight size={17} /></a><a className="text-link" href="#fairness">Read fairness rules</a></div>
      </div>
      <div className="orbital" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="ball"><Trophy size={34} /></div><span className="tag tag-one">No bidding</span><span className="tag tag-two">No bots</span><span className="tag tag-three">No resale</span></div>
    </section>

    <section className="trust-strip" aria-label="Product promises"><div><ShieldCheck size={19} /><span><strong>Rules locked</strong> before entries close</span></div><div><Fingerprint size={19} /><span><strong>One person</strong> per allocation</span></div><div><LockKeyhole size={19} /><span><strong>Non-transferable</strong> access pass</span></div></section>

    <section id="apply" className="application-section">
      <div className="section-heading"><p className="eyebrow">Live allocation</p><h2>Enter without the panic refresh.</h2><p>Live match data updates from ESPN. FanBase is a prototype, not an official FIFA ticket seller.</p></div>
      {match ? <div className="match-card">
        <div className="match-meta"><span>{match.stage}</span><span>{new Intl.DateTimeFormat("en", { dateStyle: "full", timeStyle: "short" }).format(new Date(match.date))}</span></div>
        <div className="teams">{match.teams.map((team, index) => <div className="team" key={team.abbreviation}><div className="crest">{team.logo ? <Image src={team.logo} alt="" width={52} height={52} /> : team.abbreviation}</div><strong>{team.name}</strong><small>{team.player ? `${team.player} watch` : "Team evidence"}</small>{index === 0 && <span className="versus">VS</span>}</div>)}</div>
        <div className="match-footer"><span>{match.venue}</span><a href={match.sourceUrl} target="_blank" rel="noreferrer">{match.sourceName} <ExternalLink size={13} /></a></div>
      </div> : <div className="unavailable"><CircleAlert size={20} /><div><strong>Live match data is unavailable right now.</strong><p>We do not replace it with made-up fixtures. Retry shortly.</p></div></div>}

      <div className="apply-grid">
        <div className="steps-card"><span className="step-number">01</span><h3>Prove you’re a person, not a scalper.</h3><p>Connect an Injective testnet wallet. Production adds issuer-approved identity checks; a wallet alone is never treated as a human.</p><div className="wallet-row">{isConnected && chainId === injectiveTestnet.id ? <><Check size={17} /><span>{short(address!)}</span></> : isConnected ? <button className="network-switch" disabled={isSwitching} onClick={() => switchChain({ chainId: injectiveTestnet.id })}>{isSwitching ? "Switching…" : "Switch to Injective testnet"}</button> : <span>Connect wallet to continue</span>}</div></div>
        <div className="steps-card evidence"><span className="step-number">02</span><h3>Share evidence only if you want.</h3><p>Every eligible fan begins at a neutral score of 50. Opting in can add a capped boost—never a guaranteed win.</p><label className="consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>I consent to public X post checks relevant to this match.</span></label>{consent && <label className="handle"><span>@</span><input value={handle} maxLength={15} onChange={(event) => setHandle(event.target.value.replace(/^@/, ""))} placeholder="yourhandle" aria-label="X handle" /></label>}</div>
        <div className="steps-card payment"><span className="step-number">03</span><h3>Lock a refundable deposit.</h3><p>Everyone pays the same $5 USDC deposit through x402. Paying more can never change your odds.</p><div className="payment-line"><span>Deposit</span><strong>$5.00 USDC</strong></div><button className="secondary" disabled={!application || busy} onClick={startPayment}>Pay via x402 <ChevronRight size={16} /></button></div>
      </div>
      <div className="apply-panel"><div><p className="eyebrow">Your allocation status</p><h3>{application ? "You’re eligible for the draw." : "Ready when you are."}</h3><p>{application ? application.explanation : "Connect your Injective testnet wallet, then create a verifiable application. Nothing is ranked in a hidden queue."}</p></div>{application ? <div className="score-block"><span>Fan signal score</span><strong>{application.score}</strong><small>×{application.weight.toFixed(2)} draw weight</small></div> : <button className="primary" disabled={!isConnected || chainId !== injectiveTestnet.id || !match || busy} onClick={apply}>{busy ? <LoaderCircle className="spin" size={17} /> : "Create application"}<ChevronRight size={17} /></button>}</div>
      {application && <div className="proof"><Check size={17} /><span><strong>Score commitment:</strong> {application.commitment}</span></div>}
      {notice && <p className="notice" role="status">{notice}</p>}
    </section>

    <section id="fairness" className="fairness"><div className="section-heading"><p className="eyebrow">No hidden queue</p><h2>A draw you can audit, not a score you have to trust.</h2></div><div className="fairness-grid"><article><span>01</span><h3>Freeze</h3><p>Applications, inventory, weights, and rubric version are committed before selection.</p></article><article><span>02</span><h3>Draw</h3><p>Public randomness selects weighted winners without replacement. Higher scores help, never guarantee.</p></article><article><span>03</span><h3>Verify</h3><p>Each allocation can be recomputed from the commitment—without publishing social data.</p></article></div></section>
    <section id="how-it-works" className="footer-cta"><div><p className="eyebrow">Built for licensed organizers</p><h2>Tickets should belong to fans, not the fastest script.</h2></div><div className="network-note"><span className="status-dot" /> Injective testnet · x402 ready · CCTP settlement path</div></section>
    <footer>© 2026 FanBase <span>·</span> Fair access for real fans <span>·</span> Prototype — not affiliated with FIFA</footer>
  </main>;
}

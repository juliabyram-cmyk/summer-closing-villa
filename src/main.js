
import "./styles.css";
import { createClient } from "@supabase/supabase-js";
import {
  participants, sections, bbqOptions, breakfastSavory, breakfastSweet, breakfastDrinks, mealIdeas,
  softDrinks, cocktails, alcohols, speakerBrands, activities, bringCategories
} from "./data.js";

const app = document.querySelector("#app");
const state = {
  mode: "welcome",
  participant: null,
  section: "profile",
  answers: {},
  organizerView: "dashboard",
  organizerUnlocked: false,
  accessOk: false,
  toast: ""
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

function initials(name){ return name.slice(0,2).toUpperCase(); }
function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
function selected(arr,v){ return (arr||[]).includes(v) ? "selected" : ""; }
function toast(msg){ state.toast=msg; render(); setTimeout(()=>{state.toast="";render();},1600); }
function sectionDone(id){
  const a = state.answers[id];
  if(!a) return false;
  if(id==="profile") return !!a.description && !!a.energy;
  if(id==="trip") return !!a.outbound;
  if(id==="meals") return !!a.diet;
  if(id==="drinks") return (a.softs?.length||0)+(a.cocktails?.length||0)+(a.alcohols?.length||0) > 0;
  if(id==="playlist") return a.spotifyPremium !== undefined && a.hasSpeaker !== undefined;
  if(id==="activities") return (a.activities?.length||0)>0;
  if(id==="bring") return a.canBring !== undefined;
  if(id==="checklist") return sections.filter(s=>s.id!=="checklist").every(s=>sectionDone(s.id));
  return false;
}
function progressPct(){ return Math.round(sections.filter(s=>s.id!=="checklist" && sectionDone(s.id)).length / 7 * 100); }

function navButtons(){
  return `<div class="footer-nav">${sections.map(s=>`<button data-section="${s.id}" class="${state.section===s.id?"active":""}">${s.icon} ${s.label}${sectionDone(s.id)?" ✓":""}</button>`).join("")}</div>`;
}
function participantHero(){
  return `<div class="topbar"><div><div class="brand">SUMMER CLOSING VILLA · SUMMER PASS</div><h1 class="screen-title">${esc(state.participant||"")}</h1><div class="subtitle">Vérargues · 11–14 septembre 2026</div></div><div class="metric">${progressPct()}%</div></div>`;
}
function choiceGroup(key, options, multiple=true){
  const arr = state.answers[state.section]?.[key] || (multiple ? [] : null);
  return `<div class="choice-grid">${options.map(o=>`<button class="choice ${multiple ? selected(arr,o):(arr===o?"selected":"")}" data-choice-key="${key}" data-choice-value="${esc(o)}" data-multiple="${multiple}">${esc(o)}</button>`).join("")}</div>`;
}
function participantScreen(){
  const a = state.answers[state.section] || {};
  let body = "";
  if(state.section==="profile"){
    body = `<div class="form-group"><label>Une phrase qui te décrit le mieux</label><textarea class="input" data-bind="description" maxlength="120" placeholder="Ta phrase…">${esc(a.description||"")}</textarea></div>
      <div class="form-group"><label>Ton niveau d’énergie pour ce week-end</label>${choiceGroup("energy",["Zen","Tranquille","Chaud·e","Très chaud·e","À fond !"],false)}</div>`;
  }
  if(state.section==="trip"){
    body = `<div class="form-group"><label>À l’aller</label>${choiceGroup("outbound",["Je conduis","Je suis passager·ère / covoiturage"],false)}</div>
      ${a.outbound==="Je conduis" ? `<div class="grid cols3"><input class="input" data-bind="departureCity" placeholder="Ville de départ" value="${esc(a.departureCity||"")}"><select class="input" data-bind="seats"><option value="">Places disponibles</option>${[0,1,2,3,4].map(n=>`<option ${String(a.seats)===String(n)?"selected":""}>${n}</option>`).join("")}</select><input class="input" data-bind="arrivalTime" type="time" value="${esc(a.arrivalTime||"")}"></div>` : ""}
      ${a.outbound==="Je suis passager·ère / covoiturage" ? `<div class="grid cols2"><select class="input" data-bind="withWhom"><option value="">Avec qui viens-tu ?</option>${participants.filter(p=>p!==state.participant).map(p=>`<option ${a.withWhom===p?"selected":""}>${p}</option>`).join("")}</select><input class="input" data-bind="arrivalTime" type="time" value="${esc(a.arrivalTime||"")}"></div>` : ""}
      <div class="form-group" style="margin-top:18px"><label>Retour</label>${choiceGroup("returnType",["Même organisation qu’à l’aller","Mon retour sera différent"],false)}</div>
      ${a.returnType==="Mon retour sera différent" ? `<div class="grid cols2"><select class="input" data-bind="returnMode"><option>Je conduis</option><option>Je suis passager·ère</option></select><input class="input" data-bind="returnTime" type="time" value="${esc(a.returnTime||"")}"></div>`:""}`;
  }
  if(state.section==="meals"){
    body = `<div class="form-group"><label>Régime alimentaire</label>${choiceGroup("diet",["Je mange de tout","Végétarien","Vegan","Sans porc","Autre"],false)}</div>
      <div class="grid cols2"><div><label>Allergies / intolérances</label><input class="input" data-bind="allergies" value="${esc(a.allergies||"")}" placeholder="Facultatif"></div><div><label>Aliment détesté</label><input class="input" data-bind="disliked" value="${esc(a.disliked||"")}" placeholder="Facultatif"></div></div>
      <div class="form-group"><label>Barbecue</label>${choiceGroup("bbq",bbqOptions)}</div>
      <div class="form-group"><label>Petit-déjeuner salé</label>${choiceGroup("breakfastSavory",breakfastSavory)}</div>
      <div class="form-group"><label>Petit-déjeuner sucré</label>${choiceGroup("breakfastSweet",breakfastSweet)}</div>
      <div class="form-group"><label>Boissons du petit-déjeuner</label>${choiceGroup("breakfastDrinks",breakfastDrinks)}</div>
      <div class="form-group"><label>Idées de repas — jusqu’à 3</label>${choiceGroup("mealIdeas",mealIdeas)}</div>`;
  }
  if(state.section==="drinks"){
    body = `<div class="form-group"><label>Boissons</label>${choiceGroup("softs",softDrinks)}</div>
      <div class="form-group"><label>Cocktails</label>${choiceGroup("cocktails",cocktails)}</div>
      <div class="form-group"><label>Alcools</label>${choiceGroup("alcohols",alcohols)}</div>`;
  }
  if(state.section==="playlist"){
    body = `<div class="form-group"><label>Tu as Spotify Premium ?</label>${choiceGroup("spotifyPremium",["Oui","Non"],false)}</div>
      <div class="form-group"><label>Tu peux ramener une enceinte Bluetooth ?</label>${choiceGroup("hasSpeaker",["Oui","Non"],false)}</div>
      ${a.hasSpeaker==="Oui" ? `<div class="form-group"><label>Quelle enceinte peux-tu ramener ?</label>${choiceGroup("speakerBrand",speakerBrands,false)}${a.speakerBrand==="Autre"?`<input class="input" data-bind="speakerOther" placeholder="Marque / modèle" value="${esc(a.speakerOther||"")}">`:""}</div>`:""}`;
  }
  if(state.section==="activities"){
    body = `<div class="form-group"><label>Ton programme idéal</label>${choiceGroup("activities",activities)}</div>${(a.activities||[]).includes("Autre idée")?`<input class="input" data-bind="activityOther" placeholder="Ton idée…" value="${esc(a.activityOther||"")}">`:""}`;
  }
  if(state.section==="bring"){
    body = `<div class="form-group"><label>Tu peux ramener quelque chose à la villa ?</label>${choiceGroup("canBring",["Oui","Non"],false)}</div>
      ${a.canBring==="Oui"?`<div class="form-group"><label>Qu’est-ce que tu peux ramener ?</label>${choiceGroup("bringCategories",bringCategories)}</div><textarea class="input" data-bind="bringDetails" placeholder="Précise ce que tu apportes…">${esc(a.bringDetails||"")}</textarea>`:""}`;
  }
  if(state.section==="checklist"){
    const others=sections.filter(s=>s.id!=="checklist");
    body = `<div class="section-grid">${others.map(s=>`<div class="section-card ${sectionDone(s.id)?"done":""}"><h3>${s.icon} ${s.label}</h3><div class="${sectionDone(s.id)?"badge":"badge warn"}">${sectionDone(s.id)?"✓ Complété":"À compléter"}</div><button class="secondary" style="margin-top:12px" data-section="${s.id}">Ouvrir</button></div>`).join("")}</div>
      <button class="primary" style="width:100%;margin-top:20px" data-finish ${sectionDone("checklist")?"":"disabled"}>✨ VALIDER MON SUMMER PASS</button>`;
  }
  return `<div class="app"><div class="main">${participantHero()}<div class="panel">${body}</div>${navButtons()}</div>${state.toast?`<div class="toast">${esc(state.toast)}</div>`:""}</div>`;
}

function organizerSidebar(active){
  const items=[["dashboard","Tableau de bord"],["participants","Participants"],["summaries","Synthèses"],["responses","Réponses détaillées"],["shopping","À prévoir / Liste de courses"],["budget","Budget & Contributions"]];
  return `<aside class="sidebar"><div class="side-brand">🌴 SUMMER CLOSING VILLA</div><div class="side-note">ESPACE ORGANISATRICE</div><div style="margin:24px 0"><strong>Julia</strong><div class="muted" style="color:#f5d49a">Organisatrice</div></div><nav>${items.map(([id,l])=>`<button data-org="${id}" class="${active===id?"active":""}">${l}</button>`).join("")}</nav></aside>`;
}
function mockRows(){
  return participants.map((p,i)=>({name:p,progress:p==="Stéphane"?75:100,status:p==="Stéphane"?"En cours":"Complété",updated:`14 août 2026 · ${17+(i%2)}:${String((i*7)%60).padStart(2,"0")}`}));
}
function orgDashboard(){
  return `<div class="organizer shell">${organizerSidebar("dashboard")}<main class="main"><div class="topbar"><div><h1 class="screen-title">Bienvenue Julia 🌺</h1><div class="subtitle">Aperçu des réponses de tout le monde.</div></div></div>
  <div class="grid cols3"><div class="card"><div class="metric">13</div><b>participants</b></div><div class="card"><div class="metric">12</div><b>Summer Pass complétés</b></div><div class="card"><div class="metric">92%</div><b>taux global</b></div></div>
  <div class="panel" style="margin-top:16px"><h2>Accès rapides</h2><div class="cards">${["Trajet","Repas","Boissons","Playlist","Activités","J’apporte"].map(x=>`<div class="card"><h3>${x}</h3><p class="muted">Synthèse organisée des réponses.</p><button class="secondary" data-org="summaries">Voir la synthèse</button></div>`).join("")}</div></div></main></div>`;
}
function orgParticipants(){
  const rows=mockRows();
  return `<div class="organizer shell">${organizerSidebar("participants")}<main class="main"><h1 class="screen-title">Participants 🌺</h1><div class="grid cols3"><div class="card"><div class="metric">13</div>participants</div><div class="card"><div class="metric">12</div>complétés</div><div class="card"><div class="metric">1</div>en cours</div></div>
  <div class="panel" style="margin-top:16px;overflow:auto"><table class="table"><thead><tr><th>Participant</th><th>Avancement</th><th>Statut</th><th>Dernière mise à jour</th></tr></thead><tbody>${rows.map(r=>`<tr><td><strong>${r.name}</strong></td><td><div class="progress" style="width:180px"><span style="width:${r.progress}%"></span></div>${r.progress}%</td><td><span class="${r.status==="Complété"?"badge":"badge warn"}">${r.status}</span></td><td>${r.updated}</td></tr>`).join("")}</tbody></table></div></main></div>`;
}
function orgSummaries(){
  const cards=[["Trajet","Conducteurs, passagers, heures d’arrivée et retours."],["Repas","Régimes, barbecue, petit-déjeuner et idées de repas."],["Boissons","Softs, cocktails et alcools."],["Playlist","Spotify Premium et enceintes Bluetooth."],["Activités","Ping-pong, baby-foot, jeux, piscine/chill et sport."],["J’apporte","Jeux, matériel de sport, piscine, glacière et autres apports."]];
  return `<div class="organizer shell">${organizerSidebar("summaries")}<main class="main"><h1 class="screen-title">Synthèses 🌺</h1><div class="cards">${cards.map(([t,d])=>`<div class="card"><h2>${t}</h2><p class="muted">${d}</p><button class="primary" data-summary="${t}">Voir la synthèse détaillée</button></div>`).join("")}</div><div id="summaryDetail" class="panel" style="margin-top:16px"><h2>Choisis une synthèse</h2><p class="muted">Les données réelles apparaîtront ici dès que Supabase sera connecté et que les participants auront répondu.</p></div></main></div>`;
}
function orgSimple(view,title){
  return `<div class="organizer shell">${organizerSidebar(view)}<main class="main"><h1 class="screen-title">${title}</h1><div class="panel"><p class="muted">Cette vue est prête à être branchée sur les réponses centralisées Supabase.</p></div></main></div>`;
}
function organizerScreen(){
  if(state.organizerView==="dashboard")return orgDashboard();
  if(state.organizerView==="participants")return orgParticipants();
  if(state.organizerView==="summaries")return orgSummaries();
  if(state.organizerView==="responses")return orgSimple("responses","Réponses détaillées");
  if(state.organizerView==="shopping")return orgSimple("shopping","À prévoir / Liste de courses");
  if(state.organizerView==="budget")return orgSimple("budget","Budget & Contributions");
}
function welcome(){
  return `<div class="hero"><div class="hero-card"><div class="brand">SUMMER CLOSING VILLA</div><h1>SUMMER PASS</h1><p class="subtitle">11 — 14 septembre 2026 · Vérargues</p><button class="primary" data-mode="access">Entrer dans la villa →</button><button class="secondary" style="margin-left:8px" data-mode="organizerAccess">Espace organisatrice</button></div></div>`;
}
function access(){
  return `<div class="hero"><div class="hero-card"><div class="brand">ACCÈS PRIVÉ</div><h1 style="font-size:44px">Bienvenue 🌴</h1><input id="accessCode" class="code" maxlength="9" placeholder="•••••••••"><button class="primary" style="width:100%;margin-top:14px" data-check-access>Valider →</button></div></div>`;
}
function pickParticipant(){
  const preview = "/assets/page3-passports.png";
  return `<div class="app"><main class="main"><h1 class="screen-title">Choisis ton passeport</h1><p class="subtitle">Sélectionne ton prénom pour commencer ton voyage.</p>${true?`<img class="preview-img" src="${preview}" alt="Planche validée des 13 passeports">`:""}
  <div class="passport-grid" style="margin-top:18px">${participants.map(p=>`<button class="passport-card" data-participant="${p}"><div style="height:110px;display:grid;place-items:center;font-size:34px">${initials(p)}</div><strong>${p}</strong></button>`).join("")}</div></main></div>`;
}
function organizerAccess(){
  return `<div class="hero"><div class="hero-card"><div class="brand">ESPACE ORGANISATRICE</div><h1 style="font-size:42px">Accès privé</h1><input id="organizerCode" class="code" placeholder="••••••"><button class="primary" style="width:100%;margin-top:14px" data-check-organizer>Entrer →</button></div></div>`;
}

function render(){
  if(state.mode==="welcome") app.innerHTML=welcome();
  if(state.mode==="access") app.innerHTML=access();
  if(state.mode==="pick") app.innerHTML=pickParticipant();
  if(state.mode==="participant") app.innerHTML=participantScreen();
  if(state.mode==="organizerAccess") app.innerHTML=organizerAccess();
  if(state.mode==="organizer") app.innerHTML=organizerScreen();
  bind();
}
function saveLocal(){
  if(!state.participant) return;
  localStorage.setItem(`summerpass:${state.participant}`,JSON.stringify(state.answers));
}
async function saveRemote(){
  if(!supabase || !state.participant) return;
  const payload={participant_name:state.participant, answers:state.answers, updated_at:new Date().toISOString()};
  await supabase.from("responses").upsert(payload,{onConflict:"participant_name"});
}
function updateBind(el){
  const key=el.dataset.bind;
  state.answers[state.section] ||= {};
  state.answers[state.section][key]=el.value;
  saveLocal(); render();
}
function bind(){
  document.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>{state.mode=b.dataset.mode;render()}));
  document.querySelector("[data-check-access]")?.addEventListener("click",()=>{const v=document.querySelector("#accessCode").value.trim();if(v.toLowerCase()==="villa2026"){state.mode="pick";render()}else toast("Code incorrect")});
  document.querySelector("[data-check-organizer]")?.addEventListener("click",()=>{const v=document.querySelector("#organizerCode").value.trim();if(v==="organisatrice2026"){state.mode="organizer";state.organizerView="dashboard";render()}else toast("Code organisatrice incorrect")});
  document.querySelectorAll("[data-participant]").forEach(b=>b.addEventListener("click",()=>{state.participant=b.dataset.participant;state.answers=JSON.parse(localStorage.getItem(`summerpass:${state.participant}`)||"{}");state.mode="participant";state.section="profile";render()}));
  document.querySelectorAll("[data-section]").forEach(b=>b.addEventListener("click",()=>{state.section=b.dataset.section;render()}));
  document.querySelectorAll("[data-bind]").forEach(el=>el.addEventListener("change",()=>updateBind(el)));
  document.querySelectorAll("textarea[data-bind],input[data-bind]").forEach(el=>el.addEventListener("input",()=>{const key=el.dataset.bind;state.answers[state.section] ||= {};state.answers[state.section][key]=el.value;saveLocal()}));
  document.querySelectorAll("[data-choice-key]").forEach(b=>b.addEventListener("click",()=>{
    const key=b.dataset.choiceKey,val=b.dataset.choiceValue,multiple=b.dataset.multiple==="true";
    state.answers[state.section] ||= {};
    if(multiple){
      const arr=state.answers[state.section][key] ||= [];
      const i=arr.indexOf(val); if(i>=0)arr.splice(i,1); else {
        if(key==="mealIdeas" && arr.length>=3){toast("Maximum 3 idées de repas"); return;}
        arr.push(val);
      }
    } else state.answers[state.section][key]=val;
    saveLocal(); render();
  }));
  document.querySelector("[data-finish]")?.addEventListener("click",async()=>{await saveRemote();toast("Summer Pass enregistré 🌴")});
  document.querySelectorAll("[data-org]").forEach(b=>b.addEventListener("click",()=>{state.mode="organizer";state.organizerView=b.dataset.org;render()}));
  document.querySelectorAll("[data-summary]").forEach(b=>b.addEventListener("click",()=>{const el=document.querySelector("#summaryDetail");el.innerHTML=`<h2>Synthèse détaillée — ${b.dataset.summary}</h2><p class="muted">Les agrégations se calculeront automatiquement depuis la table <code>responses</code> Supabase.</p>`}));
}
render();

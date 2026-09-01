import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const cfg=window.JOI_CONFIG||{};const supabase=createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
let allTeams=[];

const loginCard=document.getElementById("loginCard"),dashboard=document.getElementById("dashboard"),cards=document.getElementById("teamCards");
async function init(){const{data:{session}}=await supabase.auth.getSession();if(session)showDashboard();else showLogin()}
function showLogin(){loginCard.classList.remove("hidden");dashboard.classList.add("hidden")}
async function showDashboard(){loginCard.classList.add("hidden");dashboard.classList.remove("hidden");await loadTeams()}
document.getElementById("loginBtn").onclick=async()=>{const email=document.getElementById("email").value,password=document.getElementById("password").value;const{error}=await supabase.auth.signInWithPassword({email,password});document.getElementById("loginMsg").textContent=error?error.message:"";if(!error)showDashboard()}
document.getElementById("logoutBtn").onclick=async()=>{await supabase.auth.signOut();showLogin()}
document.getElementById("refreshBtn").onclick=loadTeams;
document.getElementById("search").oninput=render;
document.getElementById("ageFilter").onchange=render;

async function loadTeams(){
 const{data,error}=await supabase.from("joi_team_submissions").select("*, joi_team_players(*)").order("created_at",{ascending:false});
 if(error){cards.innerHTML=`<p>${error.message}</p>`;return}
 allTeams=data||[];document.getElementById("totalTeams").textContent=allTeams.length;document.getElementById("totalPlayers").textContent=allTeams.reduce((n,t)=>n+(t.joi_team_players?.length||0),0);document.getElementById("lastSubmitted").textContent=allTeams[0]?new Date(allTeams[0].created_at).toLocaleDateString():"—";render()
}
function render(){
 const q=document.getElementById("search").value.toLowerCase(),age=document.getElementById("ageFilter").value;
 const list=allTeams.filter(t=>(!age||t.age_group===age)&&(!q||`${t.team_name} ${t.head_coach_name}`.toLowerCase().includes(q)));
 cards.innerHTML=list.map(t=>`<article class="team-card"><h3>${esc(t.team_name)}</h3><div class="meta">${esc(t.age_group)} ${t.division?`• ${esc(t.division)}`:""} • ${t.joi_team_players?.length||0} players</div><div class="row"><b>Head Coach:</b> ${esc(t.head_coach_name)}</div><div class="row"><b>Contact:</b> ${esc(t.coach_contact)}</div><div class="row"><b>Submitted:</b> ${new Date(t.created_at).toLocaleString()}</div><button data-id="${t.id}">VIEW / PRINT</button></article>`).join("")||"<p>No submissions found.</p>";
 cards.querySelectorAll("button[data-id]").forEach(b=>b.onclick=()=>openTeam(b.dataset.id))
}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
async function openTeam(id){
 const t=allTeams.find(x=>x.id===id);if(!t)return;let stamp="";
 if(t.stamp_path){const{data}=await supabase.storage.from("joi-team-stamps").createSignedUrl(t.stamp_path,300);stamp=data?.signedUrl||""}
 const players=[...(t.joi_team_players||[])].sort((a,b)=>a.player_no-b.player_no);
 document.getElementById("printArea").innerHTML=`<div class="roster-print"><div class="print-head"><img src="assets/joi-logo.png"><div><h1>OFFICIAL TEAM LIST</h1><small>JUNIOR JOI 2026</small></div><img src="assets/mc-logo.png"></div><div class="info-grid">
 ${field("School",t.team_name)}${field("Age Group",t.age_group)}${field("Division",t.division||"—")}${field("Province",t.province||"—")}
 ${field("Light Kit",t.light_kit_colour)}${field("Dark Kit",t.dark_kit_colour)}${field("Head Coach",t.head_coach_name)}${field("Assistant Coach",t.assistant_coach_name||"—")}
 </div><table class="roster-table"><thead><tr><th>#</th><th>Name</th><th>Surname</th><th>Date of Birth</th><th>Light #</th><th>Dark #</th></tr></thead><tbody>${players.map(p=>`<tr><td>${p.player_no}</td><td>${esc(p.first_name)}</td><td>${esc(p.surname)}</td><td>${esc(p.date_of_birth)}</td><td>${esc(p.light_kit_number)}</td><td>${esc(p.dark_kit_number)}</td></tr>`).join("")}</tbody></table>
 <div class="verify"><div><b>School Head</b><br>${esc(t.school_head_name)}</div><div><b>School MIC</b><br>${esc(t.school_mic_name)}</div><div><b>School Stamp</b>${stamp?`<img class="stamp-img" src="${stamp}">`:"<br>No stamp uploaded"}</div></div>
 <div class="signs"><div><span>HEAD COACH SIGNATURE</span><strong>${esc(t.coach_signature||"")}</strong></div><div><span>SCHOOL HEAD SIGNATURE</span><strong>${esc(t.school_head_signature||"")}</strong></div><div><span>SCHOOL MIC SIGNATURE</span><strong>${esc(t.school_mic_signature||"")}</strong></div></div></div>`;
 document.getElementById("modal").classList.remove("hidden")
}
function field(k,v){return`<div><span>${k}</span><strong>${esc(v)}</strong></div>`}
document.getElementById("closeModal").onclick=()=>document.getElementById("modal").classList.add("hidden");
init();

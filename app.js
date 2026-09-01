import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const cfg=window.JOI_CONFIG||{};
const configured=cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_URL.includes("PASTE_")&&!cfg.SUPABASE_ANON_KEY.includes("PASTE_");
const supabase=configured?createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;

const ids=["teamName","ageGroup","division","province","lightKit","darkKit","headCoach","assistantCoach","coachContact","schoolHead","schoolMic","coachSignature","headSignature","micSignature","coachDate","headDate","micDate"];
const body=document.getElementById("playersBody");
for(let i=1;i<=12;i++){const tr=document.createElement("tr");tr.innerHTML=`<td>${i}</td><td><input data-key="p${i}_name" placeholder="Name"></td><td><input data-key="p${i}_surname" placeholder="Surname"></td><td><input data-key="p${i}_dob" placeholder="YYYY / MM / DD" inputmode="numeric"></td><td><input data-key="p${i}_light" placeholder="e.g. 12"></td><td><input data-key="p${i}_dark" placeholder="e.g. 12"></td>`;body.appendChild(tr)}

const toast=document.getElementById("toast");
function showToast(m,bad=false){toast.textContent=m;toast.style.background=bad?"#b81018":"#111";toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),1800)}
function collect(){const d={};ids.forEach(id=>d[id]=document.getElementById(id).value.trim());d.players=[];for(let i=1;i<=12;i++){d.players.push({player_no:i,name:document.querySelector(`[data-key="p${i}_name"]`).value.trim(),surname:document.querySelector(`[data-key="p${i}_surname"]`).value.trim(),date_of_birth:document.querySelector(`[data-key="p${i}_dob"]`).value.trim(),light_kit_number:document.querySelector(`[data-key="p${i}_light"]`).value.trim(),dark_kit_number:document.querySelector(`[data-key="p${i}_dark"]`).value.trim()})}d.stampDataUrl=document.getElementById("stampPreview").dataset.image||"";return d}
function populate(d){if(!d)return;ids.forEach(id=>{if(d[id]!=null)document.getElementById(id).value=d[id]});(d.players||[]).forEach((p,idx)=>{const i=idx+1;const values={name:p.name||"",surname:p.surname||"",dob:p.date_of_birth||"",light:p.light_kit_number||"",dark:p.dark_kit_number||""};Object.entries(values).forEach(([k,v])=>{const el=document.querySelector(`[data-key="p${i}_${k}"]`);if(el)el.value=v})});if(d.stampDataUrl){const box=document.getElementById("stampPreview");box.dataset.image=d.stampDataUrl;box.innerHTML=`<img src="${d.stampDataUrl}" alt="School stamp">`}}
function validate(d){for(const [label,val] of [["Team / School Name",d.teamName],["Age Group",d.ageGroup],["Light Kit Colour",d.lightKit],["Dark Kit Colour",d.darkKit],["Head Coach",d.headCoach],["Coach Contact",d.coachContact],["School Head",d.schoolHead],["School MIC",d.schoolMic]]){if(!val)return`${label} is required.`}const entered=d.players.filter(p=>p.name||p.surname||p.date_of_birth||p.light_kit_number||p.dark_kit_number);if(!entered.length)return"Please enter at least one player.";for(const p of entered){if(!p.name||!p.surname||!p.date_of_birth||!p.light_kit_number||!p.dark_kit_number)return`Player ${p.player_no}: complete all player fields.`}return""}

document.getElementById("saveBtn").onclick=()=>{localStorage.setItem("joiTeamListDraft",JSON.stringify(collect()));showToast("Draft saved on this device")};
document.getElementById("printBtn").onclick=()=>window.print();
document.getElementById("printSubmitted").onclick=()=>window.print();
document.getElementById("newSubmission").onclick=()=>location.reload();

document.getElementById("stampUpload").addEventListener("change",e=>{const f=e.target.files[0];if(!f)return;if(f.size>5*1024*1024){showToast("Stamp image must be under 5 MB",true);return}const r=new FileReader();r.onload=()=>{const box=document.getElementById("stampPreview");box.dataset.image=r.result;box.innerHTML=`<img src="${r.result}" alt="School stamp">`;localStorage.setItem("joiTeamListDraft",JSON.stringify(collect()))};r.readAsDataURL(f)});

document.getElementById("submitBtn").onclick=async()=>{
 const d=collect(),err=validate(d);if(err){showToast(err,true);return}
 if(!supabase){showToast("Add your Supabase details to config.js.",true);return}
 const btn=document.getElementById("submitBtn");btn.disabled=true;btn.innerHTML="Sending...";
 try{
   const id=crypto.randomUUID();let stampPath=null;
   if(d.stampDataUrl){
     const[meta,b64]=d.stampDataUrl.split(",");const mime=(meta.match(/data:(.*?);/)||[])[1]||"image/png";const ext=mime.includes("jpeg")?"jpg":"png";const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));stampPath=`${id}/school-stamp.${ext}`;
     const{error:e}=await supabase.storage.from("joi-team-stamps").upload(stampPath,bytes,{contentType:mime,upsert:true});if(e)throw e;
   }
   const team={id,team_name:d.teamName,age_group:d.ageGroup,division:d.division||null,light_kit_colour:d.lightKit,dark_kit_colour:d.darkKit,province:d.province||null,head_coach_name:d.headCoach,assistant_coach_name:d.assistantCoach||null,coach_contact:d.coachContact,school_head_name:d.schoolHead,school_mic_name:d.schoolMic,coach_signature:d.coachSignature||null,school_head_signature:d.headSignature||null,school_mic_signature:d.micSignature||null,coach_signature_date:d.coachDate||null,school_head_signature_date:d.headDate||null,school_mic_signature_date:d.micDate||null,stamp_path:stampPath,status:"submitted"};
   let{error}=await supabase.from("joi_team_submissions").insert(team);if(error)throw error;
   const players=d.players.filter(p=>p.name).map(p=>({submission_id:id,player_no:p.player_no,first_name:p.name,surname:p.surname,date_of_birth:p.date_of_birth,light_kit_number:p.light_kit_number,dark_kit_number:p.dark_kit_number}));
   ({error}=await supabase.from("joi_team_players").insert(players));if(error)throw error;
   localStorage.removeItem("joiTeamListDraft");
   document.getElementById("teamForm").classList.add("hidden");document.getElementById("successPanel").classList.remove("hidden");document.getElementById("successRef").textContent=id;
 }catch(e){console.error(e);showToast(e.message||"Could not send team list",true)}
 finally{btn.disabled=false;btn.innerHTML='➤ SEND TEAM LIST<small>Sends directly to Junior JOI</small>'}
};
populate(JSON.parse(localStorage.getItem("joiTeamListDraft")||"null"));

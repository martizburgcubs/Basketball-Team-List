import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const cfg=window.JOI_CONFIG||{};
const configured=cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_URL.includes("PASTE_")&&!cfg.SUPABASE_ANON_KEY.includes("PASTE_");
const supabase=configured?createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;

const ids=["teamName","ageGroup","division","province","lightKit","darkKit","headCoach","assistantCoach","coachContact","schoolHead","schoolMic","coachDate","headDate","micDate"];
const body=document.getElementById("playersBody");

for(let i=1;i<=12;i++){
  const tr=document.createElement("tr");
  tr.innerHTML=`<td>${i}</td>
    <td><input data-key="p${i}_name" placeholder="Name"></td>
    <td><input data-key="p${i}_surname" placeholder="Surname"></td>
    <td><input data-key="p${i}_dob" placeholder="YYYY / MM / DD" inputmode="numeric"></td>
    <td><input data-key="p${i}_light" placeholder="e.g. 12"></td>
    <td><input data-key="p${i}_dark" placeholder="e.g. 12"></td>`;
  body.appendChild(tr);
}

const toast=document.getElementById("toast");
function showToast(m,bad=false){toast.textContent=m;toast.style.background=bad?"#b80e17":"#111";toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),1700)}

function collect(){
  const d={};ids.forEach(id=>d[id]=document.getElementById(id).value.trim());
  d.players=[];
  for(let i=1;i<=12;i++){
    d.players.push({
      player_no:i,
      name:document.querySelector(`[data-key="p${i}_name"]`).value.trim(),
      surname:document.querySelector(`[data-key="p${i}_surname"]`).value.trim(),
      dob:document.querySelector(`[data-key="p${i}_dob"]`).value.trim(),
      light:document.querySelector(`[data-key="p${i}_light"]`).value.trim(),
      dark:document.querySelector(`[data-key="p${i}_dark"]`).value.trim()
    });
  }
  return d;
}
function populate(d){
  if(!d)return;
  ids.forEach(id=>{if(d[id]!=null)document.getElementById(id).value=d[id]});
  (d.players||[]).forEach((p,idx)=>{
    const i=idx+1;
    for(const key of ["name","surname","dob","light","dark"]){
      const el=document.querySelector(`[data-key="p${i}_${key}"]`);
      if(el)el.value=p[key]||"";
    }
  });
}

document.getElementById("saveBtn").onclick=()=>{
  localStorage.setItem("joiTeamListDraft",JSON.stringify(collect()));
  showToast("Draft saved on this device");
};
document.getElementById("printBtn").onclick=()=>window.print();

const signedInput=document.getElementById("signedUpload");
const fileName=document.getElementById("fileName");
signedInput.addEventListener("change",()=>{
  const f=signedInput.files[0];
  fileName.textContent=f?f.name:"No file selected";
});

function safeName(v){
  return (v||"team").trim().replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"").toLowerCase();
}

document.getElementById("uploadBtn").onclick=async()=>{
  const file=signedInput.files[0];
  const status=document.getElementById("uploadStatus");
  if(!file){status.className="upload-status bad";status.textContent="Choose the signed PDF or image first.";return}
  if(file.size>12*1024*1024){status.className="upload-status bad";status.textContent="File must be under 12 MB.";return}
  if(!configured){status.className="upload-status bad";status.textContent="Add your Supabase URL and publishable key in config.js before using uploads.";return}

  const team=document.getElementById("teamName").value.trim();
  const age=document.getElementById("ageGroup").value.trim();
  if(!team||!age){status.className="upload-status bad";status.textContent="Enter the school/team name and age group first.";return}

  const btn=document.getElementById("uploadBtn");
  btn.disabled=true;btn.textContent="UPLOADING...";
  try{
    const ext=(file.name.split(".").pop()||"pdf").toLowerCase();
    const path=`${safeName(team)}/${age}/${Date.now()}-${safeName(team)}-${age}.${ext}`;
    const {error}=await supabase.storage.from("joi-signed-team-lists").upload(path,file,{contentType:file.type||undefined,upsert:false});
    if(error)throw error;
    status.className="upload-status ok";
    status.textContent="Completed team list uploaded successfully. You can now email or WhatsApp the same copy if required.";
  }catch(e){
    console.error(e);
    status.className="upload-status bad";
    status.textContent=e.message||"Upload failed.";
  }finally{
    btn.disabled=false;btn.textContent="UPLOAD COMPLETED COPY";
  }
};

populate(JSON.parse(localStorage.getItem("joiTeamListDraft")||"null"));

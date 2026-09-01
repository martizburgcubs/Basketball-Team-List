import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const cfg = window.JOI_CONFIG || {};
const configured =
  cfg.SUPABASE_URL &&
  cfg.SUPABASE_ANON_KEY &&
  !cfg.SUPABASE_URL.includes("PASTE_") &&
  !cfg.SUPABASE_ANON_KEY.includes("PASTE_");

const supabase = configured ? createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

const ids = [
  "teamName","ageGroup","lightKit","darkKit","headCoach","assistantCoach","coachContact","province",
  "schoolHead","schoolMic","coachSignature","headSignature","micSignature","coachDate","headDate","micDate"
];

const body = document.getElementById("playersBody");
for(let i=1;i<=12;i++){
  const tr=document.createElement("tr");
  tr.innerHTML=`
    <td>${i}</td>
    <td><input data-key="p${i}_name" placeholder="Name"></td>
    <td><input data-key="p${i}_surname" placeholder="Surname"></td>
    <td><input data-key="p${i}_dob" placeholder="YYYY/MM/DD" inputmode="numeric"></td>
    <td><input data-key="p${i}_light" placeholder="#"></td>
    <td><input data-key="p${i}_dark" placeholder="#"></td>`;
  body.appendChild(tr);
}

const toast=document.getElementById("toast");
function showToast(msg, bad=false){
  toast.textContent=msg;
  toast.style.background=bad?"#9f101d":"#071d35";
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),1800);
}

function collect(){
  const data={};
  ids.forEach(id=>data[id]=document.getElementById(id).value.trim());
  data.players=[];
  for(let i=1;i<=12;i++){
    data.players.push({
      player_no:i,
      name:document.querySelector(`[data-key="p${i}_name"]`).value.trim(),
      surname:document.querySelector(`[data-key="p${i}_surname"]`).value.trim(),
      date_of_birth:document.querySelector(`[data-key="p${i}_dob"]`).value.trim(),
      light_kit_number:document.querySelector(`[data-key="p${i}_light"]`).value.trim(),
      dark_kit_number:document.querySelector(`[data-key="p${i}_dark"]`).value.trim()
    });
  }
  data.stampDataUrl=document.getElementById("stampPreview").dataset.image||"";
  return data;
}

function populate(data){
  if(!data)return;
  ids.forEach(id=>{ if(data[id]!=null) document.getElementById(id).value=data[id]; });
  (data.players||[]).forEach((p,idx)=>{
    const i=idx+1;
    ["name","surname","date_of_birth","light_kit_number","dark_kit_number"].forEach(k=>{
      const map={name:"name",surname:"surname",date_of_birth:"dob",light_kit_number:"light",dark_kit_number:"dark"};
      const el=document.querySelector(`[data-key="p${i}_${map[k]}"]`);
      if(el)el.value=p[k]||"";
    });
  });
  if(data.stampDataUrl){
    const box=document.getElementById("stampPreview");
    box.dataset.image=data.stampDataUrl;
    box.innerHTML=`<img src="${data.stampDataUrl}" alt="School stamp">`;
  }
}

function validate(data){
  const required=[
    ["Team / School Name",data.teamName],["Age Group",data.ageGroup],["Light Kit Colour",data.lightKit],
    ["Dark Kit Colour",data.darkKit],["Head Coach",data.headCoach],["Coach Contact",data.coachContact],
    ["School Head",data.schoolHead],["School MIC",data.schoolMic]
  ];
  for(const [label,val] of required){if(!val)return `${label} is required.`}
  for(const p of data.players){
    if(p.name || p.surname || p.date_of_birth || p.light_kit_number || p.dark_kit_number){
      if(!p.name || !p.surname || !p.date_of_birth || !p.light_kit_number || !p.dark_kit_number)
        return `Player ${p.player_no}: complete all player fields.`;
    }
  }
  if(data.players.filter(p=>p.name).length===0)return "Please enter at least one player.";
  return "";
}

document.getElementById("saveBtn").onclick=()=>{
  localStorage.setItem("joiTeamListDraft",JSON.stringify(collect()));
  showToast("Draft saved on this device");
};

document.getElementById("printBtn").onclick=()=>window.print();

document.getElementById("stampUpload").addEventListener("change",e=>{
  const f=e.target.files[0]; if(!f)return;
  if(f.size>5*1024*1024){showToast("Stamp image must be under 5 MB",true);return;}
  const r=new FileReader();
  r.onload=()=>{
    const box=document.getElementById("stampPreview");
    box.dataset.image=r.result;
    box.innerHTML=`<img src="${r.result}" alt="School stamp">`;
    localStorage.setItem("joiTeamListDraft",JSON.stringify(collect()));
  };
  r.readAsDataURL(f);
});

document.getElementById("submitBtn").onclick=async()=>{
  const data=collect();
  const err=validate(data);
  if(err){showToast(err,true);return;}
  if(!supabase){showToast("Add your Supabase URL and anon key in config.js first.",true);return;}

  const btn=document.getElementById("submitBtn");
  btn.disabled=true; btn.textContent="Submitting...";

  try{
    const submissionId=crypto.randomUUID();
    let stampPath=null;

    if(data.stampDataUrl){
      const [meta,b64]=data.stampDataUrl.split(",");
      const mime=(meta.match(/data:(.*?);/)||[])[1]||"image/png";
      const ext=mime.includes("jpeg")?"jpg":"png";
      const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
      stampPath=`${submissionId}/school-stamp.${ext}`;
      const {error:upErr}=await supabase.storage.from("joi-team-stamps").upload(stampPath,bytes,{contentType:mime,upsert:true});
      if(upErr)throw upErr;
    }

    const teamRow={
      id:submissionId,
      team_name:data.teamName,
      age_group:data.ageGroup,
      light_kit_colour:data.lightKit,
      dark_kit_colour:data.darkKit,
      province:data.province||null,
      head_coach_name:data.headCoach,
      assistant_coach_name:data.assistantCoach||null,
      coach_contact:data.coachContact,
      school_head_name:data.schoolHead,
      school_mic_name:data.schoolMic,
      coach_signature:data.coachSignature||null,
      school_head_signature:data.headSignature||null,
      school_mic_signature:data.micSignature||null,
      coach_signature_date:data.coachDate||null,
      school_head_signature_date:data.headDate||null,
      school_mic_signature_date:data.micDate||null,
      stamp_path:stampPath,
      status:"submitted"
    };

    const {error:teamErr}=await supabase.from("joi_team_submissions").insert(teamRow);
    if(teamErr)throw teamErr;

    const players=data.players.filter(p=>p.name).map(p=>({
      submission_id:submissionId,
      player_no:p.player_no,
      first_name:p.name,
      surname:p.surname,
      date_of_birth:p.date_of_birth,
      light_kit_number:p.light_kit_number,
      dark_kit_number:p.dark_kit_number
    }));
    const {error:playerErr}=await supabase.from("joi_team_players").insert(players);
    if(playerErr)throw playerErr;

    localStorage.removeItem("joiTeamListDraft");
    showToast("Team submitted successfully");
    setTimeout(()=>alert(`Submission complete.\nReference: ${submissionId}`),300);
  }catch(e){
    console.error(e);
    showToast(e.message||"Submission failed",true);
  }finally{
    btn.disabled=false; btn.textContent="Submit Team";
  }
};

populate(JSON.parse(localStorage.getItem("joiTeamListDraft")||"null"));

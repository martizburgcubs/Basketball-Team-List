const body = document.getElementById("playersBody");

for(let i=1;i<=12;i++){
  const tr=document.createElement("tr");
  tr.innerHTML=`
    <td>${i}</td>
    <td><input data-key="p${i}_name" placeholder="First name"></td>
    <td><input data-key="p${i}_surname" placeholder="Surname"></td>
    <td><input data-key="p${i}_dob" placeholder="YYYY / MM / DD" inputmode="numeric"></td>
    <td><input data-key="p${i}_light" placeholder="#"></td>
    <td><input data-key="p${i}_dark" placeholder="#"></td>`;
  body.appendChild(tr);
}

const fieldIds=[
  "teamName","ageGroup","division","province","lightKit","darkKit",
  "headCoach","assistantCoach","coachContact","schoolHead","schoolMic",
  "coachDate","headDate","micDate"
];

function collect(){
  const data={};

  fieldIds.forEach(id=>{
    data[id]=document.getElementById(id).value;
  });

  data.players=[];

  for(let i=1;i<=12;i++){
    data.players.push({
      name:document.querySelector(`[data-key="p${i}_name"]`).value,
      surname:document.querySelector(`[data-key="p${i}_surname"]`).value,
      dob:document.querySelector(`[data-key="p${i}_dob"]`).value,
      light:document.querySelector(`[data-key="p${i}_light"]`).value,
      dark:document.querySelector(`[data-key="p${i}_dark"]`).value
    });
  }

  return data;
}

function restore(data){
  if(!data)return;

  fieldIds.forEach(id=>{
    if(data[id]!==undefined){
      document.getElementById(id).value=data[id];
    }
  });

  (data.players||[]).forEach((player,index)=>{
    const i=index+1;
    if(i>12)return;

    for(const key of ["name","surname","dob","light","dark"]){
      const input=document.querySelector(`[data-key="p${i}_${key}"]`);
      if(input) input.value=player[key]||"";
    }
  });
}

const toast=document.getElementById("toast");

function notify(message){
  toast.textContent=message;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),1600);
}

document.getElementById("saveBtn").addEventListener("click",()=>{
  localStorage.setItem("juniorJoiTeamListDraft",JSON.stringify(collect()));
  notify("Draft saved on this device");
});

document.getElementById("printBtn").addEventListener("click",()=>{
  window.print();
});

restore(JSON.parse(localStorage.getItem("juniorJoiTeamListDraft")||"null"));

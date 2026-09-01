const playersBody = document.getElementById("playersBody");

for(let i=1;i<=12;i++){
  const row=document.createElement("tr");
  row.innerHTML=`
    <td>${i}</td>
    <td><input data-field="p${i}_name" placeholder="First name"></td>
    <td><input data-field="p${i}_surname" placeholder="Surname"></td>
    <td><input data-field="p${i}_dob" placeholder="YYYY / MM / DD" inputmode="numeric"></td>
    <td><input data-field="p${i}_light" placeholder="#"></td>
    <td><input data-field="p${i}_dark" placeholder="#"></td>`;
  playersBody.appendChild(row);
}

const normalFields=[
  "teamName","ageGroup","division","province",
  "lightKit","darkKit","headCoach","assistantCoach",
  "coachContact","schoolHead","schoolMic",
  "coachDate","headDate","micDate"
];

function getData(){
  const data={};
  normalFields.forEach(id=>{
    data[id]=document.getElementById(id).value;
  });

  data.players=[];

  for(let i=1;i<=12;i++){
    const player={};

    ["name","surname","dob","light","dark"].forEach(key=>{
      player[key]=document.querySelector(`[data-field="p${i}_${key}"]`).value;
    });

    data.players.push(player);
  }

  return data;
}

function restoreData(data){
  if(!data)return;

  normalFields.forEach(id=>{
    if(data[id]!==undefined){
      document.getElementById(id).value=data[id];
    }
  });

  (data.players||[]).forEach((player,index)=>{
    const i=index+1;
    if(i>12)return;

    ["name","surname","dob","light","dark"].forEach(key=>{
      const input=document.querySelector(`[data-field="p${i}_${key}"]`);
      if(input) input.value=player[key]||"";
    });
  });
}

const toast=document.getElementById("toast");

function showToast(message){
  toast.textContent=message;
  toast.classList.add("show");
  window.setTimeout(()=>toast.classList.remove("show"),1600);
}

document.getElementById("saveBtn").addEventListener("click",()=>{
  localStorage.setItem(
    "juniorJoiTeamListDraft",
    JSON.stringify(getData())
  );

  showToast("Draft saved on this device");
});

document.getElementById("printBtn").addEventListener("click",()=>{
  window.print();
});

restoreData(
  JSON.parse(
    localStorage.getItem("juniorJoiTeamListDraft") || "null"
  )
);

const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const toast=msg=>{const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2400)};
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
function go(page){$$(".page").forEach(p=>p.classList.toggle("active",p.id===page));$$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));$("#pageTitle").textContent=({dashboard:"Dashboard",assistant:"AI Learning Assistant",quizzes:"Quizzes & Exams",progress:"Student Performance",timetable:"Study Timetable",notes:"Ask My Notes",library:"Online Library",materials:"Subjects & Materials",users:"Users & Permissions",usage:"Platform Usage"})[page]||"Dashboard";window.scrollTo(0,0)}
$$(".nav-item").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
$("#profileBtn").addEventListener("click",()=>toast("Profile settings are a demo preview."));
$("#historyBtn").addEventListener("click",()=>{const h=read("eduviaHistory",[]);alert(h.length?"Saved conversation prompts:\\n\\n"+h.slice(-8).join("\\n"):"No saved conversations yet. Start a chat to save prompts.");});
const replies=[
"Let's break this topic into smaller steps. First, identify the key idea, then look at one example, and finally try a practice question. This is sample guidance in the EDUVIA demo.",
"Here is a simple way to study this: 1) Read the definition. 2) Write the main points in your own words. 3) Work through an example. 4) Test yourself without looking at your notes.",
"Good question! Start by explaining what you already understand. Then list the part that feels difficult. We can organize it into a definition, an example, and a short practice activity. This is a demonstration response."
];
function addMessage(text,who){const el=document.createElement("div");el.className="message "+(who==="user"?"user-msg":"assistant-msg");const b=document.createElement("b");b.textContent=who==="user"?"YOU":"EDUVIA AI";const p=document.createElement("p");p.textContent=text;el.append(b,p);$("#chatMessages").append(el);$("#chatMessages").scrollTop=$("#chatMessages").scrollHeight;}
function sendChat(text){if(!text.trim())return;addMessage(text,"user");let h=read("eduviaHistory",[]);h.push(text);save("eduviaHistory",h);$("#chatInput").value="";setTimeout(()=>addMessage(replies[Math.floor(Math.random()*replies.length)],"assistant"),350);}
$("#chatForm").addEventListener("submit",e=>{e.preventDefault();sendChat($("#chatInput").value)});
$$("[data-prompt]").forEach(b=>b.addEventListener("click",()=>sendChat(b.dataset.prompt)));
$("#clearChat").addEventListener("click",()=>{$("#chatMessages").innerHTML="";addMessage("Chat cleared. What would you like to study next?","assistant")});

const questions=[
{q:"Which part of a plant cell carries out photosynthesis?",a:["Nucleus","Chloroplast","Cell membrane","Mitochondrion"],correct:1},
{q:"What is the chemical symbol for water?",a:["CO₂","O₂","H₂O","NaCl"],correct:2},
{q:"Which force pulls objects toward Earth?",a:["Friction","Gravity","Magnetism","Pressure"],correct:1},
{q:"What is the largest organ of the human body?",a:["Heart","Liver","Skin","Lung"],correct:2},
{q:"Which gas do humans need for respiration?",a:["Oxygen","Nitrogen","Helium","Hydrogen"],correct:0}
];let qi=0,answers=[];
function renderQuestion(){const q=questions[qi];$("#quizArea").innerHTML=`<div class="question"><span class="eyebrow">QUESTION ${qi+1} OF ${questions.length}</span><h3>${q.q}</h3><div id="options">${q.a.map((x,i)=>`<button class="option" data-option="${i}">${String.fromCharCode(65+i)}. ${x}</button>`).join("")}</div><button class="primary" id="nextQuestion" disabled>${qi===questions.length-1?"Finish quiz":"Next question →"}</button></div>`;let selected=null;$$("[data-option]").forEach(b=>b.addEventListener("click",()=>{selected=Number(b.dataset.option);$$("[data-option]").forEach(x=>x.classList.toggle("selected",x===b));$("#nextQuestion").disabled=false;}));$("#nextQuestion").addEventListener("click",()=>{answers[qi]=selected;qi++;if(qi<questions.length)renderQuestion();else finishQuiz();});}
function finishQuiz(){const score=answers.reduce((n,a,i)=>n+(a===questions[i].correct?1:0),0);let stats=read("eduviaStats",{count:12,total:984});stats.count++;stats.total+=score*20;save("eduviaStats",stats);$("#quizArea").innerHTML=`<div class="quiz-start"><div class="big-icon">✦</div><h3>You scored ${score}/${questions.length}</h3><p>${score>=4?"Great work! Keep building your knowledge.":"Good effort. Review the topics and try again."}</p><button class="primary" id="retryQuiz">Try again</button></div>`;$("#retryQuiz").addEventListener("click",startQuiz);updateStats();toast("Your practice result was saved on this device.");}
function startQuiz(){qi=0;answers=[];renderQuestion()}$("#startQuiz").addEventListener("click",startQuiz);
function updateStats(){let s=read("eduviaStats",{count:12,total:984});let avg=Math.round(s.total/(s.count*20)*100);$("#quizStat").textContent=s.count;$("#progressQuizzes").textContent=s.count;$("#averageStat").textContent=avg+"%";$("#progressAverage").textContent=avg+"%";}updateStats();

function renderPlan(){const items=read("eduviaPlan",[]);$("#planList").innerHTML=items.length?items.map((x,i)=>`<div class="task"><span class="task-dot purple-dot"></span><div><strong>${escapeHtml(x.subject)}</strong><small>${x.day} • ${x.duration}</small></div><span class="task-time">${x.time}</span><button class="text-btn" data-remove="${i}">Remove</button></div>`).join(""):'<p class="empty">No custom sessions yet. Add your first study session above.</p>';$$("[data-remove]").forEach(b=>b.addEventListener("click",()=>{let a=read("eduviaPlan",[]);a.splice(Number(b.dataset.remove),1);save("eduviaPlan",a);renderPlan()}));}
$("#planForm").addEventListener("submit",e=>{e.preventDefault();let a=read("eduviaPlan",[]);a.push({subject:$("#subjectInput").value,day:$("#dayInput").value,time:$("#timeInput").value,duration:$("#durationInput").value});save("eduviaPlan",a);$("#subjectInput").value="";renderPlan();toast("Study session added.");});$("#clearPlan").addEventListener("click",()=>{save("eduviaPlan",[]);renderPlan()});renderPlan();

function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderNotes(query=""){let notes=read("eduviaNotes",[]);let found=notes.filter(n=>(n.title+" "+n.body).toLowerCase().includes(query.toLowerCase()));$("#noteResults").innerHTML=found.length?found.map(n=>`<div class="note-card"><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.body.slice(0,230))}${n.body.length>230?"…":""}</p></div>`).join(""):'<p class="empty">No matching notes found.</p>';}
$("#saveNote").addEventListener("click",()=>{let title=$("#noteTitle").value.trim(),body=$("#noteBody").value.trim();if(!title||!body){toast("Add a title and some notes first.");return;}let a=read("eduviaNotes",[]);a.push({title,body});save("eduviaNotes",a);$("#noteTitle").value="";$("#noteBody").value="";renderNotes($("#noteSearch").value);toast("Notes saved on this device.");});$("#noteSearch").addEventListener("input",e=>renderNotes(e.target.value));renderNotes();

$$("[data-resource]").forEach(b=>b.addEventListener("click",()=>{let name=b.dataset.resource;go("assistant");sendChat("Help me revise "+name+" with a short explanation and practice questions.");}));
$("#materialForm").addEventListener("submit",e=>{e.preventDefault();let v=$("#materialInput").value.trim();if(!v)return;let el=document.createElement("div");el.className="task";let dot=document.createElement("span");dot.className="task-dot blue-dot";let d=document.createElement("div"),strong=document.createElement("strong");strong.textContent=v;d.append(strong);el.append(dot,d);$("#materialList").append(el);$("#materialInput").value="";toast("Demo material added to this page.");});

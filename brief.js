!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','1999638007347637');
fbq('track','PageView');

const steps=[...document.querySelectorAll('.step')];
const next=document.querySelector('#next');
const back=document.querySelector('#back');
const send=document.querySelector('#submit');
const bar=document.querySelector('.progress em');
const count=document.querySelector('#counter');
const caption=document.querySelector('#caption');
const automationEndpoint='https://script.google.com/macros/s/AKfycbzAOYiXTkA90rbTYyGV15uk7dJ7IbtA9herqE6teOzLO8j9zh7HnOGvANfoX0JxTTM/exec';
let active=0;
const labels=['Знайомство','Аудиторія й ціль','Сенс і візуал','Матеріали й запуск'];

function draw(){
  steps.forEach((step,index)=>step.classList.toggle('active',index===active));
  back.style.visibility=active?'visible':'hidden';
  next.style.display=active===3?'none':'block';
  send.style.display=active===3?'block':'none';
  count.textContent=`0${active+1}`;
  caption.textContent=labels[active];
  bar.style.width=`${25*(active+1)}%`;
}

function valid(){
  const invalid=[...steps[active].querySelectorAll('[required]')].find(field=>!field.checkValidity());
  if(invalid){invalid.reportValidity();return false;}
  return true;
}

next.onclick=()=>{if(valid()){active++;draw();scrollTo({top:0,behavior:'smooth'});}};
back.onclick=()=>{active--;draw();scrollTo({top:0,behavior:'smooth'});};

document.querySelector('#brief').onsubmit=async event=>{
  event.preventDefault();
  if(!valid())return;
  const data=Object.fromEntries(new FormData(event.target).entries());
  data.type='brief';
  data.leadId=new URLSearchParams(location.search).get('lead')||'';
  data.style=[...document.querySelectorAll('[name=style]:checked')].map(input=>input.value);
  try{
    await fetch(automationEndpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(data)});
    if(typeof window.fbq==='function')window.fbq('track','CompleteRegistration',{content_name:'Project brief'});
    document.querySelector('#thanks').classList.add('show');
  }catch{
    alert('Не вдалося надіслати бриф. Спробуйте ще раз.');
  }
};
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','1999638007347637');
fbq('track','PageView');

const steps=[...document.querySelectorAll('.step')];
const next=document.querySelector('#next');
const back=document.querySelector('#back');
const send=document.querySelector('#submit');
const bar=document.querySelector('.progress em');
const count=document.querySelector('#counter');
const caption=document.querySelector('#caption');
const automationEndpoint='https://script.google.com/macros/s/AKfycbzAOYiXTkA90rbTYyGV15uk7dJ7IbtA9herqE6teOzLO8j9zh7HnOGvANfoX0JxTTM/exec';
let active=0;
const labels=['Знайомство','Аудиторія й ціль','Сенс і візуал','Матеріали й запуск'];

function draw(){
  steps.forEach((step,index)=>step.classList.toggle('active',index===active));
  back.style.visibility=active?'visible':'hidden';
  next.style.display=active===3?'none':'block';
  send.style.display=active===3?'block':'none';
  count.textContent=`0${active+1}`;
  caption.textContent=labels[active];
  bar.style.width=`${25*(active+1)}%`;
}

function valid(){
  const invalid=[...steps[active].querySelectorAll('[required]')].find(field=>!field.checkValidity());
  if(invalid){invalid.reportValidity();return false;}
  return true;
}

next.onclick=()=>{if(valid()){active++;draw();scrollTo({top:0,behavior:'smooth'});}};
back.onclick=()=>{active--;draw();scrollTo({top:0,behavior:'smooth'});};

document.querySelector('#brief').onsubmit=async event=>{
  event.preventDefault();
  if(!valid())return;
  const data=Object.fromEntries(new FormData(event.target).entries());
  data.type='brief';
  data.leadId=new URLSearchParams(location.search).get('lead')||'';
  data.style=[...document.querySelectorAll('[name=style]:checked')].map(input=>input.value);
  try{
    await fetch(automationEndpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(data)});
    if(typeof window.fbq==='function')window.fbq('track','CompleteRegistration',{content_name:'Project brief'});
    document.querySelector('#thanks').classList.add('show');
  }catch{
    alert('Не вдалося надіслати бриф. Спробуйте ще раз.');
  }
};

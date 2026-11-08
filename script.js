const slides=[...document.querySelectorAll(".slide")];let current=0;
function render(){slides.forEach((s,i)=>s.classList.toggle("active",i===current));document.getElementById("pageNo").textContent=`${String(current+1).padStart(2,"0")} / ${String(slides.length).padStart(2,"0")}`;document.getElementById("progressBar").style.width=((current+1)/slides.length*100)+"%";}
function goTo(n){current=Math.max(0,Math.min(slides.length-1,n));render()}
function next(){goTo(current+1)}
function prev(){goTo(current-1)}
function openMenu(){document.getElementById("menu").classList.toggle("hidden")}
document.addEventListener("keydown",e=>{if(e.key==="ArrowRight"||e.key===" "){next()}else if(e.key==="ArrowLeft"){prev()}else if(e.key==="Escape"){document.getElementById("menu").classList.add("hidden")}});
let touchX=0;document.addEventListener("touchstart",e=>touchX=e.changedTouches[0].screenX);document.addEventListener("touchend",e=>{let d=e.changedTouches[0].screenX-touchX;if(Math.abs(d)>60)d<0?next():prev()});
render();

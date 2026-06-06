const slides=document.querySelectorAll('.slide'),counter=document.getElementById('slide-counter'),prevBtn=document.getElementById('prev-btn'),nextBtn=document.getElementById('next-btn'),container=document.getElementById('deck-container');
const SW=864,SH=1440;
let cur=parseInt(localStorage.getItem('minhwa-deck-pos'))||0;
if(cur>=slides.length)cur=0;
function update(){slides.forEach((s,i)=>s.classList.toggle('active',i===cur));counter.innerText=`${cur+1} / ${slides.length}`;localStorage.setItem('minhwa-deck-pos',cur);}
function next(){if(cur<slides.length-1){cur++;update();}}
function prev(){if(cur>0){cur--;update();}}
function resize(){const scale=Math.min(window.innerWidth/SW,window.innerHeight/SH);container.style.transform=`translate(-50%,-50%) scale(${scale})`;}
window.addEventListener('resize',resize);
window.addEventListener('orientationchange',()=>setTimeout(resize,100));
window.addEventListener('keydown',e=>{
    if(document.getElementById('image-viewer').classList.contains('viewer-hidden') === false) return; // 뷰어가 열려있을 땐 슬라이드 넘김 방지
    if(['ArrowRight',' ','PageDown'].includes(e.key)){e.preventDefault();next();}
    if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();prev();}
});
prevBtn.addEventListener('click',e=>{e.stopPropagation();prev();});
nextBtn.addEventListener('click',e=>{e.stopPropagation();next();});
let tsX=0;
window.addEventListener('touchstart',e=>{tsX=e.changedTouches[0].screenX;},{passive:true});
window.addEventListener('touchend',e=>{
    if(document.getElementById('image-viewer').classList.contains('viewer-hidden') === false) return;
    const dX=e.changedTouches[0].screenX-tsX;if(dX<-50)next();if(dX>50)prev();
},{passive:true});
resize();update();

// Auto-hide Controls
const navControls = document.getElementById('nav-controls');
let hideTimeout;
function showControls() {
    navControls.classList.add('visible');
    counter.classList.add('visible');
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
        navControls.classList.remove('visible');
        counter.classList.remove('visible');
    }, 3000);
}
function hideControls() {
    navControls.classList.remove('visible');
    counter.classList.remove('visible');
    clearTimeout(hideTimeout);
}
function toggleControls() {
    if (navControls.classList.contains('visible')) {
        hideControls();
    } else {
        showControls();
    }
}
// 터치나 클릭 시 컨트롤 토글
['click', 'touchstart'].forEach(evt => {
    container.addEventListener(evt, (e) => {
        // 이미지 줌 이벤트와 겹치지 않도록 주의 (필요시 e.target 체크)
        if (e.target.classList.contains('zoomable')) return;
        toggleControls();
    }, {passive: true});
});
// 초기 실행 시 잠깐 보여줌
showControls();

// Viewer Logic
const viewer=document.getElementById('image-viewer'), vImg=document.getElementById('viewer-img'), vClose=document.querySelector('.viewer-close'), vBg=document.querySelector('.viewer-backdrop');
let sc=1, pX=0, pY=0, isD=false, stX, stY, iDist=0, iSc=1;
function uT(){vImg.style.transform=`translate(${pX}px,${pY}px) scale(${sc})`;}
document.querySelectorAll('.zoomable').forEach(img=>{
    img.addEventListener('click',e=>{
        e.stopPropagation(); vImg.src=e.target.src; viewer.classList.remove('viewer-hidden');
        sc=1; pX=0; pY=0; uT();
    });
});
const closeV = () => viewer.classList.add('viewer-hidden');
vClose.addEventListener('click', closeV);
vBg.addEventListener('click', closeV);

vImg.addEventListener('pointerdown',e=>{isD=true;stX=e.clientX-pX;stY=e.clientY-pY;vImg.setPointerCapture(e.pointerId);});
vImg.addEventListener('pointermove',e=>{if(!isD)return;pX=e.clientX-stX;pY=e.clientY-stY;uT();});
vImg.addEventListener('pointerup',e=>{isD=false;vImg.releasePointerCapture(e.pointerId);});
vImg.addEventListener('wheel',e=>{e.preventDefault();sc+=e.deltaY*-0.005;sc=Math.min(Math.max(0.5,sc),5);uT();});
vImg.addEventListener('touchstart',e=>{
    if(e.touches.length===2){ iDist=Math.hypot(e.touches[0].pageX-e.touches[1].pageX, e.touches[0].pageY-e.touches[1].pageY); iSc=sc; }
},{passive:false});
vImg.addEventListener('touchmove',e=>{
    if(e.touches.length===2){
        e.preventDefault();
        const dist=Math.hypot(e.touches[0].pageX-e.touches[1].pageX, e.touches[0].pageY-e.touches[1].pageY);
        sc=Math.min(Math.max(0.5,iSc*(dist/iDist)),5); uT();
    }
},{passive:false});
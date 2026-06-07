const slides=document.querySelectorAll('.slide'),counter=document.getElementById('slide-counter'),prevBtn=document.getElementById('prev-btn'),nextBtn=document.getElementById('next-btn'),container=document.getElementById('deck-container');
const SW=864,SH=1440;
let cur=parseInt(localStorage.getItem('minhwa-deck-pos'))||0;
if(cur>=slides.length)cur=0;
function loadSlideImages(idx) {
    if (idx < 0 || idx >= slides.length) return;
    const s = slides[idx];
    if (s.dataset.bg) {
        s.style.backgroundImage = `url('${s.dataset.bg}')`;
        delete s.dataset.bg;
    }
    s.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        delete img.dataset.src;
    });
}
function update(){
    slides.forEach((s,i)=>s.classList.toggle('active',i===cur));
    counter.innerText=`${cur+1} / ${slides.length}`;
    localStorage.setItem('minhwa-deck-pos',cur);
    [cur-1, cur, cur+1].forEach(loadSlideImages);
}
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
function toggleControls(e) {
    if (e) {
        if (e.target.closest('#nav-controls') || e.target.closest('#slide-counter') || e.target.classList.contains('zoomable')) return;
    }
    if (navControls.classList.contains('visible')) {
        hideControls();
    } else {
        showControls();
    }
}

// 터치 기기에서 즉각적인 반응을 위해 touchend 사용
container.addEventListener('touchend', (e) => {
    // 줌 동작 중이거나 여러 손가락일 때는 무시
    if (e.touches.length > 0) return;
    
    // 버튼, 카운터, 이미지 줌 클릭 시에는 토글하지 않음
    if (e.target.closest('#nav-controls') || e.target.closest('#slide-counter') || e.target.classList.contains('zoomable')) return;

    // 브라우저의 기본 click 이벤트 발생을 막아 중복 토글(Ghost Click) 방지
    e.preventDefault();
    toggleControls();
}, {passive: false});

// PC 환경을 위해 click 이벤트 유지 (touchend에서 preventDefault를 했으므로 모바일에서는 중복 실행 안 됨)
container.addEventListener('click', (e) => {
    toggleControls(e);
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
/* Braxart — gemeinsames Script: Navigation, Scroll-Animationen, Lightbox, Kontaktformular */
(function(){
  var doc=document.documentElement;
  doc.classList.add('js');

  // Materialien: Symbol, Name, Kurzinfo, hervorgehoben?
  var I='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var MAT={
    spray:[I+'<rect x="7" y="8" width="10" height="13" rx="2"/><path d="M9 8V6h6v2M11 6V4h2v2M19 5h.01M21 3h.01M21 7h.01"/></svg>','Montana-Sprühdosen','Farbflächen, Verläufe und Graffiti'],
    posca:[I+'<path d="M15 4l5 5-10 10H5v-5L15 4z"/><path d="M13 6l5 5"/></svg>','Posca-Marker','Linien, Konturen und Details'],
    collage:[I+'<circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8 8.5L20 16M8 15.5L20 8"/></svg>','Magazin-Collage','ausgeschnitten und aufgeklebt',1],
    money:[I+'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6.5 9.5h.01M17.5 14.5h.01"/></svg>','Echte Dollarnoten','im Hintergrund eingearbeitet',1]
  };


  // Navigation: Rahmen beim Scrollen, Mobilmenü
  var nav=document.querySelector('.nav');
  function onScroll(){if(nav)nav.classList.toggle('scrolled',window.scrollY>8);}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  var burger=document.querySelector('.burger');
  if(burger){
    burger.addEventListener('click',function(){
      var open=doc.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded',open);
    });
    document.querySelectorAll('.mmenu a').forEach(function(a){
      a.addEventListener('click',function(){doc.classList.remove('menu-open');});
    });
  }

  // Einblenden beim Scrollen
  var reveals=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
    },{rootMargin:'0px 0px -8% 0px',threshold:.08});
    reveals.forEach(function(el){io.observe(el);});
  }else{reveals.forEach(function(el){el.classList.add('in');});}

  // Bilder: Platzhalter entfernen, sobald geladen (auch bei Fehler, damit nichts hängen bleibt)
  document.querySelectorAll('.art img').forEach(function(img){
    var a=img.closest('.art');function done(){a.classList.add('ld');}
    if(img.complete&&img.naturalWidth)done();else{img.addEventListener('load',done);img.addEventListener('error',done);}
  });

  // Lightbox für alle Elemente mit .art[data-title]
  var arts=[].slice.call(document.querySelectorAll('.art[data-title]'));
  if(arts.length){buildLightbox(arts);}

  function buildLightbox(arts){
    var lb=document.createElement('div');
    lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Werk-Ansicht');
    lb.innerHTML=
      '<div class="lb-stage">'+
        '<span class="lb-count"></span>'+
        '<button class="lb-btn lb-prev" aria-label="Vorheriges Werk">‹</button>'+
        '<img class="lb-img" alt="">'+
        '<button class="lb-btn lb-next" aria-label="Nächstes Werk">›</button>'+
      '</div>'+
      '<aside class="lb-side">'+
        '<h2 class="lb-title"></h2>'+
        '<div class="lb-meta"></div>'+
        '<p class="lb-desc"></p>'+
        '<a class="btn btn-dark lb-ask" href="kontakt.html">Dieses Werk anfragen</a>'+
        '<div class="lb-mat"><small>Material</small><ul></ul><p class="note"></p></div>'+
        '<div class="lb-scale"><small>Größenvergleich (Person 1,75 m)</small><div class="lb-svg"></div></div>'+
      '</aside>'+
      '<button class="lb-btn lb-close" aria-label="Schließen">✕</button>';
    document.body.appendChild(lb);
    var img=lb.querySelector('.lb-img'),idx=0,lastFocus=null;

    function show(i){
      idx=(i+arts.length)%arts.length;
      var a=arts[idx],src=a.querySelector('img');
      img.classList.remove('ready');
      img.onload=function(){img.classList.add('ready');};
      img.src=a.dataset.full||src.currentSrc||src.src;
      img.alt=src.alt;
      if(img.complete)img.classList.add('ready');
      lb.querySelector('.lb-title').textContent=a.dataset.title;
      var meta='';
      if(a.dataset.size)meta+='<span class="chip chip-accent">'+a.dataset.size+'</span>';
      if(a.dataset.year)meta+='<span class="chip">'+a.dataset.year+'</span>';
      meta+='<span class="chip">Handgemalt · Unikat</span>';
      lb.querySelector('.lb-meta').innerHTML=meta;
      lb.querySelector('.lb-desc').textContent=a.dataset.desc||'';
      lb.querySelector('.lb-ask').href='kontakt.html?werk='+encodeURIComponent(a.dataset.title+(a.dataset.size?' ('+a.dataset.size+')':''));
      lb.querySelector('.lb-svg').innerHTML=scaleSVG(+a.dataset.w,+a.dataset.h);
      var mat=lb.querySelector('.lb-mat'),html='';
      (a.dataset.mat||'spray,posca').split(',').forEach(function(k,i){
        var d=MAT[k];if(d)html+='<li class="'+(d[3]?'hi':'')+'" style="transition-delay:'+(.12+i*.09)+'s">'+d[0]+'<div><b>'+d[1]+'</b><span>'+d[2]+'</span></div></li>';
      });
      mat.querySelector('ul').innerHTML=html;
      mat.querySelector('.note').textContent=a.dataset.note||'';
      mat.classList.remove('in');void mat.offsetWidth;mat.classList.add('in');
      lb.querySelector('.lb-count').textContent=(idx+1)+' / '+arts.length;
    }
    function open(i){lastFocus=document.activeElement;show(i);lb.classList.add('open');doc.style.overflow='hidden';lb.querySelector('.lb-close').focus();}
    function close(){lb.classList.remove('open');doc.style.overflow='';if(lastFocus)lastFocus.focus();}

    arts.forEach(function(a,i){
      a.setAttribute('tabindex','0');a.setAttribute('role','button');
      a.addEventListener('click',function(e){e.preventDefault();open(i);});
      a.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open(i);}});
    });
    lb.querySelector('.lb-prev').onclick=function(){show(idx-1);};
    lb.querySelector('.lb-next').onclick=function(){show(idx+1);};
    lb.querySelector('.lb-close').onclick=close;
    lb.querySelector('.lb-stage').addEventListener('click',function(e){if(e.target===this)close();});
    document.addEventListener('keydown',function(e){
      if(!lb.classList.contains('open'))return;
      if(e.key==='Escape')close();
      if(e.key==='ArrowRight')show(idx+1);
      if(e.key==='ArrowLeft')show(idx-1);
    });
    // Wischen auf dem Handy
    var x0=null;
    lb.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;},{passive:true});
    lb.addEventListener('touchend',function(e){
      if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;
      if(Math.abs(dx)>50)show(idx+(dx<0?1:-1));x0=null;
    });
    // Direkt verlinkbar: galerie.html#werk-slug
    var h=location.hash.slice(1);
    if(h){arts.forEach(function(a,i){if(a.id===h)open(i);});}
  }

  // Maßstabsgrafik: Leinwand neben einer 1,75-m-Person
  function scaleSVG(w,h){
    if(!w||!h)return'';
    var k=0.8,W=320,H=200,floor=190;          // 0,8 px pro cm
    var cx=W/2+10,cy=floor-150*k;             // Bildmitte auf 1,50 m Höhe
    var rw=w*k,rh=h*k,px=cx-rw/2-36;
    var p='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Leinwand '+w+' mal '+h+' Zentimeter neben einer Person">'+
      '<line x1="0" y1="'+floor+'" x2="'+W+'" y2="'+floor+'" stroke="#d2d2d7"/>'+
      '<rect x="'+(cx-rw/2)+'" y="'+(cy-rh/2)+'" width="'+rw+'" height="'+rh+'" rx="2" fill="#e8b923" fill-opacity=".25" stroke="#8a6a00" stroke-width="1.2"/>'+
      '<text x="'+cx+'" y="'+(cy+4)+'" text-anchor="middle" font-size="11" fill="#1d1d1f" font-family="-apple-system,Segoe UI,sans-serif">'+w+'×'+h+'</text>'+
      '<g fill="#c7c7cc"><circle cx="'+px+'" cy="'+(floor-175*k+10)+'" r="9"/>'+
      '<rect x="'+(px-12)+'" y="'+(floor-175*k+21)+'" width="24" height="'+(175*k-21)+'" rx="10"/></g>'+
      '</svg>';
    return p;
  }

  // Kontaktformular: Senden ohne Seitenwechsel
  var form=document.getElementById('contactForm');
  if(form){
    var params=new URLSearchParams(location.search),q=params.get('werk');
    if(params.get('betreff')==='auftrag'){var s=form.querySelector('#subject');if(s)s.value='Auftragsarbeit anfragen';}
    if(q){
      var sel=form.querySelector('#subject');if(sel)sel.value='Interesse an einem Werk';
      var werk=form.querySelector('#werk');if(werk)werk.value=q;
      var msg=form.querySelector('#message');if(msg&&!msg.value)msg.value='Hallo Max, ich interessiere mich für „'+q+'“. ';
    }
    form.addEventListener('submit',function(e){
      if(!window.fetch)return;
      e.preventDefault();
      var btn=form.querySelector('button[type=submit]'),status=document.getElementById('formStatus');
      btn.disabled=true;btn.textContent='Wird gesendet …';status.textContent='';
      fetch(form.dataset.ajax,{method:'POST',headers:{'Accept':'application/json'},body:new FormData(form)})
        .then(function(r){return r.json().then(function(j){if(!r.ok||j.success==='false'||j.success===false)throw new Error(j.message||'Fehler');return j;});})
        .then(function(){
          form.hidden=true;document.getElementById('formDone').hidden=false;
        })
        .catch(function(){
          btn.disabled=false;btn.textContent='Nachricht senden';
          status.innerHTML='Das hat leider nicht geklappt. Bitte versuch es nochmal oder schreib direkt an <a href="mailto:mpoertner06@gmail.com">mpoertner06@gmail.com</a>.';
        });
    });
  }
})();

/* Alter aus Geburtstag (23.11.2006) + 3D-Kippen mit der Maus */
(function(){
  var now=new Date(),age=now.getFullYear()-2006;
  if(now.getMonth()<10||(now.getMonth()===10&&now.getDate()<23))age--;
  document.querySelectorAll('[data-age]').forEach(function(el){el.textContent=age;});

  if(!matchMedia('(hover:hover) and (pointer:fine)').matches||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  document.querySelectorAll('[data-tilt],.rail-item .art,.work .art,.ex .art,.ex-row .art').forEach(function(el){
    var max=+el.dataset.tilt||8,glare=document.createElement('span');
    glare.className='glare';el.classList.add('tilt');el.appendChild(glare);
    el.addEventListener('pointermove',function(e){
      var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      el.classList.add('tilting');
      el.style.transform='perspective(900px) rotateX('+((.5-y)*max)+'deg) rotateY('+((x-.5)*max)+'deg)';
      el.style.setProperty('--gx',x*100+'%');el.style.setProperty('--gy',y*100+'%');
    });
    el.addEventListener('pointerleave',function(){el.classList.remove('tilting');el.style.transform='';});
  });
})();

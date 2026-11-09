(function(){
  var root=document.documentElement;
  var q=new URLSearchParams(location.search);
  var motion;
  try{
    if(q.get('motion')==='1')localStorage.setItem('pdd-motion','1');
    if(q.get('motion')==='0')localStorage.removeItem('pdd-motion');
    motion=localStorage.getItem('pdd-motion')==='1';
  }catch(e){motion=q.get('motion')==='1'}
  if(!motion)motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(q.get('still')==='1')motion=false;
  if(motion)root.classList.add('motion');

  var page=document.body.dataset.page||'';
  var U='<svg viewBox="0 0 44 40"><path d="M22 3 41 37H3z" fill="#fff" stroke="#E2382B" stroke-width="4.5" stroke-linejoin="round"/><text x="22" y="32" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="800" font-size="17" fill="#141824">У</text></svg>';

  // шапка
  var top=document.querySelector('[data-top]');
  if(top){
    var nav=[['courses.html','Курсы','courses'],['index.html#free','Бесплатно','free'],['index.html#how','Тренажёры','trainer'],['index.html#about','О школе','about']];
    var links=nav.map(function(n){return '<a href="'+n[0]+'"'+(page===n[2]?' class="on"':'')+'>'+n[1]+'</a>'}).join('');
    var right=document.body.dataset.user
      ? '<span class="xp"><b>⚡</b>340 XP</span><a class="btn btn-ghost btn-sm" href="account.html">Кабинет</a>'
      : '<span class="xp"><b>⚡</b><span data-xp>0</span>&nbsp;XP</span><a class="login" href="account.html">Вход</a><a class="btn btn-y btn-sm" href="account.html">Регистрация</a>';
    top.className='top';
    top.innerHTML='<div class="wrap"><a class="logo" href="index.html"><img data-duck="10669" alt="">ПДД <b>СДАЛ</b></a><nav class="nav">'+links+'</nav><div class="top-r">'+right+'<button class="burger" aria-label="Меню"><span></span></button></div></div><nav class="mnav">'+links+'<a href="account.html">Личный кабинет</a></nav>';
    top.querySelector('.burger').onclick=function(){top.querySelector('.mnav').classList.toggle('open')};
  }
  // подвал
  var foot=document.querySelector('[data-foot]');
  if(foot){
    foot.className='foot';
    foot.innerHTML='<div class="wrap"><div><a class="logo" href="index.html" style="margin-bottom:16px"><img data-duck="10669" alt="">ПДД <b>СДАЛ</b></a><p style="max-width:320px">Онлайн-школа ПДД с 3D-разборами. Учим понимать дорогу, а не зубрить ответы.</p></div><div><h4>Учёба</h4><a href="courses.html">Все курсы</a><a href="index.html#free">Бесплатный урок</a><a href="course-intersections.html">Перекрёстки</a><a href="account.html">Личный кабинет</a></div><div><h4>Мы в соцсетях</h4><a href="#">Instagram</a><a href="#">TikTok</a><a href="#">YouTube</a><a href="#">Telegram — поддержка</a></div><div><h4>Документы</h4><a href="#">Публичная оферта</a><a href="#">Политика конфиденциальности</a><a href="#">Согласие на обработку данных</a><a href="#">Возврат средств</a></div><div class="foot-legal"><span>ИП ______ · ИНН ______ · ОГРНИП ______</span><span>Материалы проверяются по действующей редакции ПДД и экзаменационной базе ГИБДД</span></div></div>';
  }
  document.querySelectorAll('[data-u]').forEach(function(el){el.innerHTML=U});

  // утки: живые webp или статичный первый кадр
  document.querySelectorAll('img[data-duck]').forEach(function(img){
    img.src='ducks/'+img.dataset.duck+(motion?'.webp':'.png');
  });

  // появление блоков
  if(motion&&'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.rv').forEach(function(el,i){el.style.animationDelay=(el.dataset.d||0)+'ms';io.observe(el)});
  }

  // тост
  var toastEl;
  function toast(title,sub,duck){
    if(!toastEl){toastEl=document.createElement('div');toastEl.className='toast';document.body.appendChild(toastEl)}
    toastEl.innerHTML='<img src="ducks/'+(duck||'11643')+(motion?'.webp':'.png')+'" alt=""><div><b>'+title+'</b><span>'+sub+'</span></div>';
    toastEl.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(function(){toastEl.classList.remove('on')},2600);
  }
  function duckSrc(id){return 'ducks/'+id+(motion?'.webp':'.png')}

  // универсальный вопрос с разбором
  function quiz(box,onDone){
    var opts=box.querySelectorAll('.opt'),why=box.querySelector('.why'),right=+box.dataset.c;
    opts.forEach(function(b,i){
      b.onclick=function(){
        if(box.dataset.done)return;
        var ok=i===right;
        b.classList.add(ok?'ok':'bad');
        why.className='why show'+(ok?' good':'');
        why.innerHTML='<img src="'+duckSrc(ok?'10669':'5996')+'" alt="">'+b.dataset.why;
        if(onDone)onDone(i,ok,b);
        if(ok){box.dataset.done=1;opts.forEach(function(o){o.disabled=true});}
      };
    });
    var r=box.querySelector('.reset');
    if(r)r.onclick=function(){delete box.dataset.done;opts.forEach(function(o){o.disabled=false;o.classList.remove('ok','bad')});why.className='why';if(box._reset)box._reset()};
  }

  // тренажёр на главной: кадр за спиной меняется по ответу
  var tr=document.querySelector('[data-trainer]');
  if(tr){
    var imgs=document.querySelectorAll('.screen-bg img');
    function show(k){imgs.forEach(function(im){im.classList.toggle('off',im.dataset.k!==k)})}
    tr._reset=function(){show('start')};
    var xp=0;
    quiz(tr,function(i,ok,b){
      show(b.dataset.frame);
      if(ok){xp+=10;var x=document.querySelector('[data-xp]');if(x)x.textContent=xp;toast('+10 XP','Первый вопрос — твой. Дальше 799','11643')}
    });
  }

  // урок
  var lq=document.querySelector('[data-lesson-quiz]');
  if(lq){
    quiz(lq,function(i,ok){
      if(ok){toast('+15 XP','Урок пройден. Серия: 6 дней','11643');var n=document.querySelector('[data-next]');if(n)n.setAttribute('aria-disabled','false');var s=document.querySelector('[data-next-note]');if(s)s.textContent='Готово, следующий урок открыт'}
    });
  }
  document.querySelectorAll('.tabs').forEach(function(t){
    var bs=t.querySelectorAll('button');
    bs.forEach(function(b){b.onclick=function(){bs.forEach(function(x){x.classList.toggle('on',x===b)});document.querySelectorAll('.tabp').forEach(function(p){p.classList.toggle('on',p.id===b.dataset.t)})}});
  });
  var mp=document.querySelector('.m-prog');
  if(mp)mp.onclick=function(){document.querySelector('.side').classList.toggle('open')};

  // каталог
  var chips=document.querySelectorAll('.filters .chip');
  chips.forEach(function(c){c.onclick=function(){
    chips.forEach(function(x){x.classList.toggle('on',x===c)});
    var f=c.dataset.f;
    document.querySelectorAll('.cat [data-cat]').forEach(function(el){
      var show=f==='all'||el.dataset.cat.split(' ').indexOf(f)>-1;
      el.classList.toggle('hide',!show);
    });
  }});

  // режим скриншота телефона: ?shot=… прокрутка к якорю
  var sc=q.get('scroll');if(sc){var t=document.getElementById(sc);if(t)setTimeout(function(){t.scrollIntoView()},50)}
})();

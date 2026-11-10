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
    var nav=[['courses.html','Курсы','courses'],['index.html#free','Бесплатно','free'],['index.html#trainer','Тренажёры','trainer'],['index.html#about','О школе','about']];
    var links=nav.map(function(n){return '<a href="'+n[0]+'"'+(page===n[2]?' class="on"':'')+'>'+n[1]+'</a>'}).join('');
    var right=document.body.dataset.user
      ? '<span class="xp"><b>⚡</b>340 XP</span><a class="btn btn-ghost btn-sm" href="account.html">Кабинет</a>'
      : '<span class="xp"><b>⚡</b><span data-xp>0</span>&nbsp;XP</span><a class="login" href="account.html">Вход</a><a class="btn btn-y btn-sm" href="register.html">Регистрация</a>';
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

  // окно с видеоразбором
  function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
  var modal;
  function openReview(o){
    if(!modal){modal=document.createElement('div');modal.className='modal';document.body.appendChild(modal);
      modal.addEventListener('click',function(e){if(e.target===modal||e.target.closest('[data-close]'))closeReview()});
      document.addEventListener('keydown',function(e){if(e.key==='Escape')closeReview()});}
    modal.innerHTML='<div class="modal-box"><button class="modal-x" data-close aria-label="Закрыть">✕</button>'+
      (o.video?'<video src="'+o.video+'" poster="'+(o.poster||'')+'" controls autoplay playsinline></video>'
        :'<div class="modal-soon"><img src="'+o.img+'" alt=""><div><b>Разбор этого вопроса — в&nbsp;курсе «Перекрёстки без ошибок»</b><span>3D-сцена с&nbsp;видом сверху и&nbsp;голосом утки. Первый урок курса бесплатный.</span><a class="btn btn-y btn-sm" href="course-intersections.html">Открыть курс</a></div></div>')+
      '<div class="modal-cap">'+esc(o.title)+'</div></div>';
    modal.classList.add('on');document.body.style.overflow='hidden';
  }
  function closeReview(){if(!modal)return;var v=modal.querySelector('video');if(v)v.pause();modal.classList.remove('on');document.body.style.overflow=''}

  // тренажёр на главной: три вопроса подряд
  var tr=document.querySelector('[data-trainer]');
  if(tr&&window.PDDQ){
    var TQ=[
      {k:'1-1',bg:'start',frames:['ped','smoke','top'],video:'video/q01.mp4',poster:'img/cabin-card-full.jpg',
       a:['Остановившись перед пешеходным переходом, чтобы уступить дорогу пешеходу','Остановившись на&nbsp;проезжей части из-за неисправности машины','В&nbsp;обоих перечисленных случаях'],
       why:['<b>Нет.</b> Перед переходом машина исправна, ты сам решил постоять и&nbsp;пропустить пешехода. Это обычная остановка.','<b>Верно!</b> Повалил дым, машина заглохла: ты&nbsp;бы и&nbsp;рад ехать, но&nbsp;дальше никак. Вот это и&nbsp;есть вынужденная.','<b>Ловушка.</b> Вынужденная только когда ехать дальше нельзя. У&nbsp;перехода ты стоишь по&nbsp;своей воле.']},
      {k:'28-15',bg:'ex1',
       why:['<b>Верно!</b> Главная дорога поворачивает, по&nbsp;ней едешь ты и&nbsp;грузовик. Легковой на&nbsp;второстепенной и&nbsp;ждёт вас обоих. А&nbsp;между собой вы решаете по&nbsp;помехе справа: грузовик справа, он первый.','<b>Нет.</b> Легковой на&nbsp;второстепенной, он сам уступает и&nbsp;тебе, и&nbsp;грузовику. Смотри на&nbsp;табличку под знаком: главная поворачивает.','<b>Ловушка.</b> Легковому ты не&nbsp;уступаешь, он на&nbsp;второстепенной. А&nbsp;грузовику да: вы оба на&nbsp;главной, и&nbsp;он у&nbsp;тебя справа.']},
      {k:'15-13',bg:'ex2',
       why:['<b>Не&nbsp;только.</b> Налево уступаешь, это так. Но&nbsp;трамвай пересекает и&nbsp;твой путь прямо, там он тоже первый.','<b>Не&nbsp;только.</b> Прямо уступаешь, но&nbsp;и&nbsp;при повороте налево с&nbsp;путей трамвай проезжает раньше тебя.','<b>Верно!</b> Зелёный горит и&nbsp;тебе, и&nbsp;трамваю. При равных условиях трамвай главнее, поэтому пропускаешь его в&nbsp;обоих случаях.']}
    ];
    var imgs=document.querySelectorAll('.screen-bg img'),cur=0,xp=0,score=0;
    var exBox=document.querySelector('[data-exam]');
    function show(k){imgs.forEach(function(im){im.classList.toggle('off',im.dataset.k!==k)});
      var cur_=[].filter.call(imgs,function(im){return im.dataset.k===k})[0];
      if(exBox){var on=cur_&&cur_.classList.contains('blur');exBox.classList.toggle('on',!!on);exBox.parentNode.classList.toggle('ex',!!on);if(on)exBox.firstChild.src=cur_.src}}
    function dots(){return '<div class="tr-dots">'+TQ.map(function(_,i){return '<i class="'+(i<cur?'done':i===cur?'on':'')+'"></i>'}).join('')+'</div>'}
    function render(){
      var t=TQ[cur],qq=PDDQ[t.k],ans=t.a||qq.a.map(esc);show(t.bg);
      tr.innerHTML='<div class="tr-top">'+dots()+'<span>Вопрос '+(cur+1)+' из&nbsp;'+TQ.length+'</span></div>'+
'<h3>'+esc(qq.q)+'</h3><div class="opts">'+
        ans.map(function(a,i){return '<button class="opt"><span class="n">'+(i+1)+'</span>'+a+'</button>'}).join('')+'</div><div class="why"></div><div class="tr-act"></div>';
      var opts=tr.querySelectorAll('.opt');
      opts.forEach(function(b,i){b.onclick=function(){
        if(tr.dataset.done)return;tr.dataset.done=1;
        var ok=i===qq.c;if(ok)score++;
        opts.forEach(function(o,j){o.disabled=true;if(j===qq.c)o.classList.add('ok')});if(!ok)b.classList.add('bad');
        if(t.frames)show(t.frames[i]);
        var why=tr.querySelector('.why');why.className='why show'+(ok?' good':'');
        why.innerHTML='<img src="'+duckSrc(ok?'10669':'5996')+'" alt="">'+t.why[i];
        var last=cur===TQ.length-1;
        tr.querySelector('.tr-act').innerHTML='<button class="btn btn-y btn-sm" data-play>▶&nbsp;Смотреть разбор</button><button class="btn btn-dark btn-sm" data-go>'+(last?'Итог':'Следующий вопрос')+'&nbsp;→</button>';
        tr.querySelector('[data-play]').onclick=function(){openReview({video:t.video,poster:t.poster,img:qq.img,title:'Билет '+qq.t+', вопрос '+qq.n})};
        tr.querySelector('[data-go]').onclick=function(){cur++;delete tr.dataset.done;tr.scrollTop=0;cur<TQ.length?render():finish()};
        if(ok){xp+=10;var x=document.querySelector('[data-xp]');if(x)x.textContent=xp;toast('+10 XP',score===1?'Первый верный ответ':'Верно! Так держать','11643')}
        var act=tr.querySelector('.tr-act');if(tr.scrollHeight>tr.clientHeight)tr.scrollTop=tr.scrollHeight;
      }});
    }
    function finish(){
      show('start');
      tr.innerHTML='<div class="tr-top">'+dots()+'<span>Готово</span></div><div class="tr-fin"><img src="'+duckSrc(score===3?'10669':'5480')+'" alt=""><b>'+score+' из&nbsp;3</b><p>'+(score===3?'Это одни из&nbsp;самых сложных вопросов билетов. Сильно!':'На&nbsp;этих вопросах валятся чаще всего. В&nbsp;курсе разберём каждый в&nbsp;3D.')+'</p></div>'+
        '<div class="tr-act"><a class="btn btn-y btn-sm" href="register.html">Сохранить прогресс</a><button class="btn btn-dark btn-sm" data-again>Пройти ещё раз</button></div>';
      tr.querySelector('[data-again]').onclick=function(){cur=0;score=0;render()};
    }
    render();
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

  // карточки с вопросами из билетов
  var deck=document.querySelector('[data-deck]');
  if(deck&&window.PDDQ){
    var keys=deck.dataset.deck.split(','),di=0;
    deck.innerHTML=keys.map(function(k,i){var qq=PDDQ[k];
      return '<div class="card" data-i="'+i+'"><div class="card-in"><div class="card-f">'+
        '<span class="tag tag-d">Билет '+qq.t+' · вопрос '+qq.n+'</span>'+
        (qq.img?'<img src="'+qq.img+'" alt="">':'')+'<h3>'+esc(qq.q)+'</h3><ol>'+qq.a.map(function(a){return '<li>'+esc(a)+'</li>'}).join('')+'</ol></div>'+
        '<div class="card-b"><span class="tag tag-g">Ответ '+(qq.c+1)+'</span><h3>'+esc(qq.a[qq.c])+'</h3><p>'+esc(qq.tip)+'</p></div></div></div>'}).join('');
    var cards=deck.querySelectorAll('.card'),cnt=document.querySelector('[data-deck-count]'),flipB=document.querySelector('[data-deck-flip]');
    function fit(){var c=cards[di],f=c.querySelector('.card-f'),b=c.querySelector('.card-b');deck.style.setProperty('--fh',f.scrollHeight+'px');deck.style.height=(c.classList.contains('flip')?Math.max(b.scrollHeight,f.scrollHeight):f.scrollHeight)+52+'px'}
    function lay(){cards.forEach(function(c,i){var p=i-di;c.dataset.p=p<0?'gone':p>2?'hide':String(p);c.classList.remove('flip')});
      if(cnt)cnt.textContent=(di+1)+' / '+keys.length;if(flipB)flipB.textContent='Показать ответ';fit()}
    function flip(){var c=cards[di];c.classList.toggle('flip');flipB.textContent=c.classList.contains('flip')?'Скрыть ответ':'Показать ответ';fit()}
    function go(d){di=(di+d+keys.length)%keys.length;lay()}
    document.querySelector('[data-deck-next]').onclick=function(){go(1)};
    document.querySelector('[data-deck-prev]').onclick=function(){go(-1)};
    flipB.onclick=flip;
    deck.addEventListener('click',function(e){var c=e.target.closest('.card');if(c&&c.dataset.p==='0')flip()});
    var sx=null;deck.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
    deck.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>50)go(dx<0?1:-1)});
    window.addEventListener('resize',fit);lay();
  }

  // регистрация
  var reg=document.querySelector('[data-reg]');
  if(reg){
    var daysBox=reg.querySelector('[data-days]'),daysIn=reg.querySelector('[name=days]'),dbs=reg.querySelectorAll('.days button');
    reg.querySelectorAll('[name=stage]').forEach(function(r){r.onchange=function(){daysBox.classList.toggle('hide',r.value==='passed')}});
    dbs.forEach(function(b){b.onclick=function(){daysIn.value=b.dataset.d;dbs.forEach(function(x){x.classList.toggle('on',x===b)})}});
    daysIn.oninput=function(){dbs.forEach(function(x){x.classList.toggle('on',x.dataset.d===daysIn.value)})};
    reg.onsubmit=function(e){e.preventDefault();var err=reg.querySelector('[data-err]'),f=reg.elements;
      var msg=!/^\S+@\S+\.\S+$/.test(f.email.value)?'Проверь почту':f.pass.value.length<8?'Пароль от&nbsp;8 символов':!f.agree.checked?'Нужно согласие с&nbsp;офертой':'';
      err.innerHTML=msg;if(msg)return;
      try{localStorage.setItem('pdd-reg',JSON.stringify({name:f.name.value.trim(),days:daysIn.value,stage:(reg.querySelector('[name=stage]:checked')||{}).value||''}))}catch(x){}
      location.href='account.html?welcome=1'};
  }
  // кабинет подхватывает имя и дни до экзамена из регистрации
  if(page==='account'){
    var rd=null;try{rd=JSON.parse(localStorage.getItem('pdd-reg')||'null')}catch(x){}
    var ah=document.querySelector('.acc-h h1'),ap=document.querySelector('.acc-h p');
    if(rd&&ah){if(rd.name)ah.textContent='Привет, '+rd.name;
      if(ap)ap.innerHTML=rd.stage==='passed'?'Ты уже сдал, поздравляем! Здесь можно освежить сложные темы.':rd.days?'До&nbsp;экзамена в&nbsp;ГИБДД '+rd.days+' дн. Сегодня хватит одного урока и&nbsp;теста.':'Начнём с&nbsp;первого урока. План подстроим, когда узнаем дату экзамена.'}
    if(q.get('welcome'))setTimeout(function(){toast('Аккаунт создан','+20 XP за&nbsp;регистрацию','11643')},400);
  }
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

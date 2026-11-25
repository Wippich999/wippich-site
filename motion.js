/* Transições do site (GSAP + ScrollTrigger + SplitText + Lenis)
   - rolagem suave
   - barra de progresso no topo
   - menu fixo que some ao descer e volta ao subir
   - entrada do topo (hero) com zoom e parallax do fundo
   - títulos revelados linha por linha
   - blocos surgem do desfoque subindo, em cascata
   - portfólio em faixa, botões magnéticos e cursor com anel */

const M = {
  dur: { xs: .3, sm: .6, md: .9, lg: 1.2 },
  desloc: 48,
  blur: 12,
  stagger: .09,
  inicio: 'top 85%',
  ease: 'expo.out'
};

(() => {
  'use strict';
  const root = document.documentElement;
  const desligar = () => root.classList.remove('js-motion');

  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return desligar();
  const reduz = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduz.matches) return desligar();

  gsap.registerPlugin(ScrollTrigger, SplitText);
  if (window.CustomEase) { CustomEase.create('saida', '.16,1,.3,1'); M.ease = 'saida'; }

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const gatilho = (trigger, start = M.inicio) => ({ trigger, start, toggleActions: 'play reverse play reverse' });
  const limpar = els => ({ onComplete() { gsap.set(els, { clearProps: 'transform,filter,willChange' }); } });

  /* surge do desfoque subindo */
  const revelar = (alvos, { trigger, inicio, desloc = M.desloc, blur = M.blur, ...extra } = {}) => {
    const els = [alvos].flat().filter(Boolean);
    if (!els.length) return null;
    return gsap.fromTo(els,
      { opacity: 0, y: desloc, filter: blur ? `blur(${blur}px)` : 'none' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: M.dur.md, ease: M.ease, stagger: M.stagger,
        scrollTrigger: trigger === null ? undefined : gatilho(trigger || els[0], inicio),
        ...limpar(els), ...extra });
  };

  /* subtítulo no estilo "faixa de cinema": uma faixa azul translúcida passa
     atrás de cada linha, as letras entram deslizando com desfoque de
     movimento e, depois, a faixa se apaga */
  const linhas = (el, trigger, inicio = 'top 88%') => {
    if (!el) return;
    let tw = null;
    el.classList.add('m-faixa-alvo');
    SplitText.create(el, {
      type: 'lines,chars', linesClass: 'm-linha', charsClass: 'm-char', autoSplit: true,
      onSplit(s) {
        if (tw) { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); }
        el.querySelectorAll(':scope > .m-faixa').forEach(f => f.remove());
        gsap.set(el, { opacity: 1 });

        // uma faixa por linha: da borda esquerda da tela até o fim do bloco do subtítulo
        const er = el.getBoundingClientRect();
        const ate = er.right + 28; // termina logo depois do bloco do subtítulo
        const faixas = s.lines.map(l => {
          const lr = l.getBoundingClientRect();
          const folga = lr.height * .12;
          const f = document.createElement('i');
          f.className = 'm-faixa';
          f.setAttribute('aria-hidden', 'true');
          f.style.top = (lr.top - er.top - folga) + 'px';
          f.style.height = (lr.height + folga * 2) + 'px';
          f.style.left = (-er.left) + 'px';
          f.style.width = ate + 'px';
          el.prepend(f);
          return f;
        });

        tw = gsap.timeline({ scrollTrigger: trigger === null ? undefined : gatilho(trigger || el, inicio) });
        s.lines.forEach((l, k) => {
          const t0 = k * .16, f = faixas[k];
          const letras = l.querySelectorAll('.m-char');
          tw.fromTo(f, { scaleX: 0, opacity: 1, transformOrigin: 'left center' },
              { scaleX: 1, duration: .75, ease: 'power3.inOut' }, t0)
            .fromTo(letras, { opacity: 0, x: -42, filter: 'blur(10px)' },
              { opacity: 1, x: 0, filter: 'blur(0px)', duration: .7, ease: M.ease, stagger: .018 }, t0 + .25)
            .to(f, { opacity: 0, duration: .7, ease: 'power2.out' }, t0 + 1.35);
        });
        return tw;
      }
    });
  };

  /* rótulo em caixa alta: uma listra azul atravessa o texto, as letras surgem
     uma a uma por trás dela e a linha decorativa se estende */
  const rotulo = (el, trigger, inicio = 'top 90%') => {
    if (!el) return null;
    let alvo = el.querySelector(':scope > span');
    if (!alvo) { // .tag do topo tem texto direto: embrulha num span
      alvo = document.createElement('span');
      while (el.firstChild) alvo.appendChild(el.firstChild);
      el.appendChild(alvo);
    }
    alvo.classList.add('m-rotulo');
    gsap.set(el, { opacity: 1 }); // a .tag do topo começa oculta pelo CSS anti-piscar
    let listra = alvo.querySelector('.m-listra');
    if (!listra) {
      listra = document.createElement('i');
      listra.className = 'm-listra';
      listra.setAttribute('aria-hidden', 'true');
      alvo.appendChild(listra);
    }
    const letras = SplitText.create(alvo, { type: 'chars', charsClass: 'm-letra', aria: 'auto' }).chars
      .filter(c => !c.closest('.m-listra'));

    const tl = gsap.timeline({ scrollTrigger: trigger === null ? undefined : gatilho(trigger, inicio) });
    tl.fromTo(listra, { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: .45, ease: 'power3.inOut' }, 0)
      .set(listra, { transformOrigin: 'right center' }, .45)
      .to(listra, { scaleX: 0, duration: .5, ease: 'power3.inOut' }, .45)
      .fromTo(letras, { opacity: 0, y: 10, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: .5, ease: M.ease, stagger: .028 }, .4)
      .fromTo(el, { '--m-linha': 0 }, { '--m-linha': 1, duration: .9, ease: 'power3.inOut' }, .3);
    return tl;
  };

  /* ---------- rolagem suave ---------- */
  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1.4 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const alvo = a.getAttribute('href');
      if (alvo.length < 2 || !$(alvo)) return;
      e.preventDefault();
      lenis.scrollTo(alvo === '#inicio' ? 0 : alvo, { offset: -80 });
    }));
  }

  const mm = gsap.matchMedia();
  mm.add({ desktop: '(min-width: 1024px)', mobile: '(max-width: 1023px)' }, ctx => {
    const { desktop } = ctx.conditions;

    /* ---------- barra de progresso ---------- */
    const barra = $('.progresso__barra');
    barra && gsap.fromTo(barra, { scaleX: 0 }, { scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: .3 } });

    /* ---------- menu: fixa com fundo e some ao descer ---------- */
    const topo = $('header');
    if (topo) {
      const mover = gsap.quickTo(topo, 'yPercent', { duration: .4, ease: 'power3.out' });
      ScrollTrigger.create({
        start: 'top -120', end: 99999,
        onToggle: s => topo.classList.toggle('is-fixo', s.isActive),
        onUpdate: s => mover(s.direction === 1 ? -100 : 0)
      });
    }

    /* ---------- topo (hero) ---------- */
    const hero = $('.hero');
    if (hero) {
      const tl = gsap.timeline({ defaults: { ease: M.ease } });
      tl.fromTo('header > *', { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: M.dur.sm, stagger: .08, ...limpar($$('header > *')) }, 0);
      const lado = $$('.hero-content > *:not(.tag)');
      tl.add(rotulo($('.hero-content .tag'), null), .35);
      tl.fromTo(lado, { opacity: 0, y: M.desloc, filter: `blur(${M.blur}px)` },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: M.dur.md, stagger: .1, ...limpar(lado) }, .2);

      /* fundo do mapa: entra com zoom suave e desce devagar na rolagem (parallax) */
      const fundo = $('.hero-fundo');
      if (fundo) {
        tl.fromTo(fundo, { scale: 1.1, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.8, ease: 'power2.out' }, 0);
        desktop && gsap.fromTo(fundo, { yPercent: 0 }, { yPercent: 12, ease: 'none', immediateRender: false,
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      }

      const cena = $('.hero-bg');
      if (cena) {
        tl.fromTo(cena, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1.6, ease: 'power2.out' }, 0);
        desktop && gsap.fromTo(cena, { yPercent: 0 }, { yPercent: 10, ease: 'none', immediateRender: false,
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      }

      /* a cena acompanha levemente o mouse */
      const caixa = cena; // .scene-box já tem animação CSS de transform; movemos o contêiner
      if (desktop && caixa) {
        const qx = gsap.quickTo(caixa, 'x', { duration: 1.1, ease: 'power3.out' });
        const qy = gsap.quickTo(caixa, 'y', { duration: 1.1, ease: 'power3.out' });
        hero.addEventListener('pointermove', e => {
          if (e.pointerType !== 'mouse') return;
          const r = hero.getBoundingClientRect();
          qx(gsap.utils.mapRange(0, r.width, -18, 18, e.clientX - r.left));
          qy(gsap.utils.mapRange(0, r.height, -12, 12, e.clientY - r.top));
        });
      }
    }

    /* faixa de destaques logo abaixo do topo */
    revelar($$('.services .service'), { trigger: $('.services'), inicio: 'top 92%', desloc: 24 });
    revelar($('.code-strip'), { inicio: 'top 95%', desloc: 20 });

    /* ---------- seções ---------- */
    $$('.block').forEach(sec => {
      const tag = $('.section-tag', sec);
      tag && rotulo(tag, tag);
      linhas($('h2', sec), $('h2', sec));
    });

    /* textos de apoio */
    revelar($$('.about-text > *'), { trigger: $('.about-text') });
    revelar($('.diff-head > p'), { trigger: $('.diff-head'), desloc: 24 });
    revelar($('.ent-lead'), { trigger: $('.ent-head'), desloc: 24 });
    revelar($('.ent-destaque'), { trigger: $('.ent-grid'), inicio: 'top 82%' });
    revelar($('.ent-difs-titulo'), { trigger: $('.ent-difs'), inicio: 'top 82%', desloc: 16, blur: 0 });
    const etapas = $$('.ent-etapas li');
    etapas.length && gsap.fromTo(etapas, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: M.dur.sm, ease: M.ease, stagger: .12,
      scrollTrigger: gatilho($('.ent-etapas'), 'top 90%'), ...limpar(etapas) });
    revelar($('.contact > p'), { desloc: 24 });
    revelar($('.orc'), { trigger: $('.orc'), inicio: 'top 85%' });
    revelar($$('.orc-wa > *, .orc-form > *'), { trigger: $('.orc'), inicio: 'top 75%', desloc: 20, blur: 6 });

    /* grades de cartões em cascata */
    ['.mvv-card', '.svc-card', '.diff-item', '.steps > li', '.ent-card'].forEach(sel => {
      const itens = $$(sel);
      if (!itens.length) return;
      revelar(itens, { trigger: itens[0].parentElement, inicio: 'top 82%' });
    });

    /* números dos passos giram ao entrar */
    const nums = $$('.steps > li > span');
    nums.length && gsap.fromTo(nums, { scale: .4, rotate: -90 }, { scale: 1, rotate: 0, duration: M.dur.md,
      ease: 'back.out(1.8)', stagger: .12, immediateRender: false, scrollTrigger: gatilho($('.steps'), 'top 80%') });

    /* portfólio: texto de apoio sobe do desfoque e a faixa entra de lado */
    revelar($('.projects-head > p'), { trigger: $('.projects-head'), desloc: 24 });
    const faixa = $('.portfolio');
    faixa && gsap.fromTo(faixa, { opacity: 0, x: 120, skewX: -4 }, {
      opacity: 1, x: 0, skewX: 0, duration: M.dur.lg, ease: M.ease,
      scrollTrigger: gatilho(faixa, 'top 88%'), ...limpar(faixa)
    });

    /* rodapé */
    revelar($$('footer > *'), { trigger: $('footer'), inicio: 'top 95%', desloc: 20, blur: 0 });

    /* brilho que segue o mouse nos balões de diferenciais */
    desktop && $$('.ent-card').forEach(c => c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));

    /* ---------- botões magnéticos ---------- */
    if (desktop) {
      $$('.main-btn, .header-btn, .ent-btn, .orc-wa-btn').forEach(b => {
        b.classList.add('m-ima');
        const qx = gsap.quickTo(b, '--ima-x', { duration: .4, ease: 'power3.out' });
        const qy = gsap.quickTo(b, '--ima-y', { duration: .4, ease: 'power3.out' });
        b.addEventListener('pointermove', e => {
          if (e.pointerType !== 'mouse') return;
          const r = b.getBoundingClientRect();
          qx(gsap.utils.clamp(-8, 8, .25 * (e.clientX - (r.left + r.width / 2))));
          qy(gsap.utils.clamp(-8, 8, .3 * (e.clientY - (r.top + r.height / 2))));
        });
        b.addEventListener('pointerleave', () => { qx(0); qy(0); });
      });
    }
  });

  /* recalcula posições depois que fontes e imagens carregam */
  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
})();

/* ---------- cursor com anel que segue o mouse (só mouse) ---------- */
(() => {
  'use strict';
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cur = document.createElement('div');
  cur.className = 'cursor';
  cur.setAttribute('aria-hidden', 'true');
  cur.innerHTML = '<span class="cursor__anel"></span><span class="cursor__rotulo"></span>';
  const rotulo = cur.querySelector('.cursor__rotulo');
  document.body.append(cur);
  document.documentElement.classList.add('tem-cursor');

  let mx = innerWidth / 2, my = innerHeight / 2, x = mx, y = my, raf = 0, antes = 0;

  const quadro = t => {
    const dt = antes ? Math.min(t - antes, 64) : 16;
    antes = t;
    const k = 1 - Math.pow(1 - .18, dt / 16.67);
    x += (mx - x) * k; y += (my - y) * k;
    cur.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    if (Math.abs(mx - x) < .1 && Math.abs(my - y) < .1) { raf = 0; antes = 0; return; }
    raf = requestAnimationFrame(quadro);
  };

  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX; my = e.clientY;
    cur.classList.add('is-ativo');
    raf || (raf = requestAnimationFrame(quadro));
  }, { passive: true });

  document.addEventListener('mouseout', e => { if (!e.relatedTarget) cur.classList.remove('is-ativo'); });
  addEventListener('pointerdown', () => cur.classList.add('is-clique'));
  addEventListener('pointerup', () => cur.classList.remove('is-clique'));
  document.addEventListener('pointerover', e => {
    const alvo = e.target.closest('a[href], button, label, select, [data-cursor]');
    const texto = alvo ? alvo.dataset.cursor || '' : '';
    cur.classList.toggle('is-link', !!alvo && !texto);
    cur.classList.toggle('is-rotulo', !!texto);
    rotulo.textContent = texto;
  });
})();

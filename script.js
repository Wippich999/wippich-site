// Menu: fundo ao rolar
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Menu mobile
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
toggle.addEventListener('click', () => {
  const aberto = links.classList.toggle('open');
  toggle.classList.toggle('open', aberto);
  toggle.setAttribute('aria-expanded', aberto);
});
links.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  })
);

// Revelar elementos ao rolar (com efeito cascata por grupo)
document.querySelectorAll('.steps, .cards, .portfolio, .testimonials').forEach((grupo) => {
  [...grupo.children].forEach((el, i) => el.style.setProperty('--stagger', `${i * 0.1}s`));
});
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// Brilho que segue o mouse nos cards
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// Contadores do hero
const contar = (el) => {
  const alvo = Number(el.dataset.count);
  const duracao = 1600;
  const inicio = performance.now();
  const passo = (agora) => {
    const t = Math.min((agora - inicio) / duracao, 1);
    el.textContent = Math.round(alvo * (1 - Math.pow(1 - t, 3)));
    if (t < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
};
setTimeout(() => document.querySelectorAll('[data-count]').forEach(contar), 1300);

// Hero: frase digitada que alterna
const frases = ['sob medida.', 'que vende.', 'rápido.', 'com a sua cara.'];
const typed = document.getElementById('typed');
let fi = 0;
const digitarFrase = (pos = 0, apagando = false) => {
  const frase = frases[fi];
  typed.textContent = frase.slice(0, pos);
  if (!apagando && pos < frase.length) return setTimeout(() => digitarFrase(pos + 1), 85);
  if (!apagando) return setTimeout(() => digitarFrase(pos, true), 2200);
  if (pos > 0) return setTimeout(() => digitarFrase(pos - 1, true), 40);
  fi = (fi + 1) % frases.length;
  setTimeout(() => digitarFrase(0), 300);
};
setTimeout(() => digitarFrase(), 900);

// Hero: código sendo digitado no editor
const tokens = [
  ['k', 'const'], ['', ' seuSite = '], ['f', 'criar'], ['', '({\n'],
  ['p', '  design'], ['', ': '], ['s', '"sob medida"'], ['', ',\n'],
  ['p', '  velocidade'], ['', ': '], ['s', '"100/100"'], ['', ',\n'],
  ['p', '  celular'], ['', ': '], ['k', 'true'], ['', ',\n'],
  ['p', '  objetivo'], ['', ': '], ['s', '"mais clientes"'], ['', ',\n'],
  ['', '});\n\n'],
  ['k', 'await'], ['', ' seuSite.'], ['f', 'publicar'], ['', '();\n'],
  ['c', '// ✓ no ar em suaempresa.com.br'],
];
const code = document.getElementById('code');
const digitarCodigo = async () => {
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  for (;;) {
    code.textContent = '';
    for (const [cls, txt] of tokens) {
      const span = document.createElement('span');
      if (cls) span.className = cls;
      code.appendChild(span);
      for (const ch of txt) {
        span.textContent += ch;
        await espera(ch === '\n' ? 120 : 28);
      }
    }
    await espera(4000);
  }
};
setTimeout(digitarCodigo, 1200);

// Formulário: sem servidor, envia o pedido montado para o WhatsApp
const WHATSAPP = '554799646069';
const form = document.getElementById('form');
const status = document.getElementById('formStatus');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const obrigatorios = [form.nome, form.email, form.mensagem];
  obrigatorios.forEach((campo) => campo.classList.toggle('invalid', !campo.checkValidity()));
  const invalido = obrigatorios.find((campo) => !campo.checkValidity());
  if (invalido) {
    status.textContent = 'Preencha nome, e-mail válido e uma mensagem, por favor.';
    invalido.focus();
    return;
  }
  const texto =
    `Olá! Quero um orçamento de site.\n\n` +
    `Nome: ${form.nome.value}\nE-mail: ${form.email.value}\n` +
    (form.telefone.value ? `WhatsApp: ${form.telefone.value}\n` : '') +
    `Tipo: ${form.tipo.value}\n\n${form.mensagem.value}`;
  // Mostra um link real: abrir janelas por script nem sempre é permitido
  form.querySelector('.form__send')?.remove();
  const link = document.createElement('a');
  link.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
  link.target = '_blank';
  link.rel = 'noopener';
  link.className = 'btn btn--wa btn--full form__send';
  link.textContent = 'Enviar mensagem no WhatsApp →';
  status.textContent = 'Sua mensagem está pronta. Toque abaixo para enviar:';
  status.after(link);
  form.reset();
});
form.querySelectorAll('input, textarea').forEach((campo) =>
  campo.addEventListener('input', () => campo.classList.remove('invalid'))
);

document.getElementById('ano').textContent = new Date().getFullYear();

(() => {
  let installEvent = null;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const style = document.createElement('style');
  style.textContent = `#pwa-install{position:fixed;top:max(10px,env(safe-area-inset-top));right:12px;z-index:100001;background:#fff;color:#1F2A30;border:1px solid #d0d5dd;border-radius:22px;padding:9px 14px;font:600 12px system-ui;box-shadow:0 3px 12px #0002}#pwa-help{border:0;border-radius:18px;padding:24px;max-width:390px;width:calc(100% - 32px);font:14px/1.5 system-ui;color:#1F2A30}#pwa-help::backdrop{background:#0008}#pwa-help h2{margin-top:0;font-size:20px}#pwa-help button{padding:10px 16px;border-radius:10px;background:#2e7d4f;color:white;margin-top:12px}#pwa-install[hidden]{display:none}@media(display-mode:standalone){#pwa-install{display:none}}`;
  document.head.append(style);
  const button = document.createElement('button');
  button.id = 'pwa-install'; button.type = 'button'; button.textContent = '↓ Instalar aplicativo'; button.hidden = !!standalone();
  document.body.append(button);
  const dialog = document.createElement('dialog'); dialog.id = 'pwa-help';
  dialog.innerHTML = '<h2>Instalar no celular</h2><p id="pwa-instructions"></p><p>O aplicativo abre pelo ícone na tela inicial. O login e a sincronização precisam de internet.</p><button type="button">Entendi</button>';
  document.body.append(dialog);
  dialog.querySelector('button').onclick = () => dialog.close();
  button.onclick = async () => {
    if (installEvent) {
      const event = installEvent; installEvent = null;
      try { await event.prompt(); const choice = await event.userChoice; if (choice.outcome === 'accepted') button.hidden = true; }
      catch (err) { console.warn('Instalação indisponível', err); }
      return;
    }
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    document.getElementById('pwa-instructions').textContent = ios
      ? 'No iPhone ou iPad, abra este endereço no Safari. Toque em Compartilhar e escolha “Adicionar à Tela de Início”. Ative “Abrir como App”, se aparecer, e toque em Adicionar.'
      : 'Abra este endereço diretamente no Chrome ou Edge. No menu ⋮, escolha “Instalar aplicativo” ou “Adicionar à tela inicial”. Se a opção ainda não aparecer, aguarde alguns segundos e recarregue a página. Se já estiver instalado, abra pelo ícone do celular.';
    dialog.showModal();
  };
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installEvent = event; button.hidden = !!standalone(); });
  window.addEventListener('appinstalled', () => { installEvent = null; button.hidden = true; });
  matchMedia('(display-mode: standalone)').addEventListener('change', () => { button.hidden = !!standalone(); });
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js', {scope:'./', updateViaCache:'none'})
      .then(reg => { reg.update().catch(() => {}); })
      .catch(err => console.error('Falha ao registrar PWA', err));
  }
})();

(() => {
  const update = () => {
    const member = party.find(item => item.id === selectedId);
    const abilities = document.querySelector('.abilities');
    if (!member || !abilities) return;

    const slots = passiveSlots(member);
    const selected = (member.selectedPassives || []).length;
    const notice = abilities.previousElementSibling?.previousElementSibling;
    const caption = abilities.previousElementSibling;
    const noticeText = 'Equipa pasivas para definir el estilo de combate. Los huecos se desbloquean en los niveles 1, 4, 7 y 10.';
    const unlockText = slots >= 4
      ? 'Todos los huecos desbloqueados'
      : `Siguiente desbloqueo: nivel ${1 + slots * 3}`;
    const captionText = `Pasivas equipadas: ${selected}/${slots} · ${unlockText}`;

    if (notice?.classList.contains('notice') && notice.textContent !== noticeText) {
      notice.textContent = noticeText;
    }
    if (caption?.classList.contains('passive-slots') && caption.textContent !== captionText) {
      caption.textContent = captionText;
    }
  };

  new MutationObserver(update).observe(document.querySelector('#party-app'), {
    childList: true,
    subtree: true
  });
  update();
})();

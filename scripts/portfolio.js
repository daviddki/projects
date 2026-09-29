// Lightbox for project photos — click any gallery image to enlarge.
(function () {
  const dialog = document.getElementById("lightbox");
  if (!dialog || typeof dialog.showModal !== "function") return;

  const imgs = Array.from(document.querySelectorAll(".gallery img, img.zoomable"));
  const big = dialog.querySelector("img");
  const cap = dialog.querySelector("figcaption");
  let index = 0;

  function show(i) {
    index = (i + imgs.length) % imgs.length;
    const src = imgs[index];
    big.src = src.currentSrc || src.src;
    big.alt = src.alt;
    const fc = src.closest("figure").querySelector("figcaption");
    cap.textContent = fc ? fc.textContent : "";
  }

  imgs.forEach((img, i) => {
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    const open = () => { show(i); dialog.showModal(); };
    img.addEventListener("click", open);
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });

  dialog.querySelector(".lb-close").addEventListener("click", () => dialog.close());
  dialog.querySelector(".lb-prev").addEventListener("click", () => show(index - 1));
  dialog.querySelector(".lb-next").addEventListener("click", () => show(index + 1));
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });

  // Swipe on touch screens
  let startX = null;
  dialog.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  dialog.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();

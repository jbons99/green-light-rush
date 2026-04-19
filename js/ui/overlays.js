function show(element) {
  element.classList.remove("hidden");
}

function hide(element) {
  element.classList.add("hidden");
}

export function showOverlay(element, duration = 1200) {
  show(element);
  setTimeout(() => hide(element), duration);
}

export async function countUpValue(element, target, duration = 900) {
  element.classList.add("counting");
  const start = performance.now();

  return new Promise((resolve) => {
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(target * progress);
      element.textContent = value;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        element.textContent = target;
        element.classList.remove("counting");
        resolve();
      }
    }

    requestAnimationFrame(tick);
  });
}

export async function showBigWin(overlayEl, valueEl, amount) {
  show(overlayEl);
  valueEl.textContent = "0";
  await countUpValue(valueEl, amount, 1100);
  return new Promise((resolve) => {
    setTimeout(() => {
      hide(overlayEl);
      resolve();
    }, 900);
  });
}

export function configureFeatureOverlay(titleEl, subtitleEl, title, subtitle) {
  titleEl.textContent = title;
  subtitleEl.textContent = subtitle;
}
const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");

menuToggle?.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("open");
  mobileNav.hidden = !isOpen;
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileNav.hidden = true;
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const track = document.getElementById("carouselTrack");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let currentIndex = 0;

function visibleItems() {
  if (window.innerWidth <= 760) return 1;
  if (window.innerWidth <= 900) return 2;
  return 3;
}

function maxIndex() {
  if (!track) return 0;
  const total = track.children.length;
  return Math.max(0, total - visibleItems());
}

function updateCarousel() {
  if (!track) return;
  const width = 100 / visibleItems();
  track.style.transform = `translateX(-${currentIndex * width}%)`;
}

function scrollPrev() {
  currentIndex = currentIndex <= 0 ? maxIndex() : currentIndex - 1;
  updateCarousel();
}

function scrollNext() {
  currentIndex = currentIndex >= maxIndex() ? 0 : currentIndex + 1;
  updateCarousel();
}

prevBtn?.addEventListener("click", scrollPrev);
nextBtn?.addEventListener("click", scrollNext);

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    currentIndex = Math.min(currentIndex, maxIndex());
    updateCarousel();
  }, 120);
});
updateCarousel();

const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const modalImageAvif = document.getElementById("modalImageAvif");
const modalImageWebp = document.getElementById("modalImageWebp");
const modalClose = document.getElementById("modalClose");

function firstSrcFromSet(srcset) {
  if (!srcset) return "";
  return srcset.split(",")[0]?.trim().split(" ")[0] ?? "";
}

track?.querySelectorAll(".gallery-item").forEach((item) => {
  item.addEventListener("click", () => {
    const fullAvif = item.getAttribute("data-full-avif") ?? "";
    const fullWebp = item.getAttribute("data-full-webp") ?? "";
    const fullJpg = item.getAttribute("data-full-jpg") ?? "";
    if (!modalImage || !(imageModal instanceof HTMLDialogElement))
      return;

    if (modalImageAvif instanceof HTMLSourceElement) {
      modalImageAvif.srcset = fullAvif;
    }

    if (modalImageWebp instanceof HTMLSourceElement) {
      modalImageWebp.srcset = fullWebp;
    }

    modalImage.srcset = fullJpg;
    modalImage.sizes = "(max-width: 900px) 92vw, 900px";
    modalImage.src = firstSrcFromSet(fullJpg) || firstSrcFromSet(fullWebp) || firstSrcFromSet(fullAvif);
    imageModal.showModal();
  });
});

modalClose?.addEventListener("click", () => {
  if (imageModal instanceof HTMLDialogElement) imageModal.close();
});

imageModal?.addEventListener("click", (event) => {
  if (!(imageModal instanceof HTMLDialogElement)) return;
  const rect = imageModal.getBoundingClientRect();
  const inside =
    rect.top <= event.clientY &&
    event.clientY <= rect.top + rect.height &&
    rect.left <= event.clientX &&
    event.clientX <= rect.left + rect.width;

  if (!inside) imageModal.close();
});

const contactForm = document.getElementById("contactForm");

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  alert("Thank you! We'll get back to you soon.");
  contactForm.reset();
});

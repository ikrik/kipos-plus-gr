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
    if (!modalImage || !(imageModal instanceof HTMLDialogElement)) return;

    if (modalImageAvif instanceof HTMLSourceElement) {
      modalImageAvif.srcset = fullAvif;
    }

    if (modalImageWebp instanceof HTMLSourceElement) {
      modalImageWebp.srcset = fullWebp;
    }

    modalImage.srcset = fullJpg;
    modalImage.sizes = "(max-width: 900px) 92vw, 900px";
    modalImage.src =
      firstSrcFromSet(fullJpg) ||
      firstSrcFromSet(fullWebp) ||
      firstSrcFromSet(fullAvif);
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
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "::1";

if (contactForm instanceof HTMLFormElement) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton?.textContent ?? "";
  const nameInput = contactForm.elements.namedItem("name");
  const emailInput = contactForm.elements.namedItem("email");
  const messageInput = contactForm.elements.namedItem("message");
  const nameError = contactForm.querySelector('[data-error-for="name"]');
  const emailError = contactForm.querySelector('[data-error-for="email"]');
  const messageError = contactForm.querySelector('[data-error-for="message"]');

  const fields = {
    name:
      nameInput instanceof HTMLInputElement || nameInput instanceof HTMLTextAreaElement
        ? nameInput
        : null,
    email:
      emailInput instanceof HTMLInputElement || emailInput instanceof HTMLTextAreaElement
        ? emailInput
        : null,
    message:
      messageInput instanceof HTMLInputElement || messageInput instanceof HTMLTextAreaElement
        ? messageInput
        : null,
  };

  const errorEls = {
    name: nameError instanceof HTMLElement ? nameError : null,
    email: emailError instanceof HTMLElement ? emailError : null,
    message: messageError instanceof HTMLElement ? messageError : null,
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const fieldNames = ["name", "email", "message"];
  let liveValidationEnabled = false;
  let isSubmitting = false;

  function validateName(value) {
    const trimmed = value.trim();
    if (!trimmed) return "Το όνομα είναι υποχρεωτικό.";
    if (trimmed.length < 2) return "Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες.";
    if (trimmed.length > 120) return "Το όνομα μπορεί να έχει έως 120 χαρακτήρες.";
    return "";
  }

  function validateEmail(value) {
    const trimmed = value.trim();
    if (!trimmed) return "Το email είναι υποχρεωτικό.";
    if (trimmed.length > 320) return "Το email μπορεί να έχει έως 320 χαρακτήρες.";
    if (!emailPattern.test(trimmed)) return "Συμπληρώστε έγκυρο email.";
    return "";
  }

  function validateMessage(value) {
    const trimmed = value.trim();
    if (!trimmed) return "Το μήνυμα είναι υποχρεωτικό.";
    if (trimmed.length < 10) return "Το μήνυμα πρέπει να έχει τουλάχιστον 10 χαρακτήρες.";
    if (trimmed.length > 5000) return "Το μήνυμα μπορεί να έχει έως 5000 χαρακτήρες.";
    return "";
  }

  function errorMessageForField(fieldName, value) {
    if (fieldName === "name") return validateName(value);
    if (fieldName === "email") return validateEmail(value);
    if (fieldName === "message") return validateMessage(value);
    return "";
  }

  function setFieldError(fieldName, message) {
    const field = fields[fieldName];
    const errorEl = errorEls[fieldName];
    if (!field || !errorEl) return;

    if (message) {
      field.classList.add("is-invalid");
      field.setAttribute("aria-invalid", "true");
      errorEl.textContent = message;
      errorEl.hidden = false;
      return;
    }

    field.classList.remove("is-invalid");
    field.removeAttribute("aria-invalid");
    errorEl.textContent = "";
    errorEl.hidden = true;
  }

  function validateField(fieldName) {
    const field = fields[fieldName];
    if (!field) return true;

    const message = errorMessageForField(fieldName, field.value);
    setFieldError(fieldName, message);
    return message === "";
  }

  function validateAllFields() {
    let isValid = true;
    for (const fieldName of fieldNames) {
      if (!validateField(fieldName)) isValid = false;
    }
    return isValid;
  }

  function isFormValid() {
    for (const fieldName of fieldNames) {
      const field = fields[fieldName];
      if (!field) return false;
      if (errorMessageForField(fieldName, field.value) !== "") return false;
    }
    return true;
  }

  function updateSubmitButtonState() {
    if (!(submitButton instanceof HTMLButtonElement)) return;
    submitButton.disabled = isSubmitting || (liveValidationEnabled && !isFormValid());
  }

  function onFieldChange(event) {
    if (!liveValidationEnabled) return;

    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if (!(target.name in fields)) return;

    validateField(target.name);
    updateSubmitButtonState();
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    liveValidationEnabled = true;

    const isValid = validateAllFields();
    updateSubmitButtonState();
    if (!isValid) return;

    if (submitButton instanceof HTMLButtonElement) {
      isSubmitting = true;
      updateSubmitButtonState();
      submitButton.textContent = "Αποστολή...";
    }

    try {
      const payload = {
        name: fields.name ? fields.name.value : "",
        email: fields.email ? fields.email.value : "",
        message: fields.message ? fields.message.value : "",
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseBody = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          responseBody && typeof responseBody.error === "string"
            ? responseBody.error
            : `HTTP ${response.status}`;
        const detailMessage =
          responseBody && typeof responseBody.details === "string"
            ? ` | Details: ${responseBody.details}`
            : "";
        throw new Error(`${errorMessage}${isLocalhost ? detailMessage : ""}`);
      }

      alert("Το μήνυμα στάλθηκε επιτυχώς. Θα επικοινωνήσουμε σύντομα μαζί σας.");
      contactForm.reset();
      for (const fieldName of fieldNames) {
        setFieldError(fieldName, "");
      }
    } catch (error) {
      console.error("Contact form submission failed:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      const alertMessage = isLocalhost
        ? `Αποτυχία αποστολής: ${message}`
        : "Αποτυχία αποστολής. Παρακαλώ δοκιμάστε ξανά.";
      alert(alertMessage);
    } finally {
      isSubmitting = false;
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.textContent = originalButtonText;
      }
      updateSubmitButtonState();
    }
  });

  if (fields.name) {
    fields.name.addEventListener("input", onFieldChange);
    fields.name.addEventListener("change", onFieldChange);
  }
  if (fields.email) {
    fields.email.addEventListener("input", onFieldChange);
    fields.email.addEventListener("change", onFieldChange);
  }
  if (fields.message) {
    fields.message.addEventListener("input", onFieldChange);
    fields.message.addEventListener("change", onFieldChange);
  }
}

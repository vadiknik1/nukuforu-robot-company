document.addEventListener("DOMContentLoaded", () => {
  const CART_STORAGE_KEY = "rf_cart_count";

  // 1. Підсвічування активного пункту меню
  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-list__link, .nav-list a");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const linkFile = href.split("#")[0].split("?")[0];
    if (linkFile && linkFile === currentFile) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });

  // 2. Мобільне меню (підтримує navToggle/navList, burger-btn/nav-list та burgerBtn/mainNav)
  const navToggle =
    document.getElementById("navToggle") ||
    document.getElementById("burger-btn") ||
    document.getElementById("burgerBtn");

  const navList =
    document.getElementById("navList") ||
    document.getElementById("nav-list") ||
    document.querySelector("#mainNav .nav-list");

  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navList.classList.toggle("is-open", !isOpen);
    });

    navList.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        navToggle.setAttribute("aria-expanded", "false");
        navList.classList.remove("is-open");
      });
    });
  }

  // 3. Плавний скрол до якірних блоків
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    const targetId = anchor.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  });

  // 4. Модальне вікно (index.html та about.html)
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalClose = document.getElementById("modal-close");
  const modalTitle = document.getElementById("modal-title");
  const modalForm = document.getElementById("contact-modal-form");
  const modalStatus = document.getElementById("modal-status");
  const openModalTriggers = document.querySelectorAll("[data-open-modal]");

  const clearModalErrors = () => {
    ["name", "email", "message"].forEach((field) => {
      const errEl = document.getElementById(`error-${field}`);
      if (errEl) errEl.textContent = "";
    });
    if (modalStatus) modalStatus.textContent = "";
  };

  const openModal = (mode = "contact") => {
    if (!modalBackdrop) return;
    clearModalErrors();
    if (modalTitle) {
      modalTitle.textContent =
        mode === "resume" ? "Надіслати резюме" : "Зв'язатися з нами";
    }
    modalBackdrop.classList.add("is-open");
    modalBackdrop.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove("is-open");
    modalBackdrop.setAttribute("aria-hidden", "true");
  };

  if (modalBackdrop && openModalTriggers.length > 0) {
    openModalTriggers.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const href = btn.getAttribute("href") || "";
        // Якщо посилання веде на футер без модалки — відкриваємо модалку тільки коли явно вказано data-open-modal
        if (btn.hasAttribute("data-open-modal")) {
          if (href.startsWith("#")) e.preventDefault();
          openModal(btn.dataset.openModal || "contact");
        }
      });
    });

    if (modalClose) {
      modalClose.addEventListener("click", closeModal);
    }

    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalBackdrop.classList.contains("is-open")) {
        closeModal();
      }
    });
  }

  if (modalForm) {
    modalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearModalErrors();

      const nameInput = document.getElementById("modal-name");
      const emailInput = document.getElementById("modal-email");
      const messageInput = document.getElementById("modal-message");

      const nameVal = nameInput ? nameInput.value.trim() : "";
      const emailVal = emailInput ? emailInput.value.trim() : "";
      const msgVal = messageInput ? messageInput.value.trim() : "";
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

      let hasError = false;

      if (!nameVal) {
        const err = document.getElementById("error-name");
        if (err) err.textContent = "Вкажіть ваше ім'я.";
        hasError = true;
      }

      if (!emailValid) {
        const err = document.getElementById("error-email");
        if (err) err.textContent = "Вкажіть коректний email.";
        hasError = true;
      }

      if (msgVal.length < 5) {
        const err = document.getElementById("error-message");
        if (err) err.textContent = "Повідомлення має містити щонайменше 5 символів.";
        hasError = true;
      }

      if (hasError) return;

      if (modalStatus) {
        modalStatus.textContent = "Повідомлення успішно надіслано!";
      }
      modalForm.reset();
    });
  }

  // 5. Кошик зі збереженням у localStorage
  const cartCountEl = document.getElementById("cartCount");
  const cartStatusLinks = document.querySelectorAll(".cart-status");
  let cartCount = Number(localStorage.getItem(CART_STORAGE_KEY) || "0");
  if (Number.isNaN(cartCount) || cartCount < 0) cartCount = 0;

  const syncCartUI = () => {
    if (cartCountEl) {
      cartCountEl.textContent = String(cartCount);
    } else {
      // Для index.html та about.html, де текст усередині <a class="cart-status">0 ТОВАРІВ</a>
      cartStatusLinks.forEach((link) => {
        if (!link.querySelector("#cartCount")) {
          link.textContent = `${cartCount} ТОВАРІВ`;
        }
      });
    }
    localStorage.setItem(CART_STORAGE_KEY, String(cartCount));
  };

  syncCartUI();

  const addButtons = document.querySelectorAll("[data-add-to-cart]");
  addButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      cartCount += 1;
      syncCartUI();

      const originalLabel = btn.dataset.originalText || btn.textContent;
      btn.dataset.originalText = originalLabel;
      btn.textContent = "Додано ✓";
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = originalLabel;
        btn.disabled = false;
      }, 850);
    });
  });

  // 6. Пагінація, пошук та підтримка ?q= у каталозі (shop.html)
  const cards = Array.from(document.querySelectorAll(".product-card"));
  const pageButtons = Array.from(document.querySelectorAll("[data-page-btn]"));
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  const searchForm = document.getElementById("shopSearchForm");
  const searchInput = document.getElementById("shopSearchInput");
  const resetBtn = document.getElementById("resetFiltersBtn");
  const statusText = document.getElementById("catalogStatusText");
  const emptyState = document.getElementById("emptyCatalogState");
  const paginationNav = document.getElementById("shopPagination");

  if (cards.length > 0) {
    let currentPage = 1;
    const totalPages = Math.max(pageButtons.length, 1);

    const urlParams = new URLSearchParams(window.location.search);
    let searchQuery = urlParams.get("q") || "";
    if (searchInput && searchQuery) {
      searchInput.value = searchQuery;
    }

    const renderCatalog = () => {
      const query = searchQuery.trim().toLowerCase();
      const hasQuery = query.length > 0;
      let visibleCount = 0;

      cards.forEach((card) => {
        const cardPage = Number(card.dataset.page) || 1;
        const searchableText = (card.dataset.title || card.textContent || "").toLowerCase();
        const isMatch = hasQuery ? searchableText.includes(query) : cardPage === currentPage;

        card.classList.toggle("is-hidden", !isMatch);
        if (isMatch) visibleCount += 1;
      });

      if (emptyState) {
        emptyState.classList.toggle("is-hidden", visibleCount > 0);
      }

      if (paginationNav) {
        paginationNav.classList.toggle("is-hidden", hasQuery);
      }

      pageButtons.forEach((btn) => {
        const btnPage = Number(btn.dataset.pageBtn);
        const active = btnPage === currentPage;
        btn.classList.toggle("is-active", active);
        if (active) {
          btn.setAttribute("aria-current", "page");
        } else {
          btn.removeAttribute("aria-current");
        }
      });

      if (prevBtn) prevBtn.disabled = currentPage <= 1;
      if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

      if (statusText) {
        statusText.textContent = hasQuery
          ? `Пошук "${searchQuery.trim()}": знайдено ${visibleCount}`
          : `Сторінка ${currentPage} з ${totalPages}`;
      }
    };

    pageButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        currentPage = Number(btn.dataset.pageBtn) || 1;
        renderCatalog();
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage -= 1;
          renderCatalog();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
          currentPage += 1;
          renderCatalog();
        }
      });
    }

    if (searchForm && searchInput) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        searchQuery = searchInput.value;
        renderCatalog();
      });

      searchInput.addEventListener("input", () => {
        searchQuery = searchInput.value;
        renderCatalog();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        searchQuery = "";
        if (searchInput) searchInput.value = "";
        currentPage = 1;
        renderCatalog();
      });
    }

    renderCatalog();
  }

  // 7. Кнопка "Вгору" (підтримує scrollTopBtn та scroll-top-btn)
  const scrollTopBtn =
    document.getElementById("scrollTopBtn") ||
    document.getElementById("scroll-top-btn");

  if (scrollTopBtn) {
    const toggleScrollBtn = () => {
      scrollTopBtn.classList.toggle("is-visible", window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleScrollBtn, { passive: true });
    toggleScrollBtn();

    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
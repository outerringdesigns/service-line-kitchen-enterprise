/* Service Line Kitchen Enterprise — home page behavior (vanilla JS) */

(function () {
  "use strict";

  /*
   * Form submission.
   * Leave SUBMIT_ENDPOINT as null while the form is a demo. When a real
   * endpoint is connected (it must accept a JSON POST and return 2xx on
   * success), set it here and the demo notice is removed automatically.
   */
  var SUBMIT_ENDPOINT = null;

  var SUCCESS_MESSAGE = "Thank you. Dispatch will call to confirm availability and next steps.";

  /* ---------- Mobile menu ---------- */

  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  var desktopQuery = window.matchMedia("(min-width: 960px)");

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    toggle.querySelector(".menu-toggle-label").textContent = open ? "Close" : "Menu";
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (toggle.getAttribute("aria-expanded") === "true" &&
          !nav.contains(e.target) && !toggle.contains(e.target)) {
        setMenu(false);
      }
    });

    desktopQuery.addEventListener("change", function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- Move focus to the form when a CTA is used ---------- */

  document.querySelectorAll('a[href="#request"]').forEach(function (link) {
    link.addEventListener("click", function () {
      // Let the browser scroll first, then put the keyboard on the first field.
      window.setTimeout(function () {
        var first = document.getElementById("business");
        if (first) first.focus({ preventScroll: true });
      }, 350);
    });
  });

  /* ---------- Hide the mobile sticky CTA while the form is on screen ---------- */

  var mobileCta = document.getElementById("mobile-cta");
  var requestSection = document.getElementById("request");
  var heroCta = document.querySelector(".hero-actions .btn");

  if (mobileCta && "IntersectionObserver" in window) {
    var formVisible = false;
    var heroCtaVisible = true;
    var update = function () {
      mobileCta.classList.toggle("is-hidden", formVisible || heroCtaVisible);
    };
    if (requestSection) {
      new IntersectionObserver(function (entries) {
        formVisible = entries[0].isIntersecting;
        update();
      }, { threshold: 0.05 }).observe(requestSection);
    }

    if (heroCta) {
      new IntersectionObserver(function (entries) {
        heroCtaVisible = entries[0].isIntersecting;
        update();
      }).observe(heroCta);
    }
    update();
  }

  /* ---------- Repair request form ---------- */

  var form = document.getElementById("repair-form");
  if (!form) return;

  var statusBox = document.getElementById("form-status");
  var demoNotice = document.getElementById("demo-notice");
  var submitBtn = form.querySelector('button[type="submit"]');

  if (SUBMIT_ENDPOINT && demoNotice) demoNotice.hidden = true;

  function digits(value) {
    return value.replace(/\D/g, "");
  }

  var validators = {
    business: function (v) {
      if (!v.trim()) return "Enter your business name.";
      return "";
    },
    zip: function (v) {
      var z = v.trim();
      if (!z) return "Enter the ZIP code where the equipment is located.";
      if (!/^\d{5}$/.test(z)) return "Enter a 5-digit ZIP code, for example 10601.";
      return "";
    },
    equipment: function (v) {
      if (!v) return "Choose the type of equipment.";
      return "";
    },
    problem: function (v) {
      var t = v.trim();
      if (!t) return "Briefly describe what the equipment is doing.";
      if (t.length < 10) return "Add a few more words so dispatch understands the problem.";
      return "";
    },
    phone: function (v) {
      var d = digits(v);
      if (!d) return "Enter a callback number.";
      if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
      if (d.length !== 10) return "Enter a 10-digit phone number, including area code.";
      return "";
    }
  };

  function errorEl(field) {
    return document.getElementById(field.id + "-error");
  }

  function validateField(field) {
    var check = validators[field.name];
    if (!check) return true;
    var message = check(field.value);
    var el = errorEl(field);
    if (el) el.textContent = message;
    if (message) {
      field.setAttribute("aria-invalid", "true");
    } else {
      field.removeAttribute("aria-invalid");
    }
    return !message;
  }

  var fields = Array.prototype.slice.call(form.querySelectorAll("input, select, textarea"));

  fields.forEach(function (field) {
    // Validate on leaving a field, then re-check live once it has shown an error.
    field.addEventListener("blur", function () {
      if (field.value !== "" || field.hasAttribute("aria-invalid")) validateField(field);
    });
    field.addEventListener("input", function () {
      if (field.hasAttribute("aria-invalid")) validateField(field);
    });
    field.addEventListener("change", function () {
      if (field.tagName === "SELECT") validateField(field);
    });
  });

  // Keep the ZIP field to digits only.
  var zipField = document.getElementById("zip");
  if (zipField) {
    zipField.addEventListener("input", function () {
      var clean = digits(zipField.value).slice(0, 5);
      if (clean !== zipField.value) zipField.value = clean;
    });
  }

  function showStatus(message, kind) {
    statusBox.textContent = message;
    statusBox.className = "form-status" + (kind ? " is-" + kind : "");
    statusBox.hidden = false;
    statusBox.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusBox.hidden = true;

    var firstInvalid = null;
    fields.forEach(function (field) {
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Honeypot: people never see this field, so anything in it is a bot.
    var trap = form.querySelector('[name="website"]');
    if (trap && trap.value) {
      showStatus("Your request could not be sent. Please try again.", "error");
      return;
    }

    if (!SUBMIT_ENDPOINT) {
      showStatus(
        "Demo only: your entries are complete, but this form is not connected, so no request was sent. " +
        "Nothing has been shared with dispatch.",
        "demo"
      );
      return;
    }

    var payload = {};
    fields.forEach(function (field) { payload[field.name] = field.value.trim(); });

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending request…";

    fetch(SUBMIT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed: " + res.status);
        form.reset();
        showStatus(SUCCESS_MESSAGE, "success");
      })
      .catch(function () {
        showStatus(
          "Your request could not be sent. Please check your connection and try again.",
          "error"
        );
      })
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Request Equipment Repair";
      });
  });
})();

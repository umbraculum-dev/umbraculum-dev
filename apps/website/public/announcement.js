(function mountUmbraculumAnnouncement() {
  const ROOT_ID = "umb-announcement-root";
  const CONFIG_URL = "/announcement.config.json";
  const STORAGE_PREFIX = "umb-announcement-dismissed:";

  function storageKey(id) {
    return STORAGE_PREFIX + id;
  }

  function createBanner(config) {
    const region = document.createElement("section");
    region.className = "umb-announcement umb-announcement--" + (config.variant || "info");
    region.setAttribute("role", "region");
    region.setAttribute("aria-label", "Site announcement");

    const inner = document.createElement("div");
    inner.className = "umb-announcement__inner";

    const body = document.createElement("div");
    body.className = "umb-announcement__body";
    body.innerHTML = config.html || "";

    inner.appendChild(body);

    if (config.dismissible !== false) {
      const dismiss = document.createElement("button");
      dismiss.type = "button";
      dismiss.className = "umb-announcement__dismiss";
      dismiss.setAttribute("aria-label", "Dismiss announcement");
      dismiss.textContent = "\u00d7";
      dismiss.addEventListener("click", function () {
        try {
          localStorage.setItem(storageKey(config.id), "1");
        } catch {
          /* ignore */
        }
        region.remove();
      });
      inner.appendChild(dismiss);
    }

    region.appendChild(inner);
    return region;
  }

  fetch(CONFIG_URL, { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) {
        throw new Error("announcement config missing");
      }
      return res.json();
    })
    .then(function (config) {
      if (!config || !config.enabled || !config.id || !config.html) {
        return;
      }
      try {
        if (localStorage.getItem(storageKey(config.id)) === "1") {
          return;
        }
      } catch {
        /* ignore */
      }

      let root = document.getElementById(ROOT_ID);
      if (!root) {
        root = document.createElement("div");
        root.id = ROOT_ID;
        document.body.prepend(root);
      }
      root.replaceChildren(createBanner(config));
    })
    .catch(function () {
      /* no banner when config unavailable */
    });
})();

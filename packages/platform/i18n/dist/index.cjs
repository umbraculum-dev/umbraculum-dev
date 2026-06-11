"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  defaultLocale: () => defaultLocale,
  en: () => en,
  getSharedMessages: () => getSharedMessages,
  isLocale: () => isLocale,
  it: () => it,
  locales: () => locales
});
module.exports = __toCommonJS(index_exports);
var import_node_module = require("module");
var import_module_sdk = require("@umbraculum/module-sdk");

// src/en.json
var en_default = {
  pim: {
    title: "Product Information Management",
    subtitle: "Master product, variant, attribute, and category catalog.",
    products: {
      title: "Products",
      listTitle: "Products",
      noProducts: "No products in this workspace yet.",
      loading: "Loading\u2026",
      refresh: "Refresh",
      refreshing: "Refreshing\u2026",
      create: "Create product",
      creating: "Creating\u2026",
      createSuccess: "Product created.",
      createError: "Could not create product.",
      createRequired: "SKU and name are required.",
      openDetail: "View product",
      back: "Back to products",
      searchPlaceholder: "Search by SKU or name\u2026",
      attributeSetPlaceholder: "Optional attribute set id",
      notFound: "Product not found in this workspace."
    },
    variants: {
      title: "Variants",
      noVariants: "No variants for this product yet."
    },
    categories: {
      title: "Categories",
      noCategories: "No categories in this workspace yet.",
      back: "Back to products"
    },
    attributeSets: {
      title: "Attribute sets",
      noSets: "No attribute sets in this workspace yet.",
      openDetail: "View set",
      back: "Back to attribute sets"
    },
    fields: {
      sku: "SKU",
      name: "Name",
      status: "Status",
      description: "Description",
      attributeSet: "Attribute set",
      code: "Code",
      label: "Label"
    },
    values: {
      draft: "Draft",
      active: "Active",
      archived: "Archived",
      none: "\u2014"
    }
  },
  automation: {
    title: "Automation",
    subtitle: "Live controller state for the vessels in this workspace. (Scheduling, capacity, and utilization belong to the future capacity-resource-planning module \u2014 not this surface.)",
    listTitle: "Vessels",
    noVessels: "No vessels in this workspace yet. Vessels appear here once the automation supervisor receives the first snapshot from a connected adapter.",
    loading: "Loading\u2026",
    refresh: "Refresh",
    refreshing: "Refreshing\u2026",
    openDetail: "View details",
    back: "Back to vessels",
    error: "Could not load vessels.",
    notFound: "Vessel not found in this workspace.",
    fields: {
      code: "Code",
      displayName: "Display name",
      vesselKind: "Kind",
      mode: "Mode",
      currentTempC: "Current temperature (\xB0C)",
      targetTempC: "Target temperature (\xB0C)",
      alarmActive: "Alarm",
      lastSeenAt: "Last seen",
      equipmentProfileId: "Equipment profile",
      adapterConnectionId: "Adapter connection"
    },
    values: {
      alarmOn: "Active",
      alarmOff: "None",
      never: "Never",
      none: "\u2014"
    }
  },
  mrp: {
    title: "Production planning",
    subtitle: "Read-only MRP alpha view over existing brewery recipes and brew sessions.",
    alphaNote: "Rows marked as projected are read models. Brewery remains the source of truth; no MRP rows are created from this page.",
    loading: "Loading\u2026",
    refresh: "Refresh",
    refreshing: "Refreshing\u2026",
    error: "Could not load production planning data.",
    noProductionOrders: "No production orders or brewery projections in this workspace yet.",
    noMaterialRequirements: "No material requirements are visible yet.",
    export: {
      workOrderPdf: "Export work order (PDF)",
      routeCardPdf: "Export route card (PDF)",
      materialRequirementsXlsx: "Export material requirements (XLSX)",
      productionOrdersCsv: "Export production orders (CSV)",
      working: "Preparing export\u2026",
      download: "Download export",
      error: "Export failed"
    },
    productionOrders: {
      listTitle: "Production orders",
      openDetail: "View order",
      back: "Back to production orders",
      materialRequirements: "Material requirements",
      operations: "Operations",
      capacityLink: "Open capacity view",
      scheduleLink: "Open CRP schedule"
    },
    materialRequirements: {
      title: "Material requirements",
      subtitle: "Read-only entry point for per-order material requirements. Open an order to see its ingredient-derived requirements.",
      openOrder: "Open order requirements"
    },
    fields: {
      orderNumber: "Order number",
      status: "Status",
      quantity: "Quantity",
      plannedStartAt: "Planned start",
      dueAt: "Due",
      createdAt: "Created",
      source: "Source",
      sourceRefId: "Source reference",
      debugId: "Debug ID",
      outputProductId: "Output product",
      lineCount: "Lines",
      operationCode: "Operation code",
      operationName: "Operation",
      duration: "Duration",
      earliestStartAt: "Earliest start",
      availability: "Availability",
      availabilityNote: "Availability note",
      material: "Material",
      requiredQuantity: "Required quantity",
      productionOrder: "Production order"
    },
    values: {
      none: "\u2014",
      unknownDate: "Not scheduled",
      canonicalMrpRow: "Canonical MRP row",
      projectedFromBrewery: "Projected from brewery",
      projectedFromModule: "Projected from {module}"
    }
  },
  crp: {
    title: "Capacity planning",
    subtitle: "Read-only CRP alpha view over automation vessels, brewery equipment, and timed brew-session steps.",
    alphaNote: "Rows marked as projected are read models. Automation and brewery remain the sources of truth; no CRP rows are created from this page.",
    loading: "Loading\u2026",
    refresh: "Refresh",
    refreshing: "Refreshing\u2026",
    error: "Could not load capacity planning data.",
    noResources: "No capacity resources or automation projections in this workspace yet.",
    noWorkCenters: "No work-center projections in this workspace yet.",
    noCapacity: "No capacity load buckets are visible yet.",
    noSchedule: "No scheduled operations are visible yet.",
    noConflicts: "No capacity warnings are visible.",
    resources: {
      listTitle: "Resources",
      openDetail: "View resource",
      workCentersTitle: "Work centers",
      workCentersNote: "Work centers are read-only brewery equipment profile projections. They explain the capacity context without moving ownership out of brewery.",
      openRelatedResource: "Open related resource",
      automationSourceLink: "Open automation vessel",
      back: "Back to resources",
      capacityLink: "Open capacity view",
      scheduleLink: "Open schedule"
    },
    export: {
      capacityLoadXlsx: "Export capacity load (XLSX)",
      schedulePdf: "Export schedule (PDF)",
      conflictReportPdf: "Export conflict report (PDF)",
      resourceCalendarCsv: "Export resource calendar (CSV)",
      working: "Preparing export\u2026",
      download: "Download export",
      error: "Export failed"
    },
    capacity: {
      title: "Capacity load",
      note: "Alpha buckets with 0 available minutes are read-model evidence, not final CRP calendar capacity.",
      resourceLink: "Open resource detail"
    },
    schedule: {
      title: "Schedule",
      conflictsTitle: "Read-only warnings",
      resourcesLink: "Open resources",
      capacityLink: "Open capacity"
    },
    fields: {
      resource: "Resource",
      code: "Code",
      name: "Name",
      kind: "Kind",
      status: "Status",
      source: "Source",
      sourceRefId: "Source reference",
      createdAt: "Created",
      updatedAt: "Updated",
      debugId: "Debug ID",
      bucketStartAt: "Bucket start",
      bucketEndAt: "Bucket end",
      availableMinutes: "Available minutes",
      plannedMinutes: "Planned minutes",
      overloadMinutes: "Overload minutes",
      operationCode: "Operation code",
      productionOrder: "Production order",
      workCenter: "Work center",
      startsAt: "Starts",
      endsAt: "Ends",
      duration: "Duration",
      conflict: "Conflict",
      severity: "Severity"
    },
    values: {
      none: "\u2014",
      canonicalCrpRow: "Canonical CRP row",
      projectedFromAutomationVessel: "Projected from automation vessel",
      projectedFromBrewery: "Projected from brewery",
      projectedFromModule: "Projected from {module}",
      zeroAvailabilityAlpha: "0 available minutes (alpha read model)"
    }
  },
  common: {
    backToDashboard: "Back to Dashboard",
    loading: "Loading\u2026",
    refresh: "Refresh",
    close: "Close",
    remove: "Remove",
    dateLabel: "Date",
    timeLabel: "Time",
    localeLabel: "Language",
    toggle: "Toggle",
    changeLanguage: "Change language",
    toggleLanguage: "Toggle language",
    dilutionDiagramLabel: "Dilution 1:100 diagram",
    imageUnavailable: "Image unavailable"
  },
  locales: {
    en: "English",
    it: "Italiano",
    de: "Deutsch",
    es: "Espa\xF1ol"
  },
  units: {
    C: "\xB0C",
    L: "L",
    count: "count",
    g: "g",
    mL: "mL",
    kg: "kg",
    lovibond: "\xB0L",
    LPerKg: "L/kg",
    LPerG: "L/g",
    ppm: "ppm",
    ppmAsCaCO3: "ppm as CaCO3",
    tsp: "tsp",
    pH: "pH"
  },
  nav: {
    dashboard: "Dashboard",
    recipes: "Recipes",
    inventory: "Inventory",
    waterProfiles: "Water profiles",
    equipment: "Equipment",
    automation: "Automation",
    pim: "Products",
    mrp: "Production planning",
    crp: "Capacity planning",
    ai: "AI",
    about: "About",
    language: "Language",
    accessibility: "Accessibility",
    login: "Log in",
    logout: "Log out",
    notAvailableOnMobileYet: "Not available on mobile yet.",
    openOnWeb: "Open on web",
    missingApiBaseUrl: "Missing API base URL (EXPO_PUBLIC_API_BASE_URL).",
    signedInAs: "Signed in as",
    activeWorkspace: "Active workspace",
    switchWorkspace: "Switch workspace",
    activeAccount: "Active workspace",
    switchAccount: "Switch workspace",
    ariaPrimary: "Primary",
    ariaSession: "Session",
    menu: "Menu"
  },
  ads: {
    ariaLabel: "Advertisement",
    contactLine: "Contact us for hosting your ad here.",
    upgradeLine: "Upgrade to a paid plan for removal."
  },
  platformAds: {
    title: "Platform ads",
    subtitle: "Manage platform-scoped ads (web). Visible across accounts unless ads are disabled for a workspace.",
    hint: "Tip: preview placements by opening any page and hard-reloading (locale: {locale}).",
    globalBottomNote: "Note: the Global bottom placement is hidden on the recipe edit page to avoid layout jumps on mobile.",
    loading: "Loading\u2026",
    notAuthorized: "You are not authorized to manage platform ads.",
    refresh: "Refresh",
    refreshing: "Refreshing\u2026",
    create: "Create ad",
    creating: "Creating\u2026",
    listTitle: "Ads",
    noAds: "No ads yet.",
    form: {
      placement: "Placement",
      priority: "Priority",
      imageUrl: "Image URL",
      linkUrl: "Link URL",
      altText: "Alt text",
      isActive: "Active"
    },
    placements: {
      globalTop: "Global top",
      globalBottom: "Global bottom",
      recipeEditAfterFermentables: "Recipe edit: after Fermentables",
      recipeEditAfterHops: "Recipe edit: after Hops",
      recipeEditAfterYeast: "Recipe edit: after Yeast"
    },
    table: {
      placement: "Placement",
      imageUrl: "Image",
      linkUrl: "Link",
      active: "Active",
      actions: "Actions",
      open: "Open",
      yes: "yes",
      no: "no",
      delete: "Delete",
      toggleActiveAria: "Toggle active for ad {id}"
    }
  },
  platform: {
    navLabel: "Platform admin",
    ads: "Ads",
    recipes: "Recipes"
  },
  platformRecipes: {
    title: "Platform recipes import/export",
    subtitle: "Import or export recipes for any workspace. Select a workspace first.",
    loading: "Loading\u2026",
    notAuthorized: "You are not authorized to manage platform recipes.",
    workspaceLabel: "Workspace",
    workspacePlaceholder: "Select workspace\u2026",
    workspaceRequired: "Select a workspace to import or export.",
    accountLabel: "Workspace",
    accountPlaceholder: "Select workspace\u2026",
    accountRequired: "Select a workspace to import or export.",
    exportSectionTitle: "Export (full BeerJSON)",
    exportSingleLabel: "Export single recipe",
    exportSingleCta: "Download selected",
    exportBulkCta: "Export all recipes",
    exportNoneAvailable: "No recipes",
    exportFullNote: "Platform export includes full BeerJSON and recipeExtJson."
  },
  accessibility: {
    title: "Accessibility",
    subtitle: "Adjust contrast, text size, and spacing. Saved on this device; if you are signed in, settings also sync to your account.",
    loading: "Loading\u2026",
    themePreset: "Theme preset",
    fontScale: "Text size",
    density: "Spacing",
    saving: "Saving\u2026",
    savingHint: "Changes apply immediately.",
    theme: {
      default: "Default",
      hcDark: "High contrast (dark)",
      hcLight: "High contrast (light)"
    },
    font: {
      sm: "Small (90%)",
      md: "Normal (100%)",
      lg: "Large (110%)",
      xl: "Extra large (125%)"
    },
    densityOptions: {
      comfortable: "Comfortable",
      compact: "Compact"
    },
    note: "Tip: your browser zoom also works, and respects locale ({locale})."
  },
  dashboard: {
    title: "Dashboard",
    subtitle: "Desktop-first web app + native mobile apps, offline-first brew-day logging.",
    links: {
      title: "Brew day & Brewing data",
      fermDataIntegration: "Ferm Data & Integration",
      brewdayStepsSettings: "Brewday Steps Settings",
      waterProfiles: "Water profiles",
      brewery: "Brewery",
      equipment: "Equipment",
      inventory: "Inventory",
      ai: "AI consultant"
    },
    importExport: {
      title: "Import / Export",
      supportedNote: "Recipe import/export interoperability is centered on BeerJSON (canonical).",
      importFormats: "Import: BeerJSON (.json) and BeerXML (.xml).",
      exportFormats: "Export: BeerJSON (.json).",
      actionsLiveInRecipes: "Import/export actions live under Recipes:",
      actionsCta: "Go to Recipes",
      customImportNote: "Need another system?",
      customImportCta: "Contact us for affordable custom import."
    },
    fermDataIntegration: {
      title: "Ferm Data & Integration",
      subtitle: "Integrations and fermentation data (stats and insights).",
      backToDashboard: "Back to dashboard",
      sections: {
        integration: {
          title: "Floating hydrometers integrations",
          empty: "No integrations yet.",
          error: "Error:",
          intro: "Each integration has its own Cloud URL. Pick your device type and follow its steps.",
          tiltTitle: "Tilt Hydrometer",
          tiltSupportedNotice: "Supported.",
          tiltSubtitle: "Use this if you have a Tilt gateway or TiltPi.",
          stepsLabel: "Steps:",
          step1: "1) Reveal token + Cloud URL",
          step2: "2) Paste the Cloud URL into TiltPi or the Tilt app",
          step3: "3) After the first log, attach the device to a brew session.",
          ispindelTitle: "iSpindel",
          ispindelWarning: "Not supported yet (coming soon).",
          ispindelSubtitle: "Token management will be available soon.",
          raptTitle: "RAPT",
          raptWarning: "Not supported yet (coming soon).",
          raptSubtitle: "Token management will be available soon.",
          configured: "Configured.",
          notConfigured: "Not configured.",
          working: "Working\u2026",
          cloudUrlLabel: "Cloud URL",
          cloudUrlAria: "Cloud URL",
          cloudUrlAriaTilt: "Cloud URL (copy into your Tilt gateway)",
          cloudUrlAriaGeneric: "Cloud URL (copy into your gateway)",
          cloudUrlHelp: "Use this URL in your gateway.",
          cloudUrlHelpTilt: "Use this URL in TiltPi / Tilt 2 \u201CCustom Cloud URL\u201D.",
          cloudUrlHelpGeneric: "Use this URL in your device gateway once supported.",
          tokenLabel: "Token (one-time)",
          tokenAria: "Integration token (one-time display)",
          tokenHelp: "This token is shown once. Save it if you need to reconfigure; otherwise rotate a new token later.",
          copy: "Copy",
          copied: "Copied",
          copyUrlAria: "Copy Cloud URL",
          copyTokenAria: "Copy token",
          devicesTitle: "Connected Tilt devices",
          noDevices: "No Tilt devices have logged yet.",
          device: "Device",
          deviceKey: "Key",
          deviceChartTitle: "Recent readings",
          chartGravity: "Gravity",
          chartTemperature: "Temperature",
          chartXAxis: "Time",
          chartGravityAxis: "Gravity (SG)",
          chartTemperatureAxis: "Temperature (\xB0C)",
          lastReading: "Last reading",
          noReadingsYet: "No readings yet.",
          attachedTo: "Attached to",
          notAttached: "Not attached",
          attachLabel: "Attach to brew session",
          attachPlaceholder: "Select\u2026",
          attach: "Attach",
          detach: "Detach",
          actions: {
            create: "Create integration",
            createAgain: "Generate new token",
            reveal: "Reveal Cloud URL",
            rotate: "Rotate token",
            revoke: "Revoke",
            createAria: "Create Tilt integration",
            rotateAria: "Rotate Tilt integration token",
            revokeAria: "Revoke Tilt integration",
            createAriaGeneric: "Create integration",
            rotateAriaGeneric: "Rotate integration token",
            revokeAriaGeneric: "Revoke integration"
          }
        }
      }
    },
    brewdayStepsSettings: {
      title: "Brewday Steps Settings",
      subtitle: "Configure brew day steps, timers, and brewing type.",
      backToDashboard: "Back to dashboard",
      brewingTypeAllGrain: "All grain",
      brewingTypeExtractPartialBiab: "Extract/Partial-mash/BIAB (homebrewing)",
      saveSuccess: "Saved.",
      loading: "Loading\u2026",
      saving: "Saving\u2026",
      accountRequired: "Select an account to continue.",
      exclude: "Exclude",
      addCustomSection: "Add custom section",
      addCustomBrewingMethod: "Add custom brewing method",
      addCustomStep: "Add custom step",
      assignedSection: "Assigned section",
      minutes: "Minutes",
      presetSections: {
        preparation: "Preparation",
        pre_mash: "Pre mash",
        mash: "Mash",
        lauter: "Lauter",
        sparge: "Sparge",
        boil: "Boil",
        post_boil: "Post boil",
        fermentor: "Fermentor",
        cleanup: "Cleanup",
        quality: "Quality",
        miscellaneous: "Miscellaneous"
      },
      defaultSectionNote: "Brew steps: add to your default setup. You can exclude them in brew day if you use only for specific recipes but you can not add in brew day workflow if not added here.",
      customSectionNote: "Add custom steps with name, optional minutes, and assigned section.",
      add: "Add",
      save: "Save",
      name: "Name",
      moveUp: "Move up",
      moveDown: "Move down",
      remove: "Remove",
      sections: {
        brewdayStepsRecap: {
          title: "Brewday Steps Recap",
          empty: "No brew steps yet."
        },
        brewingType: {
          title: "Brewing methods",
          label: "Brewing method"
        },
        brewdayStepsSections: {
          title: "Brewday steps - sections",
          placeholder: "Coming soon."
        },
        brewdayStepsDefault: {
          title: "Brewday steps - default",
          placeholder: "Coming soon."
        },
        brewdayStepsCustom: {
          title: "Brewday steps - custom",
          placeholder: "Coming soon."
        },
        brewdayNotes: {
          title: "Brewday notes"
        }
      }
    }
  },
  contact: {
    title: "Contact",
    subtitle: "For custom import requests, send us a message and we\u2019ll reply with next steps and an estimate.",
    emailHeading: "Email",
    emailLabel: "Email:",
    emailAddress: "demo@umbraculum.dev",
    mailtoSubject: "Custom import request",
    emailCta: "Email us"
  },
  health: {
    title: "API health",
    subtitle: "Fetching {url} from the browser (via Nginx).",
    appPermissions: {
      title: "App permissions",
      subtitle: "User = your login identity. Workspace = shared tenant boundary. Roles (brewery_admin/member/viewer) and ACL determine what you can do.",
      userLabel: "User",
      activeWorkspaceLabel: "Active workspace",
      roleLabel: "Your role in this workspace",
      roleUnknown: "unknown",
      selectWorkspaceCta: "Select workspace"
    }
  },
  contributing: {
    title: "Contributing",
    subtitle: "Help improve translations and brewing datasets used by the app.",
    sections: {
      i18n: {
        title: "Help translate (i18n contributing)"
      },
      rawMaterials: {
        title: "Help improve raw materials database",
        subtitle: "If you find missing or incorrect fermentables/hops/yeast/other ingredients (or water-related profiles), tell us so we can improve the canonical dataset.",
        step1: "Note what\u2019s missing/incorrect (name, producer, key specs like color/yield/AA% where applicable).",
        step2: "Include a screenshot or the exact values if possible (helps avoid ambiguity).",
        step3: "Open a report using our Raw materials issue template (coming soon).",
        issueTemplateNote: "We\u2019ll add a direct link once the GitHub contribution workflow is finalized."
      }
    }
  },
  ui: {
    addSalt: "Add salt",
    amountLabel: "Amount ({unit})",
    salt: "Salt",
    noSaltsAddedYet: "No salts added yet.",
    fx: "fx"
  },
  about: {
    title: "About",
    subtitle: "Brewery App is an internal tool for recipe development and brew-day logging, with a water chemistry calculator inspired by BrunWater, Troester and others. Beer.json schema fully supported. Raw material database of choice for v0 is BeerProto.",
    translationsRowPrefix: "Translations are welcome and managed via our contribution workflow (see",
    translationsRowLinkText: "Help translate",
    translationsRowSuffix: ").",
    translationsSideNote: "Side note: this is just a primer \u2014 the translation contribution workflow is planned, but not fully in place yet."
  },
  auth: {
    selectAccount: {
      title: "Select workspace",
      subtitle: "Choose which workspace you want to work in.",
      loading: "Loading\u2026",
      noAccountsFound: "No workspaces found."
    },
    selectWorkspace: {
      title: "Select workspace",
      subtitle: "Choose which workspace you want to work in.",
      loading: "Loading\u2026",
      noWorkspacesFound: "No workspaces found."
    },
    loginTitle: "Sign in",
    signupTitle: "Create account",
    emailLabel: "Email",
    passwordLabel: "Password",
    workspaceNameLabel: "Workspace name (optional)",
    accountNameLabel: "Workspace name (optional)",
    submitLogin: "Sign in",
    submitSignup: "Create account",
    submitting: "Submitting\u2026",
    languageLabel: "Language",
    noteTitle: "Translations status",
    noteBody: "English is the original language. Other languages (starting with Italian) will soon be 100% supported. Spanish and German are coming soon as well.",
    helpTranslate: "Help translate (i18n contributing)",
    sessionExpired: {
      title: "Session expired",
      body: "You have been signed out. Redirecting you to sign in again.",
      cta: "Log in now",
      countdown: "Redirecting in {seconds}s\u2026"
    }
  },
  i18nContributing: {
    title: "Help translate (i18n contributing)",
    subtitle: "We welcome translation contributions. English is the source of truth; Italian is the first community language.",
    howItWorksTitle: "How translations work",
    howItWorks1: "The web app uses locale-prefixed URLs (e.g. /en/..., /it/...).",
    howItWorks2Prefix: "Translations live in",
    howItWorks2Middle: "and",
    howItWorks3: "Keys should be stable. Don\u2019t change keys unless you\u2019re intentionally refactoring text across the app.",
    recommendedToolTitle: "Recommended tool (easiest)",
    recommendedToolBody: "We recommend using Weblate (web UI) connected to GitHub. It allows anyone to translate without touching git, and it opens PRs automatically.",
    recommendedTool1: "Translate using a browser (no git required).",
    recommendedTool2: "Maintainers review and merge Weblate PRs.",
    githubFallbackTitle: "GitHub fallback",
    githubFallbackBody: "If you\u2019re comfortable with git/GitHub, you can also open a PR editing the JSON message files directly.",
    rulesTitle: "Rules",
    rule1: "Keep placeholders intact (e.g. {url}).",
    rule2: "Keep meaning accurate; avoid overly literal translations if they read unnaturally.",
    rule3: "Don\u2019t translate technical identifiers like file paths, API paths, or code.",
    backToLogin: "Back to sign in"
  },
  ai: {
    title: "AI Consultant",
    subtitle: "Ask questions about your workspace \u2014 recipes, products, vessels, production planning, and inventory.",
    askAboutThisPage: "Ask AI about this page",
    composer: {
      placeholder: "Ask a question about your brewery\u2026",
      send: "Send",
      sendAriaLabel: "Send message",
      thinking: "Thinking\u2026",
      streamingAriaLabel: "Streaming assistant response"
    },
    messages: {
      empty: "Start a conversation by asking a question below.",
      you: "You",
      assistant: "Consultant",
      toolCall: "Looking up: {tool}",
      toolError: "Tool error: {message}"
    },
    proposals: {
      apply: "Apply",
      dismiss: "Dismiss",
      applied: "Applied",
      dismissed: "Dismissed"
    },
    errors: {
      subscriptionRequired: "AI consultant is available on paid tiers.",
      subscriptionRequiredCta: "Upgrade to unlock",
      notEnabled: "AI consultant is not enabled in this workspace. Ask an admin to enable it.",
      noKey: "No AI provider key configured. An admin must add one in the AI settings.",
      dataEgressNotAccepted: "An admin must accept the data-egress notice before AI calls can be made.",
      rateLimit: "AI usage limit reached. Try again later.",
      rateLimitRole: "Your role\u2019s monthly AI usage limit has been reached.",
      rateLimitUserDaily: "Your daily AI usage limit has been reached.",
      internal: "Something went wrong. Please try again."
    },
    settings: {
      title: "AI Settings",
      subtitle: "Configure the AI consultant for this workspace. Admin-only.",
      memberOnlyNotice: "Only workspace admins can change AI settings. You can still use the consultant once it has been enabled.",
      enableLabel: "Enable AI consultant",
      enableHint: "When enabled, members can use the AI consultant in this workspace.",
      providerLabel: "AI provider",
      providerHint: "Anthropic (full tools) or OpenAI BYOK (chat without tools until adapter completes).",
      apiKeyLabel: "Anthropic API key",
      apiKeyHint: "Stored encrypted at rest. We never display the key back; clear by saving an empty value.",
      apiKeyConfigured: "A key is currently configured.",
      apiKeyMissing: "No key configured.",
      apiKeyPlaceholder: "sk-ant-\u2026",
      apiKeyClearLabel: "Clear stored key",
      dataEgressLabel: "I understand that messages and tool results will be sent to Anthropic for processing.",
      dataEgressHint: "Required by EU + US privacy regimes. Tool results may include recipe, equipment, and inventory data from this workspace.",
      dataEgressAcceptedAt: "Accepted on {date}.",
      roleLimitsTitle: "Per-role monthly token caps",
      roleLimitsHint: "Sum of input + output tokens over the trailing 30 days. 0 = no cap.",
      perUserDailyCapLabel: "Per-user daily token cap",
      perUserDailyCapHint: "Sum of input + output tokens today (UTC). 0 = no cap.",
      saveButton: "Save changes",
      savingButton: "Saving\u2026",
      savedMessage: "Settings saved.",
      saveError: "Could not save settings: {message}",
      concierge: {
        title: "Need help setting up?",
        body: "Book a 15-minute call with our team. Italian and English available.",
        cta: "Schedule a call"
      },
      roles: {
        brewery_admin: "Admin",
        member: "Member",
        viewer: "Viewer"
      }
    },
    upgrade: {
      title: "Unlock the AI consultant",
      body: "The AI consultant is included with the paid plan. Upgrade your workspace to ask questions in plain language about your recipes, equipment, brew sessions, and inventory \u2014 answered using your workspace\u2019s real data.",
      bullet1: "Read-only access to your workspace data",
      bullet2: "Configurable per-role and per-user limits",
      bullet3: "Encrypted-at-rest provider key (BYOK)",
      ctaButton: "Upgrade workspace",
      ctaLoading: "Preparing checkout\u2026",
      ctaError: "Could not start checkout: {message}",
      concierge: {
        title: "Want help getting set up?",
        body: "Once your workspace is upgraded, book a 15-minute call with our team. Italian and English available.",
        cta: "Schedule a call"
      }
    },
    usage: {
      title: "AI usage",
      description: "Aggregated token spend, per-user activity, and role limits for this workspace.",
      monthlyTokensIn: "Tokens in (month-to-date)",
      monthlyTokensOut: "Tokens out (month-to-date)",
      monthlyCallCount: "Calls (month-to-date)",
      perUserTitle: "Per user (month-to-date)",
      userColumn: "User",
      todayColumn: "Today (in + out)",
      monthColumn: "Month (in + out)",
      monthCallsColumn: "Calls",
      empty: "No AI usage recorded yet.",
      monthly: {
        callCount: "Calls (MTD)",
        tokensIn: "Tokens in (MTD)",
        tokensOut: "Tokens out (MTD)",
        total: "Total tokens (MTD)"
      },
      chart: {
        title: "Token spend \u2014 last 30 days",
        ariaLabel: "Bar chart of daily token spend over the last 30 days"
      },
      table: {
        title: "Per-user breakdown",
        empty: "No AI usage recorded yet.",
        user: "User",
        role: "Role",
        today: "Today",
        month: "Month",
        roleLimit: "Role limit",
        rolePercent: "% of role limit"
      },
      alerts: {
        heading: "Limits approaching",
        roleApproachingLimit: "Role '{role}' is at {percent} of its monthly cap ({used}/{limit}).",
        userApproachingDailyCap: "User '{user}' is at {percent} of today's cap ({used}/{cap})."
      }
    },
    actions: {
      openSettings: "AI settings",
      openUsage: "View usage",
      tryAgain: "Try again"
    }
  },
  sharedLayoutNotice: {
    demo: {
      ariaLabel: "Demo environment notice",
      summaryLine: "Public demonstration environment on demo.umbraculum.dev \u2014 illustrative data only; may be reset without notice.",
      dataLossWarning: "Do not store records you cannot afford to lose.",
      expanderLabel: "About this demo and Umbraculum",
      platformIntro: "Umbraculum is an open-source platform for workspace-shaped operational applications \u2014 shared backbone (auth, workspaces, billing, AI, rendering) plus canonical modules (PIM, MRP, CRP, automation, \u2026) that vertical products compose.",
      referenceVertical: "This demo runs the brewery reference vertical: an example manufacturing product the Umbraculum core team ships in the monorepo to show how a team builds a specific vertical on the platform. It is a showcase, not proof that Umbraculum is brewery-only.",
      credentialsHeading: "Demo sign-in",
      roleAdmin: "Brewery admin (primary)",
      roleMember: "Member",
      roleViewer: "Viewer",
      roleMultiAdmin: "Multi-workspace admin",
      columnRole: "Role",
      columnEmail: "Email",
      columnPassword: "Password",
      emailAdmin: "e2e-admin@brewery.local",
      passwordAdmin: "e2e-admin-pw!",
      emailMember: "e2e-member@brewery.local",
      passwordMember: "e2e-member-pw!",
      emailViewer: "e2e-viewer@brewery.local",
      passwordViewer: "e2e-viewer-pw!",
      emailMultiAdmin: "e2e-multi-admin@brewery.local",
      passwordMultiAdmin: "e2e-multi-admin-pw!",
      fixtureWorkspace: "Fixture workspace: {workspaceId} (primary admin).",
      linkGettingStarted: "Getting started",
      linkGettingStartedDesc: "setup, vocabulary, first contribution path",
      linkBuildingVertical: "Building your vertical",
      linkBuildingVerticalDesc: "how ISVs/integrators build their own product on Umbraculum",
      linkGlossary: "Glossary",
      linkGlossaryDesc: "vertical vs canonical module (precise definitions)",
      unsurePrefix: "Unsure? Read the docs above, then ask on the ",
      unsureForumLink: "community forum",
      unsureSuffix: ".",
      nativeIntro: "Mobile (brewery native): Internal EAS preview builds point at this same origin (https://demo.umbraculum.dev). Sign in with the same demo accounts above. Brew-day flows run on device; MRP, CRP, PIM, and inventory use Open on web (browser on this host).",
      nativeLinkNativeCi: "Native strategy & CI",
      nativeLinkDemoRunbook: "Demo host runbook",
      nativeLinkSmoke: "Canonical native platform surface \xA75.1",
      nativeBulletOperators: "Operators / contributors:",
      nativeBulletSmokeLabel: "Device smoke checklist:",
      nativeBulletApk: "Build/install APK: repo path apps/native/EAS-DEMO-SETUP.md (GitHub: umbraculum-dev monorepo) or workflow native-eas-build with profile preview."
    }
  }
};

// src/it.json
var it_default = {
  pim: {
    title: "Product Information Management",
    subtitle: "Catalogo master di prodotti, varianti, attributi e categorie.",
    products: {
      title: "Prodotti",
      listTitle: "Prodotti",
      noProducts: "Nessun prodotto in questo workspace.",
      loading: "Caricamento\u2026",
      refresh: "Aggiorna",
      refreshing: "Aggiornamento\u2026",
      create: "Crea prodotto",
      creating: "Creazione\u2026",
      createSuccess: "Prodotto creato.",
      createError: "Impossibile creare il prodotto.",
      createRequired: "SKU e nome sono obbligatori.",
      openDetail: "Apri prodotto",
      back: "Torna ai prodotti",
      searchPlaceholder: "Cerca per SKU o nome\u2026",
      attributeSetPlaceholder: "ID set attributi opzionale",
      notFound: "Prodotto non trovato in questo workspace."
    },
    variants: {
      title: "Varianti",
      noVariants: "Nessuna variante per questo prodotto."
    },
    categories: {
      title: "Categorie",
      noCategories: "Nessuna categoria in questo workspace.",
      back: "Torna ai prodotti"
    },
    attributeSets: {
      title: "Set di attributi",
      noSets: "Nessun set di attributi in questo workspace.",
      openDetail: "Apri set",
      back: "Torna ai set di attributi"
    },
    fields: {
      sku: "SKU",
      name: "Nome",
      status: "Stato",
      description: "Descrizione",
      attributeSet: "Set attributi",
      code: "Codice",
      label: "Etichetta"
    },
    values: {
      draft: "Bozza",
      active: "Attivo",
      archived: "Archiviato",
      none: "\u2014"
    }
  },
  automation: {
    title: "Automazione",
    subtitle: "Stato in tempo reale del controllore per i vessel di questo workspace. (Pianificazione, capacit\xE0 e utilizzo appartengono al futuro modulo di capacity-resource-planning \u2014 non a questa superficie.)",
    listTitle: "Vessel",
    noVessels: "Nessun vessel in questo workspace. I vessel appaiono qui dopo il primo snapshot dell'adapter.",
    loading: "Caricamento\u2026",
    refresh: "Aggiorna",
    refreshing: "Aggiornamento\u2026",
    openDetail: "Vedi dettagli",
    back: "Torna ai vessel",
    error: "Impossibile caricare i vessel.",
    notFound: "Vessel non trovato in questo workspace.",
    fields: {
      code: "Codice",
      displayName: "Nome",
      vesselKind: "Tipo",
      mode: "Modalit\xE0",
      currentTempC: "Temperatura attuale (\xB0C)",
      targetTempC: "Temperatura target (\xB0C)",
      alarmActive: "Allarme",
      lastSeenAt: "Ultimo aggiornamento",
      equipmentProfileId: "Profilo attrezzatura",
      adapterConnectionId: "Connessione adapter"
    },
    values: {
      alarmOn: "Attivo",
      alarmOff: "Nessuno",
      never: "Mai",
      none: "\u2014"
    }
  },
  mrp: {
    title: "Pianificazione produzione",
    subtitle: "Vista alpha MRP in sola lettura su ricette e sessioni di cotta esistenti.",
    alphaNote: "Le righe marcate come proiettate sono read model. Brewery resta la fonte autorevole; questa pagina non crea righe MRP.",
    loading: "Caricamento\u2026",
    refresh: "Aggiorna",
    refreshing: "Aggiornamento\u2026",
    error: "Impossibile caricare i dati di pianificazione produzione.",
    noProductionOrders: "Nessun ordine di produzione o proiezione brewery in questo workspace.",
    noMaterialRequirements: "Nessun fabbisogno materiali visibile.",
    export: {
      workOrderPdf: "Esporta ordine di lavoro (PDF)",
      routeCardPdf: "Esporta scheda percorso (PDF)",
      materialRequirementsXlsx: "Esporta fabbisogni materiali (XLSX)",
      productionOrdersCsv: "Esporta ordini di produzione (CSV)",
      working: "Preparazione export\u2026",
      download: "Scarica export",
      error: "Export non riuscito"
    },
    productionOrders: {
      listTitle: "Ordini di produzione",
      openDetail: "Apri ordine",
      back: "Torna agli ordini di produzione",
      materialRequirements: "Fabbisogni materiali",
      operations: "Operazioni",
      capacityLink: "Apri vista capacit\xE0",
      scheduleLink: "Apri schedule CRP"
    },
    materialRequirements: {
      title: "Fabbisogni materiali",
      subtitle: "Punto di ingresso in sola lettura per i fabbisogni materiali per ordine. Apri un ordine per vedere i fabbisogni derivati dagli ingredienti.",
      openOrder: "Apri fabbisogni ordine"
    },
    fields: {
      orderNumber: "Numero ordine",
      status: "Stato",
      quantity: "Quantit\xE0",
      plannedStartAt: "Inizio pianificato",
      dueAt: "Scadenza",
      createdAt: "Creato",
      source: "Fonte",
      sourceRefId: "Riferimento fonte",
      debugId: "ID debug",
      outputProductId: "Prodotto in uscita",
      lineCount: "Righe",
      operationCode: "Codice operazione",
      operationName: "Operazione",
      duration: "Durata",
      earliestStartAt: "Primo inizio",
      availability: "Disponibilit\xE0",
      availabilityNote: "Nota disponibilit\xE0",
      material: "Materiale",
      requiredQuantity: "Quantit\xE0 richiesta",
      productionOrder: "Ordine di produzione"
    },
    values: {
      none: "\u2014",
      unknownDate: "Non schedulato",
      canonicalMrpRow: "Riga MRP canonica",
      projectedFromBrewery: "Proiettato da brewery",
      projectedFromModule: "Proiettato da {module}"
    }
  },
  crp: {
    title: "Pianificazione capacit\xE0",
    subtitle: "Vista alpha CRP in sola lettura su vessel di automazione, attrezzatura brewery e step di cotta temporizzati.",
    alphaNote: "Le righe marcate come proiettate sono read model. Automation e brewery restano le fonti autorevoli; questa pagina non crea righe CRP.",
    loading: "Caricamento\u2026",
    refresh: "Aggiorna",
    refreshing: "Aggiornamento\u2026",
    error: "Impossibile caricare i dati di pianificazione capacit\xE0.",
    noResources: "Nessuna risorsa di capacit\xE0 o proiezione automation in questo workspace.",
    noWorkCenters: "Nessuna proiezione di centro di lavoro in questo workspace.",
    noCapacity: "Nessun bucket di carico capacit\xE0 visibile.",
    noSchedule: "Nessuna operazione schedulata visibile.",
    noConflicts: "Nessun avviso di capacit\xE0 visibile.",
    resources: {
      listTitle: "Risorse",
      openDetail: "Apri risorsa",
      workCentersTitle: "Centri di lavoro",
      workCentersNote: "I centri di lavoro sono proiezioni in sola lettura dei profili attrezzatura brewery. Spiegano il contesto di capacit\xE0 senza spostare la propriet\xE0 fuori da brewery.",
      openRelatedResource: "Apri risorsa collegata",
      automationSourceLink: "Apri vessel automation",
      back: "Torna alle risorse",
      capacityLink: "Apri vista capacit\xE0",
      scheduleLink: "Apri schedule"
    },
    export: {
      capacityLoadXlsx: "Esporta carico capacit\xE0 (XLSX)",
      schedulePdf: "Esporta schedule (PDF)",
      conflictReportPdf: "Esporta report conflitti (PDF)",
      resourceCalendarCsv: "Esporta calendario risorse (CSV)",
      working: "Preparazione export\u2026",
      download: "Scarica export",
      error: "Export non riuscito"
    },
    capacity: {
      title: "Carico capacit\xE0",
      note: "I bucket alpha con 0 minuti disponibili sono evidenza del read model, non la capacit\xE0 calendario finale del CRP.",
      resourceLink: "Apri dettaglio risorsa"
    },
    schedule: {
      title: "Schedule",
      conflictsTitle: "Avvisi in sola lettura",
      resourcesLink: "Apri risorse",
      capacityLink: "Apri capacit\xE0"
    },
    fields: {
      resource: "Risorsa",
      code: "Codice",
      name: "Nome",
      kind: "Tipo",
      status: "Stato",
      source: "Fonte",
      sourceRefId: "Riferimento fonte",
      createdAt: "Creato",
      updatedAt: "Aggiornato",
      debugId: "ID debug",
      bucketStartAt: "Inizio bucket",
      bucketEndAt: "Fine bucket",
      availableMinutes: "Minuti disponibili",
      plannedMinutes: "Minuti pianificati",
      overloadMinutes: "Minuti sovraccarico",
      operationCode: "Codice operazione",
      productionOrder: "Ordine di produzione",
      workCenter: "Centro di lavoro",
      startsAt: "Inizia",
      endsAt: "Finisce",
      duration: "Durata",
      conflict: "Conflitto",
      severity: "Severit\xE0"
    },
    values: {
      none: "\u2014",
      canonicalCrpRow: "Riga CRP canonica",
      projectedFromAutomationVessel: "Proiettato da vessel automation",
      projectedFromBrewery: "Proiettato da brewery",
      projectedFromModule: "Proiettato da {module}",
      zeroAvailabilityAlpha: "0 minuti disponibili (read model alpha)"
    }
  },
  common: {
    backToDashboard: "Torna alla Dashboard",
    loading: "Caricamento\u2026",
    refresh: "Aggiorna",
    close: "Chiudi",
    remove: "Rimuovi",
    dateLabel: "Data",
    timeLabel: "Ora",
    localeLabel: "Lingua",
    toggle: "Cambia",
    changeLanguage: "Cambia lingua",
    toggleLanguage: "Cambia lingua",
    dilutionDiagramLabel: "Diagramma diluizione 1:100",
    imageUnavailable: "Immagine non disponibile"
  },
  locales: {
    en: "Inglese",
    it: "Italiano",
    de: "Tedesco",
    es: "Spagnolo"
  },
  units: {
    C: "\xB0C",
    L: "L",
    count: "pz",
    g: "g",
    mL: "mL",
    kg: "kg",
    lovibond: "\xB0L",
    LPerKg: "L/kg",
    LPerG: "L/g",
    ppm: "ppm",
    ppmAsCaCO3: "ppm come CaCO3",
    tsp: "cucch. da t\xE8",
    pH: "pH"
  },
  nav: {
    dashboard: "Dashboard",
    recipes: "Ricette",
    inventory: "Inventario",
    waterProfiles: "Profili acqua",
    equipment: "Attrezzatura",
    automation: "Automazione",
    pim: "Prodotti",
    mrp: "Pianificazione produzione",
    crp: "Pianificazione capacit\xE0",
    ai: "AI",
    about: "Info",
    language: "Lingua",
    accessibility: "Accessibilit\xE0",
    login: "Accedi",
    logout: "Esci",
    notAvailableOnMobileYet: "Non ancora disponibile su mobile.",
    openOnWeb: "Apri sul web",
    missingApiBaseUrl: "Base URL API mancante (EXPO_PUBLIC_API_BASE_URL).",
    signedInAs: "Accesso come",
    activeWorkspace: "Workspace attivo",
    switchWorkspace: "Cambia workspace",
    activeAccount: "Workspace attivo",
    switchAccount: "Cambia workspace",
    ariaPrimary: "Principale",
    ariaSession: "Sessione",
    menu: "Menu"
  },
  ads: {
    ariaLabel: "Pubblicit\xE0",
    contactLine: "Contattaci per ospitare qui la tua pubblicit\xE0.",
    upgradeLine: "Passa a un piano a pagamento per rimuoverle."
  },
  platformAds: {
    title: "Pubblicit\xE0 piattaforma",
    subtitle: "Gestisci le pubblicit\xE0 a livello piattaforma (web). Visibili su tutti gli account, salvo disattivazione per uno specifico workspace.",
    hint: "Suggerimento: per vedere i posizionamenti apri una pagina e fai un hard reload (lingua: {locale}).",
    globalBottomNote: "Nota: il posizionamento Globale: in basso \xE8 nascosto nella pagina di modifica ricetta per evitare salti di layout su mobile.",
    loading: "Caricamento\u2026",
    notAuthorized: "Non sei autorizzato a gestire le pubblicit\xE0 piattaforma.",
    refresh: "Aggiorna",
    refreshing: "Aggiornamento\u2026",
    create: "Crea pubblicit\xE0",
    creating: "Creazione\u2026",
    listTitle: "Pubblicit\xE0",
    noAds: "Ancora nessuna pubblicit\xE0.",
    form: {
      placement: "Posizionamento",
      priority: "Priorit\xE0",
      imageUrl: "URL immagine",
      linkUrl: "URL link",
      altText: "Testo alt",
      isActive: "Attiva"
    },
    placements: {
      globalTop: "Globale: in alto",
      globalBottom: "Globale: in basso",
      recipeEditAfterFermentables: "Modifica ricetta: dopo Fermentabili",
      recipeEditAfterHops: "Modifica ricetta: dopo Luppoli",
      recipeEditAfterYeast: "Modifica ricetta: dopo Lievito"
    },
    table: {
      placement: "Posizionamento",
      imageUrl: "Immagine",
      linkUrl: "Link",
      active: "Attiva",
      actions: "Azioni",
      open: "Apri",
      yes: "s\xEC",
      no: "no",
      delete: "Elimina",
      toggleActiveAria: "Attiva/disattiva la pubblicit\xE0 {id}"
    }
  },
  platform: {
    navLabel: "Admin piattaforma",
    ads: "Pubblicit\xE0",
    recipes: "Ricette"
  },
  platformRecipes: {
    title: "Import/export ricette piattaforma",
    subtitle: "Importa o esporta ricette per qualsiasi workspace. Seleziona prima un workspace.",
    loading: "Caricamento\u2026",
    notAuthorized: "Non sei autorizzato a gestire le ricette piattaforma.",
    workspaceLabel: "Workspace",
    workspacePlaceholder: "Seleziona workspace\u2026",
    workspaceRequired: "Seleziona un workspace per importare o esportare.",
    accountLabel: "Workspace",
    accountPlaceholder: "Seleziona workspace\u2026",
    accountRequired: "Seleziona un workspace per importare o esportare.",
    exportSectionTitle: "Export (BeerJSON completo)",
    exportSingleLabel: "Esporta singola ricetta",
    exportSingleCta: "Scarica selezionata",
    exportBulkCta: "Esporta tutte le ricette",
    exportNoneAvailable: "Nessuna ricetta",
    exportFullNote: "L'export piattaforma include BeerJSON completo e recipeExtJson."
  },
  accessibility: {
    title: "Accessibilit\xE0",
    subtitle: "Regola contrasto, dimensione del testo e spaziatura. Salvato su questo dispositivo; se hai effettuato l\u2019accesso, le impostazioni si sincronizzano anche con il tuo account.",
    loading: "Caricamento\u2026",
    themePreset: "Tema",
    fontScale: "Dimensione testo",
    density: "Spaziatura",
    saving: "Salvataggio\u2026",
    savingHint: "Le modifiche si applicano subito.",
    theme: {
      default: "Predefinito",
      hcDark: "Alto contrasto (scuro)",
      hcLight: "Alto contrasto (chiaro)"
    },
    font: {
      sm: "Piccolo (90%)",
      md: "Normale (100%)",
      lg: "Grande (110%)",
      xl: "Molto grande (125%)"
    },
    densityOptions: {
      comfortable: "Confortevole",
      compact: "Compatto"
    },
    note: "Suggerimento: funziona anche lo zoom del browser e rispetta la lingua ({locale})."
  },
  dashboard: {
    title: "Dashboard",
    subtitle: "Web app desktop-first + app mobile native, log del brew-day offline-first.",
    links: {
      title: "Brew day e dati di produzione",
      fermDataIntegration: "Dati fermentazione e integrazione",
      brewdayStepsSettings: "Impostazioni step brewday",
      waterProfiles: "Profili acqua",
      brewery: "Birrificio",
      equipment: "Attrezzatura",
      inventory: "Inventario",
      ai: "Consulente AI"
    },
    importExport: {
      title: "Import / Export",
      supportedNote: "L\u2019interoperabilit\xE0 di import/export ricette \xE8 centrata su BeerJSON (canonico).",
      importFormats: "Import: BeerJSON (.json) e BeerXML (.xml).",
      exportFormats: "Export: BeerJSON (.json).",
      actionsLiveInRecipes: "Le azioni di import/export sono in Ricette:",
      actionsCta: "Vai alle Ricette",
      customImportNote: "Hai bisogno di un altro sistema?",
      customImportCta: "Contattaci per un import personalizzato a un costo accessibile."
    },
    fermDataIntegration: {
      title: "Dati fermentazione e integrazione",
      subtitle: "Integrazioni e dati di fermentazione (statistiche e insight).",
      backToDashboard: "Torna alla dashboard",
      sections: {
        integration: {
          title: "Integrazioni idrometri galleggianti",
          empty: "Nessuna integrazione per ora.",
          error: "Errore:",
          intro: "Ogni integrazione ha la propria Cloud URL. Scegli il tipo di dispositivo e segui i passaggi.",
          tiltTitle: "Tilt Hydrometer",
          tiltSupportedNotice: "Supportata.",
          tiltSubtitle: "Usa questa integrazione se hai un gateway Tilt o TiltPi.",
          stepsLabel: "Passi:",
          step1: "1) Mostra token + Cloud URL",
          step2: "2) Incolla la Cloud URL in TiltPi o nell\u2019app Tilt",
          step3: "3) Dopo il primo invio, collega il dispositivo a una sessione di brew.",
          ispindelTitle: "iSpindel",
          ispindelWarning: "Non ancora supportata (in arrivo).",
          ispindelSubtitle: "La gestione dei token sar\xE0 disponibile a breve.",
          raptTitle: "RAPT",
          raptWarning: "Non ancora supportata (in arrivo).",
          raptSubtitle: "La gestione dei token sar\xE0 disponibile a breve.",
          configured: "Configurata.",
          notConfigured: "Non configurata.",
          working: "Operazione in corso\u2026",
          cloudUrlLabel: "Cloud URL",
          cloudUrlAria: "Cloud URL",
          cloudUrlAriaTilt: "Cloud URL (da copiare nel gateway Tilt)",
          cloudUrlAriaGeneric: "Cloud URL (da copiare nel gateway)",
          cloudUrlHelp: "Usa questa URL nel gateway.",
          cloudUrlHelpTilt: "Usa questa URL in TiltPi / Tilt 2 \u201CCustom Cloud URL\u201D.",
          cloudUrlHelpGeneric: "Usa questa URL nel gateway del dispositivo quando sar\xE0 supportato.",
          tokenLabel: "Token (una sola volta)",
          tokenAria: "Token integrazione (mostrato una sola volta)",
          tokenHelp: "Questo token viene mostrato una sola volta. Salvalo se devi riconfigurare; altrimenti ruota un nuovo token pi\xF9 avanti.",
          copy: "Copia",
          copied: "Copiato",
          copyUrlAria: "Copia Cloud URL",
          copyTokenAria: "Copia token",
          devicesTitle: "Dispositivi Tilt collegati",
          noDevices: "Nessun dispositivo Tilt ha ancora inviato dati.",
          device: "Dispositivo",
          deviceKey: "Chiave",
          deviceChartTitle: "Letture recenti",
          chartGravity: "Gravit\xE0",
          chartTemperature: "Temperatura",
          chartXAxis: "Orario",
          chartGravityAxis: "Gravit\xE0 (SG)",
          chartTemperatureAxis: "Temperatura (\xB0C)",
          lastReading: "Ultima lettura",
          noReadingsYet: "Nessuna lettura per ora.",
          attachedTo: "Collegato a",
          notAttached: "Non collegato",
          attachLabel: "Collega a sessione brew",
          attachPlaceholder: "Seleziona\u2026",
          attach: "Collega",
          detach: "Scollega",
          actions: {
            create: "Crea integrazione",
            createAgain: "Genera nuovo token",
            reveal: "Mostra Cloud URL",
            rotate: "Ruota token",
            revoke: "Revoca",
            createAria: "Crea integrazione Tilt",
            rotateAria: "Ruota token integrazione Tilt",
            revokeAria: "Revoca integrazione Tilt",
            createAriaGeneric: "Crea integrazione",
            rotateAriaGeneric: "Ruota token integrazione",
            revokeAriaGeneric: "Revoca integrazione"
          }
        }
      }
    },
    brewdayStepsSettings: {
      title: "Impostazioni step brewday",
      subtitle: "Configura step del brew day, timer e tipo di birra.",
      backToDashboard: "Torna alla dashboard",
      brewingTypeAllGrain: "All grain",
      brewingTypeExtractPartialBiab: "Extract/Partial-mash/BIAB (homebrewing)",
      saveSuccess: "Salvato.",
      loading: "Caricamento\u2026",
      saving: "Salvataggio\u2026",
      accountRequired: "Seleziona un account per continuare.",
      exclude: "Escludi",
      addCustomSection: "Aggiungi sezione personalizzata",
      addCustomBrewingMethod: "Aggiungi metodo di birra personalizzato",
      addCustomStep: "Aggiungi step personalizzato",
      assignedSection: "Sezione assegnata",
      minutes: "Minuti",
      presetSections: {
        preparation: "Preparazione",
        pre_mash: "Pre mash",
        mash: "Mash",
        lauter: "Lauter",
        sparge: "Sparge",
        boil: "Bollitura",
        post_boil: "Post bollitura",
        fermentor: "Fermentatore",
        cleanup: "Pulizia",
        quality: "Qualit\xE0",
        miscellaneous: "Varie"
      },
      defaultSectionNote: "Sezioni step brew: aggiungi alla tua configurazione predefinita: puoi escluderle nel brew day se le usi solo per ricette specifiche ma non puoi aggiungerle nel flusso brew day se non aggiunte qui.",
      customSectionNote: "Aggiungi step personalizzati con nome, minuti opzionali e sezione assegnata.",
      add: "Aggiungi",
      save: "Salva",
      name: "Nome",
      moveUp: "Sposta su",
      moveDown: "Sposta gi\xF9",
      remove: "Rimuovi",
      sections: {
        brewdayStepsRecap: {
          title: "Riepilogo step brewday",
          empty: "Nessuno step per ora."
        },
        brewingType: {
          title: "Metodi di birra",
          label: "Metodo di birra"
        },
        brewdayStepsSections: {
          title: "Step brewday - sezioni",
          placeholder: "Prossimamente."
        },
        brewdayStepsDefault: {
          title: "Step brewday - predefinito",
          placeholder: "Prossimamente."
        },
        brewdayStepsCustom: {
          title: "Step brewday - personalizzato",
          placeholder: "Prossimamente."
        },
        brewdayNotes: {
          title: "Note brewday"
        }
      }
    }
  },
  contact: {
    title: "Contatti",
    subtitle: "Per richieste di import personalizzati, scrivici: risponderemo con i prossimi passi e una stima.",
    emailHeading: "Email",
    emailLabel: "Email:",
    emailAddress: "demo@umbraculum.dev",
    mailtoSubject: "Richiesta import personalizzato",
    emailCta: "Scrivici"
  },
  health: {
    title: "Stato API",
    subtitle: "Richiesta di {url} dal browser (via Nginx).",
    appPermissions: {
      title: "Permessi app",
      subtitle: "User = identit\xE0 di accesso. Workspace = confine di condivisione/tenant. Ruoli (brewery_admin/member/viewer) e ACL determinano cosa puoi fare.",
      userLabel: "User",
      activeWorkspaceLabel: "Workspace attivo",
      roleLabel: "Il tuo ruolo in questo workspace",
      roleUnknown: "sconosciuto",
      selectWorkspaceCta: "Seleziona workspace"
    }
  },
  contributing: {
    title: "Contribuire",
    subtitle: "Aiuta a migliorare traduzioni e dataset di birrificazione usati dall\u2019app.",
    sections: {
      i18n: {
        title: "Aiuta a tradurre (i18n contributing)"
      },
      rawMaterials: {
        title: "Aiuta a migliorare il database materie prime",
        subtitle: "Se trovi fermentabili/luppoli/lieviti/altri ingredienti mancanti o errati (o profili acqua), segnalacelo per migliorare il dataset canonico.",
        step1: "Annota cosa manca o cosa \xE8 errato (nome, produttore, specifiche chiave come colore/resa/AA% quando applicabile).",
        step2: "Se possibile includi uno screenshot o i valori esatti (aiuta a evitare ambiguit\xE0).",
        step3: "Apri una segnalazione usando il nostro template GitHub \u201CRaw materials\u201D (in arrivo).",
        issueTemplateNote: "Aggiungeremo un link diretto quando il workflow di contribuzione su GitHub sar\xE0 finalizzato."
      }
    }
  },
  ui: {
    addSalt: "Aggiungi sale",
    amountLabel: "Quantit\xE0 ({unit})",
    salt: "Sale",
    noSaltsAddedYet: "Nessun sale aggiunto.",
    fx: "fx"
  },
  about: {
    title: "Info",
    subtitle: "Brewery App \xE8 uno strumento interno per lo sviluppo ricette e il logging del brew-day, con un calcolatore di chimica dell\u2019acqua ispirato a BrunWater, Troester e altri. Supporto completo allo schema Beer.json. Il database materie prime scelto per la v0 \xE8 BeerProto.",
    translationsRowPrefix: "I contributi alle traduzioni sono benvenuti e gestiti tramite il nostro workflow (vedi",
    translationsRowLinkText: "Aiuta a tradurre",
    translationsRowSuffix: ").",
    translationsSideNote: "Nota: \xE8 solo un\u2019introduzione \u2014 il workflow di contributo traduzioni \xE8 pianificato, ma non \xE8 ancora pienamente operativo."
  },
  auth: {
    selectAccount: {
      title: "Seleziona workspace",
      subtitle: "Scegli su quale workspace vuoi lavorare.",
      loading: "Caricamento\u2026",
      noAccountsFound: "Nessun workspace trovato."
    },
    selectWorkspace: {
      title: "Seleziona workspace",
      subtitle: "Scegli su quale workspace vuoi lavorare.",
      loading: "Caricamento\u2026",
      noWorkspacesFound: "Nessun workspace trovato."
    },
    loginTitle: "Accedi",
    signupTitle: "Crea account",
    emailLabel: "Email",
    passwordLabel: "Password",
    workspaceNameLabel: "Nome workspace (opzionale)",
    accountNameLabel: "Nome workspace (opzionale)",
    submitLogin: "Accedi",
    submitSignup: "Crea account",
    submitting: "Invio\u2026",
    languageLabel: "Lingua",
    noteTitle: "Stato traduzioni",
    noteBody: "L\u2019inglese \xE8 la lingua originale. Le altre lingue (a partire dall\u2019italiano) saranno presto supportate al 100%. Spagnolo e tedesco arriveranno presto.",
    helpTranslate: "Aiuta a tradurre (contributi i18n)",
    sessionExpired: {
      title: "Sessione scaduta",
      body: "Sei stato disconnesso. Reindirizzamento alla pagina di accesso.",
      cta: "Accedi ora",
      countdown: "Reindirizzamento tra {seconds}s\u2026"
    }
  },
  i18nContributing: {
    title: "Aiuta a tradurre (i18n contributing)",
    subtitle: "Accettiamo volentieri contributi alle traduzioni. L\u2019inglese \xE8 la fonte; l\u2019italiano \xE8 la prima lingua community.",
    howItWorksTitle: "Come funzionano le traduzioni",
    howItWorks1: "La web app usa URL con prefisso lingua (es. /en/..., /it/...).",
    howItWorks2Prefix: "Le traduzioni stanno in",
    howItWorks2Middle: "e",
    howItWorks3: "Le chiavi devono restare stabili. Non cambiare le chiavi a meno di un refactor intenzionale.",
    recommendedToolTitle: "Strumento consigliato (pi\xF9 semplice)",
    recommendedToolBody: "Consigliamo Weblate (interfaccia web) collegato a GitHub. Permette a chiunque di tradurre senza usare git e apre PR automaticamente.",
    recommendedTool1: "Traduci dal browser (senza git).",
    recommendedTool2: "I maintainer revisionano e mergiano le PR di Weblate.",
    githubFallbackTitle: "Alternativa GitHub",
    githubFallbackBody: "Se sei a tuo agio con git/GitHub, puoi aprire una PR modificando direttamente i file JSON delle traduzioni.",
    rulesTitle: "Regole",
    rule1: "Mantieni intatti i placeholder (es. {url}).",
    rule2: "Mantieni il significato; evita traduzioni troppo letterali se suonano innaturali.",
    rule3: "Non tradurre identificatori tecnici come path di file, path API o codice.",
    backToLogin: "Torna ad Accedi"
  },
  ai: {
    title: "Consulente AI",
    subtitle: "Fai domande su ricette, chimica dell\u2019acqua, attrezzature, sessioni di cotta e magazzino del tuo birrificio.",
    composer: {
      placeholder: "Fai una domanda sul tuo birrificio\u2026",
      send: "Invia",
      sendAriaLabel: "Invia messaggio",
      thinking: "Sto pensando\u2026",
      streamingAriaLabel: "Risposta dell\u2019assistente in corso"
    },
    messages: {
      empty: "Inizia una conversazione facendo una domanda qui sotto.",
      you: "Tu",
      assistant: "Consulente",
      toolCall: "Sto consultando: {tool}",
      toolError: "Errore strumento: {message}"
    },
    errors: {
      subscriptionRequired: "Il consulente AI \xE8 disponibile sui piani a pagamento.",
      subscriptionRequiredCta: "Aggiorna per sbloccare",
      notEnabled: "Il consulente AI non \xE8 attivo in questo workspace. Chiedi a un amministratore di attivarlo.",
      noKey: "Nessuna chiave AI configurata. Un amministratore deve aggiungerla nelle impostazioni AI.",
      dataEgressNotAccepted: "Un amministratore deve accettare l\u2019informativa sul trasferimento dati prima di poter usare l\u2019AI.",
      rateLimit: "Limite di uso AI raggiunto. Riprova pi\xF9 tardi.",
      rateLimitRole: "Il limite mensile del tuo ruolo per l\u2019uso dell\u2019AI \xE8 stato raggiunto.",
      rateLimitUserDaily: "Il tuo limite giornaliero di uso dell\u2019AI \xE8 stato raggiunto.",
      internal: "Qualcosa \xE8 andato storto. Riprova."
    },
    settings: {
      title: "Impostazioni AI",
      subtitle: "Configura il consulente AI per questo workspace. Solo amministratori.",
      memberOnlyNotice: "Solo gli amministratori del workspace possono modificare le impostazioni AI. Puoi comunque usare il consulente una volta che \xE8 stato attivato.",
      enableLabel: "Attiva consulente AI",
      enableHint: "Quando attivo, i membri possono usare il consulente AI in questo workspace.",
      providerLabel: "Fornitore AI",
      providerHint: "Attualmente \xE8 supportato solo Anthropic Claude.",
      apiKeyLabel: "Chiave API Anthropic",
      apiKeyHint: "Memorizzata cifrata. Non mostriamo mai la chiave; salva un valore vuoto per rimuoverla.",
      apiKeyConfigured: "Una chiave \xE8 attualmente configurata.",
      apiKeyMissing: "Nessuna chiave configurata.",
      apiKeyPlaceholder: "sk-ant-\u2026",
      apiKeyClearLabel: "Rimuovi chiave memorizzata",
      dataEgressLabel: "Capisco che i messaggi e i risultati degli strumenti saranno inviati ad Anthropic per l\u2019elaborazione.",
      dataEgressHint: "Richiesto dalle normative privacy UE + USA. I risultati possono includere dati di ricette, attrezzature e magazzino di questo workspace.",
      dataEgressAcceptedAt: "Accettata il {date}.",
      roleLimitsTitle: "Limiti mensili token per ruolo",
      roleLimitsHint: "Somma dei token in entrata + uscita negli ultimi 30 giorni. 0 = nessun limite.",
      perUserDailyCapLabel: "Limite giornaliero token per utente",
      perUserDailyCapHint: "Somma dei token in entrata + uscita di oggi (UTC). 0 = nessun limite.",
      saveButton: "Salva modifiche",
      savingButton: "Salvataggio\u2026",
      savedMessage: "Impostazioni salvate.",
      saveError: "Impossibile salvare le impostazioni: {message}",
      concierge: {
        title: "Hai bisogno di aiuto per la configurazione?",
        body: "Prenota una chiamata di 15 minuti con il nostro team. Disponibile in italiano e inglese.",
        cta: "Prenota una chiamata"
      },
      roles: {
        brewery_admin: "Amministratore",
        member: "Membro",
        viewer: "Osservatore"
      }
    },
    upgrade: {
      title: "Sblocca il consulente AI",
      body: "Il consulente AI \xE8 incluso nel piano a pagamento. Aggiorna il workspace per fare domande in linguaggio naturale su ricette, attrezzature, sessioni di cotta e magazzino \u2014 con risposte basate sui dati reali del tuo workspace.",
      bullet1: "Accesso in sola lettura ai dati del workspace",
      bullet2: "Limiti configurabili per ruolo e per utente",
      bullet3: "Chiave fornitore cifrata (BYOK)",
      ctaButton: "Aggiorna workspace",
      ctaLoading: "Preparazione del checkout\u2026",
      ctaError: "Impossibile avviare il checkout: {message}",
      concierge: {
        title: "Vuoi aiuto per iniziare?",
        body: "Dopo l\u2019aggiornamento del workspace, prenota una chiamata di 15 minuti con il nostro team. Disponibile in italiano e inglese.",
        cta: "Prenota una chiamata"
      }
    },
    usage: {
      title: "Utilizzo AI",
      description: "Spesa di token aggregata, attivit\xE0 per utente e limiti di ruolo per questo workspace.",
      monthlyTokensIn: "Token in entrata (mese corrente)",
      monthlyTokensOut: "Token in uscita (mese corrente)",
      monthlyCallCount: "Chiamate (mese corrente)",
      perUserTitle: "Per utente (mese corrente)",
      userColumn: "Utente",
      todayColumn: "Oggi (in + out)",
      monthColumn: "Mese (in + out)",
      monthCallsColumn: "Chiamate",
      empty: "Nessun utilizzo AI registrato.",
      monthly: {
        callCount: "Chiamate (mese)",
        tokensIn: "Token in entrata (mese)",
        tokensOut: "Token in uscita (mese)",
        total: "Token totali (mese)"
      },
      chart: {
        title: "Spesa di token \u2014 ultimi 30 giorni",
        ariaLabel: "Grafico a barre della spesa di token giornaliera negli ultimi 30 giorni"
      },
      table: {
        title: "Dettaglio per utente",
        empty: "Nessun utilizzo AI registrato.",
        user: "Utente",
        role: "Ruolo",
        today: "Oggi",
        month: "Mese",
        roleLimit: "Limite ruolo",
        rolePercent: "% del limite ruolo"
      },
      alerts: {
        heading: "Limiti in avvicinamento",
        roleApproachingLimit: "Il ruolo '{role}' \xE8 al {percent} del limite mensile ({used}/{limit}).",
        userApproachingDailyCap: "L'utente '{user}' \xE8 al {percent} del limite giornaliero ({used}/{cap})."
      }
    },
    actions: {
      openSettings: "Impostazioni AI",
      openUsage: "Vedi utilizzo",
      tryAgain: "Riprova"
    }
  },
  sharedLayoutNotice: {
    demo: {
      ariaLabel: "Avviso ambiente demo",
      summaryLine: "Ambiente di dimostrazione pubblico su demo.umbraculum.dev \u2014 dati solo dimostrativi; possono essere reimpostati senza preavviso.",
      dataLossWarning: "Non conservare dati che non puoi permetterti di perdere.",
      expanderLabel: "Informazioni su questa demo e su Umbraculum",
      platformIntro: "Umbraculum \xE8 una piattaforma open source per applicazioni operative organizzate per workspace \u2014 backbone condiviso (autenticazione, workspace, fatturazione, AI, rendering) pi\xF9 moduli canonici (PIM, MRP, CRP, automazione, \u2026) che i prodotti verticali compongono.",
      referenceVertical: "Questa demo esegue il vertical di riferimento brewery: un esempio di prodotto manifatturiero che il team core di Umbraculum distribuisce nel monorepo per mostrare come un team costruisce un vertical specifico sulla piattaforma. \xC8 una vetrina, non la prova che Umbraculum sia solo per birrifici.",
      credentialsHeading: "Accesso demo",
      roleAdmin: "Amministratore birrificio (principale)",
      roleMember: "Membro",
      roleViewer: "Visualizzatore",
      roleMultiAdmin: "Amministratore multi-workspace",
      columnRole: "Ruolo",
      columnEmail: "Email",
      columnPassword: "Password",
      emailAdmin: "e2e-admin@brewery.local",
      passwordAdmin: "e2e-admin-pw!",
      emailMember: "e2e-member@brewery.local",
      passwordMember: "e2e-member-pw!",
      emailViewer: "e2e-viewer@brewery.local",
      passwordViewer: "e2e-viewer-pw!",
      emailMultiAdmin: "e2e-multi-admin@brewery.local",
      passwordMultiAdmin: "e2e-multi-admin-pw!",
      fixtureWorkspace: "Workspace di fixture: {workspaceId} (admin principale).",
      linkGettingStarted: "Primi passi",
      linkGettingStartedDesc: "setup, vocabolario, percorso per il primo contributo",
      linkBuildingVertical: "Costruire il tuo vertical",
      linkBuildingVerticalDesc: "come ISV/integratori realizzano il proprio prodotto su Umbraculum",
      linkGlossary: "Glossario",
      linkGlossaryDesc: "vertical vs modulo canonico (definizioni precise)",
      unsurePrefix: "Dubbi? Leggi la documentazione sopra, poi chiedi sul ",
      unsureForumLink: "forum della community",
      unsureSuffix: ".",
      nativeIntro: "Mobile (native brewery): le build interne EAS preview puntano allo stesso host (https://demo.umbraculum.dev). Accedi con gli stessi account demo sopra. I flussi brew-day girano sul dispositivo; MRP, CRP, PIM e inventario usano Apri sul web (browser su questo host).",
      nativeLinkNativeCi: "Strategia native e CI",
      nativeLinkDemoRunbook: "Runbook host demo",
      nativeLinkSmoke: "Superficie piattaforma native canonica \xA75.1",
      nativeBulletOperators: "Operatori / contributor:",
      nativeBulletSmokeLabel: "Checklist smoke su dispositivo:",
      nativeBulletApk: "Build/installazione APK: percorso repo apps/native/EAS-DEMO-SETUP.md (monorepo umbraculum-dev su GitHub) oppure workflow native-eas-build con profilo preview."
    }
  }
};

// src/index.ts
var import_meta = {};
var require2 = (0, import_node_module.createRequire)(import_meta.url);
var en = en_default;
var it = it_default;
var locales = ["en", "it"];
var defaultLocale = "en";
function isLocale(value) {
  return locales.includes(value);
}
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = result[key];
    if (sourceValue && typeof sourceValue === "object" && !Array.isArray(sourceValue) && targetValue && typeof targetValue === "object" && !Array.isArray(targetValue)) {
      result[key] = deepMerge(
        targetValue,
        sourceValue
      );
    } else {
      result[key] = sourceValue;
    }
  }
  return result;
}
function loadBreweryMessages(locale) {
  if (!(0, import_module_sdk.isVerticalInstalled)("brewery")) {
    return {};
  }
  const mod = require2("@umbraculum/brewery-i18n");
  return locale === "it" ? mod.it : mod.en;
}
function getSharedMessages(locale) {
  const platform = locale === "it" ? it : en;
  const brewery = loadBreweryMessages(locale);
  return deepMerge(platform, brewery);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  defaultLocale,
  en,
  getSharedMessages,
  isLocale,
  it,
  locales
});

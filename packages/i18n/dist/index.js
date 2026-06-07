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
  equipment: {
    subtitle: "Account-scoped equipment templates used by recipes (snapshot copy; no live references).",
    refresh: "Refresh",
    refreshing: "Refreshing\u2026",
    backToRecipes: "Back to Recipes",
    listTitle: "Equipment profiles",
    noProfiles: "No equipment profiles yet.",
    colName: "Name",
    colKettleVol: "Kettle volume ({unit})",
    colMashEff: "Mash efficiency (%)",
    colActions: "Actions",
    edit: "Edit",
    delete: "Delete",
    createTitle: "Add equipment profile",
    editTitle: "Edit equipment profile",
    nameLabel: "Name",
    kettleVolumeLitersLabel: "Kettle volume ({unit})",
    kettleLossesLitersLabel: "Kettle losses ({unit})",
    kettleBoilEvaporationRatePercentPerHourLabel: "Boil evaporation rate (% per hour)",
    kettleCoolingShrinkagePercentLabel: "Cooling shrinkage (%)",
    kettleHopsAbsorptionLitersLabel: "Hops absorption ({unit})",
    mashVolumeLitersLabel: "Mash volume ({unit})",
    mashEfficiencyPercentLabel: "Mash efficiency (%)",
    mashLossesLitersLabel: "Mash losses ({unit})",
    mashThicknessLPerKgLabel: "Mash thickness ({unit})",
    mashGrainAbsorptionLPerKgLabel: "Mash grain absorption ({unit})",
    mashWaterLeftoverLitersLabel: "Mash water leftover ({unit})",
    otherLossesLitersLabel: "Other non-specified losses ({unit})",
    create: "Create",
    creating: "Creating\u2026",
    save: "Save changes",
    saving: "Saving\u2026",
    cancel: "Cancel",
    sectionTitles: {
      kettle: "Kettle",
      mash: "Mash",
      misc: "Miscellaneous"
    },
    errors: {
      nameRequired: "Name is required.",
      notAuthenticated: "Not authenticated.",
      lossesMustBeNonNegative: "This value must be \u2265 0.",
      percentRange: "Percent must be between 0 and 100.",
      kettleVolumeMustBePositive: "Kettle volume must be > 0.",
      mashEfficiencyRange: "Mash efficiency must be between 0 and 100."
    }
  },
  inventory: {
    title: "Inventory Management",
    subtitle: "Track fermentables, hops, acids, salts, and other brewing supplies.",
    backToDashboard: "Back to Dashboard",
    addCustom: "Add custom",
    addFromList: "Add from list",
    addFromListAdd: "Add",
    remove: "Remove",
    clearSearch: "Clear search",
    producerLabel: "Producer",
    lovibondLabel: "Color ({unit})",
    yieldPercentLabel: "Yield (%)",
    ppgLabel: "PPG",
    alphaAcid: "Alpha acid",
    alphaMinLabel: "\u03B1 min (%)",
    alphaMaxLabel: "\u03B1 max (%)",
    addCustomGuidance: "Add custom ingredient: to avoid duplication, double-check carefully that it is not already present in the above list (it could have a slightly different name). The existing list should already comprise all existing types and subtypes for the ingredient.",
    columns: {
      name: "Name",
      producer: "Producer",
      type: "Type",
      lovibondShort: "\xB0L",
      yieldPercentShort: "Yield %",
      ppg: "PPG",
      alphaMin: "\u03B1 min",
      alphaMax: "\u03B1 max"
    },
    sections: {
      fermentables: "Fermentables",
      hops: "Hops",
      specialities: "Specialities",
      acidSalts: "Acid & Salts",
      detergentsSanitizers: "Detergents & Sanitizers",
      kegging: "Kegging & Bottling"
    },
    searchPlaceholder: "Search\u2026",
    search: "Search in public database",
    noResultsTryAnotherKey: "No results. Try another key.",
    pagination: {
      ariaLabel: "Inventory search pagination",
      prev: "Previous",
      next: "Next",
      status: "Page {page} of {pages}"
    },
    noItems: "No items yet.",
    quantityLabel: "Quantity ({unit})",
    nameLabel: "Name"
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
  math: {
    toggleShow: "Show math",
    toggleHide: "Hide math",
    fxLabel: "Show formula: {topic}",
    common: {
      none: "(none)",
      yes: "yes",
      no: "no",
      more: "(+{count} more\u2026)",
      ionLine: "- {ion}: {ppm} {ppmUnit}",
      saltLine: "- {salt}: {grams} {g}",
      detailLine: "- {label}: {value}"
    },
    derivation: {
      headings: {
        formula: "Formula:",
        inputs: "Inputs:",
        intermediates: "Steps / intermediates:",
        breakdowns: "Breakdowns:",
        notes: "Notes:"
      },
      common: {
        kvLine: "- {label}: {value}",
        ionDelta: "{ion} {ppm} {ppmUnit}",
        more: "(+{count} more\u2026)",
        yes: "yes",
        no: "no",
        null: "\u2014",
        unknown: "unknown",
        none: "(none)",
        missing: "(recalculate to show derivation)"
      },
      labels: {
        volumeLiters: "Volume ({unit})",
        startingAlk: "Starting alkalinity ({unit})",
        startingPh: "Starting pH",
        targetPh: "Target/achieved pH",
        alkAfterSalts: "Alkalinity after salts ({unit})",
        acidSulfateAddedPpm: "Acid sulfate added ({unit})",
        acidChlorideAddedPpm: "Acid chloride added ({unit})",
        mode: "Mode",
        startingAlkalinityPpmCaCO3: "Starting alkalinity ({unit})",
        effectiveAlkalinityPpmCaCO3: "Effective alkalinity ({unit})",
        alkalinityReductionFromCaMgPpmCaCO3: "Alkalinity reduction from Ca/Mg ({unit})",
        acidRequired_mEqPerL: "Acid required (mEq/L)",
        mMRequired_mmolPerL: "mM required (mmol/L)",
        frac_equivalentsPerMole: "Equivalents per mole (fraction)",
        sg_mgPerMl: "Solution density (mg/mL)",
        acidType: "Acid type",
        strengthKind: "Strength kind",
        strengthValue: "Strength value",
        breakdownSum: "How deltas are combined",
        base: {
          calciumPpm: "Base Ca ({unit})",
          magnesiumPpm: "Base Mg ({unit})",
          sodiumPpm: "Base Na ({unit})",
          sulfatePpm: "Base SO4 ({unit})",
          chloridePpm: "Base Cl ({unit})",
          bicarbonatePpm: "Base HCO3 ({unit})"
        },
        mashWaterVolumeLiters: "Mash water volume ({unit})",
        spargeVolumeLiters: "Sparge water volume ({unit})",
        boilWaterVolumeLiters: "Additional boil water volume ({unit})",
        mashLossesLiters: "Mash losses ({unit})",
        mashWaterLeftoverLiters: "Mash leftover water ({unit})",
        mashGrainAbsorptionLPerKg: "Grain absorption ({unit})",
        preBoilVolumeLiters: "Pre-boil volume ({unit})",
        boilTimeHours: "Boil time (hours)",
        evaporationRatePercentPerHour: "Evaporation rate (% per hour)",
        coolingShrinkagePercent: "Cooling shrinkage (%)",
        kettleLossesLiters: "Kettle losses ({unit})",
        otherLossesLiters: "Other losses ({unit})",
        kettleHopAbsorptionLiters: "Hop absorption ({unit})",
        kettleVolumeLiters: "Kettle volume ({unit})",
        efficiencyPercent: "Efficiency (%)",
        ogEstimatedSg: "OG estimate (SG)",
        pbgEstimatedSg: "PBG estimate (SG)",
        attenuationEffectivePercent: "Effective attenuation (%)",
        fgEstimatedSg: "FG estimate (SG)",
        abvEstimatedPercent: "ABV estimate (%)",
        postBoilVolumeLiters: "Post-boil volume ({unit})",
        boilGravitySg: "Boil gravity (SG)",
        ibuTinsethEstimated: "IBU (Tinseth, estimated)",
        ibuRagerEstimated: "IBU (Rager, estimated)",
        mcu: "MCU",
        colorSrmMoreyEstimated: "SRM (Morey, estimated)",
        colorSrmDanielsEstimated: "SRM (Daniels, estimated)"
      },
      rows: {
        saltDelta: "- {saltKey} ({grams} {g}): {deltas}"
      },
      breakdowns: {
        salt_additions: {
          perSaltDeltas: {
            title: "Per-salt ion deltas (ppm)"
          }
        },
        mash_overall: {
          saltBreakdown: {
            title: "Salt contributions (per-salt deltas)"
          }
        },
        sparge_overall: {
          saltBreakdown: {
            title: "Salt contributions (per-salt deltas)"
          }
        },
        boil_overall: {
          saltBreakdown: {
            title: "Salt contributions (per-salt deltas)"
          }
        }
      },
      notes: {
        generic: "- {note}",
        counterIonsOnlyStrongAcids: "Counter-ions: only sulfuric adds SO4 and only hydrochloric adds Cl. For other acids these are 0."
      },
      formulas: {
        water: {
          salt_additions: {
            v1: "ppm = mg/L\n\nFor each salt:\n- Convert grams -> moles of salt\n- Use stoichiometry to get moles of each ion group\n- Convert to mg of each ion group\n- Divide by volume (L) to get ppm\n\nFinal ions = base ions + sum(per-salt deltas)"
          },
          acidification: {
            v1: "We solve for an acid amount that reaches a target pH given alkalinity and volume.\n\nKey relationships (simplified):\n- final_alkalinity = effective_alkalinity - acid_required(mEq/L) \xD7 50\n- acid_required depends on carbonate distribution + acid dissociation at target pH\n\nCounter-ions:\n- sulfuric adds SO4\n- hydrochloric adds Cl"
          },
          mash_overall: {
            v1: "Overall ions = ions(after salts) + acid counter-ions, and HCO3 is derived from final alkalinity.\n\nThis combines:\n- salt additions (mass-balance on ppm)\n- acidification (final alkalinity + SO4/Cl counter-ions)"
          },
          sparge_overall: {
            v1: "Overall ions = ions(after salts) + acid counter-ions, and HCO3 is derived from final alkalinity."
          },
          boil_overall: {
            v1: "Overall ions = ions(after salts) + acid counter-ions, and HCO3 is derived from final alkalinity."
          }
        },
        analysis: {
          pre_boil_volume: {
            v1: "pre_boil_volume = mash_water + sparge_water - grain_absorption - mash_losses - leftover + boil_additions"
          },
          kettle_volume: {
            v1: "kettle_volume = cooled(post_boil_hot(pre_boil_volume)) - kettle_losses - hop_absorption - other_losses"
          },
          og: {
            v1: "OG is estimated from fermentables yield, efficiency (%), and kettle volume."
          },
          pbg: {
            v1: "PBG is estimated from fermentables yield, efficiency (%), and pre-boil volume."
          },
          attenuation: {
            v1: "Effective attenuation = average of the top 2 yeast attenuations (overrides win)."
          },
          fg: {
            v1: "FG = 1 + (OG - 1) \xD7 (1 - attenuation/100)"
          },
          abv: {
            v1: "ABV% = (OG - FG) \xD7 131.25"
          },
          ibu_tinseth: {
            v1: "Tinseth IBU is computed from hop additions, utilization, boil gravity, and post-boil volume."
          },
          ibu_rager: {
            v1: "Rager IBU is computed from hop additions, utilization, boil gravity, and post-boil volume."
          },
          mcu: {
            v1: "MCU (Malt Color Units) = \u03A3(lb \xD7 \xB0L) / gal, using post-boil/kettle volume."
          },
          srm_morey: {
            v1: "SRM (Morey) = 1.4922 \xD7 MCU^0.6859"
          },
          srm_daniels: {
            v1: "SRM (Daniels) \u2248 0.2 \xD7 MCU + 8.4"
          }
        }
      }
    },
    analysis: {
      common: {
        toggleHint: "Applies to all sections on this page (where available).",
        sources: {
          kettleVolume: "kettle volume",
          batchSize: "BeerJSON batch size",
          pbg: "PBG",
          og: "OG",
          unknown: "unknown"
        },
        hopUse: {
          boil: "boil",
          whirlpool: "whirlpool (0.5\xD7)",
          dryhop: "dry hop"
        },
        excludeDryhop: "dry hop does not contribute to IBU",
        excludeMissingInputs: "missing amount/AA%/time",
        hopLine: "- {name}: {use}, {amountG} g @ {alpha}% AA, {timeMin} min",
        hopLineExcluded: "- {name}: excluded ({reason})",
        noHops: "(no hops in editor)",
        yeastSource: {
          override: "override",
          beerjson: "BeerJSON",
          missing: "missing"
        },
        yeastLine: "- {name}: {value}% ({source})",
        yeastSelectedLine: "- {name}: {value}%",
        noYeast: "(no yeast in editor)",
        noYeastSelected: "(no usable yeast attenuation)",
        noteDependsOnWaterAndEquipment: "Depends on saved water settings + equipment snapshot.",
        noteMissingWaterSettings: "Missing saved water settings; volume estimates may be unavailable.",
        noteMissingFermentableColors: "Missing fermentable color (Lovibond) on one or more grist rows."
      },
      abv: {
        title: "ABV (estimated)",
        body: "Formula:\nABV = (OG - FG) \xD7 131.25\n\nThis recipe:\nOG = {og}\nFG = {fg}\nABV = {abv}%\n\nNotes:\n- OG/FG are derived estimates (not measured)."
      },
      ibuTinseth: {
        title: "IBU (Tinseth, estimated)",
        body: "Model (Tinseth):\nU = 1.65 \xD7 0.000125^(G - 1) \xD7 (1 - e^(-0.04 \xD7 t)) / 4.15\nIBU = \u03A3 (g \xD7 (AA%/100) \xD7 U \xD7 1000 / V_L)\n\nThis recipe:\nGravity used (SG) = {gravity} ({gravitySource})\nVolume used (L) = {volume} ({volumeSource})\n\nHop additions (from editor):\n{hopsLines}\n\nResult:\nIBU (Tinseth) = {ibu}"
      },
      ibuRager: {
        title: "IBU (Rager, estimated)",
        body: "Model (Rager):\nU% \u2248 18.11 + 13.86 \xD7 tanh((t - 31.32) / 18.27)\nGravity adjustment (if G > 1.050): GA = (G - 1.050) / 0.2\nIBU = \u03A3 (g \xD7 (AA%/100) \xD7 (U%/(1+GA)) \xD7 1000 / V_L)\n\nThis recipe:\nGravity used (SG) = {gravity} ({gravitySource})\nVolume used (L) = {volume} ({volumeSource})\n\nHop additions (from editor):\n{hopsLines}\n\nResult:\nIBU (Rager) = {ibu}"
      },
      srmMorey: {
        title: "Color (SRM, Morey, estimated)",
        body: "Model (Morey):\nMCU = \u03A3 (lb \xD7 \xB0L) / gal\nSRM = 1.4922 \xD7 MCU^0.6859\n\nThis recipe:\nKettle volume used = {volume} L\nNotes:\n- {notes}\n\nResult:\nSRM (Morey) = {srm}"
      },
      srmDaniels: {
        title: "Color (SRM, Daniels, estimated)",
        body: "Model (Daniels, linear):\nMCU = \u03A3 (lb \xD7 \xB0L) / gal\nSRM \u2248 0.2 \xD7 MCU + 8.4\n\nThis recipe:\nKettle volume used = {volume} L\nNotes:\n- {notes}\n\nResult:\nSRM (Daniels) = {srm}"
      },
      kettleVolume: {
        title: "Volume (kettle)",
        body: "This value is derived from your saved water settings and equipment losses/evaporation.\n\nThis recipe:\nKettle volume = {kettleVolume} L\n\nNotes:\n- {notes}"
      },
      preBoilVolume: {
        title: "Pre-boil volume (estimated)",
        body: "This value is derived from your saved water settings and equipment losses.\n\nThis recipe:\nPre-boil volume = {preBoilVolume} L\n\nNotes:\n- {notes}"
      },
      og: {
        title: "OG (estimated)",
        body: "OG is estimated from fermentables potential + volume + efficiency.\n\nThis recipe:\nOG = {og}\nVolume (kettle) = {volume} L\nEfficiency used = {efficiency}%\n\nNotes:\n- If efficiency/fermentables are missing, OG can be unavailable."
      },
      fg: {
        title: "FG (estimated)",
        body: "Formula:\nFG = 1 + (OG - 1) \xD7 (1 - Attenuation/100)\n\nThis recipe:\nOG = {og}\nAttenuation = {attenuation}%\nFG = {fg}"
      },
      attenuation: {
        title: "Attenuation (effective)",
        body: "Model:\n- For each yeast: use override% if present, else use BeerJSON attenuation (avg(min,max) if given).\n- Effective attenuation = average of the top 2 highest effective values.\n\nThis recipe:\nAll yeasts:\n{yeastLines}\n\nSelected (top 2):\n{selectedLines}\n\nTop-2 average = {topAvg}%\nEffective attenuation = {attenuation}%"
      },
      pbg: {
        title: "PBG (pre-boil gravity, estimated)",
        body: "PBG is estimated like OG, but using the pre-boil volume.\n\nThis recipe:\nPBG = {pbg}\nPre-boil volume = {preBoilVolume} L\nEfficiency used = {efficiency}%\n\nNotes:\n- Requires saved water volumes to estimate pre-boil volume."
      }
    },
    yeast: {
      estimatedCells: {
        title: "Estimated cells needed (B)",
        body: "cells_B = batch_size_L \xD7 OG_plato \xD7 pitch_rate\n\nWhere:\n- batch_size_L: kettle/batch volume in liters\n- OG_plato: original gravity converted to \xB0Plato\n- pitch_rate: million cells per mL per \xB0Plato (e.g. 0.75 for Pro Brewer 0.75 Ales)\n\nB = billions of cells.\n\nNote: When 'Use Manual count for slurry density and viability (from alive/total cells)' is active for slurry (via selecting inputs in its section), 'Estimated cells needed (B)' is unchanged. Only slurry density (and thus Amount L) comes from the manual count."
      },
      amountL: {
        title: "Amount (L) for liquid/slurry",
        body: "amount_L = cells_B / cells_per_L\n\nWhere cells_B comes from batch \xD7 OG \xD7 pitch rate (unchanged by the manual count feature) then cells_per_L is the slurry/liquid density in billions per liter.\n\nWhen 'Use Manual count' is active for slurry, cells_per_L is derived from: alive cells \xD7 5 \xD7 DF \xD7 10,000 \u2192 live cells/g; then B/L = live cells/g \xD7 1000 / 1e9. This directly influences Amount (L)."
      },
      manualCountViability: {
        title: "Calculated % viability",
        body: "viability_% = (alive cells / total cells) \xD7 100\n\nWhere alive and total are raw counts from the five hemocytometer squares.\n\nSee Manual cell count methodology (hemocytometer) below for full procedure."
      },
      manualCountLiveCellsPerGram: {
        title: "Calculated live cells per gram of suspension",
        body: "live cells/g = alive \xD7 5 \xD7 DF \xD7 10,000\n\nWhere alive is the raw count of live cells, DF is the dilution factor (200\xD7 or 2000\xD7).\n\nSee Manual cell count methodology (hemocytometer) below for full procedure."
      },
      manualCountAliveInfluence: {
        title: "Influences pitching Amount (L)",
        body: "Alive cells directly influences pitching Amount (L): it\u2019s used to derive cells/L from the manual count (cells_per_L = alive \xD7 DF \xD7 0.05)."
      },
      manualCountTotalInfluence: {
        title: "Does not influence Amount (L)",
        body: "Total cells does not directly influence Amount (L). It\u2019s used to compute viability (alive/total \xD7 100). Low viability should prompt a careful vitality check."
      }
    },
    sparge: {
      acidRequired: {
        title: "Acid required (target pH)",
        body: "Conceptual model:\n- We solve for an acid amount that brings Starting pH -> Target pH, given Starting alkalinity and water volume.\n\nNotes:\n- If the selected profile has no pH, we only use the manually entered Starting pH.\n- Acid type/strength changes the conversion from equivalents to mL/grams.\n- This is a heuristic calculator: use it as guidance, then measure/adjust.",
        bodyWithValues: "Conceptual model:\n- We solve for an acid amount that brings Starting pH -> Target pH, given Starting alkalinity and water volume.\n\nThis recipe:\nStarting pH = {startingPh}\nTarget pH = {targetPh}\nStarting alkalinity = {startingAlk} ppm as CaCO3\nVolume = {volumeL} L\nSelected profile has pH = {profilePhKnown}\n\nResult:\n{detailsLines}\n\nNotes:\n- Acid type/strength changes the conversion from equivalents to mL/grams.\n- This is a heuristic calculator: use it as guidance, then measure/adjust."
      },
      finalAlkalinity: {
        title: "Final alkalinity (ppm as CaCO3)",
        body: "Meaning:\n- Alkalinity after the calculated acid addition.\n\nNotes:\n- It can be near 0 when acid neutralizes the buffering capacity.\n- We report alkalinity in ppm as CaCO3 (standard brewing convention).",
        bodyWithValues: "Meaning:\n- Alkalinity after the calculated acid addition.\n\nThis recipe:\nStarting alkalinity = {startingAlk} ppm as CaCO3\nFinal alkalinity = {finalAlk} ppm as CaCO3\n\nNotes:\n- It can be near 0 when acid neutralizes the buffering capacity.\n- We report alkalinity in ppm as CaCO3 (standard brewing convention)."
      },
      ionsAfterSalts: {
        title: "Resulting ions (after salts only)",
        body: "Meaning:\n- Starting from the selected sparge profile, we add ions contributed by the entered salt grams at the given sparge water volume.\n\nNotes:\n- Values are ppm (mg/L) for each ion.",
        bodyWithValues: "Meaning:\n- Starting from the selected sparge profile, we add ions contributed by the entered salt grams at the given sparge water volume.\n\nThis recipe:\nVolume = {volumeL} L\n\nSalts:\n{saltsLines}\n\nIons (ppm):\n{ionsLines}\n\nNotes:\n- Values are ppm (mg/L) for each ion."
      },
      ionsAfterSaltsAndAcid: {
        title: "Resulting ions (after salts + acid)",
        body: "Meaning:\n- Same as \u201Cafter salts\u201D, then apply the acid result.\n\nNotes:\n- SO4/Cl increases come from the acid counter-ion model (when applicable).\n- HCO3 is derived from alkalinity (proxy), not measured bicarbonate.",
        bodyWithValues: "Meaning:\n- Same as \u201Cafter salts\u201D, then apply the acid result.\n\nThis recipe:\nVolume = {volumeL} L\nFinal alkalinity = {finalAlk} ppm as CaCO3\n\nSalts:\n{saltsLines}\n\nIons (ppm):\n{ionsLines}\n\nNotes:\n- SO4/Cl increases come from the acid counter-ion model (when applicable).\n- HCO3 is derived from alkalinity (proxy), not measured bicarbonate."
      },
      alkalinityHeuristic: {
        title: "Heuristic: Ca/Mg reduce effective alkalinity",
        body: "We apply a residual-alkalinity-style adjustment:\n- Calcium and magnesium from salts modestly reduce effective alkalinity, so acid required can change slightly when salts are added.\n\nNotes:\n- This is intentionally modest; it improves realism without overfitting.",
        bodyWithValues: "{note}"
      }
    },
    mash: {
      acidRequired: {
        title: "Acid required (target pH)",
        body: "Conceptual model:\n- We solve for an acid amount that brings Starting pH -> Target pH, given Starting alkalinity and mash water volume.\n\nNotes:\n- Acid type/strength changes the conversion from equivalents to mL/grams.\n- This is a heuristic calculator: use it as guidance, then measure/adjust.",
        bodyWithValues: "Conceptual model:\n- We solve for an acid amount that brings Starting pH -> Target pH, given Starting alkalinity and mash water volume.\n\nThis recipe:\nStarting pH = {startingPh}\nTarget pH = {targetPh}\nStarting alkalinity = {startingAlk} ppm as CaCO3\nMash water volume = {volumeL} L\n\nResult:\n{detailsLines}\n\nNotes:\n- Acid type/strength changes the conversion from equivalents to mL/grams.\n- This is a heuristic calculator: use it as guidance, then measure/adjust."
      },
      finalAlkalinity: {
        title: "Final alkalinity (ppm as CaCO3)",
        body: "Meaning:\n- Alkalinity after the calculated acid addition.\n\nNotes:\n- It can be near 0 when acid neutralizes the buffering capacity.\n- We report alkalinity in ppm as CaCO3 (standard brewing convention).",
        bodyWithValues: "Meaning:\n- Alkalinity after the calculated acid addition.\n\nThis recipe:\nStarting alkalinity = {startingAlk} ppm as CaCO3\nFinal alkalinity = {finalAlk} ppm as CaCO3\n\nNotes:\n- It can be near 0 when acid neutralizes the buffering capacity.\n- We report alkalinity in ppm as CaCO3 (standard brewing convention)."
      },
      ionsAfterSalts: {
        title: "Resulting ions (after salts only)",
        body: "Meaning:\n- Starting from the mixed source water, we add ions contributed by the entered salt grams.\n\nNotes:\n- Values are ppm (mg/L) for each ion.\n- This table does not include acid; see the overall result for combined output.",
        bodyWithValues: "Meaning:\n- Starting from the mixed source water, we add ions contributed by the entered salt grams.\n\nThis recipe:\nMash water volume = {volumeL} L\n\nSalts:\n{saltsLines}\n\nIons (ppm):\n{ionsLines}\n\nNotes:\n- Values are ppm (mg/L) for each ion.\n- This table does not include acid; see the overall result for combined output."
      },
      overallSnapshot: {
        title: "Overall mash snapshot (salts + acid)",
        body: "Meaning:\n- Combined result after applying both salts and acid.\n\nNotes:\n- SO4/Cl increases come from the acid counter-ion model (when applicable).\n- HCO3 is derived from alkalinity (proxy), not measured bicarbonate.",
        bodyWithValues: "Meaning:\n- Combined result after applying both salts and acid.\n\nThis recipe:\npH = {ph}\nMash water volume = {volumeL} L\nFinal alkalinity = {finalAlk} ppm as CaCO3\n\nIons (ppm):\n{ionsLines}\n\nNotes:\n- SO4/Cl increases come from the acid counter-ion model (when applicable).\n- HCO3 is derived from alkalinity (proxy), not measured bicarbonate."
      }
    },
    boil: {
      ionsAfterSalts: {
        title: "Resulting ions (after salts only)",
        body: "Meaning:\n- Starting from the mixed source water, we add ions contributed by the entered salt grams.\n\nNotes:\n- Values are ppm (mg/L) for each ion.",
        bodyWithValues: "Meaning:\n- Starting from the mixed source water, we add ions contributed by the entered salt grams.\n\nThis recipe:\nBoil water volume = {volumeL} L\n\nSalts:\n{saltsLines}\n\nIons (ppm):\n{ionsLines}\n\nNotes:\n- Values are ppm (mg/L) for each ion."
      },
      overallSnapshot: {
        title: "Overall boil snapshot (salts + acid)",
        body: "Meaning:\n- Combined result after applying both salts and acid.\n\nNotes:\n- SO4/Cl increases come from the acid counter-ion model (when applicable).\n- HCO3 is derived from alkalinity (proxy), not measured bicarbonate.",
        bodyWithValues: "Meaning:\n- Combined result after applying both salts and acid.\n\nThis recipe:\npH = {ph}\nFinal alkalinity = {finalAlk} ppm as CaCO3\n\nIons (ppm):\n{ionsLines}\n\nNotes:\n- SO4/Cl increases come from the acid counter-ion model (when applicable).\n- HCO3 is derived from alkalinity (proxy), not measured bicarbonate."
      }
    },
    waterHub: {
      mergedWaterRecap: {
        title: "Merged water recap",
        body: "Meaning:\n- This section summarizes each stream (mash/sparge/additional boil) and the merged summary.\n\nNotes:\n- Merged pH is an approximate volume-weighted [H+] mix (rule-of-thumb).\n- Streams without saved snapshots are excluded from merged ions.",
        bodyWithValues: "Meaning:\n- This section summarizes each stream (mash/sparge/additional boil) and the merged summary.\n\nThis recipe:\nTotal volume = {totalVolumeL} {L}\nApprox. merged pH = {mergedPh}\nMerged final alkalinity = {mergedFinalAlk} {ppmAsCaCO3}\n\nStreams:\n{streamLines}\n\nNotes:\n- Merged pH is an approximate volume-weighted [H+] mix (rule-of-thumb).\n- Streams without saved snapshots are excluded from merged ions.",
        streamLine: "- {label}: {volumeL} {L}, pH {ph}, alk {alk} {ppmAsCaCO3}"
      },
      mergedIons: {
        title: "Merged ions (ppm)",
        body: "Meaning:\n- Computed from saved mash/sparge/boil snapshots after salts + acid (SO4/Cl counter-ions only) and averaged by volume.\n\nNotes:\n- Streams without saved snapshots are excluded.\n- HCO3 is derived from alkalinity (proxy), not measured bicarbonate.",
        bodyWithValues: "Meaning:\n- Computed from saved mash/sparge/boil snapshots after salts + acid (SO4/Cl counter-ions only) and averaged by volume.\n\nThis recipe:\nIons ({ppm}):\n{ionsLines}\n\nNotes:\n- Streams without saved snapshots are excluded.\n- HCO3 is derived from alkalinity (proxy), not measured bicarbonate."
      }
    }
  },
  recipes: {
    title: "Recipes",
    subtitle: "",
    import: {
      title: "Import recipe",
      subtitle: "Import a recipe file and create a new recipe in your account.",
      cta: "Import from BeerJSON / BeerXML",
      loading: "Loading\u2026",
      backToRecipes: "Back to Recipes",
      singleHeading: "Import single recipe",
      singleSubtitle: "Import one recipe file into your account (you choose the style).",
      legendTitle: "Import notes",
      unitsNote: "Units: metric and US customary are accepted. UK imperial gallons are not supported yet.",
      customImportNote: "Need UK imperial gallons or another system import?",
      customImportCta: "Contact us for affordable custom import.",
      bulkHeading: "Bulk import (multiple recipes)",
      bulkSubtitle: "Import a file containing multiple recipes and create them all at once.",
      fileHeading: "File",
      fileLabel: "Recipe file (BeerJSON .json or BeerXML .xml)",
      filePicked: "Selected: {name}",
      fileNotPicked: "No file selected yet.",
      formatLabel: "Format",
      formatAuto: "Auto-detect",
      formatBeerJson: "BeerJSON (.json)",
      formatBeerXml: "BeerXML (.xml)",
      formatResolved: "Resolved format: {format}",
      formatNotResolved: "Unable to detect format from filename. Choose a format above.",
      styleLabel: "Style",
      bulkStyleRule: "Bulk import matches style to BJCP 2021 by exact name first, then code. If no match, we assign Custom.",
      preview: "Preview",
      previewing: "Previewing\u2026",
      reset: "Reset",
      previewHeading: "Preview",
      previewNameLabel: "Name",
      previewNotesLabel: "Notes",
      bulkPreviewHeading: "Bulk preview",
      resolvedStyleLabel: "Resolved style",
      customStyleName: "Custom",
      customStyleCode: "custom",
      warningsHeading: "Warnings",
      noWarnings: "No warnings.",
      import: "Import recipe",
      importing: "Importing\u2026",
      bulkCreatedHeading: "Created recipes",
      bulkCreatedCount: "{count} created",
      bulkNoneCreated: "No recipes were created.",
      bulkFailedHeading: "Failed imports",
      dash: "\u2014",
      unknownWarningCode: "warning",
      errors: {
        notAuthenticated: "Not authenticated.",
        noActiveAccount: "No active account selected.",
        noContent: "Please select a file first.",
        unknownFormat: "Unknown format. Please choose BeerJSON or BeerXML.",
        previewMissing: "Preview response is missing expected data.",
        styleRequired: "Style is required.",
        importMissingId: "Import response is missing recipe id.",
        fileTooLarge: "File too large. Maximum size is {max}.",
        fileTooLargeHelp: "If you're experiencing this error, try splitting the file into smaller parts. Paid tier users can contact our support for assistance."
      }
    },
    brewSessions: {
      listTitle: "Brew sessions",
      detailTitle: "Brew session",
      backToRecipeEdit: "Back to view/edit recipe",
      backToSessions: "Back to brew sessions",
      createButton: "Create brew session",
      creating: "Creating\u2026",
      refresh: "Refresh",
      loading: "Loading\u2026",
      empty: "No brew sessions yet.",
      statusLine: "Status: {status}",
      sessionTimerLine: "Session timer: {elapsed}",
      sessionPausedAtLine: "Paused at: {at}",
      sessionStoppedAtLine: "Stopped at: {at}",
      sessionCode: "Session code",
      exportWorkOrderPdf: "Export work order (PDF)",
      exportWorkOrderPdfWorking: "Preparing PDF\u2026",
      exportWorkOrderPdfError: "Export failed",
      recipeLine: "Recipe: {name} - Version {version}",
      working: "Working\u2026",
      startSession: "Start brewing session",
      resumeSession: "Resume brewing session",
      pauseSession: "Pause",
      stopSession: "Mark session as Finished",
      sectionStatusPending: "Pending",
      sectionStatusInProgress: "In progress",
      sectionStatusDone: "Done",
      sectionStatusForcedFinished: "Forced as finished",
      sessionAutoFinishedAtLine: "Session automatically marked as finished on: {at}",
      sessionManualFinishedAtLine: "Session manually marked as finished on: {at}",
      hydrometerSectionTitle: "Floating hydrometers",
      hydrometerSectionSubtitle: "Attach a hydrometer to this brew session and review readings.",
      hydrometerKindLabel: "Device type",
      hydrometerKindTilt: "Tilt",
      hydrometerKindIspindel: "iSpindel",
      hydrometerKindRapt: "RAPT",
      hydrometerNotSupportedYet: "Not supported yet (coming soon).",
      hydrometerDeviceLabel: "Device",
      hydrometerDevicePlaceholder: "Select a device",
      hydrometerNoDevices: "No devices have logged yet for this type.",
      hydrometerAttach: "Attach device",
      hydrometerDetach: "Detach device",
      hydrometerAttachedTo: "Attached: {device}",
      hydrometerNotAttached: "Not attached.",
      hydrometerLastReading: "Last reading",
      hydrometerNoReadings: "No readings yet.",
      hydrometerChartTitle: "Readings chart",
      hydrometerChartGravity: "Gravity",
      hydrometerChartTemperature: "Temperature",
      hydrometerChartXAxis: "Time",
      hydrometerChartGravityAxis: "Gravity (SG)",
      hydrometerChartTemperatureAxis: "Temperature (\xB0C)",
      logsTitle: "Logs",
      logsPagination: {
        ariaLabel: "Brew session logs pagination",
        prev: "Previous",
        next: "Next",
        status: "Page {page} of {pages}"
      },
      addCustomStepTitle: "Add new custom step for current recipe",
      stepNameLabel: "Name",
      stepNamePlaceholder: "Enter step name",
      assignedSectionLabel: "Section",
      minutesPlannedLabel: "Minutes",
      addStepButton: "Add step",
      saveSuccess: "Saved.",
      saveStepsButton: "Save brewing session",
      saving: "Saving\u2026",
      noteSaveSteps: "Reorder/disable changes are stored when you save the brewing section.",
      moveUp: "Move up",
      moveDown: "Move down",
      stepStatusLabel: "Status",
      statusPending: "Pending",
      statusInProgress: "In progress",
      statusDone: "Done",
      statusSkipped: "Skipped",
      statusNotApplicable: "Not applicable",
      disableStepLabel: "Disable",
      disableNo: "No",
      disableYes: "Yes",
      stepNoteLabel: "Note",
      saveLogButton: "Save section logs",
      removeStepButton: "Remove step",
      removeStepRemoving: "Removing\u2026",
      removeStepSuccess: "Step removed from this brew session.",
      deleteSessionButton: "Delete brewing session",
      deleteSessionStopBeforeDelete: "Please stop the brewing session before deleting it.",
      deleteSessionConfirm: "This will permanently delete this brewing session (including steps and logs).",
      confirmDelete: "Confirm delete",
      cancelDelete: "Cancel",
      deleting: "Deleting\u2026",
      timerLine: "Timer: elapsed {elapsed} \xB7 planned {planned} min",
      timerLineStopped: "Timer: stopped \xB7 elapsed {elapsed}",
      countdownLine: "remaining {remaining}",
      relativeToLabel: "Relative to",
      relativeToNone: "(none)",
      offsetFromEndLabel: "Offset from end (min)",
      relativeRemainingBeforeStartLine: "Remaining before step start: {remaining}",
      relativeOverdueByLine: "Overdue by: {overdue}",
      pleaseSaveModifications: "Please save modifications.",
      timerStart: "Start",
      timerPause: "Pause",
      timerStop: "Stop",
      startTimerForSection: "Start timer for section",
      startMashTimerMin: "Start mash timer ({minutes})",
      startBoilTimerMin: "Start boil timer ({minutes})",
      activateCustomTimerLabel: "Activate custom timer",
      stepDurationTimerLabel: "Step duration timer",
      stepDurationTimerHelp: "Runs automatically when step is set to In progress",
      stepDurationTimerIdle: "Runs when step is set to In progress",
      dateSectionTitle: "Date",
      stepsLockedUntilStartedNotice: "Start the brewing session before changing step statuses. Until then, steps stay Pending and read-only.",
      timersAndLogsHelpNote: "Timers run automatically for some steps, i.e. for 'hops additions' after boil timer gets started. Mash steps with a duration automatically start their countdown when set to In progress. It is also possible to start custom timers for single steps (often used when you want to check/log the duration of a specific step). IMPORTANT: when manually flagging a step (or multiple steps) to 'Done' or other status in a section, remember to click 'Save section logs' (or 'Save brewing session') otherwise your changes won't be saved.",
      datePickerLabel: "Scheduled date & time",
      dateLabel: "Date",
      timeLabel: "Time",
      dateSave: "Save",
      dateRemove: "Remove",
      dateEdit: "Edit date",
      dateAdd: "Add date",
      dateCancel: "Cancel",
      dateNotSet: "No date set",
      dateScheduledLabel: "Scheduled"
    },
    edit: {
      title: "View & Edit recipe",
      loading: "Loading\u2026",
      shapeNote: "Single-page editor with section navigation. Water chemistry is a link-out to the dedicated calculator page.",
      notReadyToLoad: "Not ready to load this recipe.",
      status: {
        saved: "Saved.",
        equipmentApplied: "Applied equipment & refreshed analysis.",
        equipmentReloaded: "Reloaded equipment & refreshed analysis."
      },
      nav: {
        sectionsAriaLabel: "Recipe sections",
        sectionsTitle: "Sections",
        openWaterCalculator: "Open water calculator",
        editYeast: "Edit yeast",
        openEquipment: "Open equipment",
        backToRecipes: "Back to Recipes"
      },
      sections: {
        basics: "Basics",
        analysis: "Analysis",
        brewingHistory: "Brewing history",
        brew: "Brew",
        equipment: "Equipment",
        mashing: "Mashing & Sparging",
        fermentables: "Fermentables",
        hops: "Hops",
        yeast: "Yeasts, Nutrients, Bacteria",
        other: "Other ingredients",
        boil: "Boil",
        notes: "Notes",
        water: "Water Chemistry & Volumes"
      },
      hops: {
        timeBeforeEndOfBoilMin: "Time before end of boil (min)",
        typeLabel: "Type",
        typeOptions: {
          pellet: "Pellet",
          leaf: "Leaf/Whole (dry)",
          leafWet: "Leaf/Whole (fresh)",
          powder: "Lupulin (pellet)",
          extract: "Extract",
          hopExtract: "Hop Extract",
          plug: "Plugs",
          debitteredLeaf: "Debittered Leaf"
        }
      },
      mashingHelp: "Mash schedule (BeerJSON mash procedure). Import a BeerJSON/BeerXML recipe with mash steps, or add steps manually in the Mash and/or Sparge water calculator pages.",
      mashingEmpty: "No mash steps. Add steps or import a recipe with a mash schedule.",
      mashingAddStep: "Add step",
      mashingAddFromTemplate: "Add from template",
      mashingTemplateSingleInfusion: "Single infusion",
      mashingTemplateStepMash: "Step mash",
      mashingTemplateTemperature: "Temperature",
      mashingTemplateDecoction: "Decoction",
      mashingProcedureName: "Procedure name",
      mashingGrainTemp: "Grain temp",
      mashingStepName: "Name",
      mashingStepType: "Type",
      mashingStepTemp: "Temp ({unit})",
      mashingStepTime: "Time ({unit})",
      mashingStepAmount: "Amount ({unit})",
      mashingStepRamp: "Ramp ({unit})",
      mashingDeleteStep: "Delete step",
      moveUp: "Move up",
      moveDown: "Move down",
      mashingDeduceFromMashIn: "Deduce from Mash in",
      mashingSave: "Save (including mash)",
      mashingSaveMashSteps: "Save",
      saving: "Saving\u2026",
      mashingEditInMashPage: "Edit mash schedule in Mash water & Mash steps",
      mashStepsFromWaterPage: "Mash steps (from Mash water page)",
      spargeStepFromWaterPage: "Sparge step (from Sparge water page)",
      spargeStepConfigureLink: "Configure sparge water",
      mashStepConfigureLink: "Configure mash water",
      mashingWaterVolumesTitle: "Water volumes (mash + sparge)",
      mashingWaterVolumesSource: "From water calculator",
      mashingWaterVolumesUnavailable: "Set up water volumes in the Water calculator to see mash and sparge volumes here.",
      mashingFirstStepSuggested: "Suggested: {amount} {unit} (from mash water volume)",
      mashingSpargeStepAmountSource: "From water calculator",
      mashStepsWaterBudgetNote: "Total water across all mash steps cannot exceed the 'Mash [total] water volume' above. Only steps with 'Deduce from Mash in' checked deduct from the Mash water volume. This is useful for brewers who use hot water for temperature increase.",
      mashStepsMashInAlwaysPresentNote: `The "Mash in" step is always present by design: it guarantees total quantity correctness. If you need an immediate successive step (i.e. 'Protein rest') use the "Add step" button and add it. You can have a new step with 0 amount.`,
      mashStepsTypeFallbackNote: "If you do not find the step mash you're looking for in the 'Type' list use 'Temperature' and add the name (like 'Protein rest' or 'Ferulic rest') in the 'Name' field.",
      mashStepsSeeRecapLink: "See Mash recap in recipe summary here.",
      mashingSpargeStepAmountUnavailable: "Set up water volumes in Water calculator",
      mashingTemplateSparge: "Sparge",
      equipmentSection: {
        help: "Choose an account-level equipment profile to snapshot into this recipe (no live reference).",
        profileLabel: "Equipment profile",
        noneOption: "(none)",
        apply: "Apply to recipe",
        reload: "Reload Equipment profile & recalculate overall",
        working: "Working\u2026",
        manageTemplatesText: "Manage equipment templates on",
        manageTemplatesLinkText: "Equipment",
        errors: {
          selectFirst: "Select an equipment profile first."
        }
      },
      basicsHelp: "Loaded/saved via GET/PATCH /api/recipes/:id.",
      versionLabel: "Version",
      versionCreateNote: "This create a new version of the recipe (cloning current recipe): old version can still be edited.",
      versionCreateButton: "Create another version from current recipe",
      versionCreateWorking: "Creating version\u2026",
      versionLimitReached: "Version limit reached (00\u201399).",
      duplicateRecipeNote: "This create a new recipe cloning current recipe.",
      duplicateRecipeButton: "Duplicate recipe from current recipe",
      duplicateRecipeWorking: "Duplicating\u2026",
      brewNote: "Launching the brew recipe creates the brew steps, lods necessary raw materiales and initialize logs if applicable.",
      programmedSectionLabel: "Programmed",
      brewingNowLabel: "Brewing now",
      lastBrewedLabel: "Last brewed",
      lastBrewedLoading: "Loading brew sessions\u2026",
      brewingHistoryEmpty: "No brew sessions yet for this recipe.",
      brewButton: "Brew the current recipe",
      brewFeatureSoon: "Feature available soon...",
      hopsHelp: "Pick hops from the database (or enter manually). Stored as a snapshot on the recipe.",
      timeBeforeEndOfBoilMin: "Time before end of boil (min)",
      yeastHelp: "Select yeast from the database (or enter manually). Stored as a snapshot on the recipe.",
      yeastEditInYeastPage: "Edit yeast in Yeast page",
      yeastPageTitle: "Yeast",
      yeastSectionHeading: "Yeast strains & pitching rates.",
      yeastAdvancedSubsectionHeading: "Advanced & Pitching rate calculation.",
      yeastPitchRateAmountNote: "If Pitch rate is selected the Amount (L or kg) to be pitched will be calculated and synced.",
      yeastEstimatedCellsRecalcNote: "If Pitch rate is selected, 'Estimated cells needed (B)' will be recalculated based on the current recipe Edit page Analysis section.",
      yeastPitchRateRequiresFormat: "Pitch rate \u2013 must select format to activate",
      yeastCellsPerLLabel: "Cells per L (overridable)",
      yeastCellsPerKGLabel: "Cells per KG (overridable)",
      yeastCellsPerDefaultNote: "Default cell densities are from yeastman.",
      yeastCellsPerOverrideNote: "Override only if you have lab or manufacturer data.",
      yeastBackToRecipe: "Back to recipe",
      yeastEmpty: "No yeast yet.",
      yeastSearchLabel: "Search yeast database",
      yeastAddButton: "Add yeast",
      yeastAddCustomButton: "Add custom yeast",
      yeastCustomNamePlaceholder: "Enter yeast name",
      yeastSaveButton: "Save",
      yeastRemove: "Remove",
      yeastNameLabel: "Name",
      yeastLabLabel: "Lab",
      yeastProductIdLabel: "Product ID",
      yeastAttenMinLabel: "Atten min (%)",
      yeastAttenMaxLabel: "Atten max (%)",
      yeastAmountLabel: "Amount ({unit})",
      yeastFermentationTempLabel: "Fermentation temp. ({unit})",
      yeastOxygenationLabel: "Needs Oxygenation",
      yeastOxygenationYes: "Yes",
      yeastOxygenationNo: "No",
      yeastDiacetylRestLabel: "Diacetyl rest",
      yeastDiacetylRestYes: "Yes",
      yeastDiacetylRestNo: "No",
      yeastFormatLabel: "Format",
      yeastFormatDry: "Dry",
      yeastFormatLiquid: "Liquid",
      yeastFormatSlurry: "Slurry",
      yeastSpeciesLabel: "Species",
      yeastSpeciesSaccharomycesCerevisiae: "Saccharomyces cerevisiae",
      yeastSpeciesSaccharomycesPastorianus: "Saccharomyces pastorianus",
      yeastSpeciesBrettanomyces: "Brettanomyces",
      yeastSpeciesDiastaticus: "Diastaticus",
      yeastSpeciesOther: "Other",
      yeastEstimatedCellsLabel: "Estimated cells needed (B)",
      yeastEstimatedCellsTooltip: "B = billions of cells. Based on batch size \xD7 OG (\xB0Plato) \xD7 pitch rate.",
      yeastEstimatedCellsValue: "{value} B",
      yeastAmountCalcBreakdown: "cells_B / cells_per_L = {cellsB} / {cellsPerL} = {amountL} L",
      yeastAmountCalcExample: "amount_L = cells_B / cells_per_L = {cellsB} / {cellsPerL} = {amountL} L",
      yeastNeedsPropagationLabel: "Needs Propagation",
      yeastNeedsPropagationYes: "Yes",
      yeastNeedsPropagationNo: "No",
      yeastPitchRateLabel: "Pitch rate",
      yeastPitchRateNone: "none",
      yeastPitchRateNote: "Higher pitching rate for same style (i.e. Ale, Lager, other beer styles, Mead) is important when OG increases.",
      yeastPitchRateMfgRec035Ales: "MFG Recommended 0.35 (Ales)",
      yeastPitchRateMfgRec05Ales: "MFG Recommended 0.5 (Ales)",
      yeastPitchRatePro075Ales: "Pro Brewer 0.75 (Ales)",
      yeastPitchRatePro10Ales: "Pro Brewer 1.0 (Ales)",
      yeastPitchRatePro125Ales: "Pro Brewer 1.25 (Ales)",
      yeastPitchRatePro15Lager: "Pro Brewer 1.5 (Lager)",
      yeastPitchRatePro175Lager: "Pro Brewer 1.75 (Lager)",
      yeastPitchRatePro20Lager: "Pro Brewer 2.0 (Lager)",
      yeastManualCellCountSummary: "Manual cell count methodology (hemocytometer)",
      yeastManualCellCountTitle: "How to calculate yeast to inoculate (kg) via manual cellular count using a microscope",
      yeastManualCellCountPrerequisitesTitle: "Prerequisites: tools and materials",
      yeastManualCellCountPrerequisitesBody: "Microscope (with 100\xD7 and 400\xD7 magnification), test tubes, methylene blue (0.01%), pipettes, a scientific calculator (also available as a mobile app), and ideally a small test tube rack.",
      yeastManualCellCountStep1Title: "Dilute the yeast sample in series",
      yeastManualCellCountStep1Body: "Use water or another appropriate diluent. Aim for 5\u201350 cells per small square. A typical dilution is 1:200 (e.g. 10\xD7 then 10\xD7 then 1:1 with 0.01% methylene blue). If too dense, add 1:10 for DF = 2000\xD7.\n\nImportant: take note of the DF (Dilution Factor) you choose (either 1:200 or 1:2000) because it will be inserted in successive formulas.",
      yeastManualCellCountStep1ImageAlt: "Diagram of two tubes showing 1:10 then 1:100 serial dilution (1:10 yeast + 9:10 water).",
      yeastManualCellCountStep1ImageLegend: "Diluting 1:1 with methylene blue (0.01%) yields 1:200 overall.",
      yeastManualCellCountStep2Title: "Load the hemocytometer",
      yeastManualCellCountStep2Body: "Position the coverslip first, then apply 10 \xB5l to the hemocytometer. Focus at 100\xD7, then 400\xD7 magnification.",
      yeastManualCellCountStep3Title: "Count cells in five small squares",
      yeastManualCellCountStep3Body: "Count all live (transparent) and dead (blue) cells in the five indicated small squares.\n\nRules: Count cells in the 5 indicated squares of the central square of the hemocytometer. Count cells touching top or left lines of the mini-square; exclude cells touching bottom or right lines. Count daughter cells that exceed 50% of mother cell size.",
      yeastManualCellCountStep3ImageAlt: "Hemocytometer grid showing the five small squares (four corners and center) where cells are counted. Each small square is 0.04 mm\xB2.",
      yeastManualCellCountStep4Title: "Calculate % viability",
      yeastManualCellCountStep4Body: "Formula:\n(alive cells) / (total cells) \xD7 100 = % live cells\n\nInputs: total cells, alive cells (from Step 3).",
      yeastManualCellCountStep5Title: "Calculate live cells per gram of suspension",
      yeastManualCellCountStep5Body: "Formula:\nalive cells \xD7 5 \xD7 DF \xD7 10,000 = live cells/g of suspension\n\nInputs: alive cells (raw count from Step 3), DF (dilution factor from Step 1).",
      yeastManualCellCountStep6Title: "Calculate yeast to inoculate (kg)",
      yeastManualCellCountStep6Body: "Formula:\n(HL \xD7 100,000 \xD7 PR \xD7 \xB0P) / (live cells/g \xD7 1000) = yeast to inoculate (kg)\n\nInputs: HL (hectoliters of wort), PR (pitch rate), \xB0P (Plato), and the result from Step 5 (live cells/g of suspension).",
      yeastManualCellCountGlossaryTitle: "Glossary",
      yeastManualCellCountGlossary: "HL = Hectoliters of wort\nDF = Dilution factor\nPR = Pitch rate (cells/mL/\xB0P): Ale ~1.0\xD710\u2076, Lager ~1.5\xD710\u2076\n\xB0P = Plato (density/4)\ng / 1000 = kg",
      yeastManualCellCountReference: "For a more detailed methodology, refer to ASBC Methods, Yeast 4: Microscopic Yeast Cell Counting.",
      yeastManualCountSectionTitle: "Use Manual count for slurry density and viability (from alive/total cells)",
      yeastManualCountFirstNote: "By choosing manual count to derive cells per L, the field 'Estimated cells needed (B)' is unchanged; only the slurry density (and thus Amount (L)) comes from the manual count. This fully reuses existing formulas and logic.",
      yeastManualCountDirectlyInfluencesAmount: "These inputs directly influence Amount (L).",
      yeastManualCountDFLabel: "DF (Dilution factor)",
      yeastManualCountDF200: "200\xD7",
      yeastManualCountDF2000: "2000\xD7",
      yeastManualCountAliveCellsLabel: "Alive cells",
      yeastManualCountTotalCellsLabel: "Total cells",
      yeastManualCountTotalTooLow: "Must be \u2265 Alive cells (viability \u2264 100%)",
      yeastManualCountViabilityLabel: "Viability (%)",
      yeastManualCountCalculatedViabilityLabel: "Calculated % viability",
      yeastManualCountCalculatedLiveCellsPerGramLabel: "Calculated live cells per gram of suspension",
      yeastManualCountSaveCalculatedValues: "Save calculated values",
      yeastLowViabilityWarning: "Vitality is {pct}%: consider a viability check.",
      yeastManualCountDisclaimer: "DISCLAIMER: calculations never replace experience and common sense: use your experience to compare to previous batches: a calculation is meant to confirm you're using the right approach and for fine tuning procedures and is BY NO MEANS meant to replace empiric controls and experience. Never trust numbers alone and use them for validation instead.",
      otherHelp: "Spices, finings, flavorings, etc.",
      boilTimeHelp: "Manual boil duration in minutes. Used for kettle volume and evaporation calculations. When empty, inferred from the longest boil hop addition.",
      boilSave: "Save (including boil)",
      waterHelp: "The full mash chemistry + water calculator lives on its own page (not embedded here).",
      waterProfilesManageText: "Manage profiles on",
      rawMaterialsCtaPrefix: "Found a missing or incorrect raw material?",
      rawMaterialsCtaLinkText: "Help improve the raw material database",
      fermentables: {
        buttons: {
          clear: "Clear",
          addCustomFermentable: "Add custom fermentable"
        },
        amountLabel: "Amount ({unit})",
        colorLabel: "Color ({unit})",
        mashPhClassLegacyLabel: "Mash pH class (legacy)",
        potentialKindLabel: "Potential kind",
        potentialValueLabel: "Potential value",
        groupLabel: "Group",
        gristTotalKg: "Total: {value} {unit}",
        gristAvgColor: "Avg color: {value} {unit}"
      },
      buttons: {
        clear: "Clear",
        addFermentable: "Add fermentable",
        addCustomFermentable: "Add custom fermentable",
        addOtherIngredient: "Add other ingredient"
      },
      fermentableAddedSaveHint: "Fermentable added. You must save the section to persist data.",
      amountLabel: "Amount ({unit})",
      colorLabel: "Color ({unit})",
      gristTotalKg: "Total: {value} {unit}",
      gristAvgColor: "Avg color: {value} {unit}",
      fermentableTimingLabel: "Add to",
      fermentableTimingMash: "Mash",
      fermentableTimingKettle: "Kettle (late extract)",
      fermentableLateAdditionLabel: "Late addition",
      fermentableLateAdditionNo: "No",
      fermentableLateAdditionYes: "Yes"
    },
    analysis: {
      help: "Derived estimates. If required inputs are missing, values show as \u201CInsufficient data\u201D.",
      na: "Insufficient data",
      customAttenuationPercentLabel: "Custom attenuation (%)",
      fields: {
        abv: "ABV (estimated)",
        ibuTinseth: "IBU (Tinseth, estimated)",
        ibuRager: "IBU (Rager, estimated)",
        buGu: "BU/GU",
        srmMorey: "Color (SRM, Morey, estimated)",
        srmDaniels: "Color (SRM, Daniels, estimated)",
        boilTimeMinutes: "Boil time (minutes)",
        kettleVolume: "Volume (kettle)",
        preBoilVolume: "Pre-boil volume (estimated)",
        og: "OG (estimated) Plato/SG",
        fg: "FG (estimated) Plato/SG",
        attenuation: "Attenuation (effective)",
        pbg: "PBG (pre-boil gravity, estimated) Plato/SG"
      },
      gristWaterConsistencyCheck: "Grist recipe-mash consistency check",
      gristWaterConsistencyPassed: "passed",
      gristWaterConsistencyError: "error",
      gristWaterConsistencyWarning: "Recalculate Mash water qty and modification importing recipe grist <link>mash page grist section</link> because grist in this recipe page (fermentable section) does not correspond to the grist in the Mash page.",
      gristWaterConsistencyDifference: "Difference: {value}%",
      warningsTitle: "Notes / missing inputs",
      warningsClickToExpand: "Click to expand",
      warnings: {
        missing_beerjson: "Recipe is missing BeerJSON; cannot compute analysis.",
        missing_water_settings: "Missing saved water settings; volume estimates may be unavailable.",
        missing_water_volumes: "Missing mash/sparge water volumes; volume estimates may be unavailable.",
        invalid_runoff_volume: "Mash/sparge volumes and losses imply zero or negative runoff volume; check water + mash equipment inputs.",
        invalid_evaporation: "Boil evaporation rate/time imply zero or negative post-boil volume; check equipment inputs.",
        invalid_kettle_volume: "Computed kettle volume is zero or negative; check equipment losses and water inputs.",
        exceeds_kettle_capacity: "Computed kettle volume exceeds kettle capacity/target from equipment profile.",
        missing_efficiency: "Missing efficiency; OG/PBG estimates require an efficiency %.",
        missing_fermentables: "No fermentables with usable amount + yield/potential; cannot estimate OG/PBG.",
        missing_color_volume: "Missing computed kettle volume; SRM requires saved water settings + volumes.",
        missing_fermentable_colors: "Missing fermentable color (Lovibond) on one or more grist rows; SRM requires fermentable colors.",
        used_batch_size_volume: "Using BeerJSON batch_size volume for IBU estimate because computed kettle volume is unavailable.",
        missing_ibu_gravity: "Missing boil gravity estimate; IBU estimates require PBG/OG.",
        missing_ibu_inputs: "No usable hop boil/whirlpool additions with amount, alpha acid %, and time; cannot estimate IBU.",
        missing_attenuation: "Missing yeast attenuation; FG/ABV estimates require yeast attenuation or an override."
      }
    },
    water: {
      common: {
        backToHub: "Back to water hub",
        goToSparge: "Go to sparge",
        goToMash: "Go to mash",
        mashWaterAndSteps: "Mash water & Mash steps",
        viewEditGrist: "View/edit grist in recipe",
        notAuthenticated: "Not authenticated. Please {signIn}."
      },
      mash: {
        title: "Mash water & Mash steps",
        mashStepsHeading: "Mash steps",
        adjustmentHeading: "Mash water adjustment",
        adjustmentHint: "Select a source + dilution profile and set volumes to see mixed ions.",
        gristSummaryHeading: "Grist (import & summary)",
        gristSummaryHelp: "We avoid duplicating the full grist table here. Use the recipe editor for details; this page only keeps a snapshot for calculations.",
        lateFermentablesExcludedNote: "Late addition fermentables total {kg} kg and are excluded from mash grist for water chemistry.",
        acidificationHeading: "Mash water acidification",
        resultLastCalculated: "Result (last calculated)",
        overallResultHeading: "Overall mash water result (HCO3 derived from alkalinity)",
        saltAdditionsManualV0: "Salts additions",
        startingAlkalinityLabel: "Starting alkalinity ({unit})",
        sourceVolumeLabel: "Source volume ({unit})",
        dilutionVolumeLabel: "Dilution volume ({unit})",
        mashWaterVolumeLabel: "Mash water volume ({unit})",
        mashingStepName: "Name",
        mashingStepType: "Type",
        mashingStepTemp: "Temp ({unit})",
        mashingStepTime: "Time ({unit})",
        mashingStepAmount: "Amount ({unit})",
        mashingEmpty: "No mash steps. Add steps or import a recipe with a mash schedule.",
        mashingAddStep: "Add step",
        mashingAddFromTemplate: "Add from template",
        mashingTemplateSingleInfusion: "Single infusion",
        mashingTemplateStepMash: "Step mash",
        mashingTemplateSparge: "Sparge",
        mashingDeduceFromMashIn: "Deduce from Mash in",
        mashStepsBudgetExceeded: "Mash step water exceeds the mash water volume. Reduce step amounts or increase mash water volume.",
        saveMashDraft: "Save mash draft",
        estimateAndSaveSnapshot: "Estimate & save snapshot",
        calculateAndSaveSnapshot: "Calculate & save snapshot",
        resultManualAcidAmountMode: "Result (manual acid amount mode)",
        estimatedFromManualAcidAmount: "Estimated from manual acid amount",
        mashDraftSaved: "Saved mash draft.",
        mashSnapshotEstimatedAndSaved: "Estimated & saved snapshot.",
        mashSnapshotCalculatedAndSaved: "Calculated & saved snapshot.",
        overallSnapshotSaved: "Calculated & saved.",
        saving: "Saving\u2026",
        working: "Working\u2026"
      },
      sparge: {
        title: "Sparge water",
        spargeConfigurationHeading: "Sparge configuration",
        spargeMethodFlySparge: "Fly Sparge",
        spargeMethodBatchSparge: "Batch Sparge",
        acidificationHeading: "Sparge acidification",
        resultLastCalculated: "Result (last calculated)",
        spargeSourceWaterProfileLabel: "Sparge source water profile",
        saltAdditionsManualV0: "Sparge salts additions",
        saltAdditionsHelp: "Base profile is the selected sparge water profile above. Add salts in grams; we compute resulting ions (ppm) for the sparge water volume.",
        startingAlkalinityLabel: "Starting alkalinity ({unit})",
        waterVolumeLabel: "Water volume ({unit})"
      },
      boil: {
        title: "Additional boil water",
        adjustmentHeading: "Boil water adjustment",
        saltAdditionsHeading: "Salt additions (manual)",
        acidificationHeading: "Boil water acidification",
        overallResultHeading: "Overall boil water result (HCO3 derived from alkalinity)",
        adjustmentHelp: "Choose source/target/dilution profiles and volumes to compute a mixed starting water profile.",
        saltAdditionsHelp: "Select a Source profile and set Source volume. Dilution is optional, but if Dilution volume is > 0 you must select a Dilution profile.",
        saltAdditionsBaseHelp: "Base profile is the mixed source water above. Add salts in grams; we compute resulting ions (ppm).",
        startingAlkalinityLabel: "Starting alkalinity ({unit})",
        sourceVolumeLabel: "Source volume ({unit})",
        dilutionVolumeLabel: "Dilution volume ({unit})"
      }
    },
    activeAccount: "Active account:",
    createTitle: "Create recipe",
    nameLabel: "Name",
    styleLabel: "Style",
    stylePlaceholder: "Select a style",
    stylesLoading: "Loading styles\u2026",
    createButton: "Create",
    creating: "Creating\u2026",
    refresh: "Refresh",
    refreshing: "Refreshing\u2026",
    listTitle: "Your recipes",
    noRecipes: "No recipes yet.",
    openEditor: "Open editor",
    openWater: "Open water calculator",
    openVersions: "View versions",
    versionShort: "Version",
    versions: {
      title: "Recipe versions",
      subtitle: "All saved versions for this recipe (version 00 is the first).",
      backToRecipes: "Back to Recipes",
      backToEditor: "Back to recipe editor",
      listTitle: "Versions",
      listAriaLabel: "Recipe versions list",
      empty: "No versions found.",
      refresh: "Refresh",
      refreshing: "Refreshing\u2026",
      versionLabel: "Version",
      openEditor: "Open editor",
      openWater: "Open water calculator",
      updatedAt: "Updated"
    },
    exportBeerJson: "Export (BeerJSON)",
    pagination: {
      ariaLabel: "Recipe list pagination",
      prev: "Previous",
      next: "Next",
      status: "Page {page} of {pages}"
    },
    delete: {
      cta: "Delete",
      confirmTitle: "Delete recipe?",
      confirmBody: "This cannot be undone. Click \u201CDelete now\u201D to confirm, or Cancel to keep it.",
      confirmCta: "Delete now",
      deleting: "Deleting\u2026",
      cancel: "Cancel"
    },
    export: {
      title: "Export",
      subtitle: "Download strict BeerJSON for one recipe or all recipes.",
      selectLabel: "Recipe",
      noneAvailable: "No recipes available",
      exportSelectedCta: "Export selected",
      exportAllCta: "Export all",
      strictNote: "Exports are strict BeerJSON (internal addition row ids are removed for interoperability)."
    }
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
  devDashboard: {
    loading: "Loading\u2026"
  },
  waterProfiles: {
    title: "Water profiles",
    backToRecipes: "Back to Recipes",
    ionsLegend: "Ions ({unit})",
    activeAccount: "Active account",
    viewAllTableTitle: "View all water profiles",
    adminAddTitle: "Admin: add water profile",
    createdProfilesStartUnverified: "Created profiles start as unverified. Use the table actions to verify/unverify.",
    navigationTitle: "Navigation",
    phPlaceholder: "e.g. 7.80",
    rawMaterialsCtaPrefix: "Found a missing or incorrect raw material?",
    rawMaterialsCtaLinkText: "Help improve the raw material database"
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
  salts: {
    gypsum: "Gypsum",
    calciumChloride: "Calcium chloride",
    epsom: "Epsom",
    tableSalt: "Table salt",
    bakingSoda: "Baking soda",
    modeManualSuffix: "(manual)",
    modeRequiredSuffix: "(required)"
  },
  waterHub: {
    title: "Water management",
    recipeId: "Recipe ID",
    recipeName: "Name",
    recipeVersion: "Version",
    backToRecipeEditor: "Back to recipe editor",
    missingHeaders: "Missing dev headers. Go to the dashboard and click <strong>Save headers</strong> (User + Active account), then come back here.",
    chooseArea: "Choose an area",
    mashWater: "Mash water & Mash steps",
    spargeWater: "Sparge water",
    additionalBoilWater: "Additional boil water",
    lastCalculated: "last calculated",
    manageProfilesOn: "Manage profiles on",
    waterProfilesLink: "Water profiles",
    quickStatus: "Quick status",
    mashAcidMode: "Mash acid mode",
    spargeAcidMode: "Sparge acid mode",
    mashOverallSnapshot: "Mash overall snapshot",
    finalAlkalinity: "Final alkalinity",
    openMashOverall: "Open mash overall",
    refreshing: "Refreshing\u2026",
    refresh: "Refresh",
    profilesLoaded: "Summary loaded.",
    profilesNotLoaded: "Summary not loaded.",
    recap: "Recap",
    recapSubtitle: "Uses saved snapshots where available; merged pH is an approximation using volume-weighted [H+].",
    mergedWaterRecap: "Merged water recap",
    computed: "Computed",
    clickToExpand: "Click to expand",
    perStream: "Per stream",
    colStream: "Stream",
    colVolumeL: "Volume (L)",
    colPh: "Mash pH",
    colFinalAlk: "Final alkalinity (ppm as CaCO3)",
    mergedSummary: "Merged summary",
    totalVolume: "Total volume",
    approxMergedPh: "Approx merged pH",
    mergedFinalAlk: "Merged final alkalinity",
    additionsPerStream: "Additions (per stream)",
    salt: "Salt",
    acid: "Acid",
    mergedIonsTitle: "Merged ions",
    mergedIonsDescription: "Merged ions (ppm) are computed from saved mash/sparge/boil snapshots after salts + acid (SO4/Cl counter-ions only) and averaged by volume. Streams without saved snapshots are excluded.",
    ion: "Ion",
    mergedPpm: "Merged (ppm)",
    noMergedProfile: "No merged profile available yet (need saved salts + acid snapshots for at least one stream).",
    noSettingsLoaded: "No settings loaded yet.",
    finalRecapTitle: "Final recap",
    finalRecapSubtitle: "A quick, heuristic summary (not a full water chemistry model).",
    predictedMashPh: "Predicted mash pH",
    residualAlkalinity: "Residual alkalinity (RA)",
    raMashOverall: "Mash overall (after salts + acid)",
    raMerged: "Merged water (if available)",
    ppmAsCaCO3: "ppm as CaCO3",
    styleExpectedRa: "Style expected RA (rule of thumb)",
    styleExpectedRaNa: "N/A",
    finalRecapCaveat: "Caveat: RA is a heuristic; results depend on assumptions and do not replace a full mash pH/chemistry model.",
    styleExpectedRaPale: "Pale / hop-forward styles usually benefit from lower RA.",
    styleExpectedRaAmber: "Amber / malty styles often tolerate moderate RA.",
    styleExpectedRaDark: "Dark / roasty styles often benefit from higher RA.",
    alkVsBicarbTitle: "Alkalinity (as CaCO3) vs bicarbonate (HCO3)",
    alkVsBicarbSubtitle: "Why this app uses CaCO3 for alkalinity/RA and HCO3 in the ion tables.",
    alkVsBicarbPoint1: "\u201Cppm as CaCO3\u201D is an alkalinity unit: it expresses acid-neutralizing capacity (not dissolved CaCO3).",
    alkVsBicarbPoint2: "Ion tables list species concentrations (ppm): Ca, Mg, Na, SO4, Cl and HCO3.",
    alkVsBicarbPoint3: "When the table says \u201CHCO3 derived from alkalinity\u201D, it converts CaCO3-equivalent alkalinity into an HCO3 ppm estimate: HCO3 \u2248 alkalinity \xD7 61/50.",
    alkVsBicarbPoint4: "Strictly, alkalinity and bicarbonate are not identical at all pH/conditions; this conversion is a practical approximation for typical brewing water."
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
  equipment: {
    subtitle: "Profili attrezzatura (per account) usati dalle ricette (copia snapshot; nessun riferimento live).",
    refresh: "Aggiorna",
    refreshing: "Aggiornamento\u2026",
    backToRecipes: "Torna alle Ricette",
    listTitle: "Profili attrezzatura",
    noProfiles: "Ancora nessun profilo attrezzatura.",
    colName: "Nome",
    colKettleVol: "Volume kettle ({unit})",
    colMashEff: "Efficienza mash (%)",
    colActions: "Azioni",
    edit: "Modifica",
    delete: "Elimina",
    createTitle: "Aggiungi profilo attrezzatura",
    editTitle: "Modifica profilo attrezzatura",
    nameLabel: "Nome",
    kettleVolumeLitersLabel: "Volume kettle ({unit})",
    kettleLossesLitersLabel: "Perdite kettle ({unit})",
    kettleBoilEvaporationRatePercentPerHourLabel: "Evaporazione (% per ora)",
    kettleCoolingShrinkagePercentLabel: "Contrazione raffreddamento (%)",
    kettleHopsAbsorptionLitersLabel: "Assorbimento luppolo ({unit})",
    mashVolumeLitersLabel: "Volume mash ({unit})",
    mashEfficiencyPercentLabel: "Efficienza mash (%)",
    mashLossesLitersLabel: "Perdite mash ({unit})",
    mashThicknessLPerKgLabel: "Spessore mash ({unit})",
    mashGrainAbsorptionLPerKgLabel: "Assorbimento grani ({unit})",
    mashWaterLeftoverLitersLabel: "Acqua mash residua ({unit})",
    otherLossesLitersLabel: "Altre perdite non specificate ({unit})",
    create: "Crea",
    creating: "Creazione\u2026",
    save: "Salva modifiche",
    saving: "Salvataggio\u2026",
    cancel: "Annulla",
    sectionTitles: {
      kettle: "Kettle",
      mash: "Mash",
      misc: "Varie"
    },
    errors: {
      nameRequired: "Il nome \xE8 obbligatorio.",
      notAuthenticated: "Non autenticato.",
      lossesMustBeNonNegative: "Questo valore deve essere \u2265 0.",
      percentRange: "La percentuale deve essere tra 0 e 100.",
      kettleVolumeMustBePositive: "Il volume del kettle deve essere > 0.",
      mashEfficiencyRange: "L\u2019efficienza mash deve essere tra 0 e 100."
    }
  },
  inventory: {
    title: "Gestione inventario",
    subtitle: "Traccia fermentabili, luppoli, acidi, sali e altri materiali di produzione.",
    backToDashboard: "Torna alla Dashboard",
    addCustom: "Aggiungi personalizzato",
    addFromList: "Aggiungi da elenco",
    addFromListAdd: "Aggiungi",
    remove: "Rimuovi",
    clearSearch: "Svuota ricerca",
    producerLabel: "Produttore",
    lovibondLabel: "Colore ({unit})",
    yieldPercentLabel: "Resa (%)",
    ppgLabel: "PPG",
    alphaAcid: "Acidi alfa",
    alphaMinLabel: "\u03B1 min (%)",
    alphaMaxLabel: "\u03B1 max (%)",
    addCustomGuidance: "Aggiungi ingrediente personalizzato: per evitare duplicazioni, controlla attentamente che non sia gi\xE0 presente nell\u2019elenco qui sopra (potrebbe avere un nome leggermente diverso). L\u2019elenco esistente dovrebbe gi\xE0 comprendere tutti i tipi e sottotipi dell\u2019ingrediente.",
    columns: {
      name: "Nome",
      producer: "Produttore",
      type: "Tipo",
      lovibondShort: "\xB0L",
      yieldPercentShort: "Resa %",
      ppg: "PPG",
      alphaMin: "\u03B1 min",
      alphaMax: "\u03B1 max"
    },
    sections: {
      fermentables: "Fermentabili",
      hops: "Luppoli",
      specialities: "Specialit\xE0",
      acidSalts: "Acidi e sali",
      detergentsSanitizers: "Detergenti e sanificanti",
      kegging: "Kegging & imbottigliamento"
    },
    searchPlaceholder: "Cerca\u2026",
    search: "Cerca nel database pubblico",
    noResultsTryAnotherKey: "Nessun risultato. Prova un\u2019altra chiave.",
    pagination: {
      ariaLabel: "Paginazione ricerca inventario",
      prev: "Precedente",
      next: "Successivo",
      status: "Pagina {page} di {pages}"
    },
    noItems: "Nessun articolo ancora.",
    quantityLabel: "Quantit\xE0 ({unit})",
    nameLabel: "Nome"
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
  math: {
    toggleShow: "Mostra formule",
    toggleHide: "Nascondi formule",
    fxLabel: "Mostra formula: {topic}",
    common: {
      none: "(nessuno)",
      yes: "s\xEC",
      no: "no",
      more: "(+{count} in pi\xF9\u2026)",
      ionLine: "- {ion}: {ppm} {ppmUnit}",
      saltLine: "- {salt}: {grams} {g}",
      detailLine: "- {label}: {value}"
    },
    derivation: {
      headings: {
        formula: "Formula:",
        inputs: "Input:",
        intermediates: "Passi / intermedi:",
        breakdowns: "Dettagli:",
        notes: "Note:"
      },
      common: {
        kvLine: "- {label}: {value}",
        ionDelta: "{ion} {ppm} {ppmUnit}",
        more: "(+{count} in pi\xF9\u2026)",
        yes: "s\xEC",
        no: "no",
        null: "\u2014",
        unknown: "sconosciuto",
        none: "(nessuno)",
        missing: "(ricalcola per vedere la derivazione)"
      },
      labels: {
        volumeLiters: "Volume ({unit})",
        startingAlk: "Alcalinit\xE0 iniziale ({unit})",
        startingPh: "pH iniziale",
        targetPh: "pH target/raggiunto",
        alkAfterSalts: "Alcalinit\xE0 dopo i sali ({unit})",
        acidSulfateAddedPpm: "Solfato aggiunto dall'acido ({unit})",
        acidChlorideAddedPpm: "Cloruro aggiunto dall'acido ({unit})",
        mode: "Modalit\xE0",
        startingAlkalinityPpmCaCO3: "Alcalinit\xE0 iniziale ({unit})",
        effectiveAlkalinityPpmCaCO3: "Alcalinit\xE0 efficace ({unit})",
        alkalinityReductionFromCaMgPpmCaCO3: "Riduzione alcalinit\xE0 da Ca/Mg ({unit})",
        acidRequired_mEqPerL: "Acido richiesto (mEq/L)",
        mMRequired_mmolPerL: "mM richiesti (mmol/L)",
        frac_equivalentsPerMole: "Equivalenti per mole (frazione)",
        sg_mgPerMl: "Densit\xE0 soluzione (mg/mL)",
        acidType: "Tipo di acido",
        strengthKind: "Tipo concentrazione",
        strengthValue: "Valore concentrazione",
        breakdownSum: "Come si combinano i delta",
        base: {
          calciumPpm: "Ca base ({unit})",
          magnesiumPpm: "Mg base ({unit})",
          sodiumPpm: "Na base ({unit})",
          sulfatePpm: "SO4 base ({unit})",
          chloridePpm: "Cl base ({unit})",
          bicarbonatePpm: "HCO3 base ({unit})"
        },
        mashWaterVolumeLiters: "Volume acqua mash ({unit})",
        spargeVolumeLiters: "Volume acqua sparge ({unit})",
        boilWaterVolumeLiters: "Volume acqua boil aggiuntiva ({unit})",
        mashLossesLiters: "Perdite mash ({unit})",
        mashWaterLeftoverLiters: "Acqua residua mash ({unit})",
        mashGrainAbsorptionLPerKg: "Assorbimento grani ({unit})",
        preBoilVolumeLiters: "Volume pre-boil ({unit})",
        boilTimeHours: "Tempo bollitura (ore)",
        evaporationRatePercentPerHour: "Evaporazione (% per ora)",
        coolingShrinkagePercent: "Ritiro raffreddamento (%)",
        kettleLossesLiters: "Perdite kettle ({unit})",
        otherLossesLiters: "Altre perdite ({unit})",
        kettleHopAbsorptionLiters: "Assorbimento luppolo ({unit})",
        kettleVolumeLiters: "Volume kettle ({unit})",
        efficiencyPercent: "Efficienza (%)",
        ogEstimatedSg: "Stima OG (SG)",
        pbgEstimatedSg: "Stima PBG (SG)",
        attenuationEffectivePercent: "Attenuazione effettiva (%)",
        fgEstimatedSg: "Stima FG (SG)",
        abvEstimatedPercent: "Stima ABV (%)",
        postBoilVolumeLiters: "Volume post-boil ({unit})",
        boilGravitySg: "Gravit\xE0 boil (SG)",
        ibuTinsethEstimated: "IBU (Tinseth, stimata)",
        ibuRagerEstimated: "IBU (Rager, stimata)",
        mcu: "MCU",
        colorSrmMoreyEstimated: "SRM (Morey, stimato)",
        colorSrmDanielsEstimated: "SRM (Daniels, stimato)"
      },
      rows: {
        saltDelta: "- {saltKey} ({grams} {g}): {deltas}"
      },
      breakdowns: {
        salt_additions: {
          perSaltDeltas: {
            title: "Delta per sale (ppm)"
          }
        },
        mash_overall: {
          saltBreakdown: {
            title: "Contributi dei sali (delta per sale)"
          }
        },
        sparge_overall: {
          saltBreakdown: {
            title: "Contributi dei sali (delta per sale)"
          }
        },
        boil_overall: {
          saltBreakdown: {
            title: "Contributi dei sali (delta per sale)"
          }
        }
      },
      notes: {
        generic: "- {note}",
        counterIonsOnlyStrongAcids: "Contro-ioni: solo l\u2019acido solforico aggiunge SO4 e solo l\u2019acido cloridrico aggiunge Cl. Con altri acidi questi valori sono 0."
      },
      formulas: {
        water: {
          salt_additions: {
            v1: "ppm = mg/L\n\nPer ogni sale:\n- Converti grammi -> moli di sale\n- Usa la stechiometria per ottenere le moli di ogni gruppo ionico\n- Converti in mg di ogni gruppo ionico\n- Dividi per il volume (L) per ottenere ppm\n\nIoni finali = ioni base + somma(delta per sale)"
          },
          acidification: {
            v1: "Risolviamo la quantit\xE0 di acido che porta al pH target dato alcalinit\xE0 e volume.\n\nRelazioni chiave (semplificate):\n- alcalinit\xE0_finale = alcalinit\xE0_efficace - acido_richiesto(mEq/L) \xD7 50\n- acido_richiesto dipende dalla distribuzione dei carbonati + dissociazione dell\u2019acido al pH target\n\nContro-ioni:\n- solforico aggiunge SO4\n- cloridrico aggiunge Cl"
          },
          mash_overall: {
            v1: "Ioni complessivi = ioni(dopo sali) + contro-ioni dell\u2019acido, e HCO3 \xE8 derivato dall\u2019alcalinit\xE0 finale.\n\nCombina:\n- aggiunta sali (bilancio di massa su ppm)\n- acidificazione (alcalinit\xE0 finale + contro-ioni SO4/Cl)"
          },
          sparge_overall: {
            v1: "Ioni complessivi = ioni(dopo sali) + contro-ioni dell\u2019acido, e HCO3 \xE8 derivato dall\u2019alcalinit\xE0 finale."
          },
          boil_overall: {
            v1: "Ioni complessivi = ioni(dopo sali) + contro-ioni dell\u2019acido, e HCO3 \xE8 derivato dall\u2019alcalinit\xE0 finale."
          }
        },
        analysis: {
          pre_boil_volume: {
            v1: "volume_pre_boil = acqua_mash + acqua_sparge - assorbimento_grani - perdite_mash - residuo + aggiunte_boil"
          },
          kettle_volume: {
            v1: "volume_kettle = raffreddato(volume_post_boil_hot(volume_pre_boil)) - perdite_kettle - assorbimento_luppolo - altre_perdite"
          },
          og: {
            v1: "OG stimata da resa fermentabili, efficienza (%) e volume kettle."
          },
          pbg: {
            v1: "PBG stimata da resa fermentabili, efficienza (%) e volume pre-boil."
          },
          attenuation: {
            v1: "Attenuazione effettiva = media delle 2 attenuazioni lievito pi\xF9 alte (override prioritari)."
          },
          fg: {
            v1: "FG = 1 + (OG - 1) \xD7 (1 - attenuazione/100)"
          },
          abv: {
            v1: "ABV% = (OG - FG) \xD7 131,25"
          },
          ibu_tinseth: {
            v1: "IBU Tinseth calcolata da aggiunte luppolo, utilizzo, gravit\xE0 boil e volume."
          },
          ibu_rager: {
            v1: "IBU Rager calcolata da aggiunte luppolo, utilizzo, gravit\xE0 boil e volume."
          },
          mcu: {
            v1: "MCU (Malt Color Units) = \u03A3(lb \xD7 \xB0L) / gal, usando il volume post-boil/kettle."
          },
          srm_morey: {
            v1: "SRM (Morey) = 1,4922 \xD7 MCU^0,6859"
          },
          srm_daniels: {
            v1: "SRM (Daniels) \u2248 0,2 \xD7 MCU + 8,4"
          }
        }
      }
    },
    analysis: {
      common: {
        toggleHint: "Si applica a tutte le sezioni di questa pagina (dove disponibile).",
        sources: {
          kettleVolume: "volume kettle",
          batchSize: "batch size BeerJSON",
          pbg: "PBG",
          og: "OG",
          unknown: "sconosciuto"
        },
        hopUse: {
          boil: "boil",
          whirlpool: "whirlpool (0,5\xD7)",
          dryhop: "dry hop"
        },
        excludeDryhop: "il dry hop non contribuisce all\u2019IBU",
        excludeMissingInputs: "mancano quantit\xE0/AA%/tempo",
        hopLine: "- {name}: {use}, {amountG} g @ {alpha}% AA, {timeMin} min",
        hopLineExcluded: "- {name}: escluso ({reason})",
        noHops: "(nessun luppolo nell\u2019editor)",
        yeastSource: {
          override: "override",
          beerjson: "BeerJSON",
          missing: "mancante"
        },
        yeastLine: "- {name}: {value}% ({source})",
        yeastSelectedLine: "- {name}: {value}%",
        noYeast: "(nessun lievito nell\u2019editor)",
        noYeastSelected: "(attenuazione lievito non disponibile)",
        noteDependsOnWaterAndEquipment: "Dipende da impostazioni acqua salvate e snapshot attrezzatura.",
        noteMissingWaterSettings: "Impostazioni acqua salvate mancanti; i volumi stimati potrebbero non essere disponibili.",
        noteMissingFermentableColors: "Colore fermentabile (Lovibond) mancante su una o pi\xF9 righe."
      },
      abv: {
        title: "ABV (stimata)",
        body: "Formula:\nABV = (OG - FG) \xD7 131,25\n\nQuesta ricetta:\nOG = {og}\nFG = {fg}\nABV = {abv}%\n\nNote:\n- OG/FG sono stime derivate (non misurate)."
      },
      ibuTinseth: {
        title: "IBU (Tinseth, stimata)",
        body: "Modello (Tinseth):\nU = 1,65 \xD7 0,000125^(G - 1) \xD7 (1 - e^(-0,04 \xD7 t)) / 4,15\nIBU = \u03A3 (g \xD7 (AA%/100) \xD7 U \xD7 1000 / V_L)\n\nQuesta ricetta:\nGravit\xE0 usata (SG) = {gravity} ({gravitySource})\nVolume usato (L) = {volume} ({volumeSource})\n\nAggiunte luppolo (dall\u2019editor):\n{hopsLines}\n\nRisultato:\nIBU (Tinseth) = {ibu}"
      },
      ibuRager: {
        title: "IBU (Rager, stimata)",
        body: "Modello (Rager):\nU% \u2248 18,11 + 13,86 \xD7 tanh((t - 31,32) / 18,27)\nCorrezione gravit\xE0 (se G > 1,050): GA = (G - 1,050) / 0,2\nIBU = \u03A3 (g \xD7 (AA%/100) \xD7 (U%/(1+GA)) \xD7 1000 / V_L)\n\nQuesta ricetta:\nGravit\xE0 usata (SG) = {gravity} ({gravitySource})\nVolume usato (L) = {volume} ({volumeSource})\n\nAggiunte luppolo (dall\u2019editor):\n{hopsLines}\n\nRisultato:\nIBU (Rager) = {ibu}"
      },
      srmMorey: {
        title: "Colore (SRM, Morey, stimato)",
        body: "Modello (Morey):\nMCU = \u03A3 (lb \xD7 \xB0L) / gal\nSRM = 1,4922 \xD7 MCU^0,6859\n\nQuesta ricetta:\nVolume kettle usato = {volume} L\nNote:\n- {notes}\n\nRisultato:\nSRM (Morey) = {srm}"
      },
      srmDaniels: {
        title: "Colore (SRM, Daniels, stimato)",
        body: "Modello (Daniels, lineare):\nMCU = \u03A3 (lb \xD7 \xB0L) / gal\nSRM \u2248 0,2 \xD7 MCU + 8,4\n\nQuesta ricetta:\nVolume kettle usato = {volume} L\nNote:\n- {notes}\n\nRisultato:\nSRM (Daniels) = {srm}"
      },
      kettleVolume: {
        title: "Volume (kettle)",
        body: "Questo valore \xE8 derivato da impostazioni acqua salvate e perdite/evaporazione dell\u2019attrezzatura.\n\nQuesta ricetta:\nVolume kettle = {kettleVolume} L\n\nNote:\n- {notes}"
      },
      preBoilVolume: {
        title: "Volume pre-boil (stimato)",
        body: "Questo valore \xE8 derivato da impostazioni acqua salvate e perdite dell\u2019attrezzatura.\n\nQuesta ricetta:\nVolume pre-boil = {preBoilVolume} L\n\nNote:\n- {notes}"
      },
      og: {
        title: "OG (stimata)",
        body: "L\u2019OG \xE8 stimata da potenziale fermentabili + volume + efficienza.\n\nQuesta ricetta:\nOG = {og}\nVolume (kettle) = {volume} L\nEfficienza usata = {efficiency}%\n\nNote:\n- Se mancano efficienza/fermentabili, l\u2019OG pu\xF2 non essere disponibile."
      },
      fg: {
        title: "FG (stimata)",
        body: "Formula:\nFG = 1 + (OG - 1) \xD7 (1 - Attenuazione/100)\n\nQuesta ricetta:\nOG = {og}\nAttenuazione = {attenuation}%\nFG = {fg}"
      },
      attenuation: {
        title: "Attenuazione (effettiva)",
        body: "Modello:\n- Per ogni lievito: usa override% se presente, altrimenti attenuazione BeerJSON (media(min,max) se disponibile).\n- Attenuazione effettiva = media dei 2 valori effettivi pi\xF9 alti.\n\nQuesta ricetta:\nTutti i lieviti:\n{yeastLines}\n\nSelezionati (top 2):\n{selectedLines}\n\nMedia top-2 = {topAvg}%\nAttenuazione effettiva = {attenuation}%"
      },
      pbg: {
        title: "PBG (gravit\xE0 pre-boil, stimata)",
        body: "La PBG \xE8 stimata come l\u2019OG, ma usando il volume pre-boil.\n\nQuesta ricetta:\nPBG = {pbg}\nVolume pre-boil = {preBoilVolume} L\nEfficienza usata = {efficiency}%\n\nNote:\n- Richiede volumi acqua salvati per stimare il volume pre-boil."
      }
    },
    yeast: {
      estimatedCells: {
        title: "Cellule stimate necessarie (B)",
        body: "cells_B = batch_size_L \xD7 OG_plato \xD7 pitch_rate\n\nDove:\n- batch_size_L: volume kettle/batch in litri\n- OG_plato: gravit\xE0 originale convertita in \xB0Plato\n- pitch_rate: milioni di cellule per mL per \xB0Plato (es. 0,75 per Pro Brewer 0,75 Ales)\n\nB = miliardi di cellule.\n\nNota: Quando 'Usa conta manuale per densit\xE0 sospensione e vitalit\xE0 (da cellule vive/totali)' \xE8 attivo per la sospensione (selezionando gli input nella sua sezione), 'Cellule stimate necessarie (B)' non cambia. Solo la densit\xE0 della sospensione (e quindi Quantit\xE0 L) deriva dalla conta manuale."
      },
      amountL: {
        title: "Quantit\xE0 (L) per liquido/sospensione",
        body: "quantit\xE0_L = cells_B / cells_per_L\n\nDove cells_B deriva da batch \xD7 OG \xD7 pitch rate (invariato dalla funzione di conta manuale) poi cells_per_L \xE8 la densit\xE0 sospensione/liquido in miliardi per litro.\n\nQuando 'Usa conta manuale' \xE8 attivo per la sospensione, cells_per_L si deriva da: cellule vive \xD7 5 \xD7 DF \xD7 10.000 \u2192 cellule vive/g; poi B/L = cellule vive/g \xD7 1000 / 1e9. Questo influenza direttamente la Quantit\xE0 (L)."
      },
      manualCountViability: {
        title: "Vitalit\xE0 % calcolata",
        body: "vitalit\xE0_% = (cellule vive / cellule totali) \xD7 100\n\nDove cellule vive e totali sono i conteggi grezzi dai cinque quadrati dell'emocitometro.\n\nVedi Metodologia conta manuale (emocitometro) sotto per la procedura completa."
      },
      manualCountLiveCellsPerGram: {
        title: "Cellule vive per grammo di sospensione (calcolate)",
        body: "cellule vive/g = cellule vive \xD7 5 \xD7 DF \xD7 10.000\n\nDove cellule vive \xE8 il conteggio grezzo delle cellule vive, DF \xE8 il fattore di diluizione (200\xD7 o 2000\xD7).\n\nVedi Metodologia conta manuale (emocitometro) sotto per la procedura completa."
      },
      manualCountAliveInfluence: {
        title: "Influisce sulla Quantit\xE0 (L) da inoculare",
        body: "Le cellule vive influenzano direttamente la Quantit\xE0 (L): vengono usate per derivare le cellule/L dalla conta manuale (cells_per_L = cellule vive \xD7 DF \xD7 0,05)."
      },
      manualCountTotalInfluence: {
        title: "Non influenza la Quantit\xE0 (L)",
        body: "Le cellule totali non influenzano direttamente la Quantit\xE0 (L). Servono a calcolare la vitalit\xE0 (cellule vive/totali \xD7 100). Una vitalit\xE0 bassa richiede una verifica attenta della vitalit\xE0/attivit\xE0 del lievito."
      }
    },
    sparge: {
      acidRequired: {
        title: "Acido necessario (pH target)",
        body: "Modello concettuale:\n- Risolviamo la quantit\xE0 di acido che porta il pH da Iniziale a Target, dato alcalinit\xE0 iniziale e volume.\n\nNote:\n- Se il profilo selezionato non ha il pH, usiamo solo il pH iniziale inserito manualmente.\n- Tipo/concentrazione dell\u2019acido cambiano la conversione in mL/grammi.\n- Calcolatore euristico: usa come guida, poi misura e correggi.",
        bodyWithValues: "Modello concettuale:\n- Risolviamo la quantit\xE0 di acido che porta il pH da Iniziale a Target, dato alcalinit\xE0 iniziale e volume.\n\nQuesta ricetta:\npH iniziale = {startingPh}\npH target = {targetPh}\nAlcalinit\xE0 iniziale = {startingAlk} ppm come CaCO3\nVolume = {volumeL} L\nIl profilo selezionato ha pH = {profilePhKnown}\n\nRisultato:\n{detailsLines}\n\nNote:\n- Tipo/concentrazione dell\u2019acido cambiano la conversione in mL/grammi.\n- Calcolatore euristico: usa come guida, poi misura e correggi."
      },
      finalAlkalinity: {
        title: "Alcalinit\xE0 finale (ppm come CaCO3)",
        body: "Significato:\n- Alcalinit\xE0 dopo l\u2019aggiunta di acido calcolata.\n\nNote:\n- Pu\xF2 essere vicina a 0 quando l\u2019acido neutralizza la capacit\xE0 tampone.\n- Riportiamo in ppm come CaCO3 (convenzione standard).",
        bodyWithValues: "Significato:\n- Alcalinit\xE0 dopo l\u2019aggiunta di acido calcolata.\n\nQuesta ricetta:\nAlcalinit\xE0 iniziale = {startingAlk} ppm come CaCO3\nAlcalinit\xE0 finale = {finalAlk} ppm come CaCO3\n\nNote:\n- Pu\xF2 essere vicina a 0 quando l\u2019acido neutralizza la capacit\xE0 tampone.\n- Riportiamo in ppm come CaCO3 (convenzione standard)."
      },
      ionsAfterSalts: {
        title: "Ioni risultanti (solo sali)",
        body: "Significato:\n- Partendo dal profilo acqua di sparge selezionato, aggiungiamo gli ioni dovuti ai grammi di sali inseriti sul volume di sparge.\n\nNote:\n- I valori sono in ppm (mg/L) per ciascun ione.",
        bodyWithValues: "Significato:\n- Partendo dal profilo acqua di sparge selezionato, aggiungiamo gli ioni dovuti ai grammi di sali inseriti sul volume di sparge.\n\nQuesta ricetta:\nVolume = {volumeL} L\n\nSali:\n{saltsLines}\n\nIoni ({ppm}):\n{ionsLines}\n\nNote:\n- I valori sono in ppm (mg/L) per ciascun ione."
      },
      ionsAfterSaltsAndAcid: {
        title: "Ioni risultanti (sali + acido)",
        body: "Significato:\n- Come \u201Csolo sali\u201D, poi applichiamo il risultato dell\u2019acido.\n\nNote:\n- Gli aumenti di SO4/Cl dipendono dal contro-ione dell\u2019acido (se applicabile).\n- HCO3 \xE8 derivato dall\u2019alcalinit\xE0 (proxy), non bicarbonato misurato.",
        bodyWithValues: "Significato:\n- Come \u201Csolo sali\u201D, poi applichiamo il risultato dell\u2019acido.\n\nQuesta ricetta:\nVolume = {volumeL} L\nAlcalinit\xE0 finale = {finalAlk} ppm come CaCO3\n\nSali:\n{saltsLines}\n\nIoni ({ppm}):\n{ionsLines}\n\nNote:\n- Gli aumenti di SO4/Cl dipendono dal contro-ione dell\u2019acido (se applicabile).\n- HCO3 \xE8 derivato dall\u2019alcalinit\xE0 (proxy), non bicarbonato misurato."
      },
      alkalinityHeuristic: {
        title: "Euristica: Ca/Mg riducono l\u2019alcalinit\xE0 efficace",
        body: "Applichiamo un aggiustamento stile alcalinit\xE0 residua:\n- Calcio e magnesio dai sali riducono leggermente l\u2019alcalinit\xE0 efficace, quindi l\u2019acido necessario pu\xF2 cambiare un po\u2019 quando si aggiungono sali.\n\nNote:\n- L\u2019effetto \xE8 volutamente modesto; migliora il realismo senza sovra-adattare.",
        bodyWithValues: "{note}"
      }
    },
    mash: {
      acidRequired: {
        title: "Acido necessario (pH target)",
        body: "Modello concettuale:\n- Risolviamo la quantit\xE0 di acido che porta il pH da Iniziale a Target, data alcalinit\xE0 iniziale e volume acqua di mash.\n\nNote:\n- Tipo/concentrazione dell\u2019acido cambiano la conversione in mL/grammi.\n- Calcolatore euristico: usa come guida, poi misura e correggi.",
        bodyWithValues: "Modello concettuale:\n- Risolviamo la quantit\xE0 di acido che porta il pH da Iniziale a Target, data alcalinit\xE0 iniziale e volume acqua di mash.\n\nQuesta ricetta:\npH iniziale = {startingPh}\npH target = {targetPh}\nAlcalinit\xE0 iniziale = {startingAlk} ppm come CaCO3\nVolume acqua mash = {volumeL} L\n\nRisultato:\n{detailsLines}\n\nNote:\n- Tipo/concentrazione dell\u2019acido cambiano la conversione in mL/grammi.\n- Calcolatore euristico: usa come guida, poi misura e correggi."
      },
      finalAlkalinity: {
        title: "Alcalinit\xE0 finale (ppm come CaCO3)",
        body: "Significato:\n- Alcalinit\xE0 dopo l\u2019aggiunta di acido calcolata.\n\nNote:\n- Pu\xF2 essere vicina a 0 quando l\u2019acido neutralizza la capacit\xE0 tampone.\n- Riportiamo in ppm come CaCO3 (convenzione standard).",
        bodyWithValues: "Significato:\n- Alcalinit\xE0 dopo l\u2019aggiunta di acido calcolata.\n\nQuesta ricetta:\nAlcalinit\xE0 iniziale = {startingAlk} ppm come CaCO3\nAlcalinit\xE0 finale = {finalAlk} ppm come CaCO3\n\nNote:\n- Pu\xF2 essere vicina a 0 quando l\u2019acido neutralizza la capacit\xE0 tampone.\n- Riportiamo in ppm come CaCO3 (convenzione standard)."
      },
      ionsAfterSalts: {
        title: "Ioni risultanti (solo sali)",
        body: "Significato:\n- Partendo dall\u2019acqua di partenza miscelata, aggiungiamo gli ioni dovuti ai grammi di sali inseriti.\n\nNote:\n- I valori sono in ppm (mg/L) per ciascun ione.\n- Questa tabella non include l\u2019acido; vedi il risultato complessivo per l\u2019output combinato.",
        bodyWithValues: "Significato:\n- Partendo dall\u2019acqua di partenza miscelata, aggiungiamo gli ioni dovuti ai grammi di sali inseriti.\n\nQuesta ricetta:\nVolume acqua mash = {volumeL} L\n\nSali:\n{saltsLines}\n\nIoni ({ppm}):\n{ionsLines}\n\nNote:\n- I valori sono in ppm (mg/L) per ciascun ione.\n- Questa tabella non include l\u2019acido; vedi il risultato complessivo per l\u2019output combinato."
      },
      overallSnapshot: {
        title: "Snapshot complessivo mash (sali + acido)",
        body: "Significato:\n- Risultato combinato dopo l\u2019applicazione di sali e acido.\n\nNote:\n- Gli aumenti di SO4/Cl dipendono dal contro-ione dell\u2019acido (se applicabile).\n- HCO3 \xE8 derivato dall\u2019alcalinit\xE0 (proxy), non bicarbonato misurato.",
        bodyWithValues: "Significato:\n- Risultato combinato dopo l\u2019applicazione di sali e acido.\n\nQuesta ricetta:\npH = {ph}\nVolume acqua mash = {volumeL} L\nAlcalinit\xE0 finale = {finalAlk} ppm come CaCO3\n\nIoni ({ppm}):\n{ionsLines}\n\nNote:\n- Gli aumenti di SO4/Cl dipendono dal contro-ione dell\u2019acido (se applicabile).\n- HCO3 \xE8 derivato dall\u2019alcalinit\xE0 (proxy), non bicarbonato misurato."
      }
    },
    boil: {
      ionsAfterSalts: {
        title: "Ioni risultanti (solo sali)",
        body: "Significato:\n- Partendo dall\u2019acqua di partenza miscelata, aggiungiamo gli ioni dovuti ai grammi di sali inseriti.\n\nNote:\n- I valori sono in ppm (mg/L) per ciascun ione.",
        bodyWithValues: "Significato:\n- Partendo dall\u2019acqua di partenza miscelata, aggiungiamo gli ioni dovuti ai grammi di sali inseriti.\n\nQuesta ricetta:\nVolume acqua bollitura = {volumeL} L\n\nSali:\n{saltsLines}\n\nIoni ({ppm}):\n{ionsLines}\n\nNote:\n- I valori sono in ppm (mg/L) per ciascun ione."
      },
      overallSnapshot: {
        title: "Snapshot complessivo bollitura (sali + acido)",
        body: "Significato:\n- Risultato combinato dopo l\u2019applicazione di sali e acido.\n\nNote:\n- Gli aumenti di SO4/Cl dipendono dal contro-ione dell\u2019acido (se applicabile).\n- HCO3 \xE8 derivato dall\u2019alcalinit\xE0 (proxy), non bicarbonato misurato.",
        bodyWithValues: "Significato:\n- Risultato combinato dopo l\u2019applicazione di sali e acido.\n\nQuesta ricetta:\npH = {ph}\nAlcalinit\xE0 finale = {finalAlk} ppm come CaCO3\n\nIoni ({ppm}):\n{ionsLines}\n\nNote:\n- Gli aumenti di SO4/Cl dipendono dal contro-ione dell\u2019acido (se applicabile).\n- HCO3 \xE8 derivato dall\u2019alcalinit\xE0 (proxy), non bicarbonato misurato."
      }
    },
    waterHub: {
      mergedWaterRecap: {
        title: "Riepilogo acqua unificato",
        body: "Significato:\n- Questa sezione riassume ogni flusso (mash/sparge/acqua aggiuntiva in bollitura) e il riepilogo unificato.\n\nNote:\n- Il pH unificato \xE8 una stima (media volumetrica di [H+], regola pratica).\n- I flussi senza snapshot salvati sono esclusi dagli ioni unificati.",
        bodyWithValues: "Significato:\n- Questa sezione riassume ogni flusso (mash/sparge/acqua aggiuntiva in bollitura) e il riepilogo unificato.\n\nQuesta ricetta:\nVolume totale = {totalVolumeL} {L}\npH unificato (stima) = {mergedPh}\nAlcalinit\xE0 finale unificata = {mergedFinalAlk} {ppmAsCaCO3}\n\nFlussi:\n{streamLines}\n\nNote:\n- Il pH unificato \xE8 una stima (media volumetrica di [H+], regola pratica).\n- I flussi senza snapshot salvati sono esclusi dagli ioni unificati.",
        streamLine: "- {label}: {volumeL} {L}, pH {ph}, alc {alk} {ppmAsCaCO3}"
      },
      mergedIons: {
        title: "Ioni unificati (ppm)",
        body: "Significato:\n- Calcolati dagli snapshot salvati di mash/sparge/bollitura dopo sali + acido (solo contro-ioni SO4/Cl) e mediati per volume.\n\nNote:\n- I flussi senza snapshot salvati sono esclusi.\n- HCO3 \xE8 derivato dall\u2019alcalinit\xE0 (proxy), non bicarbonato misurato.",
        bodyWithValues: "Significato:\n- Calcolati dagli snapshot salvati di mash/sparge/bollitura dopo sali + acido (solo contro-ioni SO4/Cl) e mediati per volume.\n\nQuesta ricetta:\nIoni ({ppm}):\n{ionsLines}\n\nNote:\n- I flussi senza snapshot salvati sono esclusi.\n- HCO3 \xE8 derivato dall\u2019alcalinit\xE0 (proxy), non bicarbonato misurato."
      }
    }
  },
  recipes: {
    title: "Ricette",
    subtitle: "",
    import: {
      title: "Importa ricetta",
      subtitle: "Importa un file e crea una nuova ricetta nel tuo account.",
      cta: "Importa da BeerJSON / BeerXML",
      loading: "Caricamento\u2026",
      backToRecipes: "Torna alle Ricette",
      singleHeading: "Importa ricetta singola",
      singleSubtitle: "Importa un singolo file ricetta nel tuo account (scegli tu lo stile).",
      legendTitle: "Note import",
      unitsNote: "Unit\xE0: sono accettate unit\xE0 metriche e US customary. I galloni imperiali (UK) non sono ancora supportati.",
      customImportNote: "Hai bisogno di galloni imperiali (UK) o dell\u2019import di un altro sistema?",
      customImportCta: "Contattaci per un import personalizzato a un costo accessibile.",
      bulkHeading: "Import massivo (pi\xF9 ricette)",
      bulkSubtitle: "Importa un file che contiene pi\xF9 ricette e creale tutte in una volta.",
      fileHeading: "File",
      fileLabel: "File ricetta (BeerJSON .json o BeerXML .xml)",
      filePicked: "Selezionato: {name}",
      fileNotPicked: "Nessun file selezionato.",
      formatLabel: "Formato",
      formatAuto: "Auto",
      formatBeerJson: "BeerJSON (.json)",
      formatBeerXml: "BeerXML (.xml)",
      formatResolved: "Formato rilevato: {format}",
      formatNotResolved: "Impossibile rilevare il formato dal nome file. Seleziona un formato sopra.",
      styleLabel: "Stile",
      bulkStyleRule: "L\u2019import massivo associa lo stile a BJCP 2021 prima per nome esatto, poi per codice. Se non c\u2019\xE8 corrispondenza, assegniamo Personalizzato.",
      preview: "Anteprima",
      previewing: "Anteprima\u2026",
      reset: "Reset",
      previewHeading: "Anteprima",
      previewNameLabel: "Nome",
      previewNotesLabel: "Note",
      bulkPreviewHeading: "Anteprima massiva",
      resolvedStyleLabel: "Stile risolto",
      customStyleName: "Personalizzato",
      customStyleCode: "custom",
      warningsHeading: "Avvisi",
      noWarnings: "Nessun avviso.",
      import: "Importa ricetta",
      importing: "Importazione\u2026",
      bulkCreatedHeading: "Ricette create",
      bulkCreatedCount: "{count} create",
      bulkNoneCreated: "Non \xE8 stata creata nessuna ricetta.",
      bulkFailedHeading: "Import falliti",
      dash: "\u2014",
      unknownWarningCode: "avviso",
      errors: {
        notAuthenticated: "Non autenticato.",
        noActiveAccount: "Nessun account attivo selezionato.",
        noContent: "Seleziona prima un file.",
        unknownFormat: "Formato sconosciuto. Seleziona BeerJSON o BeerXML.",
        previewMissing: "La risposta di anteprima non contiene i dati attesi.",
        styleRequired: "Lo stile \xE8 obbligatorio.",
        importMissingId: "La risposta di import non contiene l\u2019id ricetta.",
        fileTooLarge: "File troppo grande. Dimensione massima: {max}.",
        fileTooLargeHelp: "Se riscontri questo errore, prova a dividere il file in parti pi\xF9 piccole. Gli utenti con piano a pagamento possono contattare il nostro supporto per assistenza."
      }
    },
    brewSessions: {
      listTitle: "Sessioni di brew",
      detailTitle: "Sessione di brew",
      backToRecipeEdit: "Torna a visualizza/modifica ricetta",
      backToSessions: "Torna alle sessioni di brew",
      createButton: "Crea sessione di brew",
      creating: "Creazione\u2026",
      refresh: "Aggiorna",
      loading: "Caricamento\u2026",
      empty: "Nessuna sessione di brew per ora.",
      statusLine: "Stato: {status}",
      sessionTimerLine: "Timer sessione: {elapsed}",
      sessionPausedAtLine: "In pausa alle: {at}",
      sessionStoppedAtLine: "Fermata alle: {at}",
      sessionCode: "Codice sessione",
      exportWorkOrderPdf: "Esporta ordine di lavoro (PDF)",
      exportWorkOrderPdfWorking: "Preparazione PDF\u2026",
      exportWorkOrderPdfError: "Esportazione non riuscita",
      recipeLine: "Ricetta: {name} - Versione {version}",
      working: "In corso\u2026",
      startSession: "Avvia sessione di brew",
      resumeSession: "Riprendi sessione di brew",
      pauseSession: "Pausa",
      stopSession: "Segna sessione come completata",
      sectionStatusPending: "In attesa",
      sectionStatusInProgress: "In corso",
      sectionStatusDone: "Completata",
      sectionStatusForcedFinished: "Forzata come completata",
      sessionAutoFinishedAtLine: "Sessione segnata automaticamente come completata il: {at}",
      sessionManualFinishedAtLine: "Sessione segnata manualmente come completata il: {at}",
      hydrometerSectionTitle: "Idrometri galleggianti",
      hydrometerSectionSubtitle: "Collega un idrometro a questa sessione e consulta le letture.",
      hydrometerKindLabel: "Tipo di dispositivo",
      hydrometerKindTilt: "Tilt",
      hydrometerKindIspindel: "iSpindel",
      hydrometerKindRapt: "RAPT",
      hydrometerNotSupportedYet: "Non ancora supportato (in arrivo).",
      hydrometerDeviceLabel: "Dispositivo",
      hydrometerDevicePlaceholder: "Seleziona un dispositivo",
      hydrometerNoDevices: "Nessun dispositivo ha ancora inviato dati per questo tipo.",
      hydrometerAttach: "Collega dispositivo",
      hydrometerDetach: "Scollega dispositivo",
      hydrometerAttachedTo: "Collegato: {device}",
      hydrometerNotAttached: "Non collegato.",
      hydrometerLastReading: "Ultima lettura",
      hydrometerNoReadings: "Nessuna lettura ancora.",
      hydrometerChartTitle: "Grafico letture",
      hydrometerChartGravity: "Gravit\xE0",
      hydrometerChartTemperature: "Temperatura",
      hydrometerChartXAxis: "Orario",
      hydrometerChartGravityAxis: "Gravit\xE0 (SG)",
      hydrometerChartTemperatureAxis: "Temperatura (\xB0C)",
      logsTitle: "Log",
      logsPagination: {
        ariaLabel: "Paginazione log sessione di brew",
        prev: "Precedente",
        next: "Successiva",
        status: "Pagina {page} di {pages}"
      },
      addCustomStepTitle: "Aggiungi nuovo step personalizzato per la ricetta corrente",
      stepNameLabel: "Nome",
      stepNamePlaceholder: "Inserisci nome step",
      assignedSectionLabel: "Sezione",
      minutesPlannedLabel: "Minuti",
      addStepButton: "Aggiungi step",
      saveSuccess: "Salvato.",
      saveStepsButton: "Salva sessione brewing",
      saving: "Salvataggio\u2026",
      noteSaveSteps: "Le modifiche di riordino/disabilitazione vengono salvate quando salvi la sezione brewing.",
      moveUp: "Sposta su",
      moveDown: "Sposta gi\xF9",
      stepStatusLabel: "Stato",
      statusPending: "In attesa",
      statusInProgress: "In corso",
      statusDone: "Fatto",
      statusSkipped: "Saltato",
      statusNotApplicable: "Non applicabile",
      disableStepLabel: "Disabilita",
      disableNo: "No",
      disableYes: "S\xEC",
      stepNoteLabel: "Nota",
      saveLogButton: "Salva log sezione",
      removeStepButton: "Rimuovi step",
      removeStepRemoving: "Rimozione\u2026",
      removeStepSuccess: "Step rimosso da questa sessione di brassaggio.",
      deleteSessionButton: "Elimina sessione di brewing",
      deleteSessionStopBeforeDelete: "Segna la sessione come completata prima di eliminarla.",
      deleteSessionConfirm: "Questo eliminer\xE0 definitivamente questa sessione di brewing (inclusi step e log).",
      confirmDelete: "Conferma eliminazione",
      cancelDelete: "Annulla",
      deleting: "Eliminazione\u2026",
      timerLine: "Timer: trascorso {elapsed} \xB7 pianificato {planned} min",
      timerLineStopped: "Timer: fermato \xB7 trascorso {elapsed}",
      countdownLine: "rimanente {remaining}",
      relativeToLabel: "Relativo a",
      relativeToNone: "(nessuno)",
      offsetFromEndLabel: "Offset dalla fine (min)",
      relativeRemainingBeforeStartLine: "Rimanente prima dell'inizio step: {remaining}",
      relativeOverdueByLine: "In ritardo di: {overdue}",
      pleaseSaveModifications: "Per favore salva le modifiche.",
      timerStart: "Start",
      timerPause: "Pausa",
      timerStop: "Stop",
      startTimerForSection: "Avvia timer per sezione",
      startMashTimerMin: "Avvia timer mash ({minutes})",
      startBoilTimerMin: "Avvia timer bollitura ({minutes})",
      activateCustomTimerLabel: "Attiva timer personalizzato",
      stepDurationTimerLabel: "Timer durata step",
      stepDurationTimerHelp: "Parte automaticamente quando lo step \xE8 impostato su In corso",
      stepDurationTimerIdle: "Parte quando lo step \xE8 impostato su In corso",
      dateSectionTitle: "Data",
      stepsLockedUntilStartedNotice: "Avvia la sessione di brewing prima di cambiare lo stato degli step. Fino ad allora, gli step restano In attesa e in sola lettura.",
      timersAndLogsHelpNote: "Alcuni timer partono automaticamente per certi step (ad es. per le aggiunte di luppolo dopo l'avvio del timer bollitura). Gli step mash con durata avviano automaticamente il countdown quando sono impostati su In corso. \xC8 anche possibile avviare timer personalizzati per singoli step per log personalizzati (di solito se vuoi misurare la durata di uno step specifico). IMPORTANTE: quando imposti manualmente uno step (o pi\xF9 step) su 'Fatto' o su un altro stato all'interno di una sezione, ricordati di cliccare su 'Salva log sezione' (o su 'Salva sessione brewing') altrimenti le modifiche non verranno salvate.",
      datePickerLabel: "Data e ora programmate",
      dateLabel: "Data",
      timeLabel: "Ora",
      dateSave: "Salva",
      dateRemove: "Rimuovi",
      dateEdit: "Modifica data",
      dateAdd: "Aggiungi data",
      dateCancel: "Annulla",
      dateNotSet: "Nessuna data impostata",
      dateScheduledLabel: "Programmato"
    },
    edit: {
      title: "Visualizza e modifica ricetta",
      loading: "Caricamento\u2026",
      shapeNote: "Editor a pagina singola con navigazione per sezioni. La chimica dell\u2019acqua apre il calcolatore dedicato.",
      notReadyToLoad: "Non pronto per caricare questa ricetta.",
      status: {
        saved: "Salvato.",
        equipmentApplied: "Attrezzatura applicata e analisi aggiornata.",
        equipmentReloaded: "Attrezzatura ricaricata e analisi aggiornata."
      },
      nav: {
        sectionsAriaLabel: "Sezioni ricetta",
        sectionsTitle: "Sezioni",
        openWaterCalculator: "Apri calcolatore acqua",
        editYeast: "Modifica lievito",
        openEquipment: "Apri attrezzatura",
        backToRecipes: "Torna alle Ricette"
      },
      sections: {
        basics: "Basi",
        analysis: "Analisi",
        brewingHistory: "Storico brassaggi",
        brew: "Brew",
        equipment: "Attrezzatura",
        mashing: "Ammostamento e Sparge",
        fermentables: "Fermentabili",
        hops: "Luppoli",
        yeast: "Lieviti, Nutrienti, Batteri",
        other: "Altri ingredienti",
        boil: "Bollitura",
        notes: "Note",
        water: "Chimica dell'acqua e volumi"
      },
      hops: {
        timeBeforeEndOfBoilMin: "Minuti prima della fine della bollitura (min)",
        typeLabel: "Tipo",
        typeOptions: {
          pellet: "Pellet",
          leaf: "Cono/Intero (secco)",
          leafWet: "Cono/Intero (fresco)",
          powder: "Lupulina (pellet)",
          extract: "Estratto",
          hopExtract: "Estratto di luppolo",
          plug: "Plugs",
          debitteredLeaf: "Foglia deamaricata"
        }
      },
      mashingHelp: "Programma di ammostamento (procedura mash BeerJSON). Importa una ricetta BeerJSON/BeerXML con step mash o aggiungili manualmente nelle pagine calcolatore acqua Mash e/o Sparge.",
      mashingEmpty: "Nessuno step di ammostamento. Aggiungi step o importa una ricetta con programma mash.",
      mashingAddStep: "Aggiungi step",
      mashingAddFromTemplate: "Aggiungi da modello",
      mashingTemplateSingleInfusion: "Infusione singola",
      mashingTemplateStepMash: "Step mash",
      mashingTemplateTemperature: "Temperatura",
      mashingTemplateDecoction: "Decozione",
      mashingProcedureName: "Nome procedura",
      mashingGrainTemp: "Temp. grani",
      mashingStepName: "Nome",
      mashingStepType: "Tipo",
      mashingStepTemp: "Temp ({unit})",
      mashingStepTime: "Tempo ({unit})",
      mashingStepAmount: "Quantit\xE0 ({unit})",
      mashingStepRamp: "Rampa ({unit})",
      mashingDeleteStep: "Elimina step",
      moveUp: "Sposta su",
      moveDown: "Sposta gi\xF9",
      mashingDeduceFromMashIn: "Deduci da Mash in",
      mashingSave: "Salva (inclusa mash)",
      mashingSaveMashSteps: "Salva",
      mashingEditInMashPage: "Modifica programma mash in Acqua mash e Step mash",
      spargeStepFromWaterPage: "Step sparge (da pagina Acqua sparge)",
      spargeStepConfigureLink: "Configura acqua sparge",
      mashStepConfigureLink: "Configura acqua mash",
      mashingWaterVolumesTitle: "Volumi acqua (mash + sparge)",
      mashingWaterVolumesSource: "Dal calcolatore acqua",
      mashingWaterVolumesUnavailable: "Configura i volumi acqua nel Calcolatore acqua per vedere i volumi mash e sparge qui.",
      mashingFirstStepSuggested: "Suggerito: {amount} {unit} (dal volume acqua mash)",
      mashingSpargeStepAmountSource: "Dal calcolatore acqua",
      mashStepsWaterBudgetNote: "L'acqua totale di tutti gli step mash non pu\xF2 superare il 'Volume acqua mash [totale]' sopra. Solo gli step con 'Deduci da Mash in' selezionato deducono dal volume acqua mash. Utile per i birrai che usano acqua calda per aumentare la temperatura.",
      mashStepsMashInAlwaysPresentNote: `Lo step "Mash in" \xE8 sempre presente per design: garantisce la correttezza della quantit\xE0 totale. Se serve uno step successivo immediato (es. 'Protein rest') usa il pulsante "Aggiungi step" e aggiungilo. Puoi avere un nuovo step con quantit\xE0 0.`,
      mashStepsTypeFallbackNote: "Se non trovi lo step mash che cerchi nell'elenco 'Tipo' usa 'Temperature' e aggiungi il nome (es. 'Protein rest' o 'Ferulic rest') nel campo 'Nome'.",
      mashStepsSeeRecapLink: "Vedi riepilogo mash nel riepilogo ricetta qui.",
      mashingSpargeStepAmountUnavailable: "Configura i volumi acqua nel Calcolatore acqua",
      mashingTemplateSparge: "Sparge",
      equipmentSection: {
        help: "Scegli un profilo attrezzatura (per account) da copiare nella ricetta (nessun riferimento live).",
        profileLabel: "Profilo attrezzatura",
        noneOption: "(nessuno)",
        apply: "Applica alla ricetta",
        reload: "Ricarica profilo attrezzatura e ricalcola",
        working: "In corso\u2026",
        manageTemplatesText: "Gestisci i profili attrezzatura in",
        manageTemplatesLinkText: "Attrezzatura",
        errors: {
          selectFirst: "Seleziona prima un profilo attrezzatura."
        }
      },
      basicsHelp: "Caricamento/salvataggio via GET/PATCH /api/recipes/:id.",
      versionLabel: "Versione",
      versionCreateNote: "Questo crea una nuova versione della ricetta (clonando la ricetta corrente): la vecchia versione pu\xF2 comunque essere modificata.",
      versionCreateButton: "Crea un'altra versione dalla ricetta corrente",
      versionCreateWorking: "Creazione versione\u2026",
      versionLimitReached: "Limite versioni raggiunto (00\u201399).",
      duplicateRecipeNote: "Questo crea una nuova ricetta clonando la ricetta corrente.",
      duplicateRecipeButton: "Duplica ricetta dalla ricetta corrente",
      duplicateRecipeWorking: "Duplicazione\u2026",
      brewNote: "Lanciare la ricetta di brassaggio crea gli step di brassaggio, carica le materie prime necessarie e inizializza i log se applicabile.",
      programmedSectionLabel: "Programmati",
      brewingNowLabel: "In corso",
      lastBrewedLabel: "Ultimi brassaggi",
      lastBrewedLoading: "Caricamento sessioni di brassaggio\u2026",
      brewingHistoryEmpty: "Nessuna sessione di brassaggio per questa ricetta.",
      brewButton: "Brassa la ricetta corrente",
      brewFeatureSoon: "Funzionalit\xE0 disponibile a breve...",
      hopsHelp: "Scegli luppoli dal database (o inserisci manualmente). Salvato come snapshot nella ricetta.",
      timeBeforeEndOfBoilMin: "Minuti prima della fine della bollitura (min)",
      yeastHelp: "Scegli il lievito dal database (o inserisci manualmente). Salvato come snapshot nella ricetta.",
      yeastEditInYeastPage: "Modifica lievito nella pagina Lievito",
      yeastPageTitle: "Lievito",
      yeastSectionHeading: "Ceppi di lievito e tassi di inoculo.",
      yeastAdvancedSubsectionHeading: "Avanzato e calcolo tasso di inoculo.",
      yeastPitchRateAmountNote: "Se il tasso di inoculo \xE8 selezionato, la Quantit\xE0 (L o kg) da inoculare verr\xE0 calcolata e sincronizzata.",
      yeastEstimatedCellsRecalcNote: "Se il tasso di inoculo \xE8 selezionato, 'Cellule stimate necessarie (B)' verr\xE0 ricalcolato in base alla sezione Analisi della pagina Modifica ricetta.",
      yeastPitchRateRequiresFormat: "Tasso di inoculo \u2013 seleziona il formato per attivare",
      yeastCellsPerLLabel: "Cellule per L (modificabile)",
      yeastCellsPerKGLabel: "Cellule per kg (modificabile)",
      yeastCellsPerDefaultNote: "Le densit\xE0 cellulari predefinite sono da yeastman.",
      yeastCellsPerOverrideNote: "Modifica solo se hai dati di laboratorio o del produttore.",
      yeastBackToRecipe: "Torna alla ricetta",
      yeastEmpty: "Nessun lievito ancora.",
      yeastSearchLabel: "Cerca nel database lieviti",
      yeastAddButton: "Aggiungi lievito",
      yeastAddCustomButton: "Aggiungi lievito personalizzato",
      yeastCustomNamePlaceholder: "Inserisci nome lievito",
      yeastSaveButton: "Salva",
      yeastRemove: "Rimuovi",
      yeastNameLabel: "Nome",
      yeastLabLabel: "Lab",
      yeastProductIdLabel: "ID prodotto",
      yeastAttenMinLabel: "Atten min (%)",
      yeastAttenMaxLabel: "Atten max (%)",
      yeastAmountLabel: "Quantit\xE0 ({unit})",
      yeastFermentationTempLabel: "Temp. fermentazione ({unit})",
      yeastOxygenationLabel: "Richiede ossigenazione",
      yeastOxygenationYes: "S\xEC",
      yeastOxygenationNo: "No",
      yeastDiacetylRestLabel: "Diacetil rest",
      yeastDiacetylRestYes: "S\xEC",
      yeastDiacetylRestNo: "No",
      yeastFormatLabel: "Formato",
      yeastFormatDry: "Secco",
      yeastFormatLiquid: "Liquido",
      yeastFormatSlurry: "Slurry",
      yeastSpeciesLabel: "Specie",
      yeastSpeciesSaccharomycesCerevisiae: "Saccharomyces cerevisiae",
      yeastSpeciesSaccharomycesPastorianus: "Saccharomyces pastorianus",
      yeastSpeciesBrettanomyces: "Brettanomyces",
      yeastSpeciesDiastaticus: "Diastaticus",
      yeastSpeciesOther: "Altro",
      yeastEstimatedCellsLabel: "Cellule stimate necessarie (B)",
      yeastEstimatedCellsTooltip: "B = miliardi di cellule. Basato su volume \xD7 OG (\xB0Plato) \xD7 tasso di inoculo.",
      yeastEstimatedCellsValue: "{value} B",
      yeastAmountCalcBreakdown: "cells_B / cells_per_L = {cellsB} / {cellsPerL} = {amountL} L",
      yeastAmountCalcExample: "quantit\xE0_L = cells_B / cells_per_L = {cellsB} / {cellsPerL} = {amountL} L",
      yeastNeedsPropagationLabel: "Richiede propagazione",
      yeastNeedsPropagationYes: "S\xEC",
      yeastNeedsPropagationNo: "No",
      yeastPitchRateLabel: "Tasso di inoculo",
      yeastPitchRateNone: "nessuno",
      yeastPitchRateNote: "Un tasso di inoculo pi\xF9 alto per lo stesso stile (es. Ale, Lager, altri stili di birra, Mead) \xE8 importante quando l'OG aumenta.",
      yeastPitchRateMfgRec035Ales: "Raccomandato produttore 0.35 (Ale)",
      yeastPitchRateMfgRec05Ales: "Raccomandato produttore 0.5 (Ale)",
      yeastPitchRatePro075Ales: "Pro Brewer 0.75 (Ale)",
      yeastPitchRatePro10Ales: "Pro Brewer 1.0 (Ale)",
      yeastPitchRatePro125Ales: "Pro Brewer 1.25 (Ale)",
      yeastPitchRatePro15Lager: "Pro Brewer 1.5 (Lager)",
      yeastPitchRatePro175Lager: "Pro Brewer 1.75 (Lager)",
      yeastPitchRatePro20Lager: "Pro Brewer 2.0 (Lager)",
      yeastManualCellCountSummary: "Metodologia conta cellulare manuale (emocitometro)",
      yeastManualCellCountTitle: "Come calcolare il lievito da inoculare (kg) tramite conta cellulare manuale al microscopio",
      yeastManualCellCountPrerequisitesTitle: "Prerequisiti: strumenti e materiali",
      yeastManualCellCountPrerequisitesBody: "Microscopio (con ingrandimenti 100\xD7 e 400\xD7), provette, blu di metilene (0,01%), pipette, calcolatrice scientifica (disponibile anche come app su smartphone) e idealmente un piccolo portaprovette.",
      yeastManualCellCountStep1Title: "Diluire il campione di lievito in serie",
      yeastManualCellCountStep1Body: "Usare acqua o altro diluente appropriato. Obiettivo: 5\u201350 cellule per quadratino. Diluizione tipica 1:200 (es. 10\xD7 poi 10\xD7 poi 1:1 con blu di metilene 0,01%). Se troppo denso, aggiungere 1:10 per DF = 2000\xD7.\n\nImportante: annotare il DF (Fattore di diluizione) scelto (1:200 o 1:2000) perch\xE9 verr\xE0 inserito nelle formule successive.",
      yeastManualCellCountStep1ImageAlt: "Diagramma di due provette che mostrano diluizione seriale 1:10 poi 1:100 (1/10 lievito + 9/10 acqua).",
      yeastManualCellCountStep1ImageLegend: "Diluendo 1:1 con blu di metilene (0,01%) si ottiene 1:200 complessivo.",
      yeastManualCellCountStep2Title: "Caricare l'emocitometro",
      yeastManualCellCountStep2Body: "Posizionare prima il vetrino coprioggetto, poi applicare 10 \xB5l sull'emocitometro. Mettere a fuoco a 100\xD7, poi 400\xD7.",
      yeastManualCellCountStep3Title: "Contare le cellule in cinque quadratini",
      yeastManualCellCountStep3Body: "Contare tutte le cellule vive (trasparenti) e morte (blu) nei cinque quadratini indicati.\n\nRegole: contare le cellule nei 5 quadratini indicati del quadrato centrale dell'emocitometro. Contare le cellule che toccano le linee superiore o sinistra del mini-quadratino; escludere quelle che toccano inferiore o destra. Contare le cellule figlie che superano il 50% della dimensione della cellula madre.",
      yeastManualCellCountStep3ImageAlt: "Griglia di emocitometro che mostra i cinque quadratini (quattro angoli e centro) dove si contano le cellule. Ogni quadratino \xE8 0,04 mm\xB2.",
      yeastManualCellCountStep4Title: "Calcolare la % di cellule vive",
      yeastManualCellCountStep4Body: "Formula:\n(cellule vive) / (cellule totali) \xD7 100 = % cellule vive\n\nInput: cellule totali, cellule vive (da Passo 3).",
      yeastManualCellCountStep5Title: "Calcolare le cellule vive per grammo di sospensione",
      yeastManualCellCountStep5Body: "Formula:\ncellule vive \xD7 5 \xD7 DF \xD7 10.000 = cellule vive/g di sospensione\n\nInput: cellule vive (conteggio grezzo da Passo 3), DF (fattore di diluizione da Passo 1).",
      yeastManualCellCountStep6Title: "Calcolare il lievito da inoculare (kg)",
      yeastManualCellCountStep6Body: "Formula:\n(HL \xD7 100.000 \xD7 PR \xD7 \xB0P) / (cellule vive/g \xD7 1000) = lievito da inoculare (kg)\n\nInput: HL (ettolitri di mosto), PR (tasso di inoculo), \xB0P (Plato) e il risultato del Passo 5 (cellule vive/g di sospensione).",
      yeastManualCellCountGlossaryTitle: "Glossario",
      yeastManualCellCountGlossary: "HL = Ettolitri di mosto\nDF = Fattore di diluizione\nPR = Tasso di inoculo (cellule/mL/\xB0P): Ale ~1,0\xD710\u2076, Lager ~1,5\xD710\u2076\n\xB0P = Plato (densit\xE0/4)\ng / 1000 = kg",
      yeastManualCellCountReference: "Per una metodologia pi\xF9 dettagliata, fare riferimento a Metodi ASBC, Yeast 4: Microscopic Yeast Cell Counting.",
      yeastManualCountSectionTitle: "Usa conta manuale per densit\xE0 sospensione e vitalit\xE0 (da cellule vive/totali)",
      yeastManualCountFirstNote: "Scegliendo la conta manuale per derivare le cellule per L, il campo 'Cellule stimate necessarie (B)' non cambia; solo la densit\xE0 della sospensione (e quindi Quantit\xE0 L) deriva dalla conta manuale. Riusa completamente le formule e la logica esistenti.",
      yeastManualCountDirectlyInfluencesAmount: "Questi campi influenzano direttamente la Quantit\xE0 (L).",
      yeastManualCountDFLabel: "DF (Fattore di diluizione)",
      yeastManualCountDF200: "200\xD7",
      yeastManualCountDF2000: "2000\xD7",
      yeastManualCountAliveCellsLabel: "Cellule vive",
      yeastManualCountTotalCellsLabel: "Cellule totali",
      yeastManualCountTotalTooLow: "Deve essere \u2265 Cellule vive (vitalit\xE0 \u2264 100%)",
      yeastManualCountViabilityLabel: "Vitalit\xE0 (%)",
      yeastManualCountCalculatedViabilityLabel: "Vitalit\xE0 % calcolata",
      yeastManualCountCalculatedLiveCellsPerGramLabel: "Cellule vive per grammo di sospensione (calcolate)",
      yeastManualCountSaveCalculatedValues: "Salva valori calcolati",
      yeastLowViabilityWarning: "Vitalit\xE0 {pct}%: considera una verifica di vitalit\xE0.",
      yeastManualCountDisclaimer: "DISCLAIMER: i calcoli non sostituiscono mai l\u2019esperienza e il buon senso: usa la tua esperienza per confrontare con i lotti precedenti. Un calcolo serve a confermare che stai seguendo l\u2019approccio giusto e a fare fine-tuning delle procedure e NON \xE8 in alcun modo pensato per sostituire controlli empirici ed esperienza. Non fidarti mai solo dei numeri: usali invece per validare.",
      otherHelp: "Spezie, chiarificanti, aromi, ecc.",
      boilTimeHelp: "Durata bollitura manuale in minuti. Usata per calcoli volume kettle ed evaporazione. Se vuoto, inferita dall\u2019addizione luppolo bollitura pi\xF9 lunga.",
      boilSave: "Salva (inclusa bollitura)",
      waterHelp: "Il calcolatore completo (chimica mash + acqua) vive in una pagina dedicata (non integrata qui).",
      waterProfilesManageText: "Gestisci i profili su",
      rawMaterialsCtaPrefix: "Hai trovato una materia prima mancante o errata?",
      rawMaterialsCtaLinkText: "Aiuta a migliorare il database materie prime",
      fermentables: {
        buttons: {
          clear: "Pulisci",
          addCustomFermentable: "Aggiungi fermentabile personalizzato"
        },
        amountLabel: "Quantit\xE0 ({unit})",
        colorLabel: "Colore ({unit})",
        mashPhClassLegacyLabel: "Classe pH mash (legacy)",
        potentialKindLabel: "Tipo potenziale",
        potentialValueLabel: "Valore potenziale",
        groupLabel: "Gruppo",
        gristTotalKg: "Totale: {value} {unit}",
        gristAvgColor: "Colore medio: {value} {unit}"
      },
      buttons: {
        clear: "Pulisci",
        addFermentable: "Aggiungi fermentabile",
        addCustomFermentable: "Aggiungi fermentabile personalizzato",
        addOtherIngredient: "Aggiungi altro ingrediente"
      },
      fermentableAddedSaveHint: "Fermentabile aggiunto. Salva la sezione per conservare i dati.",
      amountLabel: "Quantit\xE0 ({unit})",
      colorLabel: "Colore ({unit})",
      gristTotalKg: "Totale: {value} {unit}",
      gristAvgColor: "Colore medio: {value} {unit}",
      fermentableTimingLabel: "Aggiungi a",
      fermentableTimingMash: "Mash",
      fermentableTimingKettle: "Kettle (estratto a fine bollitura)",
      fermentableLateAdditionLabel: "Aggiunta tardiva",
      fermentableLateAdditionNo: "No",
      fermentableLateAdditionYes: "S\xEC"
    },
    analysis: {
      help: "Stime derivate. Se mancano input necessari, i valori mostrano \u201CDati insufficienti\u201D.",
      na: "Dati insufficienti",
      customAttenuationPercentLabel: "Attenuazione personalizzata (%)",
      fields: {
        abv: "ABV (stimata)",
        ibuTinseth: "IBU (Tinseth, stimata)",
        ibuRager: "IBU (Rager, stimata)",
        buGu: "BU/GU",
        srmMorey: "Colore (SRM, Morey, stimato)",
        srmDaniels: "Colore (SRM, Daniels, stimato)",
        boilTimeMinutes: "Tempo bollitura (minuti)",
        kettleVolume: "Volume (kettle)",
        preBoilVolume: "Volume pre-boil (stimato)",
        og: "OG (stimata) Plato/SG",
        fg: "FG (stimata) Plato/SG",
        attenuation: "Attenuazione (effettiva)",
        pbg: "PBG (gravit\xE0 pre-boil, stimata) Plato/SG"
      },
      gristWaterConsistencyCheck: "Controllo coerenza Grist ricetta-mash",
      gristWaterConsistencyPassed: "ok",
      gristWaterConsistencyError: "errore",
      gristWaterConsistencyWarning: "Ricalcola quantit\xE0 acqua mash e modifiche importando il grist della ricetta <link>sezione grist pagina mash</link> perch\xE9 il grist in questa pagina ricetta (sezione Fermentabili) non corrisponde al grist nella pagina Mash.",
      gristWaterConsistencyDifference: "Differenza: {value}%",
      warningsTitle: "Note / input mancanti",
      warningsClickToExpand: "Clicca per espandere",
      warnings: {
        missing_beerjson: "La ricetta non ha BeerJSON; impossibile calcolare l\u2019analisi.",
        missing_water_settings: "Impostazioni acqua salvate mancanti; i volumi stimati potrebbero non essere disponibili.",
        missing_water_volumes: "Volumi mash/sparge mancanti; i volumi stimati potrebbero non essere disponibili.",
        invalid_runoff_volume: "Volumi mash/sparge e perdite implicano un runoff nullo o negativo; controlla acqua e attrezzatura mash.",
        invalid_evaporation: "Evaporazione/tempo di bollitura implicano un volume post-boil nullo o negativo; controlla l\u2019attrezzatura.",
        invalid_kettle_volume: "Il volume kettle calcolato \xE8 nullo o negativo; controlla perdite attrezzatura e input acqua.",
        exceeds_kettle_capacity: "Il volume kettle calcolato supera la capacit\xE0/target del profilo attrezzatura.",
        missing_efficiency: "Efficienza mancante; OG/PBG richiedono una % di efficienza.",
        missing_fermentables: "Nessun fermentabile con quantit\xE0 e resa/potenziale utilizzabili; impossibile stimare OG/PBG.",
        missing_color_volume: "Volume kettle calcolato mancante; l\u2019SRM richiede impostazioni acqua salvate e volumi.",
        missing_fermentable_colors: "Colore fermentabile (Lovibond) mancante su una o pi\xF9 righe; l\u2019SRM richiede i colori dei fermentabili.",
        used_batch_size_volume: "Uso il batch_size BeerJSON per stimare l\u2019IBU perch\xE9 il volume kettle calcolato non \xE8 disponibile.",
        missing_ibu_gravity: "Gravit\xE0 di bollitura mancante; l\u2019IBU richiede PBG/OG.",
        missing_ibu_inputs: "Nessuna aggiunta di luppolo boil/whirlpool utilizzabile (quantit\xE0, AA%, tempo); impossibile stimare l\u2019IBU.",
        missing_attenuation: "Attenuazione lievito mancante; FG/ABV richiedono attenuazione o un override."
      }
    },
    water: {
      common: {
        backToHub: "Torna al centro acqua",
        goToSparge: "Vai allo sparge",
        goToMash: "Vai al mash",
        mashWaterAndSteps: "Acqua mash e Step mash",
        viewEditGrist: "Vedi/modifica grist nella ricetta",
        notAuthenticated: "Non autenticato. {signIn}."
      },
      mash: {
        title: "Acqua mash e Step mash",
        mashStepsHeading: "Step mash",
        adjustmentHeading: "Regolazione acqua mash",
        adjustmentHint: "Seleziona un profilo sorgente + diluizione e imposta i volumi per vedere gli ioni miscelati.",
        gristSummaryHeading: "Grist (importa e riepilogo)",
        gristSummaryHelp: "Evitiamo di duplicare qui la tabella completa del grist. Usa l\u2019editor ricetta per i dettagli; questa pagina mantiene solo uno snapshot per i calcoli.",
        lateFermentablesExcludedNote: "I fermentabili a aggiunta tardiva totalizzano {kg} kg e sono esclusi dal grist mash per la chimica dell'acqua.",
        acidificationHeading: "Acidificazione acqua mash",
        resultLastCalculated: "Risultato (ultimo calcolo)",
        overallResultHeading: "Risultato complessivo acqua mash (HCO3 derivato dall\u2019alcalinit\xE0)",
        saltAdditionsManualV0: "Aggiunte di sali",
        startingAlkalinityLabel: "Alcalinit\xE0 iniziale ({unit})",
        sourceVolumeLabel: "Volume sorgente ({unit})",
        dilutionVolumeLabel: "Volume diluizione ({unit})",
        mashWaterVolumeLabel: "Volume acqua mash ({unit})",
        mashingStepName: "Nome",
        mashingStepType: "Tipo",
        mashingStepTemp: "Temp ({unit})",
        mashingStepTime: "Tempo ({unit})",
        mashingStepAmount: "Quantit\xE0 ({unit})",
        mashingEmpty: "Nessuno step di ammostamento. Aggiungi step o importa una ricetta con programma mash.",
        mashingAddStep: "Aggiungi step",
        mashingAddFromTemplate: "Aggiungi da modello",
        mashingTemplateSingleInfusion: "Infusione singola",
        mashingTemplateStepMash: "Step mash",
        mashingTemplateSparge: "Sparge",
        mashingDeduceFromMashIn: "Deduci da Mash in",
        mashStepsBudgetExceeded: "L'acqua degli step mash supera il volume acqua mash. Riduci le quantit\xE0 degli step o aumenta il volume acqua mash.",
        saveMashDraft: "Salva bozza mash",
        estimateAndSaveSnapshot: "Stima e salva snapshot",
        calculateAndSaveSnapshot: "Calcola e salva snapshot",
        resultManualAcidAmountMode: "Risultato (modalit\xE0 quantit\xE0 acido manuale)",
        estimatedFromManualAcidAmount: "Stimato dalla quantit\xE0 acido manuale",
        mashDraftSaved: "Bozza mash salvata.",
        mashSnapshotEstimatedAndSaved: "Stima salvata come snapshot.",
        mashSnapshotCalculatedAndSaved: "Snapshot calcolata e salvata.",
        overallSnapshotSaved: "Calcolato e salvato.",
        saving: "Salvataggio\u2026",
        working: "Elaborazione\u2026"
      },
      sparge: {
        title: "Acqua sparge",
        spargeConfigurationHeading: "Configurazione sparge",
        spargeMethodFlySparge: "Fly Sparge",
        spargeMethodBatchSparge: "Batch Sparge",
        acidificationHeading: "Acidificazione sparge",
        resultLastCalculated: "Risultato (ultimo calcolo)",
        spargeSourceWaterProfileLabel: "Profilo acqua sorgente sparge",
        saltAdditionsManualV0: "Aggiunte di sali sparge",
        saltAdditionsHelp: "Il profilo base \xE8 quello selezionato sopra. Aggiungi sali in grammi; calcoliamo gli ioni risultanti (ppm) per il volume di sparge.",
        startingAlkalinityLabel: "Alcalinit\xE0 iniziale ({unit})",
        waterVolumeLabel: "Volume acqua ({unit})"
      },
      boil: {
        title: "Acqua aggiuntiva in bollitura",
        adjustmentHeading: "Regolazione acqua bollitura",
        saltAdditionsHeading: "Aggiunte di sali (manuale)",
        acidificationHeading: "Acidificazione acqua bollitura",
        overallResultHeading: "Risultato complessivo acqua bollitura (HCO3 derivato dall\u2019alcalinit\xE0)",
        adjustmentHelp: "Scegli profili sorgente/target/diluizione e volumi per calcolare un profilo acqua iniziale miscelato.",
        saltAdditionsHelp: "Seleziona un profilo Sorgente e imposta il volume. La diluizione \xE8 opzionale, ma se il volume di diluizione \xE8 > 0 devi selezionare un profilo di diluizione.",
        saltAdditionsBaseHelp: "Il profilo base \xE8 l\u2019acqua sorgente miscelata sopra. Aggiungi sali in grammi; calcoliamo gli ioni risultanti (ppm).",
        startingAlkalinityLabel: "Alcalinit\xE0 iniziale ({unit})",
        sourceVolumeLabel: "Volume sorgente ({unit})",
        dilutionVolumeLabel: "Volume diluizione ({unit})"
      }
    },
    activeAccount: "Account attivo:",
    createTitle: "Crea ricetta",
    nameLabel: "Nome",
    styleLabel: "Stile",
    stylePlaceholder: "Seleziona uno stile",
    stylesLoading: "Caricamento stili\u2026",
    createButton: "Crea",
    creating: "Creazione\u2026",
    refresh: "Aggiorna",
    refreshing: "Aggiornamento\u2026",
    listTitle: "Le tue ricette",
    noRecipes: "Ancora nessuna ricetta.",
    openEditor: "Apri editor",
    openWater: "Apri calcolatore acqua",
    openVersions: "Vedi versioni",
    versionShort: "Versione",
    versions: {
      title: "Versioni ricetta",
      subtitle: "Tutte le versioni salvate per questa ricetta (la versione 00 \xE8 la prima).",
      backToRecipes: "Torna alle Ricette",
      backToEditor: "Torna all\u2019editor ricetta",
      listTitle: "Versioni",
      listAriaLabel: "Elenco versioni ricetta",
      empty: "Nessuna versione trovata.",
      refresh: "Aggiorna",
      refreshing: "Aggiornamento\u2026",
      versionLabel: "Versione",
      openEditor: "Apri editor",
      openWater: "Apri calcolatore acqua",
      updatedAt: "Aggiornato"
    },
    exportBeerJson: "Esporta (BeerJSON)",
    pagination: {
      ariaLabel: "Paginazione elenco ricette",
      prev: "Precedente",
      next: "Successiva",
      status: "Pagina {page} di {pages}"
    },
    delete: {
      cta: "Elimina",
      confirmTitle: "Eliminare la ricetta?",
      confirmBody: "Questa azione non pu\xF2 essere annullata. Fai clic su \u201CElimina ora\u201D per confermare, oppure Annulla per mantenerla.",
      confirmCta: "Elimina ora",
      deleting: "Eliminazione\u2026",
      cancel: "Annulla"
    },
    export: {
      title: "Esporta",
      subtitle: "Scarica BeerJSON strict per una ricetta o per tutte le ricette.",
      selectLabel: "Ricetta",
      noneAvailable: "Nessuna ricetta disponibile",
      exportSelectedCta: "Esporta selezionata",
      exportAllCta: "Esporta tutte",
      strictNote: "Le esportazioni sono BeerJSON strict (gli id interni delle aggiunte vengono rimossi per interoperabilit\xE0)."
    }
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
  devDashboard: {
    loading: "Caricamento\u2026"
  },
  waterProfiles: {
    title: "Profili acqua",
    backToRecipes: "Torna alle Ricette",
    ionsLegend: "Ioni ({unit})",
    activeAccount: "Account attivo",
    viewAllTableTitle: "Vedi tutti i profili acqua",
    adminAddTitle: "Admin: aggiungi profilo acqua",
    createdProfilesStartUnverified: "I profili creati iniziano come non verificati. Usa le azioni nella tabella per verificare/non verificare.",
    navigationTitle: "Navigazione",
    phPlaceholder: "es. 7,80",
    rawMaterialsCtaPrefix: "Hai trovato una materia prima mancante o errata?",
    rawMaterialsCtaLinkText: "Aiuta a migliorare il database materie prime"
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
  salts: {
    gypsum: "Gesso (gypsum)",
    calciumChloride: "Cloruro di calcio",
    epsom: "Sali di Epsom",
    tableSalt: "Sale da cucina",
    bakingSoda: "Bicarbonato di sodio",
    modeManualSuffix: "(manuale)",
    modeRequiredSuffix: "(richiesto)"
  },
  waterHub: {
    title: "Gestione acqua",
    recipeId: "ID ricetta",
    recipeName: "Nome",
    recipeVersion: "Versione",
    backToRecipeEditor: "Torna all\u2019editor ricetta",
    missingHeaders: "Header dev mancanti. Vai in Dashboard e clicca <strong>Salva header</strong> (Utente + Account attivo), poi torna qui.",
    chooseArea: "Scegli un\u2019area",
    mashWater: "Acqua mash e Step mash",
    spargeWater: "Acqua sparge",
    additionalBoilWater: "Acqua aggiuntiva in bollitura",
    lastCalculated: "ultimo calcolo",
    manageProfilesOn: "Gestisci i profili in",
    waterProfilesLink: "Profili acqua",
    quickStatus: "Stato rapido",
    mashAcidMode: "Modalit\xE0 acido mash",
    spargeAcidMode: "Modalit\xE0 acido sparge",
    mashOverallSnapshot: "Snapshot complessivo mash",
    finalAlkalinity: "Alcalinit\xE0 finale",
    openMashOverall: "Apri il riepilogo mash",
    refreshing: "Aggiornamento\u2026",
    refresh: "Aggiorna",
    profilesLoaded: "Riepilogo caricato.",
    profilesNotLoaded: "Riepilogo non caricato.",
    recap: "Riepilogo",
    recapSubtitle: "Usa snapshot salvati quando disponibili; il pH unito \xE8 una approssimazione tramite [H+] pesato sul volume.",
    mergedWaterRecap: "Riepilogo acqua unita",
    computed: "Calcolato",
    clickToExpand: "Clicca per espandere",
    perStream: "Per flusso",
    colStream: "Flusso",
    colVolumeL: "Volume (L)",
    colPh: "pH mash",
    colFinalAlk: "Alcalinit\xE0 finale (ppm come CaCO3)",
    mergedSummary: "Riepilogo unito",
    totalVolume: "Volume totale",
    approxMergedPh: "pH unito (approx)",
    mergedFinalAlk: "Alcalinit\xE0 finale unita",
    additionsPerStream: "Aggiunte (per flusso)",
    salt: "Sali",
    acid: "Acido",
    mergedIonsTitle: "Ioni uniti",
    mergedIonsDescription: "Gli ioni uniti (ppm) sono calcolati da snapshot mash/sparge/boil salvati dopo sali + acido (solo contro-ioni SO4/Cl) e mediati per volume. I flussi senza snapshot salvati sono esclusi.",
    ion: "Ione",
    mergedPpm: "Unito (ppm)",
    noMergedProfile: "Profilo unito non ancora disponibile (servono snapshot sali + acido salvati per almeno un flusso).",
    noSettingsLoaded: "Nessuna impostazione caricata.",
    finalRecapTitle: "Riepilogo finale",
    finalRecapSubtitle: "Sintesi rapida ed euristica (non \xE8 un modello completo di chimica dell\u2019acqua).",
    predictedMashPh: "pH mash previsto",
    residualAlkalinity: "Alcalinit\xE0 residua (RA)",
    raMashOverall: "Mash complessivo (dopo sali + acido)",
    raMerged: "Acqua unita (se disponibile)",
    ppmAsCaCO3: "ppm come CaCO3",
    styleExpectedRa: "RA attesa per lo stile (regola pratica)",
    styleExpectedRaNa: "N/A",
    finalRecapCaveat: "Nota: la RA \xE8 un\u2019euristica; i risultati dipendono da assunzioni e non sostituiscono un modello completo di pH/chimica.",
    styleExpectedRaPale: "Gli stili chiari / orientati al luppolo spesso beneficiano di RA pi\xF9 bassa.",
    styleExpectedRaAmber: "Gli stili ambrati / maltati spesso tollerano una RA moderata.",
    styleExpectedRaDark: "Gli stili scuri / tostati spesso beneficiano di RA pi\xF9 alta.",
    alkVsBicarbTitle: "Alcalinit\xE0 (come CaCO3) vs bicarbonato (HCO3)",
    alkVsBicarbSubtitle: "Perch\xE9 l\u2019app usa CaCO3 per alcalinit\xE0/RA e HCO3 nelle tabelle degli ioni.",
    alkVsBicarbPoint1: "\u201Cppm come CaCO3\u201D \xE8 un\u2019unit\xE0 di alcalinit\xE0: esprime la capacit\xE0 di neutralizzare acido (non CaCO3 disciolto).",
    alkVsBicarbPoint2: "Le tabelle degli ioni riportano concentrazioni (ppm): Ca, Mg, Na, SO4, Cl e HCO3.",
    alkVsBicarbPoint3: "Quando la tabella dice \u201CHCO3 derivato dall\u2019alcalinit\xE0\u201D, converte l\u2019alcalinit\xE0 equivalente CaCO3 in una stima in ppm di HCO3: HCO3 \u2248 alcalinit\xE0 \xD7 61/50.",
    alkVsBicarbPoint4: "In modo rigoroso, alcalinit\xE0 e bicarbonato non coincidono sempre a tutti i pH/condizioni; questa conversione \xE8 un\u2019approssimazione pratica per acque da birrificazione tipiche."
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
var en = en_default;
var it = it_default;
var locales = ["en", "it"];
var defaultLocale = "en";
function isLocale(value) {
  return locales.includes(value);
}
function getSharedMessages(locale) {
  return locale === "it" ? it : en;
}
export {
  defaultLocale,
  en,
  getSharedMessages,
  isLocale,
  it,
  locales
};

# WMS native slice (scaffold)

**Status:** Placeholder — native-mandatory flows land when [`docs/design/canonical-wms-module-surface.md`](../../../../docs/design/canonical-wms-module-surface.md) exists and WMS Phase B+ API is scheduled.

Per [RFC-0002](../../../../docs/rfcs/0002-canonical-module-physical-layout.md) §3, the WMS canonical module will own:

- `apps/native/src/modules/wms/screens/` — scan, pick confirm, location lookup
- RFC-0007 barcode/label PDF exports via `@umbraculum/api-client` render-job helpers (no client-side PDF libs)

See [`docs/design/canonical-native-platform-surface.md`](../../../../docs/design/canonical-native-platform-surface.md) §10 and [`docs/modules/canonical/wms.md`](../../../../docs/modules/canonical/wms.md) §4.

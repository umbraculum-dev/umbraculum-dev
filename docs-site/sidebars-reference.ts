import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import {referenceSidebarItems} from './reference-sidebar-items';

/**
 * Sidebar for all reference docs plugin instances (apps, services, packages,
 * and the reference landing page). Manual link items so one tree covers every
 * workspace README regardless of which plugin instance is active.
 */
const sidebars: SidebarsConfig = {
  referenceSidebar: [...referenceSidebarItems],
};

export default sidebars;

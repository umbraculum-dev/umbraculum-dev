/**
 * Swizzled AnnouncementBar — replaces @docusaurus/theme-classic's component
 * with markup that owns its own class names (no fighting the theme's CSS
 * specificity hacks). Dismiss state still uses Docusaurus's hook so the
 * close button persists across navigations.
 *
 * Reads `themeConfig.announcementBar` produced by
 * `apps/website/scripts/announcement-theme.mjs` from
 * `apps/website/announcement.config.json`.
 */

import React, {type ReactNode} from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useAnnouncementBar} from '@docusaurus/theme-common/internal';

export default function AnnouncementBar(): ReactNode {
  const {announcementBar} = useThemeConfig();
  const {isActive, close} = useAnnouncementBar();

  if (!isActive || !announcementBar) {
    return null;
  }

  const {content, backgroundColor, textColor, isCloseable} = announcementBar;

  return (
    <aside
      className="umb-doc-announcement"
      role="region"
      aria-label="Site announcement"
      style={{
        ...(backgroundColor ? {backgroundColor} : {}),
        ...(textColor ? {color: textColor} : {}),
      }}
    >
      <div className="umb-doc-announcement__inner">
        <div
          className="umb-doc-announcement__body"
          dangerouslySetInnerHTML={{__html: content}}
        />
        {isCloseable && (
          <button
            type="button"
            className="umb-doc-announcement__dismiss"
            onClick={close}
            aria-label="Close announcement"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    </aside>
  );
}

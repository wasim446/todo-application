
import { isPlatformBrowser } from '@angular/common';

export function isBrowser(platformId: Object): boolean {
  return isPlatformBrowser(platformId);
}


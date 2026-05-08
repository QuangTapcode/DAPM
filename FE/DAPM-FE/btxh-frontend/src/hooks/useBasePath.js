import { useLocation } from 'react-router-dom';

/**
 * Returns the correct base path for staff-reception routes.
 * If in preview mode → '/preview'
 * Otherwise → '/can-bo-tiep-nhan'
 */
export function useBasePath() {
  const { pathname } = useLocation();
  return pathname.startsWith('/preview') ? '/preview' : '/can-bo-tiep-nhan';
}

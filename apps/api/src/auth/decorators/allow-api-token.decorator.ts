import { SetMetadata } from '@nestjs/common';

export const ALLOW_API_TOKEN_KEY = 'allowApiToken';

/**
 * Marks a controller or handler as reachable with a long-lived API token
 * (`Authorization: Bearer pfp_...`) in addition to a PIN session. Tokens are
 * ignored everywhere else, so a leaked token only reaches what is marked.
 */
export const AllowApiToken = () => SetMetadata(ALLOW_API_TOKEN_KEY, true);

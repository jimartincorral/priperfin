import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import {
  EnableBankingService,
  EnableBankingApiError,
} from './enable-banking.service';
import { TransactionsService } from '../transactions/transactions.service';
import {
  BankSyncSettingsDto,
  BankSyncSettingsResponse,
  BankAccountDetails,
  BankTransaction,
  PsuContext,
  TransactionsResponse,
} from './interfaces/enable-banking.interface';
import { CreateTransactionDto } from '../transactions/create-transaction.dto';
import {
  bankTransactionState,
  mapBankTransaction,
  pickBankBalance,
} from './bank-transaction-mapper';
import { Prisma } from '../generated/client';
import * as crypto from 'crypto';

const DAY_MS = 24 * 60 * 60 * 1000;
/** PSD2's baseline consent, used when a bank does not say how long it allows. */
const DEFAULT_CONSENT_SECONDS = 90 * 24 * 60 * 60;
/** Requested a little short of the bank's maximum so clock skew can't exceed it. */
const CONSENT_MARGIN_SECONDS = 10 * 60;
/** How far back a sync keeps following a pending transaction. */
const PENDING_LOOKBACK_MAX_DAYS = 30;

function safeParseArray(json: string): any[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ibansOf(accounts: any[]): Set<string> {
  const ibans = new Set<string>();
  for (const a of accounts) {
    const iban = a?.account_id?.iban || a?.iban;
    if (typeof iban === 'string' && iban) {
      ibans.add(iban.replace(/\s+/g, '').toUpperCase());
    }
  }
  return ibans;
}

/** A mapped bank transaction, flagged when the bank hasn't booked it yet. */
type BankDto = CreateTransactionDto & { pending?: boolean };

/** The fields of a stored transaction that bank sync compares against. */
interface ExistingRow {
  id: string;
  externalId: string | null;
  date: Date;
  amount: Prisma.Decimal;
  description: string;
  notes: string | null;
  pending: boolean;
  transferId: string | null;
}

/** Why a bank connection stopped working. */
export type ConnectionProblem = 'EXPIRED' | 'REVOKED';

@Injectable()
export class BankSyncService {
  private readonly logger = new Logger(BankSyncService.name);

  private readonly SETTING_APP_ID = 'enable_banking_app_id';
  private readonly SETTING_KEY = 'enable_banking_key';
  private readonly SETTING_REDIRECT_URL = 'enable_banking_redirect_url';
  private readonly SETTING_AUTO_SYNC_ENABLED =
    'enable_banking_auto_sync_enabled';
  private readonly SETTING_INITIAL_LOOKBACK_DAYS =
    'enable_banking_initial_lookback_days';

  constructor(
    private prisma: PrismaService,
    private enableBankingService: EnableBankingService,
    private transactionsService: TransactionsService,
  ) {}

  /**
   * Daily Automated Bank Synchronization (runs once per day at 6:00 AM)
   * Complies with European PSD2 RTS unattended background limits (up to 4/day).
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async handleDailyAutoSync() {
    const settings = await this.getSettings();
    if (!settings.autoSyncEnabled || !settings.hasAppId || !settings.hasKey) {
      this.logger.debug('Daily bank sync skipped (disabled or unconfigured)');
      return;
    }

    this.logger.log(
      'Executing daily automated bank synchronization across all profiles...',
    );
    try {
      await this.syncAllProfiles();
    } catch (err) {
      this.logger.error(
        'Daily automated bank synchronization encountered an error:',
        err,
      );
    }
  }

  async syncAllProfiles() {
    const profiles = await this.prisma.profile.findMany({
      where: {
        bankConnections: { some: {} },
      },
      select: { id: true, name: true },
    });

    this.logger.log(
      `Found ${profiles.length} profile(s) with active bank connections to auto-sync`,
    );
    const results = [];
    for (const p of profiles) {
      try {
        const res = await this.syncTransactions(undefined, p.id);
        this.logger.log(
          `Auto-synced profile "${p.name}": ${res.newCount} new, ${res.duplicateCount} duplicates`,
        );
        results.push({ profile: p.name, ...res });
      } catch (err) {
        this.logger.warn(`Auto-sync failed for profile "${p.name}":`, err);
      }
    }
    return results;
  }

  private async getCredentials(): Promise<{
    appId: string;
    key: string;
    redirectUrl: string | null;
  }> {
    const [appIdSetting, keySetting, redirectUrlSetting] = await Promise.all([
      this.prisma.setting.findUnique({ where: { key: this.SETTING_APP_ID } }),
      this.prisma.setting.findUnique({ where: { key: this.SETTING_KEY } }),
      this.prisma.setting.findUnique({
        where: { key: this.SETTING_REDIRECT_URL },
      }),
    ]);

    if (!appIdSetting?.value || !keySetting?.value) {
      throw new BadRequestException(
        'Enable Banking credentials are not configured. Please configure Application ID and Private Key in Settings.',
      );
    }

    return {
      appId: appIdSetting.value,
      key: keySetting.value,
      redirectUrl: redirectUrlSetting?.value || null,
    };
  }

  async getSettings(): Promise<BankSyncSettingsResponse> {
    const [
      appIdSetting,
      keySetting,
      redirectUrlSetting,
      autoSyncSetting,
      lookbackSetting,
    ] = await Promise.all([
      this.prisma.setting.findUnique({ where: { key: this.SETTING_APP_ID } }),
      this.prisma.setting.findUnique({ where: { key: this.SETTING_KEY } }),
      this.prisma.setting.findUnique({
        where: { key: this.SETTING_REDIRECT_URL },
      }),
      this.prisma.setting.findUnique({
        where: { key: this.SETTING_AUTO_SYNC_ENABLED },
      }),
      this.prisma.setting.findUnique({
        where: { key: this.SETTING_INITIAL_LOOKBACK_DAYS },
      }),
    ]);

    // Defaults to true when credentials exist unless explicitly turned off ('false')
    const autoSyncEnabled = autoSyncSetting
      ? autoSyncSetting.value === 'true'
      : true;

    const initialLookbackDays = lookbackSetting?.value
      ? parseInt(lookbackSetting.value, 10)
      : 90;

    return {
      hasAppId: !!appIdSetting?.value,
      hasKey: !!keySetting?.value,
      redirectUrl: redirectUrlSetting?.value || null,
      autoSyncEnabled,
      initialLookbackDays: isNaN(initialLookbackDays)
        ? 90
        : initialLookbackDays,
    };
  }

  async saveSettings(
    dto: BankSyncSettingsDto,
  ): Promise<BankSyncSettingsResponse> {
    if (dto.appId !== undefined) {
      await this.prisma.setting.upsert({
        where: { key: this.SETTING_APP_ID },
        update: { value: dto.appId },
        create: { key: this.SETTING_APP_ID, value: dto.appId },
      });
    }

    if (dto.key !== undefined) {
      // Basic sanity check on key
      const cleanKey = dto.key.trim();
      await this.prisma.setting.upsert({
        where: { key: this.SETTING_KEY },
        update: { value: cleanKey },
        create: { key: this.SETTING_KEY, value: cleanKey },
      });
    }

    if (dto.redirectUrl !== undefined) {
      await this.prisma.setting.upsert({
        where: { key: this.SETTING_REDIRECT_URL },
        update: { value: dto.redirectUrl.trim() },
        create: {
          key: this.SETTING_REDIRECT_URL,
          value: dto.redirectUrl.trim(),
        },
      });
    }

    if (dto.autoSyncEnabled !== undefined) {
      await this.prisma.setting.upsert({
        where: { key: this.SETTING_AUTO_SYNC_ENABLED },
        update: { value: dto.autoSyncEnabled ? 'true' : 'false' },
        create: {
          key: this.SETTING_AUTO_SYNC_ENABLED,
          value: dto.autoSyncEnabled ? 'true' : 'false',
        },
      });
    }

    if (dto.initialLookbackDays !== undefined) {
      await this.prisma.setting.upsert({
        where: { key: this.SETTING_INITIAL_LOOKBACK_DAYS },
        update: { value: dto.initialLookbackDays.toString() },
        create: {
          key: this.SETTING_INITIAL_LOOKBACK_DAYS,
          value: dto.initialLookbackDays.toString(),
        },
      });
    }

    return this.getSettings();
  }

  async getAvailableBanks(country: string = 'ES') {
    const { appId, key } = await this.getCredentials();
    const result = await this.enableBankingService.getBanks(
      country,
      appId,
      key,
    );
    return result.aspsps || [];
  }

  async startAuth(
    aspspName: string,
    country: string = 'ES',
    redirectUrlOverride?: string,
  ) {
    const { appId, key, redirectUrl } = await this.getCredentials();
    const effectiveRedirectUrl = redirectUrlOverride || redirectUrl;

    if (!effectiveRedirectUrl) {
      throw new BadRequestException(
        'A Redirect URL must be provided or configured in Settings.',
      );
    }

    const state = crypto.randomUUID();
    const consentSeconds = await this.consentSecondsFor(
      aspspName,
      country,
      appId,
      key,
    );
    const validUntil = new Date(
      Date.now() + (consentSeconds - CONSENT_MARGIN_SECONDS) * 1000,
    ).toISOString();

    const authResponse = await this.enableBankingService.startAuth(
      {
        access: {
          balances: true,
          transactions: true,
          valid_until: validUntil,
        },
        aspsp: {
          name: aspspName,
          country: country.toUpperCase(),
        },
        redirect_url: effectiveRedirectUrl,
        state,
        psu_type: 'personal',
      },
      appId,
      key,
    );

    return {
      url: authResponse.url,
      state,
      validUntil,
    };
  }

  /**
   * The longest consent this bank grants (many allow 180 days since the 2023
   * PSD2 change). Falls back to 90 days when the bank list can't be read or
   * doesn't say, which is what every connection used before.
   */
  private async consentSecondsFor(
    aspspName: string,
    country: string,
    appId: string,
    key: string,
  ): Promise<number> {
    try {
      const { aspsps } = await this.enableBankingService.getBanks(
        country,
        appId,
        key,
      );
      const bank = (aspsps || []).find(
        (a) =>
          a.name === aspspName &&
          (a.country || '').toUpperCase() === country.toUpperCase(),
      );
      const max = Number(bank?.maximum_consent_validity);
      if (Number.isFinite(max) && max > CONSENT_MARGIN_SECONDS * 2) {
        return max;
      }
    } catch (err) {
      this.logger.warn(
        `Could not read the consent limit for ${aspspName}; asking for 90 days`,
        err,
      );
    }
    return DEFAULT_CONSENT_SECONDS;
  }

  /** Withdraws a session at Enable Banking. Best effort: never throws. */
  private async revokeSession(sessionId: string): Promise<void> {
    try {
      const { appId, key } = await this.getCredentials();
      await this.enableBankingService.deleteSession(sessionId, appId, key);
      this.logger.log(`Revoked Enable Banking session ${sessionId}`);
    } catch (err) {
      // Already expired or revoked at the bank, or credentials removed: the
      // local record goes either way.
      this.logger.warn(`Could not revoke Enable Banking session ${sessionId}`);
      this.logger.debug(err);
    }
  }

  async handleCallback(code: string, profileId: string, psu?: PsuContext) {
    const { appId, key } = await this.getCredentials();
    this.logger.log(
      `Exchanging authorization code for session on profile ${profileId}`,
    );

    const session = await this.enableBankingService.createSession(
      code,
      appId,
      key,
    );
    this.logger.log(
      `Received session ${session.session_id} with ${session.accounts?.length || 0} accounts`,
    );

    // Fetch details for each authorized account
    const accountsDetails: BankAccountDetails[] = [];
    if (session.accounts && Array.isArray(session.accounts)) {
      for (const rawItem of session.accounts) {
        const rawAcc = rawItem as any;
        let accountUid = '';
        if (typeof rawAcc === 'string') {
          accountUid = rawAcc;
        } else if (rawAcc && typeof rawAcc === 'object') {
          accountUid =
            typeof rawAcc.uid === 'string'
              ? rawAcc.uid
              : rawAcc.uid?.uid || rawAcc.account_id?.iban || rawAcc.iban || '';
        }

        if (!accountUid) continue;

        try {
          const details = await this.enableBankingService.getAccountDetails(
            accountUid,
            appId,
            key,
            psu,
          );
          accountsDetails.push({
            ...(typeof rawAcc === 'object' ? rawAcc : {}),
            ...details,
            uid: accountUid,
          });
        } catch (err) {
          this.logger.warn(
            `Failed to fetch details for account ${accountUid}:`,
            err,
          );
          accountsDetails.push(
            typeof rawAcc === 'object'
              ? { ...rawAcc, uid: accountUid }
              : { uid: accountUid },
          );
        }
      }
    }

    const validUntil = session.access?.valid_until
      ? new Date(session.access.valid_until)
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    // Save or update BankConnection
    const connection = await this.prisma.bankConnection.upsert({
      where: { sessionId: session.session_id },
      update: {
        aspspName: session.aspsp?.name || 'Bank',
        aspspCountry: session.aspsp?.country || 'ES',
        validUntil,
        accountsJson: JSON.stringify(accountsDetails),
        profileId,
      },
      create: {
        sessionId: session.session_id,
        aspspName: session.aspsp?.name || 'Bank',
        aspspCountry: session.aspsp?.country || 'ES',
        validUntil,
        accountsJson: JSON.stringify(accountsDetails),
        profileId,
      },
    });

    // Auto-migrate previously linked accounts to the new connection and matching account UIDs
    try {
      const oldConnections = await this.prisma.bankConnection.findMany({
        where: {
          profileId,
          aspspName: session.aspsp?.name || 'Bank',
          id: { not: connection.id },
        },
        include: { accounts: true },
      });

      const newIbans = ibansOf(accountsDetails);
      for (const oldConn of oldConnections) {
        // A second login at the same bank (a joint account, a business
        // account) is a separate connection, not a renewal: leave it alone.
        // Renewal is recognised by a shared IBAN, or assumed when the old one
        // has expired or either side lists no IBANs to compare.
        const oldIbans = ibansOf(safeParseArray(oldConn.accountsJson));
        const expired = new Date(oldConn.validUntil) < new Date();
        const overlaps = [...oldIbans].some((iban) => newIbans.has(iban));
        if (!expired && !overlaps && oldIbans.size > 0 && newIbans.size > 0) {
          continue;
        }

        for (const linkedAcc of oldConn.accounts) {
          let newMatchedUid: string | null = null;
          let oldIban: string | null = null;
          try {
            const oldDetails = JSON.parse(oldConn.accountsJson);
            const oldItem = Array.isArray(oldDetails)
              ? oldDetails.find((d: any) => d.uid === linkedAcc.bankAccountUid)
              : null;
            oldIban = oldItem?.account_id?.iban || oldItem?.iban || null;
          } catch {
            // ignore
          }

          if (oldIban && accountsDetails.length > 0) {
            const matchByIban = accountsDetails.find(
              (d: any) =>
                (d.account_id?.iban && d.account_id.iban === oldIban) ||
                (d.iban && d.iban === oldIban),
            );
            if (matchByIban?.uid) {
              newMatchedUid = matchByIban.uid;
            }
          }

          if (
            !newMatchedUid &&
            accountsDetails.length === 1 &&
            accountsDetails[0]?.uid
          ) {
            newMatchedUid = accountsDetails[0].uid;
          }

          if (newMatchedUid) {
            await this.prisma.account.update({
              where: { id: linkedAcc.id },
              data: {
                bankConnectionId: connection.id,
                bankAccountUid: newMatchedUid,
              },
            });
            this.logger.log(
              `Auto-relinked account ${linkedAcc.name} to new session UID ${newMatchedUid}`,
            );
          }
        }

        // Remove the superseded connection, and end its session at the bank
        // so the old consent doesn't linger next to the new one.
        if (oldConn.sessionId !== session.session_id) {
          await this.revokeSession(oldConn.sessionId);
        }
        await this.prisma.bankConnection
          .delete({ where: { id: oldConn.id } })
          .catch(() => {});
      }
    } catch (migErr) {
      this.logger.warn(
        'Failed to auto-migrate old bank connection links',
        migErr,
      );
    }

    return {
      connectionId: connection.id,
      aspspName: connection.aspspName,
      validUntil: connection.validUntil,
      accounts: accountsDetails,
    };
  }

  async getConnections(profileId: string) {
    const connections = await this.prisma.bankConnection.findMany({
      where: { profileId },
      include: {
        accounts: {
          select: {
            id: true,
            name: true,
            bankAccountUid: true,
            lastSyncedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return connections.map((conn) => {
      let parsedAccounts: BankAccountDetails[] = [];
      try {
        parsedAccounts = JSON.parse(conn.accountsJson);
      } catch {
        parsedAccounts = [];
      }

      const now = new Date();
      const expiresAt = new Date(conn.validUntil);
      const isExpired = expiresAt < now;
      const daysRemaining = Math.max(
        0,
        Math.ceil(
          (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        ),
      );

      return {
        id: conn.id,
        aspspName: conn.aspspName,
        aspspCountry: conn.aspspCountry,
        validUntil: conn.validUntil,
        isExpired,
        daysRemaining,
        accounts: parsedAccounts,
        linkedAccounts: conn.accounts,
        createdAt: conn.createdAt,
      };
    });
  }

  async deleteConnection(connectionId: string, profileId: string) {
    const connection = await this.prisma.bankConnection.findFirst({
      where: { id: connectionId, profileId },
    });

    if (!connection) {
      throw new NotFoundException('Bank connection not found or access denied');
    }

    // End the consent at the bank, not just our record of it.
    await this.revokeSession(connection.sessionId);

    // Unlink associated accounts
    await this.prisma.account.updateMany({
      where: { bankConnectionId: connectionId, profileId },
      data: {
        bankConnectionId: null,
        bankAccountUid: null,
      },
    });

    await this.prisma.bankConnection.delete({
      where: { id: connectionId },
    });

    return { success: true };
  }

  async linkAccount(
    accountId: string,
    bankAccountUid: any,
    connectionId: string,
    profileId: string,
  ) {
    const [account, connection] = await Promise.all([
      this.prisma.account.findFirst({ where: { id: accountId, profileId } }),
      this.prisma.bankConnection.findFirst({
        where: { id: connectionId, profileId },
      }),
    ]);

    if (!account) {
      throw new NotFoundException('PriPerFin account not found');
    }
    if (!connection) {
      throw new NotFoundException('Bank connection not found');
    }

    let effectiveUid = '';
    if (typeof bankAccountUid === 'string') {
      effectiveUid = bankAccountUid;
    } else if (bankAccountUid && typeof bankAccountUid === 'object') {
      effectiveUid =
        bankAccountUid.uid ||
        bankAccountUid.account_id?.iban ||
        bankAccountUid.iban ||
        '';
    }

    if (!effectiveUid) {
      throw new BadRequestException('Invalid bank account UID');
    }

    const updated = await this.prisma.account.update({
      where: { id: accountId },
      data: {
        bankConnectionId: connectionId,
        bankAccountUid: effectiveUid,
      },
    });

    return updated;
  }

  async unlinkAccount(accountId: string, profileId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, profileId },
    });

    if (!account) {
      throw new NotFoundException('PriPerFin account not found');
    }

    const updated = await this.prisma.account.update({
      where: { id: accountId },
      data: {
        bankConnectionId: null,
        bankAccountUid: null,
      },
    });

    return updated;
  }

  /**
   * @param psu who started the sync, when a person did. Passed on to the bank
   *   so a manual sync counts as user-present access. The daily background
   *   sync passes nothing.
   */
  async syncTransactions(
    accountId?: string,
    profileId?: string,
    psu?: PsuContext,
  ) {
    if (!profileId) {
      throw new BadRequestException('Profile ID required');
    }

    const { appId, key } = await this.getCredentials();

    const where: any = {
      profileId,
      bankAccountUid: { not: null },
      bankConnectionId: { not: null },
    };

    if (accountId) {
      where.id = accountId;
    }

    const linkedAccounts = await this.prisma.account.findMany({
      where,
      include: {
        bankConnection: true,
      },
    });

    if (linkedAccounts.length === 0) {
      return {
        message: 'No bank-linked accounts found to sync',
        syncedCount: 0,
        newCount: 0,
        duplicateCount: 0,
        accountsSynced: [],
      };
    }

    let totalNew = 0;
    let totalDuplicates = 0;
    const accountResults = [];
    // One session lookup per connection per run, however many accounts fail.
    const problemByConnection = new Map<string, ConnectionProblem | null>();

    for (const account of linkedAccounts) {
      if (!account.bankAccountUid || !account.bankConnection) {
        continue;
      }

      // Check if consent has expired
      if (new Date(account.bankConnection.validUntil) < new Date()) {
        this.logger.warn(
          `Skipping sync for account ${account.name}: bank connection has expired.`,
        );
        accountResults.push({
          accountId: account.id,
          accountName: account.name,
          status: 'EXPIRED',
          message:
            'Bank authorization expired. Please re-authenticate in Settings.',
          newCount: 0,
          duplicateCount: 0,
        });
        continue;
      }

      try {
        // Calculate dateFrom (intelligent lookback for first sync vs subsequent syncs)
        let dateFrom: string;
        if (account.lastSyncedAt) {
          const syncStart = new Date(account.lastSyncedAt);
          syncStart.setDate(syncStart.getDate() - 5); // 5 days safety overlap
          // Reach back to the oldest transaction still pending, so the sync
          // sees it booked, changed or dropped even if the bank files it under
          // its original date. Capped, so a hold that never books doesn't
          // widen every sync forever.
          if (account.bankPendingFrom) {
            const pendingStart = new Date(account.bankPendingFrom);
            pendingStart.setDate(pendingStart.getDate() - 2);
            const cap = new Date(
              Date.now() - PENDING_LOOKBACK_MAX_DAYS * DAY_MS,
            );
            const start = pendingStart < cap ? cap : pendingStart;
            if (start < syncStart) syncStart.setTime(start.getTime());
          }
          dateFrom = syncStart.toISOString().split('T')[0];
        } else {
          const syncSettings = await this.getSettings();
          const lookbackDays = syncSettings.initialLookbackDays || 90;
          const defaultStart = new Date();
          defaultStart.setDate(defaultStart.getDate() - lookbackDays);

          // First Sync: look for latest existing transaction on this account to establish overlap
          const latestTx = await this.prisma.transaction.findFirst({
            where: { accountId: account.id, profileId },
            orderBy: { date: 'desc' },
          });
          if (latestTx) {
            const start = new Date(latestTx.date);
            start.setDate(start.getDate() - 7); // 7 days safety overlap with previous imports
            // Start from latest transaction overlap, but NEVER query older than the max lookback window (prevents bank SCA session invalidation)
            const chosenStart =
              start.getTime() > defaultStart.getTime() ? start : defaultStart;
            dateFrom = chosenStart.toISOString().split('T')[0];
          } else {
            dateFrom = defaultStart.toISOString().split('T')[0];
          }
        }

        const dateTo = new Date().toISOString().split('T')[0];

        this.logger.log(
          `Fetching transactions for ${account.name} from ${dateFrom} to ${dateTo}`,
        );

        let targetUid = account.bankAccountUid;
        if (!targetUid || targetUid === '[object Object]') {
          try {
            const connAccounts = JSON.parse(
              account.bankConnection.accountsJson,
            );
            if (Array.isArray(connAccounts) && connAccounts.length > 0) {
              const first = connAccounts[0];
              targetUid =
                typeof first === 'string'
                  ? first
                  : first.uid?.uid || first.uid || first.account_id?.iban || '';
              if (targetUid && typeof targetUid === 'string') {
                await this.prisma.account.update({
                  where: { id: account.id },
                  data: { bankAccountUid: targetUid },
                });
              }
            }
          } catch {
            this.logger.debug('Failed to parse bankConnection accountsJson');
          }
        }

        if (!targetUid || targetUid === '[object Object]') {
          this.logger.warn(
            `Skipping account ${account.name}: invalid bankAccountUid`,
          );
          continue;
        }

        const rawTransactions: BankTransaction[] = [];
        let continuationKey: string | undefined = undefined;
        let pageCount = 0;
        const maxPages = 25; // safety ceiling (supports thousands of transactions)

        do {
          pageCount++;
          const response: TransactionsResponse =
            await this.enableBankingService.getAccountTransactions(
              targetUid,
              appId,
              key,
              dateFrom,
              dateTo,
              continuationKey,
              psu,
            );

          if (response?.transactions && Array.isArray(response.transactions)) {
            rawTransactions.push(...response.transactions);
          }

          continuationKey = response?.continuation_key || undefined;
        } while (continuationKey && pageCount < maxPages);

        this.logger.log(
          `Received ${rawTransactions.length} raw transactions across ${pageCount} page(s) for ${account.name}`,
        );

        // Booked and pending transactions both come in. Pending ones are
        // flagged, kept up to date while the bank still lists them, turned
        // into the booked transaction in place once it is final (so a
        // category set meanwhile stays), and removed if the bank drops them.
        // Cancelled and rejected transactions are never imported.
        const bookedIn: BankDto[] = [];
        const pendingIn: BankDto[] = [];
        for (const tx of rawTransactions) {
          const state = bankTransactionState(tx);
          if (state === 'void') continue;
          const dto = mapBankTransaction(tx, account.id);
          if (!dto) continue;
          if (state === 'pending') pendingIn.push({ ...dto, pending: true });
          else bookedIn.push(dto);
        }
        const fetchComplete = !continuationKey;

        // Existing rows the incoming ones may correspond to: everything in
        // the date window, plus every pending row on the account.
        const windowStart = new Date(dateFrom);
        windowStart.setDate(windowStart.getDate() - 4);
        const windowEnd = new Date(dateTo);
        windowEnd.setDate(windowEnd.getDate() + 4);
        const rowSelect = {
          id: true,
          externalId: true,
          date: true,
          amount: true,
          description: true,
          notes: true,
          pending: true,
          transferId: true,
        } as const;
        const pool: ExistingRow[] = await this.prisma.transaction.findMany({
          where: {
            accountId: account.id,
            profileId,
            OR: [
              { date: { gte: windowStart, lte: windowEnd } },
              { pending: true },
            ],
          },
          select: rowSelect,
        });

        const matched = new Set<string>();
        const toInsert: BankDto[] = [];
        let accountDuplicatesCount = 0;
        let bookedCount = 0;

        // Booked first, so a transaction that became final claims its
        // pending row before a pending one of the same amount can.
        for (const dto of bookedIn) {
          const direct = pool.find(
            (e) => !matched.has(e.id) && e.externalId === dto.externalId,
          );
          const pendingRow =
            direct ??
            this.findPendingMatch(
              pool.filter((e) => e.pending && !matched.has(e.id)),
              dto,
            );
          if (pendingRow?.pending) {
            matched.add(pendingRow.id);
            await this.writeBankFields(pendingRow, dto, false);
            bookedCount++;
            continue;
          }
          if (direct) {
            matched.add(direct.id);
            accountDuplicatesCount++;
            continue;
          }

          const recorded = this.findRecordedMatch(
            pool.filter((e) => !e.pending && !matched.has(e.id)),
            dto,
          );
          if (recorded) {
            matched.add(recorded.id);
            accountDuplicatesCount++;
            this.logger.log(
              `Reconciled bank movement "${dto.description}" (${dto.amount}) with existing transaction "${recorded.description}" (id: ${recorded.id})`,
            );
            // Promote the existing transaction by attaching the bank's ID
            if (dto.externalId && recorded.externalId !== dto.externalId) {
              await this.prisma.transaction.update({
                where: { id: recorded.id },
                data: { externalId: dto.externalId },
              });
            }
            continue;
          }

          toInsert.push(dto);
        }

        for (const dto of pendingIn) {
          const direct = pool.find(
            (e) => !matched.has(e.id) && e.externalId === dto.externalId,
          );
          if (direct) {
            matched.add(direct.id);
            // Still pending: follow any change in amount, date or text.
            if (direct.pending) await this.writeBankFields(direct, dto, true);
            continue;
          }
          // The same pending transaction under a new ID (banks without a
          // stable reference, after the amount moved).
          const earlier = this.findPendingMatch(
            pool.filter((e) => e.pending && !matched.has(e.id)),
            dto,
          );
          if (earlier) {
            matched.add(earlier.id);
            await this.writeBankFields(earlier, dto, true);
            continue;
          }
          // Already recorded by hand or from a file: keep that one. The
          // booked version will reconcile with it later.
          const recorded = this.findRecordedMatch(
            pool.filter((e) => !e.pending && !matched.has(e.id)),
            dto,
          );
          if (recorded) {
            matched.add(recorded.id);
            continue;
          }
          toInsert.push(dto);
        }

        // Pending rows the bank no longer lists were cancelled or expired.
        // Only judged on a complete fetch, never on a truncated one.
        let removedCount = 0;
        if (fetchComplete) {
          for (const row of pool) {
            if (!row.pending || matched.has(row.id)) continue;
            if (row.transferId) {
              await this.prisma.transaction.updateMany({
                where: { transferId: row.transferId, profileId },
                data: {
                  isTransfer: false,
                  transferId: null,
                  transferAccountId: null,
                },
              });
            }
            await this.prisma.transaction.delete({ where: { id: row.id } });
            removedCount++;
          }
        }

        // Ingest into PriPerFin with automatic deduplication and rule matching
        let resultNewCount = 0;
        if (toInsert.length > 0) {
          const result = await this.transactionsService.createMany(
            toInsert,
            false,
            [],
            profileId,
            true, // skipDuplicatesAndInsert = true
          );
          resultNewCount = result.newCount;
          accountDuplicatesCount += result.duplicateCount;
        }

        const pendingAfter = await this.prisma.transaction.aggregate({
          where: { accountId: account.id, profileId, pending: true },
          _min: { date: true },
          _sum: { amount: true },
          _count: { _all: true },
        });
        const pendingCount = pendingAfter._count?._all ?? 0;
        const pendingSum = Number(pendingAfter._sum?.amount ?? 0);

        this.logger.log(
          `${account.name}: ${resultNewCount} new, ${bookedCount} pending now booked, ${removedCount} pending dropped by the bank, ${pendingCount} still pending`,
        );

        totalNew += resultNewCount;
        totalDuplicates += accountDuplicatesCount;

        // Try updating verified bank balance if available
        try {
          const balances = await this.enableBankingService.getAccountBalances(
            targetUid,
            appId,
            key,
            psu,
          );
          const picked = pickBankBalance(balances?.balances);
          if (picked) {
            // The ledger counts pending transactions, a booked balance does
            // not: add them so the two compare like for like. Debit accounts
            // only, until the sign a bank uses for card balances is known.
            const balanceAmt =
              picked.booked && account.type !== 'CREDIT'
                ? Math.round((picked.amount + pendingSum) * 100) / 100
                : picked.amount;
            await this.prisma.setting.upsert({
              where: { key: `balance_verified_account_${account.id}` },
              update: { value: balanceAmt.toString() },
              create: {
                key: `balance_verified_account_${account.id}`,
                value: balanceAmt.toString(),
              },
            });
          }
        } catch (balanceErr) {
          this.logger.warn(
            `Could not sync balance for ${account.name}:`,
            balanceErr,
          );
        }

        // Update lastSyncedAt on account
        await this.prisma.account.update({
          where: { id: account.id },
          data: {
            lastSyncedAt: new Date(),
            bankPendingFrom: pendingAfter._min?.date ?? null,
          },
        });

        accountResults.push({
          accountId: account.id,
          accountName: account.name,
          status: 'SUCCESS',
          newCount: resultNewCount,
          duplicateCount: accountDuplicatesCount,
          bookedCount,
          removedCount,
          pendingCount,
        });
      } catch (syncErr: any) {
        this.logger.error(`Error syncing account ${account.name}:`, syncErr);
        const connectionId = account.bankConnectionId!;
        if (!problemByConnection.has(connectionId)) {
          problemByConnection.set(
            connectionId,
            await this.diagnoseConnection(
              account.bankConnection.sessionId,
              syncErr,
              appId,
              key,
            ),
          );
        }
        const problem = problemByConnection.get(connectionId) ?? null;

        if (problem) {
          // Mark the connection expired so the UI and Home Assistant show it.
          await this.prisma.bankConnection
            .update({
              where: { id: connectionId },
              data: { validUntil: new Date() },
            })
            .catch(() => {});
        }

        const errMsg = syncErr?.message || syncErr?.response?.message || '';
        accountResults.push({
          accountId: account.id,
          accountName: account.name,
          status: problem ? 'EXPIRED' : 'ERROR',
          reason: problem ?? undefined,
          message:
            problem === 'REVOKED'
              ? 'Access to this bank was withdrawn. Connect it again in Settings.'
              : problem === 'EXPIRED'
                ? 'Bank authorization expired. Please re-authenticate in Settings.'
                : errMsg || 'Bank synchronization failed.',
          newCount: 0,
          duplicateCount: 0,
        });
      }
    }

    if (totalNew > 0) {
      try {
        const transferMatches =
          await this.transactionsService.findTransferMatches(profileId);
        for (const match of transferMatches) {
          if (match.confidence >= 85) {
            await this.transactionsService.linkAsTransfer(
              {
                transactionAId: match.source.id,
                transactionBId: match.target.id,
              },
              profileId,
            );
            this.logger.log(
              `[BankSync] Auto-linked transfer between ${match.source.account?.name} and ${match.target.account?.name} (${match.source.amount})`,
            );
          }
        }
      } catch (matchErr) {
        this.logger.warn(
          '[BankSync] Transfer auto-matching warning:',
          matchErr,
        );
      }
    }

    return {
      syncedCount: linkedAccounts.length,
      newCount: totalNew,
      duplicateCount: totalDuplicates,
      accountsSynced: accountResults,
    };
  }

  /**
   * The pending row an incoming transaction stands for. The final amount can
   * differ from the hold (tips, exchange rates) and the bank can date it a
   * few days later, so this is looser than duplicate detection: the same
   * amount, or within 20% with a similar description, within ten days.
   */
  private findPendingMatch(
    pendingRows: ExistingRow[],
    dto: BankDto,
  ): ExistingRow | null {
    let best: ExistingRow | null = null;
    let bestScore = -Infinity;
    const exactCount = pendingRows.filter(
      (e) => Math.abs(e.amount.toNumber() - dto.amount) <= 0.01,
    ).length;
    for (const row of pendingRows) {
      const amount = row.amount.toNumber();
      if (amount * dto.amount <= 0) continue; // same direction only
      const days = Math.abs(
        (row.date.getTime() - new Date(dto.date).getTime()) / DAY_MS,
      );
      if (days > 10) continue;
      const exact = Math.abs(amount - dto.amount) <= 0.01;
      const relDiff =
        Math.abs(amount - dto.amount) /
        Math.max(Math.abs(amount), Math.abs(dto.amount));
      const similarity =
        this.transactionsService.calculateDescriptionSimilarity(
          row.description,
          dto.description,
        );
      const accept = exact
        ? similarity >= 30 || exactCount === 1
        : relDiff <= 0.2 && similarity >= 50;
      if (!accept) continue;
      const score = (exact ? 1000 : 0) + similarity - days;
      if (score > bestScore) {
        bestScore = score;
        best = row;
      }
    }
    return best;
  }

  /**
   * A transaction already recorded from a file or by hand: the same content
   * hash, or the same amount within three days and a similar description
   * (or the only such amount within a day).
   */
  private findRecordedMatch(
    rows: ExistingRow[],
    dto: BankDto,
  ): ExistingRow | null {
    const csvHash = this.transactionsService.generateHash(dto);
    const hashMatch = rows.find((e) => e.externalId === csvHash);
    if (hashMatch) return hashMatch;

    const dtoTime = new Date(dto.date).getTime();
    const candidates = rows.filter((e) => {
      if (Math.abs(e.amount.toNumber() - dto.amount) > 0.01) return false;
      return Math.abs((e.date.getTime() - dtoTime) / DAY_MS) <= 3;
    });

    let best: ExistingRow | null = null;
    let bestScore = 0;
    for (const cand of candidates) {
      const similarity =
        this.transactionsService.calculateDescriptionSimilarity(
          cand.description,
          dto.description,
        );
      if (similarity >= 50 && similarity > bestScore) {
        bestScore = similarity;
        best = cand;
      }
    }
    if (!best && candidates.length === 1) {
      const days = Math.abs((candidates[0].date.getTime() - dtoTime) / DAY_MS);
      if (days <= 1) best = candidates[0];
    }
    return best;
  }

  /**
   * Copies the bank's view of a transaction onto a pending row: amount, date,
   * text and ID. Category, cost object, splits and transfer links stay.
   */
  private async writeBankFields(
    row: ExistingRow,
    dto: BankDto,
    stillPending: boolean,
  ): Promise<void> {
    const date = new Date(dto.date);
    const changed =
      row.pending !== stillPending ||
      row.externalId !== (dto.externalId ?? null) ||
      Math.abs(row.amount.toNumber() - dto.amount) > 0.001 ||
      row.date.getTime() !== date.getTime() ||
      row.description !== dto.description ||
      (row.notes ?? null) !== (dto.notes ?? null);
    if (!changed) return;
    await this.prisma.transaction.update({
      where: { id: row.id },
      data: {
        amount: dto.amount,
        date,
        description: dto.description,
        notes: dto.notes ?? null,
        externalId: dto.externalId,
        pending: stillPending,
      },
    });
  }

  /**
   * After a failed sync, whether the connection itself is the problem. Asks
   * Enable Banking for the session's state, which also catches consent the
   * user withdrew at their bank; falls back to reading the error.
   */
  private async diagnoseConnection(
    sessionId: string,
    syncErr: any,
    appId: string,
    key: string,
  ): Promise<ConnectionProblem | null> {
    try {
      const session = await this.enableBankingService.getSession(
        sessionId,
        appId,
        key,
      );
      const status = (session?.status || '').toUpperCase();
      if (status === 'REVOKED' || status === 'CANCELLED') return 'REVOKED';
      if (status === 'EXPIRED' || status === 'CLOSED' || status === 'INVALID') {
        return 'EXPIRED';
      }
      if (status === 'AUTHORIZED') return null;
    } catch (err) {
      if (
        err instanceof EnableBankingApiError &&
        (err.upstreamStatus === 404 || err.upstreamStatus === 401)
      ) {
        return 'EXPIRED';
      }
      this.logger.debug(`Could not read session ${sessionId} state`);
    }

    const upstream =
      syncErr instanceof EnableBankingApiError
        ? syncErr.upstreamStatus
        : undefined;
    const text =
      `${syncErr?.errorName ?? ''} ${syncErr?.message ?? ''}`.toLowerCase();
    if (upstream === 401 || text.includes('expired')) return 'EXPIRED';
    if (text.includes('revoked')) return 'REVOKED';
    return null;
  }
}

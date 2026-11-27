import { describeBankAccount, normalizeIban, ownIbanMap } from './iban';

describe('iban helpers', () => {
  it('normalises IBANs and rejects junk', () => {
    expect(normalizeIban(' es91 2100 0418 4502 0005 1332 ')).toBe(
      'ES9121000418450200051332',
    );
    expect(normalizeIban('123')).toBeNull();
    expect(normalizeIban(undefined)).toBeNull();
  });

  it('maps linked accounts to their IBANs', () => {
    const map = ownIbanMap([
      {
        id: 'acc-1',
        bankAccountUid: 'u1',
        bankConnection: {
          accountsJson: JSON.stringify([
            { uid: 'u0', account_id: { iban: 'ES7620770024003102575766' } },
            { uid: 'u1', account_id: { iban: 'ES9121000418450200051332' } },
          ]),
        },
      },
      { id: 'acc-2', bankAccountUid: null, bankConnection: null },
      {
        id: 'acc-3',
        bankAccountUid: 'u3',
        bankConnection: { accountsJson: 'not json' },
      },
    ]);
    expect([...map]).toEqual([['ES9121000418450200051332', 'acc-1']]);
  });

  describe('describeBankAccount', () => {
    it("uses the bank's name for the account and the last IBAN digits", () => {
      expect(
        describeBankAccount(
          {
            name: 'Cuenta Nómina',
            cash_account_type: 'CACC',
            account_id: { iban: 'ES9121000418450200051332' },
          },
          'Abanca',
        ),
      ).toEqual({ name: 'Cuenta Nómina ··1332', type: 'DEBIT' });
    });

    it('makes a card a credit account, falling back to product or bank name', () => {
      expect(
        describeBankAccount(
          { product: 'Visa Classic', cash_account_type: 'CARD' },
          'Abanca',
        ),
      ).toEqual({ name: 'Visa Classic', type: 'CREDIT' });
      expect(describeBankAccount({}, 'Abanca')).toEqual({
        name: 'Abanca',
        type: 'DEBIT',
      });
    });
  });
});

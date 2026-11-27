import { PatternDetectionService } from './pattern-detection.service';

describe('PatternDetectionService.detectMccPatterns', () => {
  const service = new PatternDetectionService({} as any);
  let n = 0;
  const txs = (count: number, mcc: string | null, categoryId: string) =>
    Array.from({ length: count }, () => ({
      id: `tx-${n++}`,
      categoryId,
      merchantCategoryCode: mcc,
    }));

  it('suggests a rule for a code that lands in one category', () => {
    const result = service.detectMccPatterns([
      ...txs(9, '5411', 'groceries'),
      ...txs(1, '5411', 'household'),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      patternType: 'mcc',
      categoryId: 'groceries',
      matchCount: 9,
      conditions: {
        operator: 'AND',
        conditions: [{ field: 'mcc', operator: 'equals', value: '5411' }],
      },
    });
    expect(result[0].confidence).toBeGreaterThanOrEqual(90);
    expect(result[0].confidence).toBeLessThanOrEqual(99);
  });

  it('skips codes spread over several categories, or seen too rarely', () => {
    expect(
      service.detectMccPatterns([
        ...txs(6, '5999', 'gifts'),
        ...txs(4, '5999', 'household'),
        ...txs(4, '5912', 'health'),
        ...txs(8, null, 'health'),
      ]),
    ).toHaveLength(0);
  });

  it('leaves transfers out', () => {
    const transfers = txs(6, '6012', 'savings').map((t) => ({
      ...t,
      isTransfer: true,
    }));
    expect(service.detectMccPatterns(transfers)).toHaveLength(0);
  });
});

export type StatisticType = 'click' | 'referrer' | 'browser' | 'os' | 'device' | 'country';

export interface Statistic {
  id: string;
  linkId: string;
  type: StatisticType;
  data: Record<string, unknown>;
  createdAt: string;
}

export interface LinkStatistics {
  totalClicks: number;
  statistics: Statistic[];
}

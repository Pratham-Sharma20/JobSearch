import { Card } from './ui/Card';

interface StatItem {
  label: string;
  value: string;
  trend?: string;
}

export function StatsBar({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <Card key={i} variant="feature" className="flex flex-col gap-2 p-8">
          <div className="text-muted text-[16px] font-sans font-medium">{stat.label}</div>
          <div className="text-ink font-display text-4xl">{stat.value}</div>
          {stat.trend && (
            <div className="text-primary font-sans text-[14px] font-medium mt-1">
              {stat.trend}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

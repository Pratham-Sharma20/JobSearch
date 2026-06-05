import { ArrowRight, Code, Database, Layout, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatsBar } from '../components/StatsBar';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Active Jobs', value: '4,281', trend: '+12% this week' },
  { label: 'Companies', value: '852', trend: 'Top tier tech only' },
  { label: 'New Today', value: '342', trend: 'Updated hourly' },
];

const categories = [
  { name: 'Engineering', icon: <Code size={20} />, count: '2.1k' },
  { name: 'Design', icon: <Layout size={20} />, count: '842' },
  { name: 'Data', icon: <Database size={20} />, count: '654' },
  { name: 'Product', icon: <Smartphone size={20} />, count: '432' },
];

export function Dashboard() {
  return (
    <div className="flex flex-col gap-16 md:gap-24">
      {/* Hero Section */}
      <section className="bg-canvas py-12 md:py-20 flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1 flex flex-col items-start">
          <Badge variant="coral" className="mb-6">Waitlist open</Badge>
          <h1 className="text-5xl md:text-6xl font-display font-medium text-ink leading-[1.05] tracking-tight mb-6">
            Find internships that actually match you
          </h1>
          <p className="text-xl text-body mb-8 max-w-xl">
            We curate the best early-career roles at top-tier companies. No noise, just the opportunities that matter.
          </p>
          <div className="flex gap-4">
            <Link to="/jobs">
              <Button variant="primary" className="h-12 px-8 text-base">Browse Jobs</Button>
            </Link>
            <Link to="/alerts">
              <Button variant="secondary" className="h-12 px-8 text-base">Set up Alerts</Button>
            </Link>
          </div>
        </div>
        
        {/* Right side illustration / code window equivalent */}
        <div className="flex-1 w-full max-w-lg">
          <div className="bg-surface-dark rounded-xl p-8 shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500 border border-surface-dark-soft">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-[#c64545]" />
              <div className="w-3 h-3 rounded-full bg-[#d4a017]" />
              <div className="w-3 h-3 rounded-full bg-[#5db872]" />
            </div>
            <div className="font-mono text-sm text-on-dark-soft space-y-4">
              <p><span className="text-primary">const</span> <span className="text-accent-teal">match</span> = <span className="text-primary">await</span> engine.<span className="text-accent-amber">findRole</span>({'{'}</p>
              <p className="pl-4">skills: [<span className="text-success">'React'</span>, <span className="text-success">'TypeScript'</span>],</p>
              <p className="pl-4">level: <span className="text-success">'Internship'</span>,</p>
              <p className="pl-4">tier: <span className="text-success">'Fortune 500'</span></p>
              <p>{'}'});</p>
              <p className="pt-4 text-success">// Found: Software Engineering Intern at Anthropic</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section>
        <StatsBar stats={stats} />
      </section>

      {/* Categories */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-display font-medium text-ink">Explore by Category</h2>
          <Link to="/jobs" className="text-primary hover:underline font-medium flex items-center gap-1 text-[14px]">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Card key={cat.name} variant="feature" className="p-6 hover:border-primary/30 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-canvas border border-hairline flex items-center justify-center text-ink mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                {cat.icon}
              </div>
              <h3 className="font-sans font-medium text-lg text-ink mb-1">{cat.name}</h3>
              <p className="text-muted text-[14px]">{cat.count} open roles</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Band */}
      <section className="bg-primary rounded-2xl p-12 md:p-16 flex flex-col items-center text-center">
        <h2 className="text-4xl md:text-5xl font-display font-medium text-on-primary mb-6 max-w-2xl">
          Ready to start your career journey?
        </h2>
        <p className="text-on-primary/90 text-lg mb-8 max-w-xl">
          Join thousands of students finding their dream roles at the world's most innovative companies.
        </p>
        <Link to="/register">
          <Button className="bg-canvas text-ink hover:bg-surface-soft h-12 px-8 text-base border-none">
            Create free account
          </Button>
        </Link>
      </section>
    </div>
  );
}

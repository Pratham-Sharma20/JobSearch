import { BellRing } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export function Alerts() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-surface-card rounded-full flex items-center justify-center mx-auto mb-6">
          <BellRing size={28} className="text-primary" />
        </div>
        <h1 className="text-4xl font-display font-medium text-ink mb-4">Job Alerts</h1>
        <p className="text-body text-lg">Get notified immediately when top companies post roles matching your criteria.</p>
      </div>

      <Card variant="feature" className="p-8">
        <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-2">
            <label className="font-sans font-medium text-[14px] text-ink">Keywords / Role</label>
            <Input placeholder="e.g. Software Engineering Intern" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-sans font-medium text-[14px] text-ink">Company (Optional)</label>
            <Input placeholder="e.g. Google, Stripe" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-sans font-medium text-[14px] text-ink">Email Address</label>
            <Input type="email" placeholder="you@university.edu" />
          </div>

          <Button variant="primary" className="mt-4 w-full h-12 text-base">
            Create Alert
          </Button>
        </form>
      </Card>
    </div>
  );
}

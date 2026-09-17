import { useState } from 'react';
import {
  Settings as SettingsIcon, UserPlus, UserMinus, Palette, User,
  ShieldCheck, RefreshCw, Building2, BadgeCheck, GripVertical, AlertTriangle, RotateCcw, Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/store';
import { useHasRole } from '@/store';
import type { UserRole } from '@/types';
import { cn } from '@/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};
const fadeUpVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const roles: UserRole[] = ['editor', 'warehouse', 'customer'];

function roleLabel(r: UserRole) {
  return r === 'editor' ? 'Editor' : r === 'warehouse' ? 'Warehouse' : 'Customer';
}

export default function SettingsPage() {
  const s = useAppStore(state => state);
  const isEditor = useHasRole(['editor']);
  const isWarehouse = useHasRole(['editor', 'warehouse']);
  const u = s.currentUser!;

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUpVariants} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-royal-primary/10 dark:bg-crimson-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-2 border surface-border">
            <SettingsIcon className="w-3.5 h-3.5" /> System Console
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">System &amp; Workspace Settings</h2>
          <p className="text-xs sm:text-sm text-muted mt-1">Profile management, active theme configuration, role permissions, and workspace controls.</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUpVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ProfileCard />

        <div className="lg:col-span-2 space-y-5">
          <ThemePanel />
          {isWarehouse && <ShiftPanel />}
          {isEditor && <UserManagement />}
          <DangerZone />
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProfileCard() {
  const s = useAppStore();
  const u = s.currentUser!;
  const initials = u.name.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2);
  const roleTone: Record<UserRole, string> = {
    editor: 'bg-royal-primary/10 text-royal-primary dark:bg-crimson-primary/20 dark:text-white',
    warehouse: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    customer: 'bg-status-green/15 text-status-green',
  } as const;
  return (
    <div className="stat-card shadow-card">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-20 h-20 rounded-2xl bg-royal-primary text-white text-2xl font-black flex items-center justify-center shadow-lg shadow-royal-primary/20">
          {initials}
        </div>
        <div className="min-w-0">
          <h3 className="text-xl font-black truncate">{u.name}</h3>
          <p className="text-xs text-muted truncate">{u.email}</p>
          <span className={cn('badge-pill mt-2', roleTone[u.role])}>
            <ShieldCheck className="w-3.5 h-3.5" /> {roleLabel(u.role)}
          </span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        <Row k={<User className="w-4 h-4" />} label="Display Name" value={u.name} />
        <Row k={<Building2 className="w-4 h-4" />} label="Department" value={u.dept ?? u.department ?? '—'} />
        <Row k={<BadgeCheck className="w-4 h-4" />} label="User ID" value={u.id} mono />
        <Row k={<SettingsIcon className="w-4 h-4" />} label="Active Shift" value={s.activeShift} />
        <Row k={<Palette className="w-4 h-4" />} label="Theme" value={s.theme === 'dark' ? 'Crimson Noir (Dark)' : 'Royal Velvet (Light)'} />
      </ul>
    </div>
  );
}

function Row({ k, label, value, mono }: { k: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <li className="flex items-start justify-between gap-3 rounded-xl border surface-border px-3 py-2 surface">
      <span className="text-muted flex items-center gap-2 shrink-0">{k}<span>{label}</span></span>
      <span className={cn('font-semibold text-right break-all', mono && 'font-mono text-xs')}>{value}</span>
    </li>
  );
}

function ThemePanel() {
  const s = useAppStore();
  const opt = [
    { id: 'light' as const, label: 'Royal Velvet', desc: 'Light porcelain with deep maroon accents.', grad: 'from-[#FAFAFA] to-white', stroke: 'border-[#500B18]', chip: 'bg-[#500B18] text-white' },
    { id: 'dark' as const, label: 'Crimson Noir', desc: 'OLED dark with glowing crimson palette.', grad: 'from-[#0D0D0D] to-[#18181A]', stroke: 'border-[#B22234]', chip: 'bg-[#B22234] text-white' },
  ];
  return (
    <section className="stat-card shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">Theme</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {opt.map(o => {
          const active = s.theme === o.id;
          return (
            <button key={o.id} onClick={() => s.setTheme(o.id)} className={cn(
              'text-left rounded-2xl border-2 p-4 transition-all bg-gradient-to-br',
              o.grad,
              active ? o.stroke : 'surface-border hover:surface-border/80',
            )}>
              <div className="flex items-center justify-between">
                <span className={cn('badge-pill', o.chip)}>{o.label}</span>
                {active && <span className="badge-pill bg-status-green/20 text-status-green"><ShieldCheck className="w-3 h-3" /> Active</span>}
              </div>
              <p className={cn('mt-3 text-sm font-semibold', o.id === 'dark' ? 'text-white/90' : 'text-obsidian')}>{o.desc}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ShiftPanel() {
  const s = useAppStore();
  return (
    <section className="stat-card shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <GripVertical className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">Work Shift</h3>
        <span className="ml-auto text-xs text-muted">Affects new issuance log entries</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(['Shift A', 'Shift B'] as const).map(sh => {
          const active = s.activeShift === sh;
          return (
            <button key={sh} onClick={() => s.setActiveShift(sh)} className={cn(
              'rounded-2xl border-2 p-4 text-left transition-all',
              active ? 'border-royal-primary bg-royal-primary/[0.04] dark:bg-crimson-primary/10 dark:border-crimson-primary' : 'surface-border hover:surface-border/80',
            )}>
              <div className="flex items-center justify-between">
                <p className="font-extrabold text-lg">{sh}</p>
                {active && <span className="badge-pill bg-status-green/15 text-status-green">Active</span>}
              </div>
              <p className="text-sm text-muted mt-1">
                {sh === 'Shift A' ? 'Day shift (06:00 – 14:00)' : 'Night shift (14:00 – 22:00)'}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function UserManagement() {
  const s = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [dept, setDept] = useState('');
  const [password, setPassword] = useState('mpw@123');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    s.addUser({ name: name.trim(), email: email.trim(), role, dept: dept.trim() || 'General', password });
    setName(''); setEmail(''); setRole('customer'); setDept(''); setPassword('mpw@123');
  };

  const roleBadge: Record<UserRole, string> = {
    editor: 'bg-royal-primary/10 text-royal-primary dark:bg-crimson-primary/20 dark:text-white',
    warehouse: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    customer: 'bg-status-green/15 text-status-green',
  };

  return (
    <section className="stat-card shadow-card">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">User Management</h3>
          <span className="badge-pill bg-black/5 dark:bg-white/10">{s.users.length} users</span>
        </div>
      </div>
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border surface-border">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="h-11 px-3 rounded-xl border surface-border surface outline-none focus:ring-2 focus:ring-royal-primary/30 lg:col-span-1 sm:col-span-2" required />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="h-11 px-3 rounded-xl border surface-border surface outline-none focus:ring-2 focus:ring-royal-primary/30 lg:col-span-1 sm:col-span-2" required />
        <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="h-11 px-3 rounded-xl border surface-border surface outline-none focus:ring-2 focus:ring-royal-primary/30">
          {roles.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
        </select>
        <input value={dept} onChange={e => setDept(e.target.value)} placeholder="Dept / Project" className="h-11 px-3 rounded-xl border surface-border surface outline-none focus:ring-2 focus:ring-royal-primary/30" />
        <button type="submit" className="btn-primary h-11 px-5 inline-flex items-center justify-center gap-2"><UserPlus className="w-4 h-4" /> Add User</button>
      </form>
      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b surface-border text-xs uppercase tracking-wider text-muted">
              <th className="text-left font-semibold px-5 py-3">Name</th>
              <th className="text-left font-semibold px-3 py-3">Email</th>
              <th className="text-left font-semibold px-3 py-3">Department</th>
              <th className="text-left font-semibold px-3 py-3">Role</th>
              <th className="text-center font-semibold px-3 py-3">Active</th>
              <th className="text-right font-semibold px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {s.users.map(usr => (
              <tr key={usr.id} className="border-b surface-border last:border-0">
                <td className="px-5 py-3 font-semibold">{usr.name}</td>
                <td className="px-3 py-3 text-muted">{usr.email}</td>
                <td className="px-3 py-3">{usr.dept ?? usr.department ?? '—'}</td>
                <td className="px-3 py-3">
                  <select
                    value={usr.role}
                    onChange={e => s.updateUser(usr.id, { role: e.target.value as UserRole })}
                    disabled={usr.id === s.currentUser?.id}
                    className="badge-pill outline-none cursor-pointer disabled:opacity-60"
                  >
                    {roles.map(r => <option key={r} value={r} className={roleBadge[r]}>{roleLabel(r)}</option>)}
                  </select>
                </td>
                <td className="px-3 py-3 text-center">
                  <button onClick={() => s.updateUser(usr.id, { active: !usr.active })} className={cn('w-12 h-6 rounded-full relative transition-colors', usr.active ? 'bg-status-green' : 'bg-muted/40')}>
                    <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all', usr.active ? 'left-[26px]' : 'left-0.5')} />
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => {
                      if (usr.id === s.currentUser?.id) return;
                      if (window.confirm(`Remove user ${usr.name}?`)) s.deleteUser(usr.id);
                    }}
                    disabled={usr.id === s.currentUser?.id}
                    className="btn-outline h-8 px-3 text-xs border-status-red/50 text-status-red hover:bg-status-red/10 disabled:opacity-50"
                  >
                    <UserMinus className="w-3.5 h-3.5" /> Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DangerZone() {
  const s = useAppStore();
  const reset = () => {
    if (window.confirm('Reset ALL store data (inventory, users, logs, requisitions) to seed defaults? This cannot be undone.')) {
      s.resetToSeed();
    }
  };
  return (
    <section className="stat-card shadow-card border-status-red/30 dark:border-status-red/40">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-status-red/10 text-status-red flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-status-red">Danger Zone</h3>
            <p className="text-sm text-muted max-w-xl">Reset this workspace to factory seed data. All persisted state (inventory edits, user list, requisitions, issuance logs, and notifications) will be permanently deleted.</p>
          </div>
        </div>
        <button onClick={reset} className="btn-primary h-11 px-6 inline-flex items-center gap-2 bg-status-red hover:bg-status-red/90 whitespace-nowrap">
          <RotateCcw className="w-4 h-4" /> Reset to Seed
        </button>
      </div>
    </section>
  );
}

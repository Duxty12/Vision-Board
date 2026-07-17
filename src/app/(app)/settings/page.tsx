import type { Metadata } from 'next';
import {
  Settings,
  User,
  Palette,
  Mail,
  LogOut,
  ChevronRight,
  Pin,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Settings',
};

// ─── Settings section wrapper ─────────────────────────────────────────────────
function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden mb-5">
      <div className="px-6 py-4 border-b border-stone-100">
        <h2 className="font-display font-semibold text-stone-800 text-sm">{title}</h2>
      </div>
      <div className="divide-y divide-stone-100">{children}</div>
    </div>
  );
}

// ─── Settings row ─────────────────────────────────────────────────────────────
function SettingsRow({
  icon: Icon,
  label,
  description,
  action,
  id,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  action?: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50/60 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-cork-50 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-cork-600" />
        </div>
        <div>
          <div className="text-sm font-medium text-stone-800 font-sans">{label}</div>
          {description && (
            <div className="text-xs text-stone-400 font-sans mt-0.5">{description}</div>
          )}
        </div>
      </div>
      {action ?? <ChevronRight size={16} className="text-stone-300" />}
    </div>
  );
}

// ─── Board theme picker ───────────────────────────────────────────────────────
const BOARD_THEMES = [
  { id: 'cork',     label: 'Cork',     color: '#c8894a' },
  { id: 'linen',    label: 'Linen',    color: '#e8dcc8' },
  { id: 'gradient', label: 'Gradient', color: 'linear-gradient(135deg,#fdf4ff,#eff6ff)' },
  { id: 'dark',     label: 'Dark',     color: '#1a1c23' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 mb-8">
        <Settings size={22} className="text-cork-500" />
        <h1 className="font-display text-2xl font-bold text-stone-900">Settings</h1>
      </div>

      {/* ── Profile ── */}
      <SettingsSection title="Profile">
        {/* User card */}
        <div className="px-6 py-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cork-500 flex items-center justify-center text-white text-xl font-bold font-display shadow-sticky shrink-0">
            U
          </div>
          <div>
            <div className="font-display font-semibold text-stone-900">Your Name</div>
            <div className="text-sm text-stone-400 font-sans">user@example.com</div>
            <div className="text-xs text-stone-300 font-sans mt-0.5">
              Member since — <span className="text-cork-500">Clerk profile synced here</span>
            </div>
          </div>
        </div>
        <SettingsRow
          id="settings-edit-profile"
          icon={User}
          label="Edit profile"
          description="Update your name and avatar via Clerk"
        />
      </SettingsSection>

      {/* ── Board Appearance ── */}
      <SettingsSection title="Board Appearance">
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <Palette size={15} className="text-cork-500" />
            <span className="text-sm font-medium text-stone-700 font-sans">Board Theme</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {BOARD_THEMES.map((theme) => (
              <button
                key={theme.id}
                id={`theme-${theme.id}`}
                className="group flex flex-col items-center gap-2"
                aria-label={`${theme.label} theme`}
              >
                <div
                  className="w-full h-12 rounded-xl border-2 border-transparent group-hover:border-cork-400 transition-all duration-200 shadow-sm"
                  style={{ background: theme.color }}
                />
                <span className="text-xs text-stone-500 group-hover:text-stone-800 font-sans transition-colors duration-200">
                  {theme.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </SettingsSection>

      {/* ── Email ── */}
      <SettingsSection title="Email">
        <SettingsRow
          id="settings-email-board"
          icon={Mail}
          label="Email me my board"
          description="Receive a snapshot of your starred cards"
          action={
            <button
              id="email-board-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-sans text-white transition-all duration-200 hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #c07423, #d9902e)',
                boxShadow: '0 2px 8px rgba(192,116,35,0.3)',
              }}
            >
              <Mail size={12} />
              Send now
            </button>
          }
        />
      </SettingsSection>

      {/* ── Account ── */}
      <SettingsSection title="Account">
        <SettingsRow
          id="settings-sign-out"
          icon={LogOut}
          label="Sign out"
          description="You'll be redirected to the sign-in page"
          action={
            <button
              id="sign-out-btn"
              className="px-3 py-1.5 rounded-lg text-xs font-medium font-sans text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-all duration-200"
            >
              Sign out
            </button>
          }
        />
      </SettingsSection>

      {/* ── Footer note ── */}
      <div className="flex items-center justify-center gap-2 mt-8 text-stone-400">
        <Pin size={13} className="text-cork-400" />
        <span className="text-xs font-sans">StillBoard — built for dreamers who do.</span>
      </div>
    </div>
  );
}

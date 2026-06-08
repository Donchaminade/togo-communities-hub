import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { SHARE_NETWORKS, copyToClipboard } from '../../lib/share';
import ShareNetworkIcon, { SHARE_HOVER_STYLES } from '../ui/ShareNetworkIcon';
import { useToast } from '../ui/Toast';

interface EventShareSidebarProps {
  url: string;
  title: string;
}

const COMPACT_NETWORKS = SHARE_NETWORKS.filter((n) =>
  ['x', 'facebook', 'linkedin', 'whatsapp'].includes(n.id),
);

const BASE_BTN =
  'group grid h-11 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-all duration-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';

export default function EventShareSidebar({ url, title }: EventShareSidebarProps) {
  const { notify } = useToast();
  const [copied, setCopied] = useState(false);
  const text = title;

  const handleCopy = async () => {
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      notify('Lien copié.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } else {
      notify('Impossible de copier le lien.', 'error');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Partager l&apos;événement</p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {COMPACT_NETWORKS.map((network) => (
          <a
            key={network.id}
            href={network.buildUrl(url, text)}
            target="_blank"
            rel="noreferrer noopener"
            title={network.label}
            aria-label={`Partager sur ${network.label}`}
            className={`${BASE_BTN} ${SHARE_HOVER_STYLES[network.id]}`}
          >
            <ShareNetworkIcon network={network.id} className="h-[18px] w-[18px]" />
          </a>
        ))}
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:border-emerald-500 hover:bg-emerald-500 hover:text-white dark:border-slate-700 dark:text-slate-300`}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Lien copié' : 'Copier le lien'}
      </button>
    </div>
  );
}

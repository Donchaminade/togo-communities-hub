import { Check, Copy, Share2 } from 'lucide-react';
import { useState } from 'react';
import { SHARE_NETWORKS, communityShareText, communityShareUrl, copyToClipboard, type ShareableCommunity } from '../../lib/share';
import ShareNetworkIcon, { SHARE_HOVER_STYLES } from '../ui/ShareNetworkIcon';
import { useToast } from '../ui/Toast';

interface CommunityShareSidebarProps {
  community: ShareableCommunity;
}

const COMPACT_NETWORKS = SHARE_NETWORKS.filter((n) =>
  ['x', 'facebook', 'linkedin', 'whatsapp'].includes(n.id),
);

const BASE_BTN =
  'group grid h-10 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-all duration-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';

export default function CommunityShareSidebar({ community }: CommunityShareSidebarProps) {
  const { notify } = useToast();
  const [copied, setCopied] = useState(false);
  const url = communityShareUrl(community);
  const text = communityShareText(community);

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
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
          <Share2 className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Partager</h3>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2">
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
        <button
          type="button"
          onClick={handleCopy}
          title="Copier le lien"
          aria-label="Copier le lien"
          className={`${BASE_BTN} hover:border-emerald-500 hover:bg-emerald-500 hover:text-white`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

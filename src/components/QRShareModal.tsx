import React, { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, ExternalLink, Smartphone } from 'lucide-react';
import { LottieIcon } from './LottieIcon';

interface QRShareModalProps {
  open: boolean;
  onClose: () => void;
  publicUrl: string | null;
}

export const QRShareModal: React.FC<QRShareModalProps> = ({ open, onClose, publicUrl }) => {
  const [copied, setCopied] = useState(false);

  const activeUrl = useMemo(() => {
    if (typeof window === 'undefined') return publicUrl || '';
    const origin = window.location.origin;
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
    if (!isLocal) return origin;
    if (publicUrl && !publicUrl.includes('localhost')) return publicUrl;
    return origin;
  }, [publicUrl]);

  const isLocalhost = activeUrl.includes('localhost') || activeUrl.includes('127.0.0.1');

  if (!open) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(activeUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <h2 className="font-display text-lg font-bold text-slate-900">
              Tester sur smartphone
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer shrink-0"
          >
            <LottieIcon animation="close" size={20} tone="ink" />
          </button>
        </div>

        {isLocalhost ? (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-2 text-xs font-semibold text-amber-950">
            <p className="font-bold">
              Vous visualisez actuellement l’app en local ({activeUrl}).
            </p>
            <p>
              Pour générer un QR code scannable depuis un téléphone, ouvrez l’URL publique
              partagée (Vercel, Netlify ou lien public Cloud Run). Le QR code s’adaptera
              automatiquement à cette URL !
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-3xl bg-white border-2 border-slate-200 shadow-xs">
              <QRCodeSVG
                value={activeUrl}
                size={184}
                bgColor="#FFFFFF"
                fgColor="#0F172A"
                level="M"
              />
            </div>
            <p className="text-xs font-bold text-slate-600 text-center">
              Scannez ce QR code avec l’appareil photo d’un iPhone ou d’un Android pour lancer
              LumiMath en plein écran.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2">
          <span className="flex-1 text-xs font-bold text-slate-700 truncate px-2">
            {activeUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[44px] px-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
          >
            {copied ? <LottieIcon animation="success" size={18} tone="inverse" trigger="mount" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copié' : 'Copier'}</span>
          </button>
        </div>

        {!isLocalhost && (
          <a
            href={activeUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full min-h-[44px] rounded-2xl bg-emerald-50 text-emerald-700 font-display text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Ouvrir le lien public</span>
          </a>
        )}
      </div>
    </div>
  );
};

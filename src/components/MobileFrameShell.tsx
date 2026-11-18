import React, { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Sparkles } from 'lucide-react';
import { LottieIcon } from './LottieIcon';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileFrameShellProps {
  children: React.ReactNode;
  publicUrl: string | null;
  onOpenQRModal: () => void;
}

export const MobileFrameShell: React.FC<MobileFrameShellProps> = ({
  children,
  publicUrl,
  onOpenQRModal,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const liveUrl = useMemo(() => {
    if (typeof window === 'undefined') return publicUrl || '';
    const origin = window.location.origin;
    if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) return origin;
    if (publicUrl && !publicUrl.includes('localhost')) return publicUrl;
    return origin;
  }, [publicUrl]);

  const isLocal = liveUrl.includes('localhost') || liveUrl.includes('127.0.0.1');

  return (
    <div className="min-h-[100dvh] w-full bg-[#F3F4F6] flex items-center justify-center lg:p-6">
      <div className="w-full lg:max-w-5xl flex items-center justify-center gap-10">
        {/* Mobile Viewport: Edge-to-edge on phone, clean centered smartphone frame on desktop */}
        <div className="w-full h-[100dvh] lg:w-[390px] lg:h-[812px] lg:max-h-[90dvh] lg:rounded-[44px] lg:border-[10px] lg:border-[#111827] lg:shadow-2xl bg-white overflow-hidden relative flex flex-col shrink-0">
          {children}
        </div>

        {/* Desktop Companion Panel */}
        <aside className="hidden lg:flex flex-col max-w-sm space-y-5">
          <div className="space-y-2">
            <span className="text-xs font-extrabold tracking-wide text-[#16A34A]">
              APPRENTISSAGE ACTIF · 6–12 ANS
            </span>
            <h2 className="font-display text-3xl font-bold text-[#111827] leading-tight">
              LumiMath
            </h2>
            <p className="text-sm font-semibold text-[#4B5563] leading-relaxed">
              Pédagogie par découverte et manipulation tactile inspirée de Brilliant : observer,
              expérimenter, comprendre et appliquer du CP à la 6e.
            </p>
          </div>

          {/* Live Smartphone QR Card */}
          <div className="rounded-3xl bg-white border border-[#E5E7EB] p-5 space-y-3">
            <div className="flex items-center gap-2 font-display font-bold text-[#111827]">
              <Smartphone className="w-5 h-5 text-[#16A34A]" />
              <span>Tester sur smartphone</span>
            </div>

            {isLocal ? (
              <div className="rounded-2xl bg-[#FEF3C7] border border-[#FCD34D] p-3 text-xs font-semibold text-[#92400E] leading-relaxed">
                Mode local détecté. Ouvrez le lien public pour afficher le QR code scannable sur
                téléphone.
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-2xl bg-white border border-[#E5E7EB] shrink-0">
                  <QRCodeSVG value={liveUrl} size={96} bgColor="#FFFFFF" fgColor="#111827" />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <div className="text-xs font-bold text-[#111827]">
                    Scannez avec votre caméra
                  </div>
                  <p className="text-[11px] font-semibold text-[#6B7280] leading-snug">
                    Compatible iOS Safari et Android Chrome en mode PWA plein écran.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenQRModal}
                    className="text-xs font-extrabold text-[#16A34A] hover:text-[#15803D] cursor-pointer"
                  >
                    Agrandir le QR Code →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3-Minute Demo Guide */}
          <div className="rounded-3xl bg-white border border-[#E5E7EB] p-5 space-y-3">
            <div className="flex items-center gap-2 font-display font-bold text-[#111827] text-sm">
              <LottieIcon animation="book" size={20} tone="xp" fallback={<Sparkles className="w-4 h-4 text-[#EAB308]" />} />
              <span>Parcours de démonstration</span>
            </div>
            <ol className="space-y-2 text-xs font-semibold text-[#4B5563] list-decimal list-inside">
              <li>Créez un profil ou cliquez sur « Essayer directement (Mode démo) ».</li>
              <li>Lancez une notion d’Addition, Multiplication ou Géométrie.</li>
              <li>Observez la démonstration puis manipulez directement les éléments.</li>
              <li>Touchez « Pourquoi ? » pour voir l’écran d’explication animée.</li>
            </ol>
          </div>

          {!isInstalled && isInstallable && (
            <button
              type="button"
              onClick={install}
              className="min-h-[46px] rounded-full bg-[#111827] hover:bg-[#1F2937] text-white font-display text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <LottieIcon animation="download" size={20} tone="inverse" />
              <span>Installer l’application PWA</span>
            </button>
          )}
        </aside>
      </div>
    </div>
  );
};

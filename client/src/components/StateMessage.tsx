// États de chargement, d'erreur et "vide", réutilisés sur les deux pages.
import type { ReactNode } from 'react';
import { Icon } from './Icon';

export function Loader({ label = 'Chargement des lieux…' }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-5 py-24 text-ash">
      <span className="loader-orbit" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

type StateMessageProps = {
  tone?: 'neutral' | 'error';
  title: string;
  children?: ReactNode;
  action?: ReactNode;
};

export function StateMessage({ tone = 'neutral', title, children, action }: StateMessageProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-[1.75rem] border border-white/8 bg-forest/40 px-6 py-14 text-center"
    >
      <span className={tone === 'error' ? 'text-red-300' : 'text-acid'}>
        <Icon name={tone === 'error' ? 'alert' : 'moon-star'} className="size-8" />
      </span>
      <h3 className="font-display text-3xl font-bold text-mist">{title}</h3>
      {children && <div className="text-ash">{children}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

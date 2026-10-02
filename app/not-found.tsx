import Link from 'next/link';
import { GlowButton } from '@/components/ui/GlowButton';
import { PageShell } from '@/components/layout/PageShell';
import { Panel } from '@/components/ui/Panel';

export default function NotFound() {
  return (
    <PageShell>
      <div className="py-20">
        <Panel frame className="mx-auto max-w-xl p-10 text-center">
          <p className="kicker">404</p>
          <h1 className="display mt-4 text-[1.8rem] uppercase text-white">This shadow does not exist</h1>
          <p className="mx-auto mt-5 max-w-md text-[0.86rem] leading-relaxed text-echo-muted">
            The page you were looking for is not part of the ECHO AI² experiment. Head back and meet an AI Shadow
            instead.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <GlowButton href="/">Back to home</GlowButton>
            <GlowButton href="/my-echo" variant="ghost">
              My echo
            </GlowButton>
          </div>
          <p className="mt-8 text-[0.7rem] text-echo-faint">
            Looking for the leaderboard?{' '}
            <Link href="/world" className="text-echo-muted underline decoration-white/20 underline-offset-4">
              Open the world
            </Link>
          </p>
        </Panel>
      </div>
    </PageShell>
  );
}

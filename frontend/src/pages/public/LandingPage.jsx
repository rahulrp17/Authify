import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Fingerprint,
  KeyRound,
  MailCheck,
  Minus,
  MonitorSmartphone,
  Plus,
  RefreshCw,
  ShieldCheck,
  Timer,
  Zap,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Reveal } from '../../components/common/Reveal';
import { SectionHeading } from '../../components/common/SectionHeading';
import { AuthConsole } from '../../components/marketing/AuthConsole';
import { Marquee } from '../../components/marketing/Marquee';
import { cn } from '../../utils/cn';

const features = [
  {
    icon: MailCheck,
    code: '01',
    title: 'Verified onboarding',
    description:
      'Every identity starts with a six-digit email code. Codes expire in ten minutes and lock after five wrong attempts.',
    footer: 'OTP / HMAC hashed',
    accent: 'text-acid',
  },
  {
    icon: MonitorSmartphone,
    code: '02',
    title: 'Session command',
    description:
      'See every device holding a live session, when it was last used, and revoke it without touching the others.',
    footer: 'JWT + JTI / revocable',
    accent: 'text-hot-pink',
  },
  {
    icon: RefreshCw,
    code: '03',
    title: 'Recovery without leaks',
    description:
      'Forgot-password requests return the same answer whether an account exists or not. Reset tokens are single-use.',
    footer: 'Generic responses / single-use',
    accent: 'text-inferno',
  },
  {
    icon: ShieldCheck,
    code: '04',
    title: 'Request integrity',
    description:
      'CSRF double-submit protection, strict validation, and layered rate limits sit in front of every mutation.',
    footer: 'CSRF / Zod / rate limits',
    accent: 'text-volt',
  },
];

const defenseLayers = [
  { icon: KeyRound, label: 'Password hashing', detail: 'bcrypt / 12 rounds', status: 'Active' },
  { icon: Timer, label: 'OTP integrity', detail: 'HMAC-SHA256 / 10 min', status: 'Active' },
  { icon: MonitorSmartphone, label: 'Session revocation', detail: 'JTI records / instant', status: 'Active' },
  { icon: ShieldCheck, label: 'CSRF shield', detail: 'Double-submit cookie', status: 'Active' },
  { icon: Zap, label: 'Rate limiting', detail: 'Per-route / per-IP', status: 'Active' },
];

const never = [
  'Store plaintext passwords',
  'Return session tokens to JavaScript',
  'Keep OTPs in readable form',
  'Reveal whether an email exists during recovery',
];

const steps = [
  {
    code: '01',
    title: 'Enroll',
    description:
      'Create an account with your name, email, and a strong password. A six-digit code confirms the address.',
    detail: 'No account is usable until the email is verified.',
  },
  {
    code: '02',
    title: 'Sign in',
    description:
      'Exchange credentials for an HttpOnly session cookie. Choose a one-hour session or seven-day remember mode.',
    detail: 'Tokens stay out of local storage and JavaScript reach.',
  },
  {
    code: '03',
    title: 'Control',
    description:
      'Rotate your password, inspect active devices, revoke access, or delete the identity entirely.',
    detail: 'Every action takes effect on the server immediately.',
  },
];

const specs = [
  { value: '12', label: 'bcrypt rounds' },
  { value: '6', label: 'digit OTP' },
  { value: '10m', label: 'OTP lifetime' },
  { value: '0', label: 'tokens in storage' },
];

const faqs = [
  {
    question: 'Where is my session token stored?',
    answer:
      'In an HttpOnly cookie. JavaScript cannot read it, so a cross-site scripting bug cannot lift the token out of local storage. Requests also carry a CSRF token that is validated server-side.',
  },
  {
    question: 'What happens after too many wrong OTP attempts?',
    answer:
      'After five invalid attempts the code is destroyed. Request a fresh code and the attempt counter resets. Codes also expire automatically after ten minutes.',
  },
  {
    question: 'Can I revoke a session on another device?',
    answer:
      'Yes. The Sessions page lists every live session with browser, platform, creation time, and last use. Revoke any device that is not the current one; revocation is immediate.',
  },
  {
    question: 'What happens when I change my password?',
    answer:
      'Every other session is revoked. The session performing the change stays alive so you are not signed out mid-action. Password reset follows the same rule and revokes all sessions.',
  },
  {
    question: 'Do you reveal whether an email exists?',
    answer:
      'No. Registration is the only flow that confirms an email is already in use. Verification and recovery responses are intentionally generic so they cannot be used to enumerate accounts.',
  },
  {
    question: 'What is this built with?',
    answer:
      'MongoDB, Express, React, and Node. Passwords use bcrypt, sessions use signed JWTs with tracked JTI records, and request bodies are validated with Zod before they reach the database.',
  },
];

export const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div>
      <section className="relative overflow-hidden border-b-2 border-line lg:flex lg:min-h-[calc(100svh-5.20rem)] lg:items-center">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-electric/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-hot-pink/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:py-10">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10">
            <div>
              <div className="mb-7 inline-flex items-center gap-3 border-2 border-line bg-surface px-3 py-2">
                <span className="h-2 w-2 animate-blink bg-acid" />
                <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-white">
                  Authentication / Rebuilt
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-muted">
                  v1.0
                </span>
              </div>

              <h1 className="font-display text-[clamp(3.2rem,7.6vw,6.6rem)] font-bold uppercase leading-[0.84] tracking-[-0.08em] text-white">
                <span className="block ">Your identity.</span>
                <span className="relative mt-3 block w-fit text-acid">
                  Your rules.
                  <span
                    className="absolute -right-2 top-1/2 -z-10 h-[0.5em] w-[1.35em] -translate-y-1/2 -skew-x-12 bg-hot-pink/30"
                    aria-hidden="true"
                  />
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-sm leading-7 text-muted sm:text-base">
                A complete authentication layer for people who refuse to hand
                over control. Verify, sign in, rotate, revoke, and delete —
                every action is explicit, immediate, and yours.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button to="/register" size="lg">
                  Create your identity
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button to="/#security" variant="outline" size="lg">
                  Inspect the security
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t-2 border-line pt-5">
                {[
                  { value: '12', label: 'bcrypt rounds' },
                  { value: '6', label: 'digit OTP' },
                  { value: 'JWT', label: 'JTI tracked' },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="font-display text-2xl font-bold leading-none tracking-[-0.05em] text-white">
                      {item.value}
                    </p>
                    <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div
                className="absolute -left-4 top-8 h-20 w-20 border-2 border-hot-pink bg-hot-pink/10"
                aria-hidden="true"
              />
              <div
                className="absolute -right-3 bottom-10 h-32 w-32 rounded-full bg-inferno/20 blur-2xl"
                aria-hidden="true"
              />

              <AuthConsole className="relative z-10 shadow-brutal-acid" />

              <div className="absolute -bottom-7 -left-4 z-20 border-2 border-line bg-void px-4 py-3 shadow-[4px_4px_0_0_#FF00E5]">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-hot-pink">
                  No token
                </p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white">
                  in storage
                </p>
              </div>

              <div className="absolute -right-4 top-24 z-20 hidden border-2 border-line bg-void px-4 py-3 shadow-[4px_4px_0_0_#39FF14] sm:block">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-acid">
                  Session
                </p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white">
                  revocable
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-b-2 border-line bg-acid text-void">
        <Marquee
          items={[
            'Secure by default',
            'No shared credentials',
            'Revoke any session',
            'Identity is infrastructure',
            'Zero shortcuts',
          ]}
          separator="✦"
          className="py-2.5 text-[10px]"
        />
      </div>

      <section id="platform" className="scroll-mt-32 border-b-2 border-line py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Platform // 01"
              title={
                <>
                  One control plane.
                  <br />
                  <span className="text-outline-pink">Zero loose ends.</span>
                </>
              }
              description="Four surfaces, one identity. Nothing is hidden behind a dashboard you cannot inspect."
            />
          </Reveal>

          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Reveal key={feature.code} delay={index * 0.06}>
                  <article className="group flex h-full flex-col border-2 border-line bg-surface p-5 transition-all hover:-translate-y-1 hover:border-acid hover:shadow-brutal-acid">
                    <div className="flex items-start justify-between">
                      <span className="flex h-11 w-11 items-center justify-center border-2 border-line bg-card">
                        <Icon className={cn('h-5 w-5', feature.accent)} aria-hidden="true" />
                      </span>
                      <span className="font-display text-2xl font-bold text-line transition-colors group-hover:text-acid">
                        {feature.code}
                      </span>
                    </div>

                    <h3 className="mt-8 font-display text-xl font-bold uppercase leading-none tracking-[-0.04em] text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-3 flex-1 text-xs leading-6 text-muted">
                      {feature.description}
                    </p>
                    <p className="mt-6 border-t-2 border-line pt-3 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                      {feature.footer}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="security"
        className="scroll-mt-32 border-b-2 border-line bg-surface py-20 lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <Reveal>
              <SectionHeading
                eyebrow="Security // 02"
                title={
                  <>
                    Security is
                    <br />
                    the product.
                  </>
                }
                description="Every layer is deliberate. No decorative badges, no invented certifications, no secret backdoors."
              />

              <div className="mt-8 space-y-3">
                {[
                  'Passwords are hashed with bcrypt before they touch the database.',
                  'OTPs are stored as HMAC digests, never as readable codes.',
                  'Sessions are signed JWTs backed by revocable server records.',
                  'Recovery responses are generic to prevent account enumeration.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 border-l-2 border-line pl-3">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-acid" aria-hidden="true" />
                    <p className="text-xs leading-6 text-muted">{item}</p>
                  </div>
                ))}
              </div>

              <Button to="/register" variant="outline" className="mt-8">
                Start with a verified identity
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="border-2 border-line bg-void">
                <div className="flex items-center justify-between border-b-2 border-line px-5 py-4">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-acid">
                      Defense // layers
                    </p>
                    <h3 className="mt-1 font-display text-lg font-bold uppercase tracking-[-0.03em] text-white">
                      Active protections
                    </h3>
                  </div>
                  <Badge variant="acid" dot>
                    Live
                  </Badge>
                </div>

                <ul className="divide-y divide-line">
                  {defenseLayers.map((layer) => {
                    const Icon = layer.icon;
                    return (
                      <li
                        key={layer.label}
                        className="flex items-center justify-between gap-4 px-5 py-4"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-muted" aria-hidden="true" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                              {layer.label}
                            </p>
                            <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-muted">
                              {layer.detail}
                            </p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-acid">
                          {layer.status}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <div className="border-t-2 border-line p-5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-hot-pink">
                    What we never do
                  </p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {never.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[10px] leading-5 text-muted">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 bg-hot-pink" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-32 border-b-2 border-line py-20 lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Flow // 03"
              title={
                <>
                  Three moves.
                  <br />
                  <span className="text-acid">Full control.</span>
                </>
              }
              description="From a blank slate to a revocable identity in under a minute."
            />
          </Reveal>

          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {steps.map((step, index) => (
              <Reveal key={step.code} delay={index * 0.08}>
                <article className="relative h-full border-2 border-line bg-surface p-6">
                  <span className="font-display text-[5rem] font-bold leading-none tracking-[-0.08em] text-line">
                    {step.code}
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-bold uppercase leading-none tracking-[-0.05em] text-white">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-xs leading-6 text-muted">{step.description}</p>
                  <p className="mt-6 border-t-2 border-line pt-3 text-[9px] font-bold uppercase tracking-[0.16em] text-acid">
                    {step.detail}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="mt-8 grid gap-3 border-2 border-line bg-card sm:grid-cols-2 lg:grid-cols-4">
              {specs.map((spec) => (
                <div key={spec.label} className="border-b-2 border-line p-5 last:border-b-0 sm:border-r-2 sm:last:border-r-0 lg:border-b-0">
                  <p className="font-display text-4xl font-bold leading-none tracking-[-0.07em] text-acid">
                    {spec.value}
                  </p>
                  <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                    {spec.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="faq" className="scroll-mt-32 border-b-2 border-line bg-surface py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12  lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
            <Reveal>
              <SectionHeading
                eyebrow="FAQ // 04"
                title={
                  <>
                    No fine
                    <br />
                    print.
                  </>
                }
                description="Direct answers about how the system behaves. If something is missing, the console will tell you."
              />
            </Reveal>

            <Reveal delay={0.08}>
              <div className="border-2  border-line">
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={faq.question}
                      className={cn(
                        'border-b-2 border-line  last:border-b-0',
                        isOpen && 'bg-void',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                        className="flex w-full items-center cursor-pointer justify-between gap-4 px-5 py-4 text-left"
                        aria-expanded={isOpen}
                      >
                        <span className="font-display text-sm font-bold uppercase tracking-[-0.01em] text-white">
                          {faq.question}
                        </span>
                        {isOpen ? (
                          <Minus className="h-4 w-4 shrink-0 text-acid" aria-hidden="true" />
                        ) : (
                          <Plus className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5">
                          <p className="max-w-2xl text-xs leading-6 text-muted">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-line bg-acid py-16 text-void lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.26em] text-void/60">
                <Fingerprint className="h-4 w-4" aria-hidden="true" />
                Ready when you are
              </p>
              <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.6rem,6vw,5.6rem)] font-bold uppercase leading-[0.88] tracking-[-0.08em]">
                Take control of your identity.
              </h2>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Button
                to="/register"
                size="lg"
                className="border-void bg-void text-acid! shadow-[4px_4px_0_0_#FF00E5] hover:bg-void hover:text-white! hover:shadow-[6px_6px_0_0_#FF00E5]"
              >
                Create identity
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                to="/login"
                variant="outline"
                size="lg"
                className="border-void text-void! hover:border-void hover:bg-void hover:text-acid!"
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="border-b-2 border-line bg-void">
        <Marquee
          items={[
            'Verify',
            'Authenticate',
            'Rotate',
            'Revoke',
            'Delete',
            'Repeat',
          ]}
          className="py-3 text-[11px] text-muted"
          reverse
        />
      </div>
    </div>
  );
};

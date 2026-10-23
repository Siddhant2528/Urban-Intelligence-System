import {
  Accessibility,
  ArrowRight,
  BusFront,
  ChartNoAxesCombined,
  GraduationCap,
  HeartPulse,
  Landmark,
  Leaf,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ButtonLink, Card, SectionHeader } from '../components/common'
import { indicatorCategories } from '../types/indicator'

const indicatorIcons: Record<(typeof indicatorCategories)[number], LucideIcon> = {
  Environment: Leaf,
  Healthcare: HeartPulse,
  Education: GraduationCap,
  Safety: ShieldCheck,
  Transport: BusFront,
  Infrastructure: Landmark,
  Accessibility,
}

const capabilities = [
  {
    title: 'Area Analysis',
    description: 'Inspect an area profile and its indicator performance.',
    icon: ChartNoAxesCombined,
  },
  {
    title: 'Multiple Urban Indicators',
    description: 'Explore the approved indicators together in one place.',
    icon: Scale,
  },
  {
    title: 'Area Comparison',
    description: 'Compare selected areas across urban-development indicators.',
    icon: ArrowRight,
  },
]

const homeActionClassName =
  'inline-flex items-center justify-center rounded-full bg-[#176b53] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-none hover:bg-[#176b53] active:bg-[#176b53] focus-visible:outline-none'

function HomePage() {
  return (
    <>
      <section
        aria-labelledby="home-title"
        className="relative isolate flex min-h-[34rem] items-center overflow-hidden bg-ink text-white"
      >
        <img
          alt="Illustrative city skyline"
          className="absolute inset-0 -z-20 size-full object-cover object-center"
          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=2200&q=88"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-ink/55" />
        <div className="mx-auto w-full max-w-7xl px-page py-16 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-soft/90">
              Urban Intelligence System
            </p>
            <h1
              className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
              id="home-title"
            >
              Understand Your City&apos;s Development
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
              Explore how different areas perform across healthcare, education,
              environment, safety, transport and infrastructure.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink
                className={homeActionClassName}
                leadingIcon={<ArrowRight aria-hidden="true" size={18} />}
                to="/city"
              >
                Explore City
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="px-page py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            level={2}
            title="Explore the indicators"
            description="The dashboard organizes area information across these seven urban-development categories."
          />
          <div className="mt-8 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {indicatorCategories.map((category) => {
              const Icon = indicatorIcons[category]

              return (
                <Card className="flex min-h-24 items-center gap-3 p-4" key={category}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
                    <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
                  </span>
                  <h2 className="text-sm font-semibold leading-5 text-ink">{category}</h2>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface px-page py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader level={2} title="What you can explore" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {capabilities.map(({ description, icon: Icon, title }) => (
              <Card className="flex gap-4 p-5" key={title}>
                <span className="grid size-10 shrink-0 place-items-center rounded-control bg-accent-soft text-accent">
                  <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-ink">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

    </>
  )
}

export default HomePage
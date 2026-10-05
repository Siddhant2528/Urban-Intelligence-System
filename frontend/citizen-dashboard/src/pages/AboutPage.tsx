import {
  ArrowRight,
  BarChart3,
  Building2,
  Compass,
  Gauge,
  MapPinned,
  Sparkles,
  Users,
} from 'lucide-react'
import { Badge, Card, SectionHeader } from '../components/common'
import cityImage from '../assets/images/City.jpg'
import nashikAiMap from '../assets/images/NASHIK  AI MAP.png'

const featureCards = [
  {
    title: 'City Overview',
    description: 'See the city at a glance and understand how different areas contribute to local performance.',
    icon: Building2,
  },
  {
    title: 'Area Analysis',
    description: 'Dive into a neighbourhood profile and review the factors shaping daily urban life.',
    icon: MapPinned,
  },
  {
    title: 'Urban Indicators',
    description: 'Explore city conditions through the seven core UIS indicators that matter to citizens.',
    icon: BarChart3,
  },
  {
    title: 'Facilities & Accessibility',
    description: 'Review available services and understand how easy it is to move across the area.',
    icon: Compass,
  },
  {
    title: 'Compare Areas',
    description: 'Contrast neighbourhoods side by side to spot strengths, gaps, and opportunities.',
    icon: Gauge,
  },
  {
    title: 'AI-Assisted Insights',
    description: 'Turn indicators and accessibility patterns into clear, understandable summaries.',
    icon: Sparkles,
  },
]

const workflowSteps = [
  {
    title: 'Urban Data',
    description: 'Local indicators, area context, and city signals are brought together in one view.',
    icon: Building2,
  },
  {
    title: 'Indicator Assessment',
    description: 'Each area is evaluated across the key urban categories residents care about most.',
    icon: BarChart3,
  },
  {
    title: 'Area & City UIS',
    description: 'City and neighbourhood performance is interpreted into a simple comparative score.',
    icon: MapPinned,
  },
  {
    title: 'AI-Assisted Explanation',
    description: 'Patterns are translated into concise, citizen-friendly explanations and summaries.',
    icon: Sparkles,
  },
]

function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-page py-10 sm:py-12">
      <section className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <div className="grid gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-10 lg:py-12">
          <div className="text-center lg:text-left">
            <Badge className="mx-auto lg:mx-0" tone="warning">Citizen dashboard</Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              About UIS
            </h1>
            <p className="mt-3 text-lg font-medium text-brand">
              Understand Your City. Explore Its Areas.
            </p>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted sm:text-lg">
              UIS is an AI-assisted urban intelligence platform that helps people understand how different city areas perform across important social, environmental, and service indicators.
            </p>
          </div>

          <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
            <img
              alt="Nashik AI map"
              className="block aspect-[4/3] w-full object-cover"
              src={nashikAiMap}
            />
          </div>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader
          level={2}
          title="What Can You Explore?"
          description="A citizen-friendly view of how urban performance can be understood and compared."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map(({ description, icon: Icon, title }) => (
            <Card
              className="group h-full border border-line bg-surface transition-[border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-raised motion-reduce:transform-none motion-reduce:transition-none"
              key={title}
            >
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
                  <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader
          level={2}
          title="How UIS Works"
          description="From urban signals to clear area-level understanding."
        />

        <div className="mt-6 hidden gap-4 md:grid md:grid-cols-4">
          {workflowSteps.map(({ description, icon: Icon, title }, index) => (
            <div className="flex items-center gap-3" key={title}>
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
                <span className="grid size-11 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
                  <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
                </div>
              </div>
              {index < workflowSteps.length - 1 && (
                <ArrowRight aria-hidden="true" className="shrink-0 text-brand" size={18} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:hidden">
          {workflowSteps.map(({ description, icon: Icon, title }) => (
            <div className="relative rounded-card border border-line bg-surface p-4 shadow-card" key={title}>
              <div className="absolute left-4 top-0 h-full w-px bg-brand/30" aria-hidden="true" />
              <div className="relative flex items-start gap-3">
                <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
                  <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <SectionHeader
              level={2}
              title="Why UIS Matters"
              description="Making the city easier to understand, compare, and improve."
            />
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
              UIS helps citizens explore the conditions of different urban areas, understand their strengths and constraints, and compare neighbourhoods using available data and consistent indicators.
            </p>
            <div className="mt-5 flex items-center gap-3 rounded-control border border-line bg-brand-soft p-3 text-sm text-brand">
              <Users aria-hidden="true" size={18} />
              <span>Designed to support everyday understanding of city performance.</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
            <img
              alt="City skyline"
              className="block h-full w-full object-cover"
              src={cityImage}
            />
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="rounded-card border border-brand/20 bg-brand-soft px-5 py-8 text-center shadow-card sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Our Vision</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink sm:text-3xl">
            Making Urban Intelligence Accessible to Everyone
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-muted sm:text-base">
            Helping people understand cities through data, geographic insights, and AI-assisted interpretation.
          </p>
        </div>
      </section>

      <div className="mt-10 border-t border-line pt-6 text-sm leading-6 text-muted">
        UIS insights depend on the availability and quality of underlying data. Demonstration data, where used, is illustrative and should not be interpreted as verified real-world information.
      </div>
    </div>
  )
}

export default AboutPage
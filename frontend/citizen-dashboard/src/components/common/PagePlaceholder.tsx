import { SectionHeader } from './SectionHeader'

interface PagePlaceholderProps {
  title: string
}

function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <section className="mx-auto w-full max-w-5xl px-page py-section">
      <SectionHeader title={title} />
      <p className="mt-3 text-sm text-muted">Page placeholder</p>
    </section>
  )
}

export default PagePlaceholder
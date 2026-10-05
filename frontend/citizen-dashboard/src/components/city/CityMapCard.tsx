import nashikMapImage from '../../assets/images/Nashik Map.png'
import { Badge, ButtonLink, Card } from '../common'

function CityMapCard() {
  return (
    <Card
      className="overflow-hidden transition-[border-color,box-shadow] duration-150 hover:border-brand/40 hover:shadow-raised"
      padding="none"
    >
      <div className="grid gap-5 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">City Map</p>
            <h3 className="mt-2 text-lg font-semibold text-ink">
              Explore Nashik and its surrounding areas
            </h3>
          </div>
          <Badge>Map Preview</Badge>
        </div>

        <img
          alt="Static map preview of Nashik and its surrounding areas"
          className="block h-auto w-full rounded-control object-contain"
          src={nashikMapImage}
        />

        <div>
          <ButtonLink to="/city#city-area-visualization">Explore Areas</ButtonLink>
        </div>
      </div>
    </Card>
  )
}

export default CityMapCard
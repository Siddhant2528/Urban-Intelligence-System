import assert from 'node:assert/strict'
import test from 'node:test'
import {
  classifyDevelopmentProfile,
  developmentIndicatorIds,
} from '../src/utils/developmentProfileClassification.ts'

const scores = (overrides = {}) =>
  Object.fromEntries(developmentIndicatorIds.map((id) => [id, overrides[id] ?? 60]))

test('classifies all seven strong scores with no weak gaps as well-developed', () => {
  const result = classifyDevelopmentProfile(scores({
    environment: 70,
    healthcare: 71,
    education: 72,
    safety: 73,
    transport: 69,
    infrastructure: 69,
    accessibility: 69,
  }))

  assert.equal(result.profileName, 'Well-Developed Urban Area')
  assert.deepEqual(result.counts, { Strong: 4, Moderate: 3, Weak: 0 })
})

test('classifies a majority-weak pattern as emerging ahead of specialist rules', () => {
  const result = classifyDevelopmentProfile(scores({
    environment: 39,
    healthcare: 39,
    education: 39,
    safety: 39,
    transport: 39,
    infrastructure: 39,
  }))

  assert.equal(result.profileName, 'Emerging Urban Area')
  assert.match(result.reason, /6 Weak/)
})

test('gives infrastructure rule priority over environment-stressed when both match', () => {
  const result = classifyDevelopmentProfile(scores({
    environment: 39,
    transport: 39,
    infrastructure: 39,
    healthcare: 70,
    education: 40,
    safety: 40,
    accessibility: 70,
  }))

  assert.equal(result.profileName, 'Infrastructure-Developing Area')
  assert.match(result.reason, /Infrastructure and Transport are both Weak/)
})

test('classifies a weak environment with mostly non-weak neighbors as environmentally stressed', () => {
  const result = classifyDevelopmentProfile(scores({
    environment: 39,
    healthcare: 70,
    education: 40,
    safety: 40,
    transport: 40,
    infrastructure: 40,
    accessibility: 39,
  }))

  assert.equal(result.profileName, 'Environmentally Stressed Urban Area')
  assert.match(result.reason, /Environment is Weak while 5 of the other six/)
})

test('uses developing as the general moderate or uneven profile', () => {
  const result = classifyDevelopmentProfile(scores({
    environment: 70,
    healthcare: 70,
    education: 70,
    safety: 69,
    transport: 69,
    infrastructure: 69,
    accessibility: 69,
  }))

  assert.equal(result.profileName, 'Developing Urban Area')
  assert.deepEqual(result.counts, { Strong: 3, Moderate: 4, Weak: 0 })
})

test('uses the requested score-band boundaries', () => {
  const result = classifyDevelopmentProfile(scores({
    environment: 39,
    healthcare: 40,
    education: 69,
    safety: 70,
  }))

  assert.deepEqual(
    result.indicators.slice(0, 4).map(({ score, band }) => [score, band]),
    [[39, 'Weak'], [40, 'Moderate'], [69, 'Moderate'], [70, 'Strong']],
  )
})

test('requires all seven valid scores and reports missing or invalid inputs', () => {
  const missingResult = classifyDevelopmentProfile({ ...scores(), accessibility: null })
  const invalidResult = classifyDevelopmentProfile({ ...scores(), infrastructure: 101 })

  assert.equal(missingResult.profileName, 'Insufficient Data for Classification')
  assert.match(missingResult.reason, /Accessibility/)
  assert.equal(invalidResult.profileName, 'Insufficient Data for Classification')
  assert.match(invalidResult.reason, /Infrastructure/)
})
import React from 'react'

interface RenderRatingProps {
  sumRate?: number
  countRate?: number
  rem: number
}

export const renderRating = ({ sumRate = 0, countRate = 0, rem = 1 }: RenderRatingProps) => {
  if (countRate === 0 || sumRate === 0) {
    return <span className="noRating">Нет данных</span>
  }

  const average = sumRate / countRate
  const roundedAverage = Math.round(average * 10) / 10
  const gradientValue = Math.min(Math.max((average - 1) / 9, 0), 1)
  const color = `rgb(${200 - gradientValue * 200}, ${gradientValue * 200}, 0)`

  return (
    <span style={{ color, fontSize: `${rem}rem` }} title={`Средний рейтинг: ${roundedAverage}`}>
      {roundedAverage}
    </span>
  )
}

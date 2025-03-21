"use client"

import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"

interface SemiCircleProgressBarProps {
  value: number
  maxValue: number
}

export default function SemiCircleProgressBar({ value, maxValue }: SemiCircleProgressBarProps) {
  // Calculate percentage
  const percentage = (value / maxValue) * 100

  // Determine color based on percentage
  const getColor = () => {
    if (percentage >= 80) return "hsl(var(--success))"
    if (percentage >= 60) return "hsl(var(--warning))"
    return "hsl(var(--destructive))"
  }

  return (
    <div className="relative">
      <div className="w-full">
        <CircularProgressbar
          value={percentage}
          circleRatio={0.5}
          styles={buildStyles({
            rotation: 0.75,
            strokeLinecap: "round",
            trailColor: "hsl(var(--muted))",
            pathColor: getColor(),
          })}
        />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold">{value.toFixed(2)}</span>
        <span className="text-sm text-muted-foreground">out of {maxValue.toFixed(1)}</span>
      </div>
    </div>
  )
}


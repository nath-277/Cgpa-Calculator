"use client"

import { useEffect, useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
} from "chart.js"
import { Line } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface GpaChartProps {
  data: { semester: string; gpa: number; cgpa: number }[]
}

export default function GpaChart({ data }: GpaChartProps) {
  const [chartData, setChartData] = useState<ChartData<"line">>({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    if (data.length === 0) {
      setChartData({
        labels: ["No data"],
        datasets: [
          {
            label: "GPA",
            data: [0],
            borderColor: "hsl(var(--primary))",
            backgroundColor: "hsl(var(--primary) / 0.5)",
          },
          {
            label: "CGPA",
            data: [0],
            borderColor: "hsl(var(--secondary))",
            backgroundColor: "hsl(var(--secondary) / 0.5)",
          },
        ],
      })
      return
    }

    setChartData({
      labels: data.map((item) => item.semester),
      datasets: [
        {
          label: "GPA",
          data: data.map((item) => item.gpa),
          borderColor: "hsl(var(--primary))",
          backgroundColor: "hsl(var(--primary) / 0.5)",
          tension: 0.3,
        },
        {
          label: "CGPA",
          data: data.map((item) => item.cgpa),
          borderColor: "hsl(var(--secondary))",
          backgroundColor: "hsl(var(--secondary) / 0.5)",
          tension: 0.3,
        },
      ],
    })
  }, [data])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  }

  return (
    <div className="h-[300px]">
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Add courses to see your GPA trend
        </div>
      ) : (
        <Line data={chartData} options={options} />
      )}
    </div>
  )
}


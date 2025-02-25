"use client";

import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export function AreaChart() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart instance if it exists
      if (chartInstance) {
        chartInstance.destroy();
      }

      // Sample data for the area chart
      const data = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Revenue",
            data: [1800, 2200, 1900, 2400, 2800, 2600, 3000],
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
          },
        ],
      };

      // Create new chart instance - 直接使用 canvas 元素而不是 context
      const newChartInstance = new Chart(chartRef.current, {
        type: "line",
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                display: true,
              },
            },
          },
        },
      });
      setChartInstance(newChartInstance);
    }

    // Cleanup function
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [chartInstance]);

  return <canvas ref={chartRef} />;
}

export function BarChart() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart instance if it exists
      if (chartInstance) {
        chartInstance.destroy();
      }

      // Sample data for the bar chart
      const data = {
        labels: ["Electronics", "Clothing", "Food", "Books", "Home", "Beauty"],
        datasets: [
          {
            label: "Sales",
            data: [12500, 8300, 5400, 3200, 9800, 4600],
            backgroundColor: [
              "rgba(59, 130, 246, 0.7)",
              "rgba(16, 185, 129, 0.7)",
              "rgba(245, 158, 11, 0.7)",
              "rgba(239, 68, 68, 0.7)",
              "rgba(139, 92, 246, 0.7)",
              "rgba(236, 72, 153, 0.7)",
            ],
            borderRadius: 4,
          },
        ],
      };

      // 直接使用 canvas 元素而不是 context
      const newChartInstance = new Chart(chartRef.current, {
        type: "bar",
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                display: true,
              },
            },
          },
        },
      });
      setChartInstance(newChartInstance);
    }

    // Cleanup function
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [chartInstance]);

  return <canvas ref={chartRef} />;
}

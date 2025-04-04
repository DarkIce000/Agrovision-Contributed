import { useEffect, useRef, useState } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Legend,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Legend
);

const ENDPOINT = "https://agrovision-contributed.onrender.com/data";
const MAX_DATA_POINTS = 10;

function SensorChart() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(chartRef.current, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Moisture",
              data: [],
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 3,
            },
            {
              label: "NPK",
              data: [],
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 3,
            },
            {
              label: "Water Level",
              data: [],
              borderColor: "rgba(255, 206, 86, 1)",
              borderWidth: 3,
            },
            {
              label: "Temperature",
              data: [],
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 3,
            },
            {
              label: "Humidity",
              data: [],
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true },
          },
          plugins: {
            title: {
              display: true,
              text: " Sensor Overview Graph ",
            },
            legend: {
              display: true,
              position: "bottom",
              labels: { usePointStyle: true },
            },
          },
        },
      });
    }

    const fetchData = async () => {
      try {
        const response = await fetch(ENDPOINT, { mode: "cors" });
        const data = await response.json();

        if (chartInstance.current) {
          const now = new Date(data.timestamp * 1000).toLocaleTimeString();
          const { datasets, labels } = chartInstance.current.data;

          // Ensure data doesn't grow infinitely
          if (labels.length >= MAX_DATA_POINTS) {
            labels.shift();
            datasets.forEach((dataset) => dataset.data.shift());
          }

          labels.push(now);
          datasets[0].data.push(data.moisture);
          datasets[1].data.push(data.npk);
          datasets[2].data.push(data.water_level);
          datasets[3].data.push(data.temperature);
          datasets[4].data.push(data.humidity);

          chartInstance.current.update();
        }

        setRecommendations(data.recommendations || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const interval = setInterval(fetchData, 5000);

    return () => {
      clearInterval(interval);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="w-full h-[250px] md:h-[400px] lg:h-[500px] overflow-hidden">
      <canvas ref={chartRef} className="w-full h-full"></canvas>
      <div id="recommendations" className="mt-4">
        {recommendations.map((rec, index) => (
          <p key={index} className="text-sm text-gray-700">
            {rec}
          </p>
        ))}
      </div>
    </div>
  );
}

export default SensorChart;

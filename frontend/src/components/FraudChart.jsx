import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function FraudChart({ transactions }) {
  const fraud = transactions.filter(t => t.is_fraud).length;
  const safe = transactions.length - fraud;

  const data = {
    labels: ["Fraud", "Safe"],
    datasets: [
      {
        data: [fraud, safe],
        backgroundColor: ["#ef4444", "#22c55e"],
      },
    ],
  };

  return (
    <div className="w-64 mx-auto">
      <Pie data={data} />
    </div>
  );
}
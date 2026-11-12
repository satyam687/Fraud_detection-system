import { useState } from "react";
import axios from "axios";

export default function TransactionForm({ refresh, onUnauthorized }) {
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const submitTransaction = async () => {
    try {
      setError("");
      setResult("");

      // ✅ frontend validation
      if (!email.includes("@")) {
        setError("Invalid email format");
        return;
      }

      if (!amount) {
        setError("Amount required");
        return;
      }

      const res = await axios.post(
        "http://127.0.0.1:8000/transaction/",
        {
          amount,
          email,
          location: "India",
          device: "Mobile",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setResult(res.data.status);
      refresh();

      setAmount("");
      setEmail("");
    } catch (err) {
      console.log(err);

      if (err.response?.status === 401) {
        if (onUnauthorized) {
          onUnauthorized();
        } else {
          setError("Session expired, please login again");
        }
      } else if (err.response) {
        setError(
          err.response.data?.error ||
            err.response.data?.detail ||
            "Request failed"
        );
      } else {
        setError("Backend server not running 🚨");
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h2 className="font-bold mb-2">Check Transaction</h2>

      {/* Amount Input */}
      <input
        className="border p-2 mr-2 rounded"
        type="number"
        placeholder="Enter Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      {/* Email Input */}
      <input
        className="border p-2 mr-2 rounded"
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={submitTransaction}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Check
      </button>

      {/* ❌ ERROR MESSAGE */}
      {error && (
        <div className="text-red-500 mt-3 font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* ✅ RESULT */}
      {result && (
        <div
          className={`mt-4 p-3 rounded text-white font-bold ${
            result === "Fraud" ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {result === "Fraud"
            ? "❌ Fraud Transaction Detected"
            : "✅ Safe Transaction"}
        </div>
      )}
    </div>
  );
}




// import { useState } from "react";
// import axios from "axios";

// export default function TransactionForm({ refresh }) {
//   const [amount, setAmount] = useState("");
//   const [email, setEmail] = useState("");
//   const [result, setResult] = useState("");

//   const submitTransaction = async () => {
//     try {
//       const res = await axios.post(
//         "http://127.0.0.1:8000/transaction/",
//         {
//           amount,
//           email, // ✅ send email
//           location: "India",
//           device: "Mobile",
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       setResult(res.data.status);
//       refresh();
//     } catch (error) {
//       console.log(error);
//       alert("Error ❌");
//     }
//   };

//   return (
//     <div className="bg-white p-4 rounded shadow mb-4">
//       <h2 className="font-bold mb-2">Check Transaction</h2>

//       {/* Amount */}
//       <input
//         className="border p-2 mr-2 rounded"
//         type="number"
//         placeholder="Enter Amount"
//         value={amount}
//         onChange={(e) => setAmount(e.target.value)}
//       />

//       {/* Email */}
//       <input
//         className="border p-2 mr-2 rounded"
//         type="email"
//         placeholder="Enter Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />

//       <button
//         onClick={submitTransaction}
//         className="bg-blue-500 text-white px-4 py-2 rounded"
//       >
//         Check
//       </button>

//       {/* RESULT */}
//       {result && (
//         <div
//           className={`mt-4 p-3 rounded text-white font-bold ${
//             result === "Fraud" ? "bg-red-500" : "bg-green-500"
//           }`}
//         >
//           {result === "Fraud"
//             ? "❌ Fraud Transaction Detected"
//             : "✅ Safe Transaction"}
//         </div>
//       )}
//     </div>
//   );
// }
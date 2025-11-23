import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Header } from "./components/layout/Header";
import { Transactions } from "./pages/Transactions";
import { Merchants } from "./pages/Merchants";
import { UpdateMerchant } from "./pages/UpdateMerchant";
import { Reports } from "./pages/Reports";
import "./App.css";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <div className="app">
        <Header />

        <Routes>
          <Route path="/" element={<Transactions />} />
          <Route path="/merchants" element={<Merchants />} />
          <Route path="/merchants/update/:id" element={<UpdateMerchant />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </>
  );
}

export default App;

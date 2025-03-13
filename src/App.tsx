import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [amount, setAmount] = useState(1);
  const [fromCur, setFromCur] = useState("EUR");
  const [toCur, setToCur] = useState("USD");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [currencyList, setCurrencyList] = useState([]);
  const [currencyCountry, setCurrencyCountry] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errMessage, setErrMessage] = useState("");

  useEffect(() => {
    document.title = "Currency Converter";

    const fetchCurrencyCountry = async () => {
      try {
        const res = await fetch("https://api.frankfurter.app/currencies");
        const data = await res.json();
        setCurrencyCountry(data);
      } catch (error) {
        console.error("Error fetching currency country:", error);
      }
    };

    const fetchCurrencyList = async () => {
      try {
        const res = await fetch("https://api.frankfurter.app/latest");
        const data = await res.json();
        setCurrencyList({EUR: 1, ...data.rates});
      } catch (error) {
        console.error("Error fetching currency list:", error);
      }
    };

    const fetchCurrencyRate = async () => {
      try { 
        setIsLoading(true);

        const res = await fetch(
          `https://api.frankfurter.app/latest?amount=${amount}&from=${fromCur}&to=${toCur}`
        );
        const data = await res.json();

        if (data.rates && data.rates[toCur] !== undefined) {
          setConvertedAmount(data.rates[toCur]);
          setErrMessage(""); // Clear error on success
        } else {
          setConvertedAmount(null);
          setErrMessage(data.message); // Generic error message
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrMessage("Error Fetching Currency");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCurrencyCountry();
    fetchCurrencyList();
    if (fromCur !== toCur) fetchCurrencyRate(); // Avoid unnecessary API calls when both currencies are the same
  }, [amount, fromCur, toCur]);

  /**
   * Handle currency change
   * @param field - The field to update
   * @returns - The updated field
   */
  const handleCurrencyChange = (field: "fromCur" | "toCur") => 
    (e: any) => {
      const newValue = e.target.value;
      console.log(newValue);
      if (field === "fromCur") {
        setFromCur(newValue);
      } else {
        setToCur(newValue);
      }
    };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center bg-blue-950 py-8">
        <div className="bg-white shadow-lg rounded-2xl p-6 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
            Currency Converter
          </h1>
          <div className="space-y-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                disabled={fromCur === toCur}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-400"
                min={1}
              />
            </div>
            <div className="flex flex-col justify-between gap-2">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  From
                </label>
                <select
                  value={fromCur}
                  onChange={handleCurrencyChange("fromCur")}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                >
                  {Object.keys(currencyList).map((cur: any) => (
                    <option key={cur} value={cur}>
                      {cur} - {currencyCountry[cur] || ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">
                  To
                </label>
                <select
                  value={toCur}
                  onChange={handleCurrencyChange("toCur")}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                >
                  {Object.keys(currencyList).map((cur: any) => (
                    <option key={cur} value={cur}>
                      {cur} - {currencyCountry[cur] || ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-lg text-center font-semibold text-gray-800">
              {isLoading ? "Loading..." : convertedAmount !== null ? (
                <span className="text-green-600 text-2xl">{amount} {fromCur} = {convertedAmount} {toCur}</span>
              ) : (
                <span className="text-red-600 capitalize">{errMessage}</span>
              )}
            </p>
          </div>
        </div>
        
        <CurrencyList currencyList={currencyList}/>
        <Footer />

      </div>
    </>
  )
}
function CurrencyList({currencyList}: {currencyList: any}) {
  return (
    <div className="mt-4 bg-white shadow-lg rounded-2xl p-6 max-w-md w-full">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Currency List
      </h1>
      <p className="text-sm font-base text-gray-800 mb-4">Base Currency: 1 EUR</p>
      <div className="flex flex-wrap gap-2">
          {Object.keys(currencyList).map((currency: any, index: number) => (
        <div key={currency} className={`bg-gray-100 p-2 rounded-lg ${(index + 1) % 3 === 0 ? 'w-[33.33%]' : 'w-[calc(33.33%-0.5rem)]'}`}>
          <p>{currency} <span className='font-bold text-gray-800'>{currencyList[currency]}</span></p>
        </div>
        ))}
      </div>
    </div>
  )
}

function Footer() {
  return (
    <>
      <div className='mt-4 text-center max-w-md w-full'>
        <p className='text-sm font-base text-gray-400 mt-4'>Exchange rates are refreshed each day at approximately 16:00 Central European Time.</p>
      </div>
    </>
  )
}

export default App

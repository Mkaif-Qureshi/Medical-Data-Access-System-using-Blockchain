import React, { useEffect, useState } from "react";
import web3 from "./utils/web3";
import medicalDataAccess from "./utils/contract";

export function App() {
  const [account, setAccount] = useState("");
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [accessStatus, setAccessStatus] = useState("");
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    connectWallet();
    loadDatasets();
  }, []);

  const connectWallet = async () => {
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
  };

  const loadDatasets = async () => {
    const datasetList = [];
    for (let i = 1; i <= 3; i++) {
      const data = await medicalDataAccess.methods.getMetadata(i).call();
      datasetList.push({
        id: i,
        name: data[0],
        url: data[1],
        price: web3.utils.fromWei(data[2], "ether"),
      });
    }
    setDatasets(datasetList);
  };

  const requestAccess = async () => {
    if (!selectedDataset) {
      alert("Please select a dataset first.");
      return;
    }
    try {
      const transaction = await medicalDataAccess.methods
        .requestAccess(selectedDataset.id)
        .send({
          from: account,
          value: web3.utils.toWei(selectedDataset.price, "ether"),
        });

      const transactionHash = transaction.transactionHash;
      setAccessToken(transactionHash);
      alert(`Access granted! Your access token is: ${transactionHash}`);

      setAccessStatus("Access Granted");
    } catch (error) {
      alert("Transaction failed.");
      console.error(error);
    }
  };

  const checkAccess = async () => {
    if (!selectedDataset) {
      alert("Please select a dataset first.");
      return;
    }
    const hasAccess = await medicalDataAccess.methods
      .hasAccess(selectedDataset.id)
      .call({ from: account });

    setAccessStatus(hasAccess ? "Access Granted" : "Access Denied");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Medical Data Access System</h1>
      <p className="mb-4">Connected Account: {account}</p>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Select a Dataset</h2>
        <select
          className="w-full p-3 border border-gray-300 rounded mb-4"
          value={selectedDataset ? selectedDataset.id : ""}
          onChange={(e) => {
            const datasetId = e.target.value;
            const dataset = datasets.find((d) => d.id == datasetId);
            setSelectedDataset(dataset);
          }}
        >
          <option value="">-- Select Dataset --</option>
          {datasets.map((dataset) => (
            <option key={dataset.id} value={dataset.id}>
              {dataset.name} ({dataset.price} ETH)
            </option>
          ))}
        </select>

        {selectedDataset && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold">{selectedDataset.name}</h3>
            <p className="text-gray-700">Price: {selectedDataset.price} ETH per day</p>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            onClick={requestAccess}
          >
            Request Access
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
            onClick={checkAccess}
          >
            Check Access
          </button>
        </div>

        {accessStatus && (
          <p className="mt-4 text-lg font-semibold">
            Access Status: {accessStatus}
          </p>
        )}
        {accessToken && accessStatus === "Access Granted" && (
          <p className="mt-2 text-sm text-gray-600">Your Access Token: {accessToken}</p>
        )}
      </div>
    </div>
  );
}

export default App;

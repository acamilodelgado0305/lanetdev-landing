import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Wallet,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Building2,
  Landmark,
  HandCoins
} from "lucide-react";
import AddAccountModal from "./addAccount";
import { getAccounts, deleteAccount } from "../../../services/moneymanager/moneyService";
import { Card, Button, Tooltip } from 'antd';
import Swal from "sweetalert2";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const AccountContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cuentas, setCuentas] = useState([]);
  const [error, setError] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const [editAccount, setEditAccount] = useState(null);
  const [showPrestamos, setShowPrestamos] = useState(false);
  const [categoryTotals, setCategoryTotals] = useState({
    efectivo: 0,
    banco: 0,
    prestamos: 0,
  });

  const openModal = () => {
    setEditAccount(null);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const fetchCuentas = async () => {
    try {
      const data = await getAccounts();
      setCuentas(data);
      calculateTotals(data);
    } catch (err) {
      setError("Error al cargar las cuentas");
      console.error("Error fetching accounts:", err);
    }
  };

  const calculateTotals = (accounts) => {
    const totals = accounts.reduce(
      (acc, cuenta) => {
        const balance = parseFloat(cuenta.balance || 0);
        if (cuenta.plus) {
          acc.total += balance;
          switch (cuenta.type) {
            case "Dinero en Efectivo":
              acc.efectivo += balance;
              break;
            case "Banco":
              acc.banco += balance;
              break;
          }
        }
        // Always sum prestamos, regardless of the 'plus' flag
        if (cuenta.type === "Prestamos") {
          acc.prestamos += balance;
        }
        return acc;
      },
      { total: 0, efectivo: 0, banco: 0, prestamos: 0 }
    );

    setTotalBalance(totals.total);
    setCategoryTotals({
      efectivo: totals.efectivo,
      banco: totals.banco,
      prestamos: totals.prestamos,
    });
  };

  useEffect(() => {
    fetchCuentas();
  }, []);

  const handleAccountAdded = () => {
    fetchCuentas();
  };

  const handleDeleteAccount = async (accountId) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar!",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteAccount(accountId);
          await fetchCuentas();
          Swal.fire("Eliminada!", "La cuenta ha sido eliminada.", "success");
        } catch (error) {
          console.error("Error deleting account:", error);
          Swal.fire("Error!", "No se pudo eliminar la cuenta.", "error");
        }
      }
    });
  };

  const openEditModal = (account) => {
    setEditAccount(account);
    setIsModalOpen(true);
  };


  const renderAccount = (cuenta) => (
    <Card
      key={cuenta.id}
      className="mb-4 hover:shadow-lg transition-all duration-300 border border-gray-100"
      bodyStyle={{ padding: "16px" }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${
            cuenta.type === "Dinero en Efectivo" ? "bg-emerald-50" :
            cuenta.type === "Banco" ? "bg-blue-50" : "bg-orange-50"
          }`}>
            {cuenta.type === "Dinero en Efectivo" ? (
              <DollarSign className="w-6 h-6 text-emerald-600" />
            ) : cuenta.type === "Banco" ? (
              <Building2 className="w-6 h-6 text-blue-600" />
            ) : (
              <HandCoins className="w-6 h-6 text-orange-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{cuenta.name}</h3>
            <p className="text-sm text-gray-500">{cuenta.type}</p>
            {!cuenta.plus && (
              <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full">
                No suma al total
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`text-xl font-bold ${
            parseFloat(cuenta.balance) >= 0 ? "text-emerald-600" : "text-red-600"
          }`}>
            {formatCurrency(parseFloat(cuenta.balance))}
          </span>
          <div className="flex space-x-2">
            <Tooltip title="Editar cuenta">
              <Button 
                type="text" 
                icon={<Edit className="w-4 h-4 text-blue-600" />}
                onClick={() => openEditModal(cuenta)}
              />
            </Tooltip>
            <Tooltip title="Eliminar cuenta">
              <Button 
                type="text" 
                icon={<Trash2 className="w-4 h-4 text-red-600" />}
                onClick={() => handleDeleteAccount(cuenta.id)}
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderAccountSection = (title, accounts, totalAmount, icon) => (
    <div className="mb-8">
      <Card className="bg-white shadow-sm border-0">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            {icon}
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          </div>
          <div className="bg-gray-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-gray-500 mr-2">Total:</span>
            <span className="text-lg font-semibold text-emerald-600">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
        <div className="space-y-4">
          {accounts.map(renderAccount)}
        </div>
      </Card>
    </div>
  );

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  const efectivoCuentas = cuentas.filter(
    (cuenta) => cuenta.type === "Dinero en Efectivo"
  );
  const bancoCuentas = cuentas.filter((cuenta) => cuenta.type === "Banco");
  const prestamoCuentas = cuentas.filter(
    (cuenta) => cuenta.type === "Prestamos"
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header y Balance Total */}
        <Card className="mb-6 border-0 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Control de Cuentas
              </h1>
              <p className="text-gray-500">
                Gestiona tus cuentas y monitorea tus balances
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Balance Total</p>
              <p className="text-3xl font-bold text-emerald-600">
                {formatCurrency(totalBalance)}
              </p>
            </div>
          </div>
        </Card>

        {/* Secciones de Cuentas */}
        {renderAccountSection(
          "Efectivo",
          efectivoCuentas,
          categoryTotals.efectivo,
          <DollarSign className="w-6 h-6 text-emerald-600" />
        )}

        {renderAccountSection(
          "Cuentas Bancarias",
          bancoCuentas,
          categoryTotals.banco,
          <Landmark className="w-6 h-6 text-blue-600" />
        )}

        <Card className="mb-8 border-0 shadow-sm">
          <Button
            type="text"
            onClick={() => setShowPrestamos(!showPrestamos)}
            className="flex items-center w-full justify-between px-4"
          >
            <div className="flex items-center space-x-3">
              <HandCoins className="w-6 h-6 text-orange-600" />
              <span className="text-xl font-bold text-gray-800">Préstamos</span>
            </div>
            {showPrestamos ? <ChevronUp /> : <ChevronDown />}
          </Button>
          
          {showPrestamos && (
            <div className="mt-6">
              {renderAccountSection(
                "",
                prestamoCuentas,
                categoryTotals.prestamos,
                null
              )}
            </div>
          )}
        </Card>

        {/* Botón Flotante */}
        <Button
          type="primary"
          shape="circle"
          size="large"
          className="fixed bottom-8 right-8 w-14 h-14 flex items-center justify-center bg-blue-600 hover:bg-blue-700 border-none shadow-lg"
          onClick={openModal}
          icon={<PlusCircle className="w-6 h-6" />}
        />

        <AddAccountModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onAccountAdded={handleAccountAdded}
          accountToEdit={editAccount}
        />
      </div>
    </div>
  );

};

export default AccountContent;

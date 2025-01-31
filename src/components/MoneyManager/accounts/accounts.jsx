import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Edit,
  Trash2,
  DollarSign,
  Building2,
  HandCoins
} from "lucide-react";
import { Card, Button, Tooltip, Table, Tag, Typography } from 'antd';
import Swal from "sweetalert2";
import AddAccountModal from "./addAccount";
import { getAccounts, deleteAccount } from "../../../services/moneymanager/moneyService";

const { Title, Text } = Typography;

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

  const columns = [
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const icons = {
          "Dinero en Efectivo": <DollarSign className="w-4 h-4 text-emerald-600" />,
          "Banco": <Building2 className="w-4 h-4 text-blue-600" />,
          "Prestamos": <HandCoins className="w-4 h-4 text-orange-600" />
        };
        const colors = {
          "Dinero en Efectivo": "green",
          "Banco": "blue",
          "Prestamos": "orange"
        };
        return (
          <Tag icon={icons[type]} color={colors[type]}>
            {type}
          </Tag>
        );
      },
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      align: 'right',
      render: (balance) => (
        <Text className={parseFloat(balance) >= 0 ? "text-emerald-600" : "text-red-600"}>
          {formatCurrency(parseFloat(balance))}
        </Text>
      ),
    },
    {
      title: 'Suma al Total',
      dataIndex: 'plus',
      key: 'plus',
      align: 'center',
      render: (plus) => (
        <Tag color={plus ? "success" : "error"}>
          {plus ? "Sí" : "No"}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <div className="flex justify-center space-x-2">
          <Tooltip title="Editar cuenta">
            <Button 
              type="text" 
              icon={<Edit className="w-4 h-4 text-blue-600" />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Eliminar cuenta">
            <Button 
              type="text" 
              icon={<Trash2 className="w-4 h-4 text-red-600" />}
              onClick={() => handleDeleteAccount(record.id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div >
      <Card className="border-0 shadow-sm">
        {/* Header con totales y botón de agregar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={4} className="m-0">Gestion de Cuentas</Title>
            <Text type="secondary">Gestiona tus cuentas y monitorea tus balances</Text>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <Text type="secondary">Balance Total</Text>
              <Title level={3} className="m-0 text-emerald-600">
                {formatCurrency(totalBalance)}
              </Title>
            </div>
            <Button
              type="primary"
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={openModal}
              className="bg-blue-600"
            >
              Agregar Nueva Cuenta
            </Button>
          </div>
        </div>

        {/* Resumen de totales por categoría */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-emerald-50">
            <Text type="secondary">Total Efectivo</Text>
            <Title level={4} className="m-0 text-emerald-600">
              {formatCurrency(categoryTotals.efectivo)}
            </Title>
          </Card>
          <Card className="bg-blue-50">
            <Text type="secondary">Total Bancos</Text>
            <Title level={4} className="m-0 text-blue-600">
              {formatCurrency(categoryTotals.banco)}
            </Title>
          </Card>
          <Card className="bg-orange-50">
            <Text type="secondary">Total Préstamos</Text>
            <Title level={4} className="m-0 text-orange-600">
              {formatCurrency(categoryTotals.prestamos)}
            </Title>
          </Card>
        </div>

        {/* Tabla de cuentas */}
        <Table
          columns={columns}
          dataSource={cuentas}
          rowKey="id"
          pagination={false}
          className="border rounded-lg"
        />

        <AddAccountModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onAccountAdded={handleAccountAdded}
          accountToEdit={editAccount}
        />
      </Card>
    </div>
  );
};

export default AccountContent;
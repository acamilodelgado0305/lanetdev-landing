import React from 'react';
import { Calendar, Clock, DollarSign, Hash, Tag, FileText, User, CreditCard, Wallet, MessageSquare } from 'lucide-react';
import { useParams } from 'react-router-dom';

const IncomeInvoiceView = () => {

    const { id } = useParams(); // Obtener el ID de la URL
    // Simular que recibimos el ID de la URL
    const [transactionType, setTransactionType] = useState("expense");
    const [amount, setAmount] = useState("");

    const [fevAmount, setFevAmount] = useState("");
    const [diversoAmount, setDiversoAmount] = useState("");
    const [category, setCategory] = useState("");
    const [account, setAccount] = useState("");
    const [voucher, setVoucher] = useState("");
    const [description, setDescription] = useState("");
    const [comentarios, setComentarios] = useState("");
    const [categories, setCategories] = useState([]);
    const [cashiers, setCashiers] = useState([]);

    const [accounts, setAccounts] = useState([]);
    const [date, setDate] = useState(dayjs());

    const [ventaCategoryId, setVentaCategoryId] = useState(null);

    const [loading, setLoading] = useState(false);


    const [arqueoCategoryId, setArqueoCategoryId] = useState(null);
    const [isArqueoChecked, setIsArqueoChecked] = useState(true);
    const [isVentaChecked, setIsVentaChecked] = useState(false);

    const [startPeriod, setStartPeriod] = useState(null);
    const [endPeriod, setEndPeriod] = useState(null);
    const [arqueoNumber, setArqueoNumber] = useState("");
    const [otherIncome, setOtherIncome] = useState("");
    const [cashReceived, setCashReceived] = useState("");
    const [cashierCommission, setCashierCommission] = useState("");
    const [CommissionPorcentaje, setCommissionPorcentaje] = useState("");
    const [isIncomeSaved, setIsIncomeSaved] = useState(false);
    const [cashierid, setCashierid] = useState(null);

    const [stats, setStats] = useState({
        totalCashiers: 0,
        avgCommission: 0
    });


      useEffect(() => {
        if (id) {
          fetchIncomeData();
          fetchCashiers();
        }
      }, [id]);


    const fetchIncomeData = async () => {
        try {
            const response = await fetch(`${apiUrl}/incomes/${id}`);
            if (!response.ok) {
                throw new Error('No se pudo obtener la información del ingreso');
            }
            const data = await response.json();

            // Actualizamos los estados con validación para cada campo
            setAmount(data.amount?.toString() || "");
            setCategory(data.category_id?.toString() || "");
            setAccount(data.account_id?.toString() || "");
            setDescription(data.description || "");
            setComentarios(data.comentarios || "");
            setDate(data.date ? dayjs(data.date) : dayjs());

            // Si es un arqueo, actualizar los campos específicos con validación
            if (data.type === "arqueo") {
                setIsArqueoChecked(true);
                setFevAmount(data.amountfev?.toString() || "");
                setDiversoAmount(data.amountdiverse?.toString() || "");
                setCashierid(data.cashier_id || "");
                setArqueoNumber(data.arqueo_number?.toString() || "");
                setOtherIncome(data.other_income?.toString() || "");
                setCashReceived(data.cash_received?.toString() || "");
                setCashierCommission(data.cashier_commission?.toString() || "");
                setStartPeriod(data.start_period ? dayjs(data.start_period) : null);
                setEndPeriod(data.end_period ? dayjs(data.end_period) : null);
            } else if (data.category_id === ventaCategoryId) {
                setIsVentaChecked(true);
            }


        } catch (error) {
            console.error('Error al obtener los datos del ingreso:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar la información del ingreso. ' + error.message
            });
        }
    };
    // Función para formatear fechas
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Función para formatear montos
    const formatAmount = (amount) => {
        return parseFloat(amount).toLocaleString('es-ES', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        });
    };

    // Colores Jira
    const jiraColors = {
        blue: "#0052CC",
        green: "#00875A",
        lightBlue: "#DEEBFF",
        lightGreen: "#E3FCEF",
        lightGray: "#F4F5F7",
        darkGray: "#42526E",
        border: "#DFE1E6",
    };

    return (
        <div className="bg-gray-100 min-h-screen p-6">
            <div className="max-w-full mx-auto bg-white rounded-md shadow-md overflow-hidden border border-gray-200">
                {/* Encabezado de tipo Factura */}
                <div style={{ backgroundColor: jiraColors.blue }} className="p-4 text-white">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <h1 className="text-2xl font-bold">Registro de Ingreso</h1>
                        </div>
                        <div className="text-right">
                            <p className="text-sm mb-1">Fecha del Registro</p>
                            <p className="font-bold">{formatDate(incomeData.date)}</p>
                        </div>
                    </div>
                </div>

                {/* Información principal tipo factura */}
                <div className="border-b" style={{ borderColor: jiraColors.border }}>
                    <div className="grid grid-cols-2 divide-x" style={{ borderColor: jiraColors.border }}>
                        <div className="p-4">
                            <h2 className="font-semibold mb-2" style={{ color: jiraColors.darkGray }}>Referencia</h2>
                            <div className="flex items-center space-x-2">
                                <Hash size={16} style={{ color: jiraColors.blue }} />
                                <span className="font-bold text-lg">Arqueo #{incomeData.arqueo_number}</span>
                            </div>
                            <div className="mt-1 flex items-center">
                                <Tag size={14} className="mr-1" style={{ color: jiraColors.darkGray }} />
                                <span>ID: {incomeData.id.substring(0, 8)}...</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <h2 className="font-semibold mb-2" style={{ color: jiraColors.darkGray }}>Estado</h2>
                            <div className="flex items-center space-x-2">
                                <span
                                    className="px-3 py-1 rounded-full text-sm font-medium"
                                    style={{
                                        backgroundColor: incomeData.estado ? jiraColors.lightGreen : jiraColors.lightGray,
                                        color: incomeData.estado ? jiraColors.green : jiraColors.darkGray
                                    }}
                                >
                                    {incomeData.estado ? "Activo" : "Inactivo"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información del periodo */}
                <div className="border-b p-4" style={{ borderColor: jiraColors.border, backgroundColor: jiraColors.lightBlue }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="font-semibold" style={{ color: jiraColors.darkGray }}>Período del Arqueo</h2>
                            <div className="flex items-center mt-1">
                                <Calendar size={14} className="mr-1" style={{ color: jiraColors.blue }} />
                                <span>{formatDate(incomeData.start_period)} - {formatDate(incomeData.end_period)}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="font-semibold" style={{ color: jiraColors.darkGray }}>Total Ingreso</h2>
                            <div className="text-2xl font-bold" style={{ color: jiraColors.blue }}>{formatAmount(incomeData.amount)}</div>
                        </div>
                    </div>
                </div>

                {/* Tabla de detalles */}
                <table className="w-full text-sm">
                    <thead>
                        <tr style={{ backgroundColor: jiraColors.lightGray }}>
                            <th className="py-3 px-4 text-left font-semibold" style={{ color: jiraColors.darkGray }}>Concepto</th>
                            <th className="py-3 px-4 text-left font-semibold" style={{ color: jiraColors.darkGray }}>Detalle</th>
                            <th className="py-3 px-4 text-right font-semibold" style={{ color: jiraColors.darkGray }}>Monto</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: jiraColors.border }}>
                        <tr>
                            <td className="py-3 px-4 flex items-center">
                                <Wallet size={16} className="mr-2" style={{ color: jiraColors.blue }} />
                                <span>Efectivo Recibido</span>
                            </td>
                            <td className="py-3 px-4">Arqueo de Caja</td>
                            <td className="py-3 px-4 text-right font-medium">{formatAmount(incomeData.cash_received)}</td>
                        </tr>
                        <tr>
                            <td className="py-3 px-4 flex items-center">
                                <DollarSign size={16} className="mr-2" style={{ color: jiraColors.blue }} />
                                <span>Monto FEV</span>
                            </td>
                            <td className="py-3 px-4">Fondo Especial de Valores</td>
                            <td className="py-3 px-4 text-right font-medium">{formatAmount(incomeData.amountfev)}</td>
                        </tr>
                        <tr>
                            <td className="py-3 px-4 flex items-center">
                                <DollarSign size={16} className="mr-2" style={{ color: jiraColors.blue }} />
                                <span>Monto Diverso</span>
                            </td>
                            <td className="py-3 px-4">Ingresos Diversos</td>
                            <td className="py-3 px-4 text-right font-medium">{formatAmount(incomeData.amountdiverse)}</td>
                        </tr>
                        <tr>
                            <td className="py-3 px-4 flex items-center">
                                <DollarSign size={16} className="mr-2" style={{ color: jiraColors.blue }} />
                                <span>Otros Ingresos</span>
                            </td>
                            <td className="py-3 px-4">Ingresos Adicionales</td>
                            <td className="py-3 px-4 text-right font-medium">{formatAmount(incomeData.other_income)}</td>
                        </tr>
                        <tr style={{ backgroundColor: jiraColors.lightGray }}>
                            <td className="py-3 px-4 flex items-center">
                                <DollarSign size={16} className="mr-2" style={{ color: jiraColors.darkGray }} />
                                <span className="font-semibold">Comisión de Cajero</span>
                            </td>
                            <td className="py-3 px-4">Comisión por Servicios</td>
                            <td className="py-3 px-4 text-right font-medium">{formatAmount(incomeData.cashier_commission)}</td>
                        </tr>
                        <tr className="border-t-2" style={{ borderColor: jiraColors.blue }}>
                            <td className="py-3 px-4 font-bold" style={{ color: jiraColors.darkGray }}>Total</td>
                            <td className="py-3 px-4"></td>
                            <td className="py-3 px-4 text-right font-bold" style={{ color: jiraColors.blue }}>{formatAmount(incomeData.amount)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Información adicional */}
                <div className="grid grid-cols-2 divide-x border-t" style={{ borderColor: jiraColors.border }}>
                    <div className="p-4">
                        <h2 className="font-semibold mb-2" style={{ color: jiraColors.darkGray }}>Información de Usuario</h2>
                        <table className="w-full text-sm">
                            <tbody>
                                <tr>
                                    <td className="py-1 flex items-center" style={{ color: jiraColors.darkGray }}>
                                        <User size={14} className="mr-1" style={{ color: jiraColors.blue }} />
                                        <span>ID Usuario:</span>
                                    </td>
                                    <td className="py-1">{incomeData.user_id}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 flex items-center" style={{ color: jiraColors.darkGray }}>
                                        <CreditCard size={14} className="mr-1" style={{ color: jiraColors.blue }} />
                                        <span>ID Cuenta:</span>
                                    </td>
                                    <td className="py-1">{incomeData.account_id}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 flex items-center" style={{ color: jiraColors.darkGray }}>
                                        <Tag size={14} className="mr-1" style={{ color: jiraColors.blue }} />
                                        <span>Tipo:</span>
                                    </td>
                                    <td className="py-1 capitalize">{incomeData.type}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4">
                        <h2 className="font-semibold mb-2" style={{ color: jiraColors.darkGray }}>Descripción y Comentarios</h2>
                        <div className="mb-2">
                            <div className="flex items-start">
                                <FileText size={14} className="mr-1 mt-1" style={{ color: jiraColors.blue }} />
                                <div>
                                    <p className="text-sm" style={{ color: jiraColors.darkGray }}>Descripción:</p>
                                    <p>{incomeData.description}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-start">
                                <MessageSquare size={14} className="mr-1 mt-1" style={{ color: jiraColors.blue }} />
                                <div>
                                    <p className="text-sm" style={{ color: jiraColors.darkGray }}>Comentarios:</p>
                                    <p>{incomeData.comentarios}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pie de página */}
                <div className="p-3 text-xs text-center border-t" style={{ backgroundColor: jiraColors.lightGray, borderColor: jiraColors.border, color: jiraColors.darkGray }}>
                    <div className="flex justify-between items-center">
                        <div>Money Manager v1.0</div>
                        <div className="flex items-center">
                            <Clock size={12} className="mr-1" />
                            <span>Generado el: {formatDate(new Date())}</span>
                        </div>
                        <div>ID: {incomeData.id}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomeInvoiceView;
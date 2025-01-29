import React, { useState } from 'react';
import { 
    Typography, 
    Tabs,
} from 'antd';
import { 
    Settings, 
    BookOpen, 
    Building2,
    Calculator
} from 'lucide-react';

import AccountContent from '../accounts/accounts';
import Categories from '../categories/Categories';
import ProvidersPage from '../proveedores/ProvidersPage';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ConfiguracionContable = () => {
    const [activeTab, setActiveTab] = useState('1');

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-6 h-6 text-blue-500" />
                    <Title level={4} className="m-0">
                        Configuración Contable
                    </Title>
                </div>
                <Text type="secondary">
                    Gestione la configuración contable de su empresa, incluyendo el plan de cuentas,
                    impuestos y parámetros generales.
                </Text>
            </div>

            {/* Contenido Principal */}
            <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                className="mb-6"
            >
                <TabPane 
                    tab={
                        <span className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Cuentas
                        </span>
                    } 
                    key="1"
                >
                    <AccountContent />
                </TabPane>

                <TabPane 
                    tab={
                        <span className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Categorías
                        </span>
                    } 
                    key="2"
                >
                    <Categories />
                </TabPane>

                <TabPane 
                    tab={
                        <span className="flex items-center gap-2">
                            <Calculator className="w-4 h-4" />
                            Proveedores
                        </span>
                    } 
                    key="3"
                >
                    <ProvidersPage />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default ConfiguracionContable;
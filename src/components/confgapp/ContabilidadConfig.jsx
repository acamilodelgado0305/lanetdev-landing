import React from "react";
import { Collapse, Typography } from "antd";
import AccountContent from "../MoneyManager/accounts/accounts";
import Categories from "../MoneyManager/categories/Categories";

const { Panel } = Collapse;
const { Title } = Typography;

const ContabilidadConfig = () => {
  return (
    <div style={{ padding: "0 5px" }}>
     
      <Collapse
        defaultActiveKey={[]} // Ningún panel abierto por defecto
        expandIconPosition="right"
        style={{ background: "#fff", borderRadius: 8, border: "1px solid #d9d9d9" }}
      >
        
        <Panel header="Cuentas" key="2">
          <AccountContent />
        </Panel>
        <Panel header="Categorías" key="3">
          <Categories />
        </Panel>
      </Collapse>
    </div>
  );
};

export default ContabilidadConfig;
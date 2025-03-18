import React, { useState } from "react";
import {
  Layout,
  Menu,
  Typography,
} from "antd";
import {
  SettingOutlined,
  TeamOutlined,
  ProfileOutlined,
  DollarCircleOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import PerfilUsuario from "./PerfilUsuario";
import Colaboradores from "./Colaboradores";
import ContabilidadConfig from "./ContabilidadConfig";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const IndexConfig = () => {
  const [selectedMenuKey, setSelectedMenuKey] = useState("collaborators");

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={200} theme="light">
        <Menu
          mode="inline"
          defaultSelectedKeys={["collaborators"]}
          style={{ height: "100%", borderRight: 0 }}
          onClick={(e) => setSelectedMenuKey(e.key)}
        >
          <Menu.Item key="contabilidad" icon={<DollarCircleOutlined />}>
            Contabilidad
          </Menu.Item>
          <Menu.Item key="collaborators" icon={<TeamOutlined />}>
            Colaboradores
          </Menu.Item>
          <Menu.Item key="profile" icon={<ProfileOutlined />}>
            Perfil
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout style={{ padding: "0 24px 24px" }}>
      <div className="mb-6 bg-white p-4  shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-[#0052CC] p-2 ">
            <SettingOutlined className="text-white text-lg" />
          </div>
          <Title level={3} className="!m-0 text-[#0052CC]">
            Configuración
          </Title>
        </div>
     
      </div>
        <Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: "#fff",
          }}
        >
          {selectedMenuKey === "collaborators" && <Colaboradores />}
          {selectedMenuKey === "profile" && <PerfilUsuario />}
          {selectedMenuKey === "contabilidad" && <ContabilidadConfig/>}
        </Content>
      </Layout>
    </Layout>
  );
};

export default IndexConfig;
import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Typography,
} from "antd";
import {
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  getUsers,
  updateUser,
  deleteUser,
  createUser,
} from "../../services/apiService";
import { Outlet, Link } from "react-router-dom";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;
const { Option } = Select;

const IndexConfig = () => {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setCollaborators(data);
    } catch (err) {
      message.error("Error al cargar los colaboradores");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateCollaborator = async (values) => {
    try {
      if (editingUserId) {
        await updateUser(editingUserId, values);
        message.success("Colaborador actualizado con éxito");
      } else {
        await createUser(values);
        message.success("Colaborador agregado con éxito");
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      message.error("Error al procesar la operación");
    }
  };

  const handleDeleteCollaborator = async (id) => {
    try {
      await deleteUser(id);
      message.success("Colaborador eliminado con éxito");
      fetchUsers();
    } catch (error) {
      message.error("Error al eliminar colaborador");
    }
  };

  const showUserModal = (user = null) => {
    if (user) {
      setEditingUserId(user.id);
      form.setFieldsValue(user);
    } else {
      setEditingUserId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: "username",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Rol",
      key: "role",
      dataIndex: "role",
      render: (role) => {
        if (!role) return <Tag color="default">No asignado</Tag>;
        const color = role.toLowerCase() === "admin" ? "geekblue" : "green";
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Acciones",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showUserModal(record)}>
            Editar
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteCollaborator(record.id)}
            danger
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={200} theme="light">
        <Menu
          mode="inline"
          defaultSelectedKeys={["collaborators"]}
          style={{ height: "100%", borderRight: 0 }}
        >
          <Menu.Item key="settings" icon={<SettingOutlined />}>
            Configuraciones
          </Menu.Item>
          <Menu.Item key="collaborators" icon={<TeamOutlined />}>
            Colaboradores
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout style={{ padding: "0 24px 24px" }}>
        <Header style={{ background: "#fff", padding: 0 }}>
          <Title level={2} style={{ margin: "16px 0" }}>
            Configuracion
          </Title>
        </Header>
        <Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: "#fff",
          }}
        >
          <Link to="/signup">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showUserModal()}
              style={{ marginBottom: 16 }}
            >
              Agregar Colaborador
            </Button>
          </Link>

          <Table
            columns={columns}
            dataSource={collaborators}
            rowKey="id"
            loading={loading}
          />
        </Content>
      </Layout>

      <Modal
        title={editingUserId ? "Editar Colaborador" : "Agregar Colaborador"}
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Cancelar
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            {editingUserId ? "Actualizar" : "Agregar"}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddOrUpdateCollaborator}
        >
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Por favor ingrese el email" },
              { type: "email", message: "Por favor ingrese un email válido" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: "Por favor seleccione un rol" }]}
          >
            <Select>
              <Option value="Admin">Admin</Option>
              <Option value="User">Usuario</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default IndexConfig;

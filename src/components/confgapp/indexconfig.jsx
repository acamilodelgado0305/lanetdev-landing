import React, { useState, useEffect } from "react";
import { Tabs, Button, List, Avatar, Input, Modal, message } from "antd";
import {
  UserOutlined,
  DeleteOutlined,
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  getUsers,
  updateUserInfo,
  updateUser,
  deleteUser,
} from "../../services/apiService";
const { TabPane } = Tabs;

const IndexConfig = () => {
  const [collaborators, setCollaborators] = useState([]);
  const [newCollaborator, setNewCollaborator] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError("Error al cargar las cuentas");
      console.error("Error fetchig users:", err);
    }
  };

  const handleAddCollaborator = async () => {
    if (newCollaborator.trim() !== "") {
      try {
        const newUser = {
          id: Date.now(),
          name: newCollaborator,
          email: `${newCollaborator.toLowerCase()}@example.com`,
        };
        setCollaborators([...collaborators, newUser]);
        setNewCollaborator("");
        setIsModalVisible(false);
        message.success("Colaborador agregado con éxito");
      } catch (error) {
        message.error("Error al agregar colaborador");
      }
    }
  };

  const handleDeleteCollaborator = async (id) => {
    try {
      await deleteUser(id);
      setCollaborators(collaborators.filter((c) => c.id !== id));
      message.success("Colaborador eliminado con éxito");
    } catch (error) {
      message.error("Error al eliminar colaborador");
    }
  };

  const handleEditCollaborator = (user) => {
    setEditingUser(user);
    setIsModalVisible(true);
  };

  const handleUpdateCollaborator = async () => {
    if (editingUser) {
      try {
        await updateUser(editingUser.id, editingUser);
        setCollaborators(
          collaborators.map((c) => (c.id === editingUser.id ? editingUser : c))
        );
        setIsModalVisible(false);
        setEditingUser(null);
        message.success("Información del colaborador actualizada con éxito");
      } catch (error) {
        message.error("Error al actualizar la información del colaborador");
      }
    }
  };

  return (
    <div className="p-4">
      <Tabs defaultActiveKey="1">
        <TabPane tab="Configuraciones" key="1">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">
              Configuraciones de la App
            </h2>
            <p>Configuraciones adicionales de la app irían aquí.</p>
          </div>
        </TabPane>
        <TabPane tab="Colaboradores" key="2">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Colaboradores</h2>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingUser(null);
                  setIsModalVisible(true);
                }}
              >
                Agregar Colaborador
              </Button>
            </div>
            <List
              itemLayout="horizontal"
              dataSource={collaborators}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => handleEditCollaborator(item)}
                    />,
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteCollaborator(item.id)}
                      danger
                    />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.name}
                    description={item.email}
                  />
                </List.Item>
              )}
            />
          </div>
        </TabPane>
      </Tabs>

      <Modal
        title={editingUser ? "Editar Colaborador" : "Agregar Colaborador"}
        visible={isModalVisible}
        onOk={editingUser ? handleUpdateCollaborator : handleAddCollaborator}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingUser(null);
        }}
      >
        {editingUser ? (
          <>
            <Input
              placeholder="Nombre del colaborador"
              value={editingUser.name}
              onChange={(e) =>
                setEditingUser({ ...editingUser, name: e.target.value })
              }
              className="mb-2"
            />
            <Input
              placeholder="Email del colaborador"
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
            />
          </>
        ) : (
          <Input
            placeholder="Nombre del colaborador"
            value={newCollaborator}
            onChange={(e) => setNewCollaborator(e.target.value)}
          />
        )}
      </Modal>
    </div>
  );
};

export default IndexConfig;

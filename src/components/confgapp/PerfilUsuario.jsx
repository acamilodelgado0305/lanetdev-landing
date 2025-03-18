import React, { useState, useEffect } from "react";
import { Avatar, Button, Form, Input, Modal, Typography, message, Card, Divider } from "antd";
import { useAuth } from "../../components/Context/AuthProvider";
import ImageUploader from "../../components/user/ImageUpload";
import { updateUserInfo, getUserById, changePassword } from "../../services/apiService";

const { Title, Text } = Typography;

const PerfilUsuario = () => {
  const { authToken, setUser, user, userRole } = useAuth();
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profilepictureurl || "");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const defaultProfilePictureUrl =
    "https://res.cloudinary.com/dybws2ubw/image/upload/v1726015542/ayqfjv1wj5a9vbbqcrz3.png";

  useEffect(() => {
    setProfilePictureUrl(user?.profilepictureurl || defaultProfilePictureUrl);
  }, [user]);

  const fetchUser = async () => {
    try {
      const updatedUser = await getUserById(user.id, authToken);
      setUser(updatedUser);
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      message.error("Error al actualizar los datos del usuario");
    }
  };

  const handleEditProfile = async (values) => {
    try {
      await updateUserInfo(user.id, values, authToken);
      await fetchUser();
      message.success("Datos personales actualizados correctamente");
      setIsEditProfileModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
      message.error("Error al actualizar los datos personales");
    }
  };

  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
      await changePassword(user.id, values.currentPassword, values.newPassword, authToken);
      message.success("Contraseña cambiada con éxito");
      form.resetFields();
      setLoading(false);
      setIsChangePasswordModalOpen(false);
    } catch (error) {
      message.error("Error al cambiar la contraseña: " + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const handleUploadSuccess = (uploadedUrl) => {
    setProfilePictureUrl(uploadedUrl);
    message.success("Imagen de perfil actualizada correctamente");
  };

  return (
    <Card
      bordered
      style={{
        maxWidth: 800,
        margin: "0 auto",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        borderRadius: 8,
        border: "1px solid #d9d9d9",
      }}
    >
      <div style={{ textAlign: "center", padding: "24px" }}>
        <Avatar
          size={120}
          src={profilePictureUrl}
          style={{
            border: "4px solid #e8ecef",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          }}
        />
        <div style={{ marginTop: 16 }}>
          <ImageUploader
            userId={user?.id}
            authToken={authToken}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>
      </div>

      <Divider style={{ borderColor: "#d9d9d9" }} />

      <div style={{ padding: "0 24px 24px" }}>
        <Title level={3} style={{ color: "#1a3c6e", marginBottom: 24, fontWeight: 600 }}>
          {user?.username || "Usuario"}
        </Title>

        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: "block", color: "#333", fontSize: 16 }}>
            Email
          </Text>
          <Text style={{ color: "#666", fontSize: 16 }}>
            {user?.email || "No disponible"}
          </Text>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: "block", color: "#333", fontSize: 16 }}>
            Rol
          </Text>
          <Text style={{ color: "#666", fontSize: 16 }}>
            {userRole || "No asignado"}
          </Text>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: "block", color: "#333", fontSize: 16 }}>
            Dirección
          </Text>
          <Text style={{ color: "#666", fontSize: 16 }}>
            {user?.address || "No disponible"}
          </Text>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: "block", color: "#333", fontSize: 16 }}>
            Teléfono
          </Text>
          <Text style={{ color: "#666", fontSize: 16 }}>
            {user?.phone || "No disponible"}
          </Text>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: "block", color: "#333", fontSize: 16 }}>
            App
          </Text>
          <Text style={{ color: "#666", fontSize: 16 }}>
            {user?.app || "No disponible"}
          </Text>
        </div>

        <Divider style={{ borderColor: "#d9d9d9" }} />

        <div style={{ textAlign: "right" }}>
          <Button
            type="primary"
            onClick={() => setIsEditProfileModalOpen(true)}
            style={{
              backgroundColor: "#1a3c6e",
              borderColor: "#1a3c6e",
              borderRadius: 6,
              padding: "8px 20px",
              fontSize: 16,
              height: "auto",
              marginRight: 16,
            }}
          >
            Editar Perfil
          </Button>
          <Button
            danger
            onClick={() => setIsChangePasswordModalOpen(true)}
            style={{
              borderRadius: 6,
              padding: "8px 20px",
              fontSize: 16,
              height: "auto",
            }}
          >
            Cambiar Contraseña
          </Button>
        </div>
      </div>

      {/* Modal para Editar Perfil */}
      <Modal
        title={<Title level={4}>Editar Perfil</Title>}
        visible={isEditProfileModalOpen}
        onCancel={() => setIsEditProfileModalOpen(false)}
        footer={null}
        bodyStyle={{ padding: "24px" }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditProfile}
          initialValues={{
            username: user?.username,
            address: user?.address,
            phone: user?.phone,
          }}
        >
          <Form.Item
            label={<Text strong>Nombre</Text>}
            name="username"
            rules={[{ required: true, message: "Por favor ingresa tu nombre" }]}
          >
            <Input size="large" style={{ borderRadius: 6 }} />
          </Form.Item>
          <Form.Item
            label={<Text strong>Dirección</Text>}
            name="address"
            rules={[{ required: true, message: "Por favor ingresa tu dirección" }]}
          >
            <Input size="large" style={{ borderRadius: 6 }} />
          </Form.Item>
          <Form.Item
            label={<Text strong>Teléfono</Text>}
            name="phone"
            rules={[{ required: true, message: "Por favor ingresa tu teléfono" }]}
          >
            <Input size="large" style={{ borderRadius: 6 }} />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              width: "100%",
              backgroundColor: "#1a3c6e",
              borderColor: "#1a3c6e",
              borderRadius: 6,
              padding: "8px 0",
              fontSize: 16,
              height: "auto",
            }}
          >
            Guardar Cambios
          </Button>
        </Form>
      </Modal>

      {/* Modal para Cambiar Contraseña */}
      <Modal
        title={<Title level={4}>Cambiar Contraseña</Title>}
        visible={isChangePasswordModalOpen}
        footer={null}
        onCancel={() => {
          form.resetFields();
          setIsChangePasswordModalOpen(false);
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleChangePassword}
          initialValues={{ currentPassword: "", newPassword: "" }}
        >
          <Form.Item
            label={<Text strong>Contraseña actual</Text>}
            name="currentPassword"
            rules={[
              { required: true, message: "Por favor, introduce tu contraseña actual" },
            ]}
          >
            <Input.Password size="large" style={{ borderRadius: 6 }} placeholder="Contraseña actual" />
          </Form.Item>
          <Form.Item
            label={<Text strong>Nueva contraseña</Text>}
            name="newPassword"
            rules={[
              { required: true, message: "Por favor, introduce tu nueva contraseña" },
              { min: 6, message: "La contraseña debe tener al menos 6 caracteres" },
            ]}
          >
            <Input.Password size="large" style={{ borderRadius: 6 }} placeholder="Nueva contraseña" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{
              width: "100%",
              backgroundColor: "#1a3c6e",
              borderColor: "#1a3c6e",
              borderRadius: 6,
              padding: "8px 0",
              fontSize: 16,
              height: "auto",
            }}
          >
            Cambiar Contraseña
          </Button>
        </Form>
      </Modal>
    </Card>
  );
};

export default PerfilUsuario;
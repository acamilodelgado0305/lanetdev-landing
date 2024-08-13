import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import axios from "axios";

class Clients extends React.Component {
  state = {
    clients: [],
  };

  async componentDidMount() {
    this.fetchClients();
  }

  async fetchClients() {
    const response = await axios
      .get(`https://api.wisphub.net/api/clientes/`, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: `${import.meta.env.VITE_AUTHORIZACION}`,
        },
      })
      .then((res) => this.setState({ clients: res.data }));
  }

  columns = [
    { field: "_id", headerName: "ID", width: 70 },
    { field: "Nombre", headerName: "Nombres", width: 150 },
    { field: "DocumentoIdentidad", headerName: "Documento", width: 120 },
    { field: "Estado", headerName: "Estado", width: 80 },
    { field: "Ip", headerName: "Ip", width: 150 },
    { field: "FechaInstalacion", headerName: "Instalacion", width: 150 },
    { field: "CiudadMunicipio", headerName: "Municipio", width: 150 },
    { field: "Barrio", headerName: "Barrio", width: 150 },
    { field: "Direccion", headerName: "Direccion", width: 150 },
    { field: "Telefono", headerName: "Teléfono", width: 150 },
    { field: "Correo", headerName: "Correo", width: 150 },
    { field: "MacAntena", headerName: "MacAntena", width: 150 },
    { field: "Zona", headerName: "Zona", width: 80 },
    { field: "PlanInternet", headerName: "PlanInternet", width: 150 },
  ];

  handleSelectionChange = (selection) => {
    const selectedRowIndex = selection.length > 0 ? selection[0] : null;

    if (selectedRowIndex !== null) {
      const selectedClientId = this.state.clients[selectedRowIndex]._id;
      this.props.navigate(`/clientes/${selectedClientId}`);
    }
  };

  render() {
    const { clients } = this.state;
    return (
      <>
        <div className="group_button">
          <button>Nuevo</button>
          <button>Editar</button>
          <button>Eliminar</button>
        </div>

        <div
          style={{
            width: "1000px",
            height: "100vh",
            marginTop: "30px",
            marginRight: "-700px",
            marginLeft: "-20px",
          }}
        >
          <DataGrid
            rows={clients}
            columns={this.columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection
            disableSelectionOnClick
            getRowId={(row) => row._id}
            onSelectionModelChange={this.handleSelectionChange}
          />
        </div>
      </>
    );
  }
}

export default Clients;

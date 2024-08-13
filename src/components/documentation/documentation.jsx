import React, { Component } from "react";
import axios from "axios";
import { FaTrashAlt, FaUserEdit } from "react-icons/fa";
import { Link } from "react-router-dom";

export default class Documentation extends Component {
  state = {
    nodes: [],
  };

  componentDidMount() {
    this.fetchNodes();
  }

  async fetchNodes() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/nodes`
      );
      const data = response.data;
      console.log("Nodos recibidos:", data.nodes);
      this.setState({ nodes: data.nodes });
    } catch (error) {
      console.error("Error fetching nodes:", error);
    }
  }

  deleteNode = async (_id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/nodes/` + _id);
      this.fetchNodes();
    } catch (error) {
      console.error("Error deleting node:", error);
    }
  };

  render() {
    const { nodes } = this.state;
    return (
      <div>
        
        <div className="container">
        <div className="Buttons">
          <Link to='/index/doc/new'>
            <button type="button" className="btn btn-primary">
              Crear
            </button>
          </Link>
        </div>
          <div className="table">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Municipio</th>
                  <th>Sector</th>
                  <th>Coordenadas</th>
                  <th>TLGM</th>
                  <th>UISP</th>
                  <th>Equipos</th>
                </tr>
              </thead>
              <tbody>
                {nodes && nodes.length > 0 ? (
                  nodes.map((node) => (
                    <tr key={node._id}>
                      <td>{node.name}</td>
                      <td>{node.municipality}</td>
                      <td>{node.sector}</td>
                      <td>{`${node.coordinates.lat}, ${node.coordinates.lng}`}</td>
                      <td>{node.tlgm ? "Sí" : "No"}</td>
                      <td>{node.uisp ? "Sí" : "No"}</td>
                      <td>
                        <Link
                          to={"doc/equips" + node._id}
                          onClick={() => handleViewEquipment(node)}
                        >
                          Ver equipos
                        </Link>
                      </td>
                      <td>
                        <button
                          className="delete-node-button"
                          onClick={() => {
                            if (
                              window.confirm(
                                "¿Está seguro de que desea eliminar este nodo?"
                              )
                            ) {
                              this.deleteNode(node._id);
                            }
                          }}
                        >
                          <FaTrashAlt />
                        </button>
                        <button>
                          <FaUserEdit />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No hay nodos disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

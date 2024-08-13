import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function FormNodes() {
  const { _id } = useParams();
  const navigate = useNavigate();
  const [node, setNode] = useState({
    name: "",
    municipality: "",
    sector: "",
    coordinates: {
      lat: "",
      lng: "",
    },
    tlgm: false,
    uisp: false,
  });

  const handleInputChange = (e) => {
    setNode({
      ...node,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const updatedNodo = { ...node };

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/nodes/create`,
        updatedNodo
      );
      navigate(-1);

      setNodo({
        name: "",
        municipality: "",
        sector: "",
        coordinates: {
          lat: "",
          lng: "",
        },
        tlgm: false,
        uisp: false,
      });
    } catch (error) {}
  };

  return (
    <div className="col4">
      <h2>{_id ? "Editar Nodo" : "Agregar Nodo"}</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Datos del Nodo</legend>
         
          <div className="form-group">
            <label htmlFor="nombre">Nombre:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={node.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Municipio:</label>
            <input
              type="text"
              className="form-control"
              name="municipality"
              value={node.municipality}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Sector:</label>
            <input
              type="text"
              className="form-control"
              name="sector"
              value={node.sector}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Latitud:</label>
            <input
              type="text"
              className="form-control"
              name="lat"
              value={node.coordinates.lat}
              onChange={(e) =>
                setNode({
                  ...node,
                  coordinates: { ...node.coordinates, lat: e.target.value },
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Longitud:</label>
            <input
              type="text"
              className="form-control"
              name="lng"
              value={node.coordinates.lng}
              onChange={(e) =>
                setNode({
                  ...node,
                  coordinates: { ...node.coordinates, lng: e.target.value },
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="tlgm"
                checked={node.tlgm}
                onChange={(e) => setNode({ ...node, tlgm: e.target.checked })}
              />
              TLGM
            </label>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="uisp"
                checked={node.uisp}
                onChange={(e) => setNode({ ...node, uisp: e.target.checked })}
              />
              UISP
            </label>
          </div>

          <button type="submit" className="btn btn-primary">
            {_id ? "Actualizar" : "Guardar"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}

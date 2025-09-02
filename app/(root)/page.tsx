import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../components/Header";
import { useSelector } from "react-redux";

const Zones = () => {
  const [zones, setZones] = useState([]);
  const [zone, setZone] = useState("");
  const [head, setHead] = useState("");
  const [mobile, setMobile] = useState("");
  const [anganwadis, setAnganwadis] = useState("");
  const [newUsers, setNewUsers] = useState("");
  const [edit, setEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const token = useSelector((state) => state.token);
  const { _id } = useSelector((state) => state.user);
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const getZones = async () => {
    // FIX: Changed the hardcoded localhost URL to a relative path.
    const response = await fetch("/zones", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setZones(data);
  };

  const deleteZone = async (id) => {
    // FIX: Changed the hardcoded localhost URL to a relative path.
    const response = await fetch(`/zones/${id}/delete`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setZones(data);
  };

  const handleFormSubmit = async () => {
    if (edit) {
      // FIX: Changed the hardcoded localhost URL to a relative path.
      const response = await fetch("/zones/update", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editId,
          name: zone,
          head,
          mobile,
          anganwadis,
          newUsers,
        }),
      });
      const data = await response.json();
      setZones(data);
    } else {
      // FIX: Changed the hardcoded localhost URL to a relative path.
      const response = await fetch("/zones/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: zone,
          userId: _id,
          head,
          mobile,
          anganwadis,
          newUsers,
        }),
      });
      const data = await response.json();
      setZones(data);
    }
    setZone("");
    setHead("");
    setMobile("");
    setAnganwadis("");
    setNewUsers("");
    setEdit(false);
    setEditId("");
  };

  const editZone = (id) => {
    setEdit(true);
    setEditId(id);
    const editZone = zones.find((zone) => zone._id === id);
    setZone(editZone.name);
    setHead(editZone.head);
    setMobile(editZone.mobile);
    setAnganwadis(editZone.anganwadis);
    setNewUsers(editZone.newUsers);
  };

  useEffect(() => {
    getZones();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "head",
      headerName: "Zone Head",
      flex: 1,
    },
    {
      field: "mobile",
      headerName: "Mobile Number",
      flex: 1,
    },
    {
      field: "anganwadis",
      headerName: "Anganwadis",
      flex: 1,
    },
    {
      field: "newUsers",
      headerName: "New Users",
      flex: 1,
    },
    {
      field: "user",
      headerName: "Added By",
      flex: 1,
    },
    {
      field: "edit",
      headerName: "Edit",
      flex: 0.5,
      renderCell: (params) => {
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={() => editZone(params.row._id)}
          >
            Edit
          </Button>
        );
      },
    },
    {
      field: "delete",
      headerName: "Delete",
      flex: 0.5,
      renderCell: (params) => {
        return (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => deleteZone(params.row._id)}
          >
            Delete
          </Button>
        );
      },
    },
  ];

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="ZONES" subtitle="Managing the zones and adding new zones" />
      <Box
        mt="40px"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#00353E",
            color: "white",
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: "#f0f2f5",
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "#00353E",
            color: "white",
            borderTop: "none",
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `grey !important`,
          },
        }}
      >
        <DataGrid
          getRowId={(row) => row._id}
          rows={zones || []}
          columns={columns}
        />
      </Box>
      <Box
        width={isNonMobile ? "50%" : "93%"}
        p="2rem"
        m="2rem auto"
        borderRadius="1.5rem"
        backgroundColor="#FFFFFF"
        boxShadow="0px 0px 15px rgba(0, 0, 0, 0.1)"
      >
        <Typography fontWeight="500" variant="h5" sx={{ mb: "1.5rem" }}>
          {edit ? "EDIT ZONE" : "ADD A NEW ZONE"}
        </Typography>
        <Box
          display="grid"
          gap="30px"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          sx={{
            "& > div": {
              gridColumn: isNonMobile ? undefined : "span 4",
            },
          }}
        >
          <TextField
            label="Name"
            onChange={(e) => setZone(e.target.value)}
            value={zone}
            name="name"
            sx={{ gridColumn: "span 4" }}
          />
          <TextField
            label="Zone Head"
            onChange={(e) => setHead(e.target.value)}
            value={head}
            name="head"
            sx={{ gridColumn: "span 4" }}
          />
          <TextField
            label="Mobile Number"
            onChange={(e) => setMobile(e.target.value)}
            value={mobile}
            name="mobile"
            sx={{ gridColumn: "span 4" }}
          />
          <TextField
            label="Anganwadis"
            onChange={(e) => setAnganwadis(e.target.value)}
            value={anganwadis}
            name="anganwadis"
            sx={{ gridColumn: "span 4" }}
          />
          <TextField
            label="New Users"
            onChange={(e) => setNewUsers(e.target.value)}
            value={newUsers}
            name="newUsers"
            sx={{ gridColumn: "span 4" }}
          />
        </Box>

        <Button
          fullWidth
          type="submit"
          onClick={handleFormSubmit}
          sx={{
            m: "2rem 0",
            p: "1rem",
            backgroundColor: "#00353E",
            color: "white",
            "&:hover": { backgroundColor: "#002A30" },
          }}
        >
          {edit ? "EDIT ZONE" : "ADD ZONE"}
        </Button>
      </Box>
    </Box>
  );
};

export default Zones;

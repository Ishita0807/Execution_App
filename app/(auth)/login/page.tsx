import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { setLogin } from "../state";
import { useNavigate } from "react-router-dom";

const loginSchema = yup.object().shape({
  email: yup.string().email("invalid email").required("required"),
  password: yup.string().required("required"),
});

const initialValuesLogin = {
  email: "",
  password: "",
};

const Login = () => {
  const [error, setError] = useState(null);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const login = async (values, onSubmitProps) => {
    // FIX: Changed the hardcoded localhost URL to a relative path.
    // This allows the API call to work in a deployed environment.
    const loggedInResponse = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const loggedIn = await loggedInResponse.json();
    onSubmitProps.resetForm();
    if (loggedIn.token) {
      dispatch(
        setLogin({
          user: loggedIn.user,
          token: loggedIn.token,
        })
      );
      navigate("/dashboard");
    } else {
      setError(loggedIn.msg);
    }
  };

  const handleFormSubmit = async (values, onSubmitProps) => {
    await login(values, onSubmitProps);
  };

  return (
    <Box
      width="100%"
      minHeight="100vh"
      p="1rem"
      display="flex"
      alignItems="center"
      justifyContent="center"
      backgroundColor="#f0f2f5"
    >
      <Box
        width={isNonMobile ? "40%" : "95%"}
        p="2rem"
        borderRadius="1.5rem"
        backgroundColor="white"
        boxShadow="0px 0px 15px rgba(0, 0, 0, 0.1)"
      >
        <Typography fontWeight="500" variant="h3" sx={{ mb: "1.5rem" }}>
          Welcome to the Execution App
        </Typography>
        <Formik
          onSubmit={handleFormSubmit}
          initialValues={initialValuesLogin}
          validationSchema={loginSchema}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
          }) => (
            <form onSubmit={handleSubmit}>
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                }}
              >
                <TextField
                  label="Email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.email}
                  name="email"
                  error={Boolean(touched.email) && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  label="Password"
                  type="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.password}
                  name="password"
                  error={
                    Boolean(touched.password) && Boolean(errors.password)
                  }
                  helperText={touched.password && errors.password}
                  sx={{ gridColumn: "span 4" }}
                />
              </Box>

              <Box>
                {error && (
                  <Typography color="red" textAlign="center" mt="1rem">
                    {error}
                  </Typography>
                )}
                <Button
                  fullWidth
                  type="submit"
                  sx={{
                    m: "2rem 0",
                    p: "1rem",
                    backgroundColor: "#00353E",
                    color: "white",
                    "&:hover": { backgroundColor: "#002A30" },
                  }}
                >
                  LOGIN
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default Login;

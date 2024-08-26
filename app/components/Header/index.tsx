import Link from "next/link";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import { useMemo } from "react";

const Header: React.FC = () => {
  const routes = useMemo(
    () => [
      { name: 'Home', to: '/' },
      { name: 'Cadastro de pessoas', to: '/register' },
      { name: 'Pessoas cadastradas', to: '/persons' },
      { name: 'Empréstimos', to: '/loans' }
    ],
    []
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <Container maxWidth="lg">
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Empresa X
          </Typography>
          {routes.map((route, index) => (
            <Button
              key={index}
              color="inherit"
              component={Link}
              href={route.to}
              sx={{ mx: 1 }}
            >
              {route.name}
            </Button>
          ))}
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

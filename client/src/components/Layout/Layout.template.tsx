import { AppBar, Button, Container, Toolbar, Typography } from '@mui/material'
import CasinoIcon from '@mui/icons-material/Casino'
import AddIcon from '@mui/icons-material/Add'
import { Link as RouterLink, Outlet } from 'react-router-dom'
import { routes } from '../../App/App.ts'
import { useLayout } from './Layout.ts'
import './Layout.css'

export function Layout() {
  const { showCreateButton } = useLayout()

  return (
    <div className="layout">
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <CasinoIcon className="layout__logo" />
          <Typography
            variant="h6"
            component={RouterLink}
            to={routes.calendar}
            className="layout__title"
          >
            Tabletop Game Events
          </Typography>
          {showCreateButton && (
            <Button
              component={RouterLink}
              to={routes.createEvent}
              color="inherit"
              variant="outlined"
              startIcon={<AddIcon />}
            >
              Create Event
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" className="layout__content">
        <Outlet />
      </Container>
    </div>
  )
}

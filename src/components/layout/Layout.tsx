import * as React from "react";
import { Suspense, useEffect } from "react";
import { CSSObject, styled, Theme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Outlet } from "react-router-dom";
import LanguageSelector from "../LanguageSelector";
import { useAppDispatch, useAppSelector } from "../../hooks/ReduxHooks";
import { logout, selectUser } from "../../slices/userSlice";
import SideBarContent from "./SideBarContent";
import { useGetCurrentUserQuery } from "../../api/userApi";
import LoadingOverlay from "../misc/LoadingOverlay";
import Breadcrumbs from "../routing/Breadcrumbs";
import NotificationBell from "../notification/NotificationBell";
import { useIntl } from "react-intl";

const drawerWidth = 240;

const Layout: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  useGetCurrentUserQuery();
  const user = useAppSelector(selectUser);
  const intl = useIntl();

  useEffect(() => {
    return () => {
      dispatch(logout());
    };
  }, [dispatch]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  if (!user.loggedIn) {
    return <>{intl.formatMessage({ id: "app-loading" })}</>;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" open={open} elevation={1}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            CheckIt
          </Typography>
          <Box
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
            }}
          >
            <NotificationBell />
            <LanguageSelector />
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon color={"secondary"} />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <SideBarContent open={open} />
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1 }}>
        <DrawerHeader />
        <Suspense fallback={<LoadingOverlay />}>
          <Box pb={3}>
            <Breadcrumbs />
            <Outlet />
          </Box>
        </Suspense>
      </Box>
    </Box>
  );
};

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default Layout;

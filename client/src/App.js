import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

//import AllFilesPost from "./filespost/pages/AllFilesPost";
// import MyFilesPost from "./filespost/pages/MyFilesPost";
// import UpdateFilesPost from "./filespost/pages/UpdateFilesPost";
// import Users from "./users/pages/Users";
// import UserProfile from "./users/pages/UserProfile";
// import UpdateProfile from "./users/pages/UpdateProfile";
// import Login from "./users/pages/Login";
// import AddUser from "./users/pages/AddUser";
import MainNavigation from "./shared/components/Navigation/MainNavigation";
import LoadingSpinner from "./shared/components/UIElements/LoadingSpinner";
// import AddFile from "./filespost/pages/AddFile";
import { AuthContext } from "./shared/context/auth-context";
import { useAuth } from "./shared/hooks/auth-hooks";
import EmailVerify from "./users/pages/EmailVerify";

const AllFilesPost = React.lazy(() => import("./filespost/pages/AllFilesPost"));
const MyFilesPost = React.lazy(() =>
  import("./filespost/pages/MyFilesPost")
);
const UpdateFilesPost = React.lazy(() =>
  import("./filespost/pages/UpdateFilesPost")
);
const Users = React.lazy(() => import("./users/pages/Users"));
const UserProfile = React.lazy(() => import("./users/pages/UserProfile"));
const UpdateProfile = React.lazy(() => import("./users/pages/UpdateProfile"));
const Login = React.lazy(() => import("./users/pages/Login"));
const AddUser = React.lazy(() => import("./users/pages/AddUser"));
const AddFile = React.lazy(() => import("./filespost/pages/AddFile"));
const ForgotPassword = React.lazy(() => import("./users/pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./users/pages/ResetPassword"));

export default function App() {
  const { token, login, logout, userId, isAdmin } = useAuth();

  let routes;

  if (token && isAdmin) {
    routes = (
      <React.Fragment>
        <Route path="/" element={<AllFilesPost />} />
        <Route path="/add-file" element={<AddFile />} />
        <Route path="/:fileId/edit" element={<UpdateFilesPost />} />
        <Route path="/my-files" element={<MyFilesPost />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:userId" element={<UserProfile />} />
        <Route path="/users/:userId/edit" element={<UpdateProfile />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="*" element={<Navigate to="/" />} />
      </React.Fragment>
    );
  } else if (token && !isAdmin) {
    routes = (
      <React.Fragment>
        <Route path="/" element={<AllFilesPost />} />
        <Route path="/add-file" element={<AddFile />} />
        <Route path="/:fileId/edit" element={<UpdateFilesPost />} />
        <Route path="/my-files" element={<MyFilesPost />} />
        <Route path="/users/:userId" element={<UserProfile />} />
        <Route path="/users/:userId/edit" element={<UpdateProfile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </React.Fragment>
    );
  } else {
    routes = (
      <React.Fragment>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/users/user/:uid/reset-password/:emailToken" element={<ResetPassword />} />
        <Route path="/users/user/:uid/verify/:emailToken" element={<EmailVerify />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </React.Fragment>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        isAdmin: isAdmin,
        login: login,
        logout: logout,
      }}
    >
      <Router>
        <MainNavigation />
        <main>
          <Suspense fallback={<div className="center"><LoadingSpinner /></div>}>
            <Routes>{routes}</Routes>
          </Suspense>
        </main>
      </Router>
    </AuthContext.Provider>
  );
}

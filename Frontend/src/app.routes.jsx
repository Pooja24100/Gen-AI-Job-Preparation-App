import {createBrowserRouter} from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register.jsx";
import Protected from "./features/auth/components/Protected";
import AppShell from "./features/layout/components/AppShell.jsx";
import Home from "./features/interview/pages/Home.jsx";
import Upload from "./features/interview/pages/Upload.jsx";
import InterviewList from "./features/interview/pages/InterviewList.jsx";
import Interview from "./features/interview/pages/interview.jsx";
import Profile from "./features/profile/pages/Profile.jsx";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path:"/",
    element:<Protected><AppShell/></Protected>,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "upload",
        element: <Upload />
      },
      {
        path: "interviews",
        element: <InterviewList />
      },
      {
        path: 'interview/:interviewId',
        element: <Interview />
      },
      {
        path: "profile",
        element: <Profile />
      }
    ]
  }
])

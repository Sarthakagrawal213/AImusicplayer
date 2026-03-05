import { createBrowserRouter } from 'react-router';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import FaceExpression from './features/expression/components/FaceExpression';

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/home",
    element:  <FaceExpression />,
  },
  {
    path: "/",
    element: <Login />,
  }
]);
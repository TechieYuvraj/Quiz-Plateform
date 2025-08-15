import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// export default function ProtectedAdminRoute({ children }) {
//     const isAdminLoggedIn = useSelector((state) => state.adminAuth.isLoggedIn);
//     console.log(isAdminLoggedIn)

//     if (!isAdminLoggedIn) {
//         console.log("not loggedin")
//         return <Navigate to="/admin/login" replace />;
//     }

//     return children;
// }

export default function ProtectedAdminRoute({ children }) {
    const isAdminLoggedIn = useSelector((state) => state.adminAuth.isAdminLoggedIn);

    if (!isAdminLoggedIn) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}

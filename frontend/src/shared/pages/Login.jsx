import { LoginForm } from "../components/auth";

const Login = () => {
    return(
        <LoginForm action="/home" route="/api/token/" method="login"/>
    )
}

export default Login;
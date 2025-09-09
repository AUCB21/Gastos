import LoginForm from "../components/forms/LoginForm"



const Login = () => {
    return(
        <LoginForm action="/home" route="/api/token/" method="login"/>
    )
}

export default Login;
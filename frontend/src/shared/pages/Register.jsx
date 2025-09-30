import LoginForm  from "../components/LoginForm";

const Register = () => {
    return(
        <LoginForm action="/home" route="/api/user/register/" method="register"/>
    )
}

export default Register;
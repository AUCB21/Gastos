const delayedNavigate = (navigate, path, delay = 250) => {
    setTimeout(() => {
        navigate(path);
    }, delay);
}

export default delayedNavigate;